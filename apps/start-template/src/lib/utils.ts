import { type ClassValue, clsx } from "clsx";
import { customAlphabet } from "nanoid";
import { twMerge } from "tailwind-merge";
import { v7 } from "uuid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789");

export const uuid = () => v7();

export const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
