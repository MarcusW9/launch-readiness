import type { Metadata } from "next";
import { ProductsView } from "@/components/launch/products-view";
import { isFlagFilter, isStatusFilter, type ProductFilters } from "@/lib/launch/filters";

export const metadata: Metadata = { title: "Products | Launch Readiness (prototype)" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; flag?: string }>;
}) {
  const { status, flag } = await searchParams;
  const initialFilters: Partial<ProductFilters> = {};
  if (isStatusFilter(status)) initialFilters.status = status;
  if (isFlagFilter(flag)) initialFilters.flag = flag;

  return <ProductsView key={`${status}-${flag}`} initialFilters={initialFilters} />;
}
