import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { DEFAULT_SITE_NAME, seo } from "@/utils/seo";

export const Route = createFileRoute("/terms")({
  head: () => {
    const { meta, links } = seo({
      title: `Terms of Service - ${DEFAULT_SITE_NAME}`,
      description: "Terms and conditions for using Start Kit.",
      url: "/terms",
      canonicalUrl: "/terms",
      image: "/images/landing/hero-bg.png",
    });

    return { meta, links };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  return <div>{t("TERMS_PLACEHOLDER")}</div>;
}
