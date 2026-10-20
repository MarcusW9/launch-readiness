import type { Metadata } from "next";
import { ProductsView } from "@/components/launch/products-view";
import {
  isInformationFilter,
  isOutstandingFilter,
  isReadinessFilter,
  type ProductFilters,
} from "@/lib/launch/filters";

export const metadata: Metadata = { title: "Products | Launch Readiness (prototype)" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ readiness?: string; outstanding?: string; information?: string }>;
}) {
  const { readiness, outstanding, information } = await searchParams;
  const initialFilters: Partial<ProductFilters> = {};
  if (isReadinessFilter(readiness)) initialFilters.readiness = readiness;
  if (isOutstandingFilter(outstanding)) initialFilters.outstanding = outstanding;
  if (isInformationFilter(information)) initialFilters.information = information;

  return (
    <ProductsView
      key={`${readiness}-${outstanding}-${information}`}
      initialFilters={initialFilters}
    />
  );
}
