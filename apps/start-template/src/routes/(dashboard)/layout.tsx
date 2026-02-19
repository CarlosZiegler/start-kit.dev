import {
  ClientOnly,
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useRouterState,
} from "@tanstack/react-router";

import { AppSidebar } from "@/components/app-sidebar";
import { ThemeSwitcher } from "@/components/theme-switcher";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { authQueryOptions } from "@/lib/auth/queries";

export const Route = createFileRoute("/(dashboard)")({
  component: RouteComponent,

  beforeLoad: async ({ context }) => {
    const qc = context.queryClient;

    const session = await qc.ensureQueryData(authQueryOptions());
    return { session };
  },

  loader: ({ context }) => {
    const { session } = context;

    if (!session?.user?.id) {
      throw redirect({ to: "/sign-in" });
    }
    return {
      session,
    };
  },
});

function RouteComponent() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const crumbs = currentPath?.split("/").filter(Boolean);

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <ClientOnly
          fallback={<Skeleton className="h-16 w-full bg-transparent" />}
        >
          <header className="flex h-16 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" />
              <Breadcrumb className="hidden sm:block">
                <BreadcrumbList>
                  {crumbs.map((match, index) => {
                    const isLast = index === crumbs.length - 1;
                    const link = `/${crumbs.slice(0, index + 1).join("/")}`;
                    return (
                      <BreadcrumbItem key={link}>
                        {!isLast && (
                          <BreadcrumbLink>
                            <Link to={link}>{match}</Link>
                          </BreadcrumbLink>
                        )}
                        {isLast && <BreadcrumbPage>{match}</BreadcrumbPage>}
                        {!isLast && (
                          <BreadcrumbSeparator className="hidden md:block" />
                        )}
                      </BreadcrumbItem>
                    );
                  })}
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <ThemeSwitcher className="mr-4 ml-auto" />
          </header>
        </ClientOnly>
        <div className="flex flex-col p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
