import { createFileRoute } from "@tanstack/react-router";

import { PricingContent } from "@/components/pricing-content";
import { DEFAULT_SITE_NAME, seo } from "@/utils/seo";

export const Route = createFileRoute("/pricing")({
  head: () => {
    const { meta, links } = seo({
      title: `Pricing - ${DEFAULT_SITE_NAME}`,
      description: "Simple, transparent pricing plans for Start Kit.",
      url: "/pricing",
      canonicalUrl: "/pricing",
      image: "/images/landing/hero-bg.png",
    });

    return { meta, links };
  },
  component: PricingPage,
});

function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <PricingContent />
      </div>
    </div>
  );
}
