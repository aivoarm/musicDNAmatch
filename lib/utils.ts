import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { decode } from "he"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function decodeHtml(text: string) {
    if (!text) return "";
    return decode(text);
}

