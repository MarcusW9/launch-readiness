import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatShortDate } from "@/lib/launch/readiness";
import { assessProduct } from "@/lib/launch/readiness-model";
import {
  groupByStyle,
  isDataError,
  NOT_PROVIDED,
  STUDIO_COLUMNS,
  type StudioColumn,
} from "@/lib/launch/studio";
import type { Product } from "@/lib/launch/types";
import { StatusBadge } from "./status";

function StudioValue({ value }: { value: string | undefined }) {
  const text = value?.trim();
  if (!text) return <span className="text-muted-foreground">{NOT_PROVIDED}</span>;
  if (isDataError(text)) {
    return (
      <span className="font-medium text-danger" title="Data error in the source data">
        <span className="sr-only">Data error: </span>
        {text}
      </span>
    );
  }
  return <>{text}</>;
}

const OPTIONAL_COLUMNS = STUDIO_COLUMNS.filter(
  (column) => !["id", "name", "launch", "status"].includes(column.key),
);

function OptionalCell({ column, product }: { column: StudioColumn; product: Product }) {
  return (
    <TableCell className="max-w-44 align-middle whitespace-normal">
      <StudioValue value={column.read(product)} />
    </TableCell>
  );
}

function StudioRow({ product }: { product: Product }) {
  const [critical, ...rest] = OPTIONAL_COLUMNS;

  return (
    <TableRow>
      <TableCell className="align-middle whitespace-nowrap tabular-nums">{product.id}</TableCell>
      <TableCell className="max-w-56 align-middle whitespace-normal">
        <Link
          href={`/products/${product.id}`}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {product.name}
        </Link>
        <div className="mt-1">
          <Badge variant="outline">{product.brand}</Badge>
        </div>
      </TableCell>
      <OptionalCell column={critical} product={product} />
      {rest.map((column) => (
        <OptionalCell key={column.key} column={column} product={product} />
      ))}
      <TableCell className="align-middle whitespace-nowrap">{formatShortDate(product.launchDate)}</TableCell>
      <TableCell className="align-middle">
        <StatusBadge assessment={assessProduct(product)} />
      </TableCell>
    </TableRow>
  );
}

interface StudioTableProps {
  products: Product[];
  grouped: boolean;
  caption: string;
}

export function StudioTable({ products, grouped, caption }: StudioTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table className="min-w-[72rem]">
        <caption className="sr-only">{caption}</caption>
        <TableHeader>
          <TableRow>
            {STUDIO_COLUMNS.map((column) => (
              <TableHead key={column.key} className={column.key === "launch" ? "whitespace-nowrap" : undefined}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {grouped
            ? groupByStyle(products).map((group) => (
                <StyleGroupRows key={group.style} style={group.style} products={group.products} />
              ))
            : products.map((product) => <StudioRow key={product.id} product={product} />)}
        </TableBody>
      </Table>
    </div>
  );
}

function StyleGroupRows({ style, products }: { style: string; products: Product[] }) {
  return (
    <>
      <TableRow className="bg-muted/50 hover:bg-muted/50">
        <TableHead colSpan={STUDIO_COLUMNS.length} scope="colgroup" className="h-9 text-foreground">
          {style} · {products.length} {products.length === 1 ? "line" : "lines"}
        </TableHead>
      </TableRow>
      {products.map((product) => (
        <StudioRow key={product.id} product={product} />
      ))}
    </>
  );
}
