"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch box-border inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-8 data-[size=default]:min-h-8 data-[size=default]:w-[52px] data-[size=default]:min-w-[52px] data-[size=default]:p-[3px] data-[size=sm]:h-[26px] data-[size=sm]:min-h-[26px] data-[size=sm]:w-[42px] data-[size=sm]:min-w-[42px] data-[size=sm]:p-[3px] data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block shrink-0 rounded-full bg-background ring-0 transition-transform will-change-transform group-data-[size=default]/switch:size-[26px] group-data-[size=sm]/switch:size-[21px] data-[state=unchecked]:translate-x-[-2px] data-[state=checked]:translate-x-6 group-data-[size=sm]/switch:data-[state=checked]:translate-x-[15px] dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
