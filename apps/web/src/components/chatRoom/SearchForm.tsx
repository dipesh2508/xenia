import { Search } from "lucide-react";

import { Label } from "@repo/ui/components/ui/label";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
} from "@repo/ui/components/ui/sidebar";

export function SearchForm({ ...props }: React.ComponentProps<"form">) {
  return (
    <form {...props}>
      <SidebarGroup className="py-0 px-0">
        <SidebarGroupContent className="relative">
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <SidebarInput
            id="search"
            placeholder="Search community..."
            className="pl-10 bg-primary-3/5 py-5 placeholder:text-secondary-5"
          />
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 select-none opacity-50 text-secondary-9" />
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  );
}
