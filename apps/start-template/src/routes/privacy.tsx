import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { DEFAULT_SITE_NAME, seo } from "@/utils/seo";

export const Route = createFileRoute("/privacy")({
  head: () => {
    const { meta, links } = seo({
      title: `Privacy Policy - ${DEFAULT_SITE_NAME}`,
      description: "Learn how Start Kit handles and protects your data.",
      url: "/privacy",
      canonicalUrl: "/privacy",
      image: "/images/landing/hero-bg.png",
    });

    return { meta, links };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  return <div>{t("PRIVACY_PLACEHOLDER")}</div>;
}
