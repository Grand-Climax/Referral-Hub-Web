/** Shared layout + theme classes for MoH analytics pages (light/dark via design tokens) */

export const mohPageShell =
  "min-h-screen bg-background p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 select-none";

export const mohCard =
  "bg-card rounded-xl sm:rounded-2xl border border-border shadow-sm";

export const mohCardPad = "p-4 sm:p-6 lg:p-8";

export const mohHeading = "text-2xl sm:text-3xl font-bold tracking-tight text-foreground";

export const mohSubheading = "text-sm text-muted-foreground";

export const mohMetricTile =
  "bg-muted/40 p-4 rounded-xl border border-border flex flex-col justify-between";

export const mohTableWrap = "w-full overflow-x-auto -mx-1 px-1";

/** Recharts axis/grid strokes that work in light and dark */
export const mohChartGridStroke = "hsl(var(--border))";
export const mohChartTickFill = "hsl(var(--muted-foreground))";

/** Icon wells that work in light and dark */
export const mohIconBlue = "bg-blue-500/10";
export const mohIconGreen = "bg-green-500/10";
export const mohIconRed = "bg-red-500/10";
export const mohIconIndigo = "bg-indigo-500/10";
export const mohIconOrange = "bg-orange-500/10";
export const mohIconPurple = "bg-purple-500/10";
