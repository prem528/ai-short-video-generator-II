import clsx from "clsx";
import { twMerge } from "tailwind-merge";

// Utility function to merge class names
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Animation and hover styles
export const fadeInUp = "animate-in fade-in-0 slide-in-from-bottom-8 duration-700";
export const fadeIn = "animate-in fade-in-0 duration-1000";
export const scaleIn = "animate-in zoom-in-50 duration-500";
export const hoverScale = "transition-transform duration-300 hover:scale-105";
