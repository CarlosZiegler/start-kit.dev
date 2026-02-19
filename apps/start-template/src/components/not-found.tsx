import { Link, useCanGoBack, useRouter } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, Home } from "lucide-react";
import type * as React from "react";
import { useTranslation } from "react-i18next";

import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

export function NotFound({ children }: { children?: React.ReactNode }) {
  const { t } = useTranslation();
  const router = useRouter();
  const canGoBack = useCanGoBack();

  const handleGoBack = () => {
    // Use router navigation to go back in history
    router.history.back();
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader className="pt-8 pb-6">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
            <AlertTriangle className="h-10 w-10 text-muted-foreground" />
          </div>
          <CardTitle className="mb-2 font-semibold text-2xl">
            {t("NOT_FOUND_TITLE")}
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            {children || t("NOT_FOUND_DESC")}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t("NOT_FOUND_MESSAGE")}
          </p>
        </CardContent>
        <CardFooter className="flex flex-col justify-center gap-3 pt-2 pb-8 sm:flex-row sm:gap-2">
          {canGoBack ? (
            <Button
              className="w-full sm:w-auto"
              onClick={handleGoBack}
              size="lg"
              variant="outline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("NOT_FOUND_GO_BACK")}
            </Button>
          ) : null}
          <Button
            className="flex w-full items-center gap-2 sm:w-auto"
            size="lg"
          >
            <Link className="flex items-center gap-2" to="/">
              <Home className="mr-2 h-4 w-4" />
              {t("HOME")}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
