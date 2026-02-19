import { createFileRoute, Link } from "@tanstack/react-router";
import { Beaker, Blocks } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/(dashboard)/lab/")({
  component: LabPage,
});

function LabPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 font-bold text-2xl">
          <Beaker className="size-6" />
          {t("LAB_TITLE")}
        </h1>
        <p className="text-muted-foreground">{t("LAB_DESC")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Blocks className="size-5" />
              {t("LAB_BLOCK_GENERATOR_TITLE")}
            </CardTitle>
            <CardDescription>{t("LAB_BLOCK_GENERATOR_DESC")}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              {t("LAB_BLOCK_GENERATOR_LONG_DESC")}
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/lab/block-generator">
              <Button type="button">{t("LAB_TRY_IT")}</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
