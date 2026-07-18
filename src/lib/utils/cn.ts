import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/*
 * cn() — className utility
 * 
 * THE PROBLEM:
 * When building reusable components, you often want to let the consumer
 * override Tailwind classes. But Tailwind classes don't "cascade" — 
 * both classes apply and the one later in the CSS file wins (not the 
 * one later in the className string).
 * 
 * Example without cn():
 *   <Button className="bg-red-500" />
 *   // Component internally has "bg-brand-primary"
 *   // Both classes apply! Which color wins? Unpredictable.
 * 
 * WHAT cn() DOES:
 * 1. clsx() — merges conditional classes: cn("base", isActive && "active")
 * 2. twMerge() — deduplicates conflicting Tailwind classes, last one wins
 * 
 * Example with cn():
 *   cn("bg-brand-primary px-4", "bg-red-500")
 *   // Result: "px-4 bg-red-500" — red wins, px-4 is kept
 * 
 * WHY THIS IS IN lib/utils/:
 * It's a pure utility with no business logic. It belongs in the lowest
 * layer of our architecture. Every component imports it.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
