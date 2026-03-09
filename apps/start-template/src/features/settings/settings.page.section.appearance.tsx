"use client";

import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";

import { LanguageSwitch } from "@/components/language-switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  return (
    <div className="space-y-6 px-4">
      <div>
        <h1 className="text-balance font-semibold text-2xl">
          {t("SETTINGS_APPEARANCE_TITLE_FULL")}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {t("SETTINGS_APPEARANCE_DESC")}
        </p>
      </div>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t("SETTINGS_THEME_TITLE")}</CardTitle>
          <CardDescription>{t("SETTINGS_THEME_DESC")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <button
              className={`w-full cursor-pointer rounded-lg border-2 p-4 text-center transition-colors ${
                theme === "light"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => handleThemeChange("light")}
              type="button"
            >
              <div className="mx-auto mb-2 h-8 w-8 rounded-full border bg-white" />
              <p className="font-medium">{t("SETTINGS_THEME_LIGHT")}</p>
            </button>

            <button
              className={`w-full cursor-pointer rounded-lg border-2 p-4 text-center transition-colors ${
                theme === "dark"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => handleThemeChange("dark")}
              type="button"
            >
              <div className="mx-auto mb-2 h-8 w-8 rounded-full bg-gray-900" />
              <p className="font-medium">{t("SETTINGS_THEME_DARK")}</p>
            </button>

            <button
              className={`w-full cursor-pointer rounded-lg border-2 p-4 text-center transition-colors ${
                theme === "system"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => handleThemeChange("system")}
              type="button"
            >
              <div className="mx-auto mb-2 h-8 w-8 rounded-full bg-gradient-to-r from-white to-gray-900" />
              <p className="font-medium">{t("SETTINGS_THEME_SYSTEM")}</p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t("LANGUAGE")}</CardTitle>
          <CardDescription>{t("SETTINGS_LANGUAGE_DESC")}</CardDescription>
        </CardHeader>
        <CardContent>
          <LanguageSwitch />
        </CardContent>
      </Card>
    </div>
  );
}
