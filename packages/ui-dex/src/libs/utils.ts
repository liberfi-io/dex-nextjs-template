import { Observable, OperatorFunction, Subscriber } from "rxjs";

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

/**
 * 创建基于DOM事件的RxJS可观察流
 * @param eventTarget 事件目标对象（如HTMLElement）
 * @param eventName 事件名称（如'click'）
 * @param options 事件监听配置（可选）
 * @param operator RxJS操作符（如debounceTime）
 */
export function createEventObservable<T = unknown>(
  eventTarget: EventTarget,
  eventName: string,
  options?: AddEventListenerOptions | OperatorFunction<T, T>,
  operator?: OperatorFunction<T, T>,
): Observable<T> {
  // 参数重载处理（参考网页1的类型推断策略）
  if (typeof options === "function") {
    operator = options as OperatorFunction<T, T>;
    options = undefined;
  }

  // 事件处理器解构（参考网页7的DOM操作类型断言）
  const [addListener, removeListener] = getEventHandlers(eventTarget, eventName, options);
  if (!addListener) {
    throw new TypeError("Invalid event target");
  }

  // 创建基础Observable（参考网页6的观察者模式实现）
  const baseObservable = new Observable<T>((subscriber) => {
    const handler = (event: Event) => {
      subscriber.next(event as T); // 类型断言（参考网页8的CustomEvent处理）
    };

    addListener(handler);
    return () => removeListener(handler);
  });

  return operator ? baseObservable.pipe(operator) : baseObservable;
}

/**
 * 获取类型安全的事件处理器（参考网页8的WindowEventMap扩展思路）
 */
function getEventHandlers(
  target: EventTarget,
  eventName: string,
  options?: AddEventListenerOptions,
): [(handler: (event: Event) => void) => void, (handler: (event: Event) => void) => void] {
  return [
    (handler) => target.addEventListener(eventName, handler, options),
    (handler) => target.removeEventListener(eventName, handler, options),
  ];
}

/**
 * 检查键盘事件是否匹配指定快捷键组合（包含修饰键验证）
 * @param event 键盘事件对象
 * @param targetKeyCode 目标按键代码（如 'KeyA'）
 * @param modifiers 修饰键配置（可选）
 * @returns 是否匹配快捷键条件
 */
export function checkKeyboardShortcut(
  event: KeyboardEvent,
  targetKeyCode: string,
  modifiers?: Partial<Pick<KeyboardEvent, "ctrlKey" | "metaKey" | "shiftKey" | "altKey">>,
): boolean {
  // 解构修饰键配置并设置默认值
  const { ctrlKey = false, metaKey = false, shiftKey = false, altKey = false } = modifiers || {};

  return (
    event.code === targetKeyCode &&
    event.ctrlKey === ctrlKey &&
    event.metaKey === metaKey &&
    event.shiftKey === shiftKey &&
    event.altKey === altKey
  );
}

/**
 * 获取元素的计算样式属性值
 * @param propertyName 要查询的CSS属性名
 * @param element 目标元素（默认document.body）
 * @returns 该属性的计算值（去除首尾空格）
 */
export function getCssPropertyValue(
  propertyName: string,
  element: HTMLElement = document.body,
): string {
  return window.getComputedStyle(element).getPropertyValue(propertyName).trim();
}

export function duplicate<T>(source: Observable<T>) {
  return () =>
    new Observable<T>((subscriber) => {
      source.subscribe({
        next: (e) => subscriber.next(e),
        error: (e) => subscriber.error(e),
        complete: () => subscriber.complete(),
      });
      if (!subscriber.closed) {
        source.subscribe(subscriber);
      }
    });
}

interface EmptyError extends Error {
  name: "EmptyError";
  message: string;
}

/**
 * 将 Observable 转换为 Promise，并处理空序列的边界情况
 * @param sourceObservable 输入的可观察对象
 * @param options 配置对象（可选），可包含默认值
 * @param options.defaultValue 默认值，当序列中没有元素时返回
 * @returns Promise，在收到第一个值时解决，或在空序列时返回默认值/抛出错误
 */
export function observableToPromise<TValue>(
  sourceObservable: Observable<TValue>,
  options?: {
    defaultValue?: TValue;
  },
): Promise<TValue | undefined> {
  const hasOptions = options !== null && typeof options === "object";

  return new Promise((resolve, reject) => {
    const subscription = new Subscriber<TValue>({
      next: (value: TValue) => {
        resolve(value);
        subscription.unsubscribe();
      },
      error: (err: unknown) => {
        reject(err);
      },
      complete: () => {
        if (hasOptions) {
          resolve(options?.defaultValue);
        } else {
          const emptyError: EmptyError = {
            name: "EmptyError",
            message: "No elements in sequence",
          };
          reject(emptyError);
        }
      },
    });

    sourceObservable.subscribe(subscription);
  });
}

/**
 * 自定义组合操作符，等待所有输入Observable发出值后合并结果
 * @param sources 需要组合的Observable数组
 * @param project 可选的转换函数，用于处理合并后的值
 * @returns 返回一个新的Observable，发出组合后的结果
 */
export function combineLatestWith<T, R>(
  sources: Observable<T>[],
  project?: (...args: T[]) => R,
): OperatorFunction<T, T[] | R> {
  return (source: Observable<T>) => {
    return new Observable<T[] | R>((subscriber: Subscriber<T[] | R>) => {
      // 初始化存储各Observable最新值的数组
      const latestValues: (T | undefined)[] = new Array(sources.length);
      // 标记各Observable是否已至少发出一次值
      const hasEmitted: boolean[] = new Array(sources.length).fill(false);
      // 所有Observable均已就绪的标志
      let allReady = false;

      // 订阅所有源Observable
      sources.forEach((obs, index) => {
        obs.subscribe({
          next: (value: T) => {
            latestValues[index] = value;
            if (!hasEmitted[index]) {
              hasEmitted[index] = true;
              // 检查是否所有Observable都已发出值
              allReady = hasEmitted.every(Boolean);
            }
          },
          error: (err) => subscriber.error(err),
        });
      });

      // 订阅主Observable
      source.subscribe({
        next: (value: T) => {
          if (allReady) {
            // 合并当前值与各Observable的最新值
            const mergedValues = [value, ...latestValues] as T[];
            // 应用转换函数或直接返回合并数组
            const result = project ? project(...mergedValues) : mergedValues;
            subscriber.next(result);
          }
        },
        error: (err) => subscriber.error(err),
        complete: () => subscriber.complete(),
      });
    });
  };
}
