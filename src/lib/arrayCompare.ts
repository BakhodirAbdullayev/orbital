// src/lib/utils/arrayCompare.ts

import { Timestamp } from "firebase/firestore";

/**
 * Ikki obyekt massivini chuqur taqqoslaydi.
 * Massiv ichidagi obyektlarning tuzilishi taqqoslanadigan deb faraz qiladi.
 *
 * @param arr1 Birinchi massiv.
 * @param arr2 Ikkinchi massiv.
 * @returns Massivlar chuqur teng bo'lsa true, aks holda false.
 */
export function areArraysDeepEqual<T extends object>(
  arr1: T[],
  arr2: T[]
): boolean {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    const obj1 = arr1[i];
    const obj2 = arr2[i];

    if (!isDeepEqual(obj1, obj2)) {
      return false;
    }
  }

  return true;
}

// Yakka qadriyatlarni chuqur taqqoslash uchun yordamchi funksiya (ichki obyektlar va Firestore Timestamp'larni boshqaradi)
function isDeepEqual(val1: any, val2: any): boolean {
  if (val1 === val2) {
    return true;
  }

  if (val1 && val2 && typeof val1 === "object" && typeof val2 === "object") {
    // Firestore Timestamp obyektlarini maxsus taqqoslash
    if (val1 instanceof Timestamp && val2 instanceof Timestamp) {
      return val1.isEqual(val2);
    }

    // Massivlarni rekursiv taqqoslash
    if (Array.isArray(val1) && Array.isArray(val2)) {
      return areArraysDeepEqual(val1, val2);
    }

    // Oddiy obyektlarni taqqoslash
    const keys1 = Object.keys(val1);
    const keys2 = Object.keys(val2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      if (!keys2.includes(key) || !isDeepEqual(val1[key], val2[key])) {
        return false;
      }
    }

    return true;
  }

  return false;
}
