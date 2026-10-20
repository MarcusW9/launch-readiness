import type { ComponentProps } from "react";
import type { VariantProps } from "class-variance-authority";
import { Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DownloadButtonProps = Omit<ComponentProps<"a">, "href" | "download"> &
  VariantProps<typeof buttonVariants> & {
    href: string;
    fileName: string;
  };

export function DownloadButton({ href, fileName, variant, size, className, children, ...props }: DownloadButtonProps) {
  return (
    <a href={href} download={fileName} className={cn(buttonVariants({ variant, size }), className)} {...props}>
      <Download aria-hidden />
      {children}
    </a>
  );
}
