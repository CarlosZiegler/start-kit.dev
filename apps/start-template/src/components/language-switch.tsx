import { Check, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { languages } from "@/lib/intl/i18n";

export function LanguageSwitch() {
  const { t, i18n } = useTranslation();
  const languagesList = languages?.map((language) => ({
    code: language,
    // @ts-expect-error - language is a string
    label: t(language) as string,
  }));

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger>
        <Button className="gap-2" size="sm" variant="outline">
          <Globe size={16} />
          <span>{t("LANGUAGE")}</span>
          <Badge className="ml-1 px-1 py-0 text-xs" variant="secondary">
            {i18n?.language?.toUpperCase()}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languagesList.map((language) => (
          <DropdownMenuItem
            className="flex justify-between"
            key={language.code}
            onClick={() => i18n.changeLanguage(language.code)}
          >
            {language.label}
            {i18n.language === language.code && <Check size={16} />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
