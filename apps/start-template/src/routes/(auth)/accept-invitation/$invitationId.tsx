import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { AlertCircleIcon, MailIcon, UsersIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  acceptInvitationOptions,
  rejectInvitationOptions,
} from "@/features/organizations/organizations.factory.mutations";
import { invitationByIdOptions } from "@/features/organizations/organizations.factory.queries";

export const Route = createFileRoute("/(auth)/accept-invitation/$invitationId")(
  {
    component: AcceptInvitationPage,
    // beforeLoad: async ({ params }) => {
    //   // If user is not authenticated, redirect to login
    //   const session = await authClient.getSession();
    //   if (!session.data?.user) {
    //     throw redirect({
    //       to: "/sign-in",
    //       search: { redirect: `/accept-invitation/${params.invitationId}` },
    //     });
    //   }
    //   return { session: session.data };
    // },
  }
);

function AcceptInvitationPage() {
  const { t } = useTranslation();
  const { invitationId } = Route.useParams();
  const router = useRouter();

  // Fetch invitation details using React Query
  const {
    data: invitation,
    error,
    isLoading: isLoadingInvitation,
  } = useQuery(invitationByIdOptions(invitationId));

  // Accept invitation mutation
  const acceptInvitationMutation = useMutation({
    ...acceptInvitationOptions(),
    onSuccess: () => {
      toast.success(t("INVITATION_ACCEPT_SUCCESS"));
      // Redirect to dashboard or organizations page
      window.location.href = "/organizations";
    },
    onError: (error: Error) => {
      toast.error(error.message || t("INVITATION_ACCEPT_FAILED"));
    },
  });

  // Reject invitation mutation
  const rejectInvitationMutation = useMutation({
    ...rejectInvitationOptions(),
    onSuccess: () => {
      toast.success(t("INVITATION_REJECT_SUCCESS"));
      window.location.href = "/overview";
    },
    onError: (error: Error) => {
      toast.error(error.message || t("INVITATION_REJECT_FAILED"));
    },
  });

  if (error) {
    return (
      <div>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircleIcon className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>{t("INVITATION_INVALID_TITLE")}</CardTitle>
            <CardDescription>{t("INVITATION_INVALID_DESC")}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4 text-muted-foreground text-sm">
              {error.message}
            </p>
            <Button onClick={() => router.navigate({ to: "/overview" })}>
              {t("BACK_TO_DASHBOARD")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoadingInvitation) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("INVITATION_LOADING_TITLE")}</CardTitle>
          <CardDescription>{t("INVITATION_LOADING_DESC")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!invitation) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>{t("INVITATION_NOT_FOUND_TITLE")}</CardTitle>
          <CardDescription>{t("INVITATION_NOT_FOUND_DESC")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const isExpired = new Date(invitation.expiresAt) < new Date();
  const isAccepted = invitation.status === "accepted";
  const isRejected = invitation.status === "rejected";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <MailIcon className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>{t("ORG_INVITATION")}</CardTitle>
          <CardDescription>{t("ORG_INVITATION_DESC")}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2 text-center">
            <div className="flex items-center justify-center gap-2">
              <UsersIcon className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">{invitation.organizationName}</h3>
            </div>
            <Badge className="capitalize" variant="secondary">
              {t("ROLE")}: {invitation.role}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{t("INVITED_BY")}</span>
              <span className="font-medium">{invitation.inviterEmail}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{t("ORG_EXPIRES")}:</span>
              <span
                className={`font-medium ${isExpired ? "text-destructive" : ""}`}
              >
                {new Date(invitation.expiresAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {isExpired && (
            <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3">
              <p className="text-center text-destructive text-sm">
                {t("INVITATION_EXPIRED_DESC")}
              </p>
            </div>
          )}

          {isAccepted && (
            <div className="rounded-md border border-green-200 bg-green-50 p-3">
              <p className="text-center text-green-700 text-sm">
                {t("INVITATION_ALREADY_ACCEPTED")}
              </p>
            </div>
          )}

          {isRejected && (
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
              <p className="text-center text-gray-700 text-sm">
                {t("INVITATION_REJECTED_DESC")}
              </p>
            </div>
          )}

          {!(isExpired || isAccepted || isRejected) && (
            <div className="flex gap-3">
              <Button
                className="flex-1"
                disabled={
                  acceptInvitationMutation.isPending ||
                  rejectInvitationMutation.isPending
                }
                onClick={() => rejectInvitationMutation.mutate(invitationId)}
                variant="outline"
              >
                {t("DECLINE")}
              </Button>
              <Button
                className="flex-1"
                disabled={
                  acceptInvitationMutation.isPending ||
                  rejectInvitationMutation.isPending
                }
                onClick={() => acceptInvitationMutation.mutate(invitationId)}
              >
                {acceptInvitationMutation.isPending
                  ? t("JOINING")
                  : t("JOIN_ORGANIZATION")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
