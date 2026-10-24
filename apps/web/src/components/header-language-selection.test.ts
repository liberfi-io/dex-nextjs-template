import type { Language } from "@liberfi.io/i18n";
import { resolveHeaderLanguageOption } from "./header-language-selection";

const compatibleLanguages: Language[] = [
  { localCode: "en", displayName: "English" },
  { localCode: "zh", displayName: "中文" },
];

describe("resolveHeaderLanguageOption", () => {
  it.each(["zh-Hant", "zh-Hans", "zh-TW", "zh-CN"])(
    "maps the runtime locale %s onto the supported Chinese compatibility option",
    (locale) => {
      expect(resolveHeaderLanguageOption(locale, compatibleLanguages)).toBe("zh");
    },
  );

  it("maps a regional English locale onto the supported English option", () => {
    expect(resolveHeaderLanguageOption("en-US", compatibleLanguages)).toBe("en");
  });

  it("keeps explicit Chinese script options distinct when both are supported", () => {
    const scriptLanguages: Language[] = [
      { localCode: "zh-Hant", displayName: "繁體中文" },
      { localCode: "zh-Hans", displayName: "简体中文" },
    ];

    expect(resolveHeaderLanguageOption("zh-Hant", scriptLanguages)).toBe("zh-Hant");
    expect(resolveHeaderLanguageOption("zh-Hans", scriptLanguages)).toBe("zh-Hans");
  });
});
