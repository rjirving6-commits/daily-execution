import * as React from "react"
import { cn } from "@/lib/utils"

const PercentInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          type="number"
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background pl-3 pr-8 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
      </div>
    )
  }
)
PercentInput.displayName = "PercentInput"

export { PercentInput }
