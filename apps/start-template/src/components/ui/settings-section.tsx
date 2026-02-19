"use client";

import type { ReactNode } from "react";

import { useTranslation } from "react-i18next";

export type SettingsSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function SettingsSection({
  title,
  description,
  children,
}: SettingsSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 px-4">
      <div>
        <h1 className="text-balance font-semibold text-2xl">{t(title)}</h1>
        {description && (
          <p className="mt-1 text-muted-foreground">{t(description)}</p>
        )}
      </div>
      {children}
    </div>
  );
}
