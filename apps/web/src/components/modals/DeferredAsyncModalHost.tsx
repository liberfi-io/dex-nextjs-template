"use client";

import {
  createContext,
  type ComponentType,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type OpenAsyncModalOptions,
  useModalCoordinator,
} from "@liberfi.io/ui-scaffold";

type ModalLoader = () => Promise<ComponentType>;

interface DeferredModalRegistry {
  ensure(id: string, loader: ModalLoader): Promise<void>;
}

const DeferredModalContext = createContext<DeferredModalRegistry | null>(null);

export function DeferredAsyncModalHost({ children }: PropsWithChildren) {
  const [modals, setModals] = useState<Record<string, ComponentType>>({});
  const installed = useRef<Record<string, ComponentType>>({});
  const loading = useRef(new Map<string, Promise<void>>());
  const waiters = useRef(new Map<string, Array<() => void>>());

  const ensure = useCallback(async (id: string, loader: ModalLoader) => {
    if (installed.current[id]) return;
    const pending = loading.current.get(id);
    if (pending) return pending;

    const next = loader().then(
      (Modal) =>
        new Promise<void>((resolve) => {
          const current = waiters.current.get(id) ?? [];
          current.push(resolve);
          waiters.current.set(id, current);
          setModals((previous) => ({ ...previous, [id]: Modal }));
        }),
    );
    loading.current.set(id, next);
    try {
      await next;
    } finally {
      loading.current.delete(id);
    }
  }, []);

  useEffect(() => {
    installed.current = modals;
    for (const id of Object.keys(modals)) {
      const current = waiters.current.get(id);
      if (!current) continue;
      waiters.current.delete(id);
      current.forEach((resolve) => resolve());
    }
  }, [modals]);

  const registry = useMemo(() => ({ ensure }), [ensure]);

  return (
    <DeferredModalContext.Provider value={registry}>
      {children}
      {Object.entries(modals).map(([id, Modal]) => (
        <Modal key={id} />
      ))}
    </DeferredModalContext.Provider>
  );
}

export function useDeferredAsyncModal<P = unknown, R = unknown>(
  id: string,
  loader: ModalLoader,
) {
  const registry = useContext(DeferredModalContext);
  const coordinator = useModalCoordinator();
  if (!registry) {
    throw new Error(
      "useDeferredAsyncModal must be used within DeferredAsyncModalHost",
    );
  }

  const onOpen = useCallback(
    async (options?: OpenAsyncModalOptions<P, R>) => {
      await registry.ensure(id, loader);
      return coordinator.open<P, R>(id, options);
    },
    [coordinator, id, loader, registry],
  );
  const onClose = useCallback(() => coordinator.close(id), [coordinator, id]);

  return { onOpen, onClose };
}
