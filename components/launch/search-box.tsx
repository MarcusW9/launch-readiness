"use client";

import { useId } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
}

/** The Products search field, shared by the Exceptions and Studio views so both match and read the same. */
export function SearchBox({ value, onChange }: SearchBoxProps) {
  const searchId = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={searchId} className="text-sm font-medium">
        Search products
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          id={searchId}
          type="search"
          placeholder="Search title, Cat No or critical path"
          className="px-8 [&::-webkit-search-cancel-button]:hidden"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {value ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onChange("")}
            className="absolute top-1/2 right-1.5 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <X className="size-4" aria-hidden />
          </button>
        ) : null}
      </div>
    </div>
  );
}
