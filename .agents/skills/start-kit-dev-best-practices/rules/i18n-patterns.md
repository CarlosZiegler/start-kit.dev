# i18n-patterns: Follow i18next Translation Conventions

## Priority: MEDIUM

## Explanation

Internationalization uses i18next with react-i18next. Translations are loaded dynamically from locale files. All user-facing text must use translation keys via the `t()` function from `useTranslation()`. SSR language detection uses cookies.

## Bad Example

```tsx
// Wrong: hardcoded strings in UI
function WelcomeMessage() {
  return <h1>Welcome to our app!</h1>;
}

// Wrong: template literals for user-facing text
function ErrorMessage({ count }) {
  return <p>You have {count} errors</p>;
}
```

## Good Example

```tsx
// Using translation keys
import { useTranslation } from "react-i18next";

function WelcomeMessage() {
  const { t } = useTranslation();
  return <h1>{t("common.welcome")}</h1>;
}

function ErrorMessage({ count }) {
  const { t } = useTranslation();
  return <p>{t("common.errorCount", { count })}</p>;
}
```

## Good Example: SSR Language Detection

```typescript
// src/lib/intl/i18n.tsx — language detection
import { createIsomorphicFn } from "@tanstack/react-start";

const setSSRLanguage = createIsomorphicFn()
  .server(async () => {
    const { getCookie } = await import("@tanstack/react-start/server");
    const cookieLang = getCookie("i18nextLng");
    if (cookieLang) await i18n.changeLanguage(cookieLang);
  })
  .client(() => {
    // Client detects from cookie automatically
  });

// Called in __root.tsx beforeLoad
export const Route = createRootRouteWithContext()({
  beforeLoad: async () => {
    await setSSRLanguage();
  },
});
```

## Good Example: Language Switching

```typescript
import { changeLanguage } from "@/lib/intl/i18n";

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <Select value={i18n.language} onValueChange={(lang) => changeLanguage(lang)}>
      <SelectItem value="en">English</SelectItem>
      <SelectItem value="pt">Portuguese</SelectItem>
    </Select>
  );
}
```

## Context

- i18n config: `src/lib/intl/i18n.tsx`
- Locale files loaded dynamically (not bundled)
- Language stored in `i18nextLng` cookie (365 day expiry)
- SSR language detected from cookie in `__root.tsx` beforeLoad
- Fallback language: English
- Use `t("namespace.key")` for translations
- Use `t("key", { variable })` for interpolation
- Toast messages: `toast.success(t("toast.created"))`, `toast.error(t("toast.error"))`
- In tests, i18n is mocked to return keys as-is (see `vitest.setup.ts`)
