import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function Page({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-6">{children}</main>
  );
}

interface Crumb {
  label: string;
  href: string;
}

export function Crumbs({ items }: { items: Crumb[] }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={item.href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={item.href} />}>{item.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {isLast ? null : <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

interface PageHeadingProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHeading({ title, description, children }: PageHeadingProps) {
  return (
    <div className="flex flex-col gap-2">
      {children}
      <h1 className="text-3xl font-semibold tracking-tight text-balance">{title}</h1>
      {description ? <p className="max-w-3xl leading-relaxed text-pretty text-muted-foreground">{description}</p> : null}
    </div>
  );
}

export function SectionHeading({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h2 id={id} className="text-xl font-semibold tracking-tight text-balance">
      {children}
    </h2>
  );
}
