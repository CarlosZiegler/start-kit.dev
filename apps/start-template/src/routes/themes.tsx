import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { ThemesPage } from "@/features/themes/themes.page";
import { themeSearchParamsSchema } from "@/features/themes/themes.search-params";
import type { ThemeConfig } from "@/features/themes/themes.types";
import { DEFAULT_SITE_NAME, seo } from "@/utils/seo";

export const Route = createFileRoute("/themes")({
  validateSearch: themeSearchParamsSchema,
  head: () => {
    const { meta, links } = seo({
      title: `Theme Customizer - ${DEFAULT_SITE_NAME}`,
      description:
        "Customize your Start Kit theme. Pick colors, radius, and font, preview live, then copy CSS or share via URL.",
      url: "/themes",
      canonicalUrl: "/themes",
      image: "/images/landing/hero-bg.png",
    });

    return { meta, links };
  },
  component: ThemesRoute,
});

function ThemesRoute() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const config: ThemeConfig = {
    baseColor: search.baseColor,
    theme: search.theme,
    radius: search.radius,
    font: search.font,
    customColor: search.customColor,
  };

  const handleConfigChange = (newConfig: ThemeConfig) => {
    navigate({
      search: {
        baseColor: newConfig.baseColor,
        theme: newConfig.theme,
        radius: newConfig.radius,
        font: newConfig.font,
        customColor: newConfig.customColor,
      },
    });
  };

  return <ThemesPage config={config} onConfigChange={handleConfigChange} />;
}
