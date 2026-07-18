/**
 * Re-export our cn utility from the canonical location.
 * shadcn components import from "@/lib/utils" by convention.
 * Our own components import from "@/lib/utils/cn".
 * Both resolve to the same function.
 */
export { cn } from "@/lib/utils/cn";
