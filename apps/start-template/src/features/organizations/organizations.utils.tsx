import { CrownIcon, ShieldIcon, UsersIcon } from "lucide-react";
import { z } from "zod";

/**
 * Shared Zod schema for organization forms (create/edit)
 */
export const organizationFormSchema = z.object({
  name: z
    .string()
    .min(1, "Organization name is required")
    .max(100, "Name must be less than 100 characters"),
  slug: z
    .string()
    .min(1, "Organization slug is required")
    .max(50, "Slug must be less than 50 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    )
    .transform((val) => val.toLowerCase()),
  logo: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

export type OrganizationFormData = z.infer<typeof organizationFormSchema>;

/**
 * Get the appropriate icon for a role
 */
export function getRoleIcon(role: string, className = "size-3") {
  switch (role) {
    case "owner":
      return <CrownIcon className={className} />;
    case "admin":
      return <ShieldIcon className={className} />;
    default:
      return <UsersIcon className={className} />;
  }
}

/**
 * Get the badge variant for a role
 */
export function getRoleBadgeVariant(
  role: string
): "default" | "secondary" | "outline" {
  switch (role) {
    case "owner":
      return "default";
    case "admin":
      return "secondary";
    default:
      return "outline";
  }
}

/**
 * Capitalize first letter of a role
 */
export function formatRole(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

/**
 * Invitation status badge variants
 */
type InvitationStatusType = "pending" | "accepted" | "rejected" | "expired";

const INVITATION_STATUS_BADGE_VARIANTS = {
  pending: "secondary",
  accepted: "default",
  rejected: "destructive",
  expired: "outline",
} as const;

export function getInvitationStatusBadgeVariant(
  status: string
): "default" | "secondary" | "outline" | "destructive" {
  const normalizedStatus = status.toLowerCase() as InvitationStatusType;
  return INVITATION_STATUS_BADGE_VARIANTS[normalizedStatus] ?? "outline";
}

/**
 * Format invitation status for display
 */
export function formatInvitationStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}
