import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface CategoryOption {
  id: string | null;
  name: string;
  level?: number;
  parent_id?: string | null;
}

interface CascadingSelectProps {
  parentOptions: CategoryOption[];
  childOptions: CategoryOption[];
  parentValue: string | null;
  childValue: string | null;
  onParentChange: (value: string | null) => void;
  onChildChange: (value: string | null) => void;
  parentPlaceholder?: string;
  childPlaceholder?: string;
  isLoading?: boolean;
  className?: string;
}

export function CascadingSelect({
  parentOptions,
  childOptions,
  parentValue,
  childValue,
  onParentChange,
  onChildChange,
  parentPlaceholder = "Select parent category",
  childPlaceholder = "Select subcategory",
  isLoading = false,
  className,
}: CascadingSelectProps) {
  const [openParent, setOpenParent] = React.useState(false);
  const [openChild, setOpenChild] = React.useState(false);

  const selectedParent = React.useMemo(() => {
    return parentOptions.find((option) => option.id === parentValue);
  }, [parentOptions, parentValue]);

  const selectedChild = React.useMemo(() => {
    return childOptions.find((option) => option.id === childValue);
  }, [childOptions, childValue]);

  return (
    <div className={cn("flex flex-col sm:flex-row gap-2", className)}>
      <Popover open={openParent} onOpenChange={setOpenParent}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={openParent}
            className="w-full sm:w-[200px] justify-between"
          >
            {selectedParent ? selectedParent.name : parentPlaceholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full sm:w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search category..." />
            <CommandEmpty>No category found.</CommandEmpty>
            <CommandGroup>
              {parentOptions.map((option) => (
                <CommandItem
                  key={option.id || "all"}
                  value={option.name}
                  onSelect={() => {
                    onParentChange(option.id);
                    setOpenParent(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedParent?.id === option.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {option.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <Popover open={openChild} onOpenChange={setOpenChild}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={openChild}
            className="w-full sm:w-[200px] justify-between"
            disabled={!parentValue || childOptions.length <= 1}
          >
            {selectedChild ? selectedChild.name : childPlaceholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full sm:w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search subcategory..." />
            <CommandEmpty>No subcategory found.</CommandEmpty>
            <CommandGroup>
              {childOptions.map((option) => (
                <CommandItem
                  key={option.id || "all"}
                  value={option.name}
                  onSelect={() => {
                    onChildChange(option.id);
                    setOpenChild(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedChild?.id === option.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {option.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}