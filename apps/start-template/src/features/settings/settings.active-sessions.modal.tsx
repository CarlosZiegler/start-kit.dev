"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authClient } from "@/lib/auth/auth-client";
import { activeSessionsOptions } from "@/lib/auth/queries";
import { getDeviceIconFromUserAgent, getDeviceInfo } from "@/lib/device-utils";

type ActiveSessionsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ActiveSessionsModal({
  open,
  onOpenChange,
}: ActiveSessionsModalProps) {
  const { t } = useTranslation();
  const { data: session } = authClient.useSession();
  const [isTerminating, setIsTerminating] = useState<string>();
  const qc = useQueryClient();
  const revokeSession = useMutation({
    mutationFn: async ({ token }: { token: string }) => {
      const result = await authClient.revokeSession({ token });
      if (result.error) {
        throw new Error(result.error.message || t("SESSION_TERMINATE_FAILED"), {
          cause: result.error,
        });
      }
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: activeSessionsOptions().queryKey });
      toast.success(t("SESSION_TERMINATED_SUCCESS"));
    },
  });

  const { data: sessionsData } = useQuery(activeSessionsOptions());

  const handleRevokeSession = async (token: string) => {
    setIsTerminating(token);
    try {
      await revokeSession.mutateAsync({ token });
    } catch {
      toast.error(t("SESSION_TERMINATE_FAILED"));
    } finally {
      setIsTerminating(undefined);
    }
  };

  type ActiveSession = {
    id: string;
    token?: string | null;
    userAgent?: string | null;
  };
  const sessions = (sessionsData?.data || []) as ActiveSession[];

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="w-11/12 sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("SETTINGS_SECURITY_SESSIONS_TITLE")}</DialogTitle>
          <DialogDescription>
            {t("SETTINGS_SECURITY_SESSIONS_DESC")}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[400px] space-y-4 overflow-y-auto">
          {sessions?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {t("SETTINGS_SECURITY_SESSIONS_DEVICE")}
                  </TableHead>
                  <TableHead>
                    {t("SETTINGS_SECURITY_SESSIONS_STATUS")}
                  </TableHead>
                  <TableHead>{t("ACTIONS")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((sessionItem) => {
                  const isCurrent = sessionItem.id === session?.session?.id;
                  const isLoading = isTerminating === sessionItem.token;

                  return (
                    <TableRow key={sessionItem.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getDeviceIconFromUserAgent(sessionItem.userAgent)}
                          <span className="text-sm">
                            {getDeviceInfo(
                              sessionItem.userAgent,
                              t("SETTINGS_SECURITY_SESSIONS_UNKNOWN_DEVICE")
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`rounded-full bg-gray-100 px-2 py-1 text-gray-800 text-xs dark:bg-gray-800 dark:text-gray-200 ${
                            isCurrent
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : ""
                          }`}
                        >
                          {isCurrent
                            ? t("SETTINGS_SECURITY_SESSIONS_CURRENT")
                            : t("SETTINGS_SECURITY_SESSIONS_ACTIVE")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          disabled={isLoading || isCurrent}
                          onClick={() =>
                            sessionItem.token &&
                            handleRevokeSession(sessionItem.token)
                          }
                          size="sm"
                          variant="outline"
                        >
                          {isLoading ? (
                            <Loader2 className="animate-spin" size={15} />
                          ) : (
                            t("TERMINATE")
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-sm">
              {t("SETTINGS_SECURITY_SESSIONS_NO_ACTIVE")}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            {t("CLOSE")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
