import { useTranslation } from "react-i18next";

import { PricingContent } from "@/components/pricing-content";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type SubscriptionPlanDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlanName: string | undefined;
  buttonLabel: string;
  buttonVariant?: "default" | "outline";
};

export function SubscriptionPlanDialog({
  isOpen,
  onOpenChange,
  currentPlanName,
  buttonLabel,
  buttonVariant = "outline",
}: SubscriptionPlanDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog onOpenChange={onOpenChange} open={isOpen}>
      <DialogTrigger>
        <Button variant={buttonVariant}>{buttonLabel}</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-7xl">
        <DialogHeader>
          <DialogTitle>{buttonLabel}</DialogTitle>
          <DialogDescription>{t("PRICING_DESCRIPTION")}</DialogDescription>
        </DialogHeader>
        <PricingContent currentPlanName={currentPlanName} />
      </DialogContent>
    </Dialog>
  );
}
