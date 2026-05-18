/** Apply to Table root for consistent premium table styling. */
export const WORKSPACE_TABLE_CLASS =
  "workspace-table [&_thead]:bg-slate-100/90 [&_th]:text-xs [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-slate-600 [&_tbody_tr:nth-child(even)]:bg-slate-50/70 [&_tbody_tr]:border-slate-100 [&_td]:text-sm";

/** Wide tables: force horizontal scroll when columns exceed the card width. */
export const WORKSPACE_TABLE_MIN_WIDTH_CLASS = "min-w-[1280px] w-max";

/** Scroll container for workspace data tables (vertical + horizontal). */
export const WORKSPACE_TABLE_SCROLL_CLASS =
  "w-full min-w-0 overflow-x-auto overflow-y-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]";
