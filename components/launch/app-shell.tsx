"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NotificationsMenu } from "@/components/launch/notifications-menu";
import { ThemeToggle } from "@/components/launch/theme-toggle";
import { Toaster } from "@/components/launch/toaster";
import { Button } from "@/components/ui/button";
import type { Session } from "@/lib/auth";
import { SessionProvider, useSession } from "@/lib/auth/session-context";
import { RemindCommercial } from "@/components/launch/remind-commercial";
import { RoleSwitcher } from "@/components/launch/role-switcher";
import { DEMO_TODAY, formatLongDate } from "@/lib/launch/readiness";
import { assessProduct } from "@/lib/launch/readiness-model";
import { NotificationsProvider, useNotifications } from "@/lib/launch/notifications";
import { LaunchProvider, useLaunch } from "@/lib/launch/store";
import type { Product } from "@/lib/launch/types";
import { cn } from "@/lib/utils";

function PrototypeStrip() {
  const { resetDemoData } = useLaunch();
  const { clearNotifications } = useNotifications();
  const { can } = useSession();
  return (
    <div className="bg-info-subtle text-info">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-1.5 md:px-6">
        <p className="text-sm">
          Portfolio prototype using synthetic demo data. Demo date: {formatLongDate(DEMO_TODAY)}.
        </p>
        {can("demo:reset") ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              resetDemoData();
              clearNotifications();
            }}
          >
            Reset demo data
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
        active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}

function Chrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { products } = useLaunch();
  const actionCount = products.filter((product) => {
    const assessment = assessProduct(product);
    return assessment.isPreparing && assessment.status !== "On Track";
  }).length;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-card">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 md:px-6">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="text-lg font-semibold tracking-tight">Launch Readiness</span>
            <span className="hidden text-sm text-muted-foreground sm:inline">Northwind Home</span>
          </Link>
          <nav aria-label="Primary" className="-mx-2 flex flex-wrap items-center gap-1">
            <NavLink href="/" active={pathname === "/"}>
              Overview
            </NavLink>
            <NavLink href="/products" active={pathname.startsWith("/products")}>
              Products
            </NavLink>
            <NavLink href="/action-required" active={pathname.startsWith("/action-required")}>
              {`Action Required (${actionCount})`}
            </NavLink>
            <NavLink href="/how-it-works" active={pathname.startsWith("/how-it-works")}>
              How it works
            </NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <RemindCommercial />
            <RoleSwitcher />
            <NotificationsMenu />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <PrototypeStrip />
      <div className="flex-1">{children}</div>
      <Toaster />
      <footer className="border-t bg-card">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-6 md:px-6">
          <nav aria-label="Footer" className="flex flex-wrap gap-4 text-sm">
            <Link href="/how-it-works" className="underline-offset-4 hover:underline">
              How it works
            </Link>
            <Link href="/about" className="underline-offset-4 hover:underline">
              About this prototype
            </Link>
          </nav>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Launch Readiness is a portfolio prototype for a fictional retailer, Northwind Home. All products, IDs and
            statuses are fictional demo data and are not connected to any real system.
          </p>
        </div>
      </footer>
    </div>
  );
}

export function AppShell({
  initialProducts,
  session,
  children,
}: {
  initialProducts: Product[];
  session: Session | null;
  children: ReactNode;
}) {
  return (
    <SessionProvider session={session}>
      <LaunchProvider initialProducts={initialProducts}>
        <NotificationsProvider>
          <Chrome>{children}</Chrome>
        </NotificationsProvider>
      </LaunchProvider>
    </SessionProvider>
  );
}
