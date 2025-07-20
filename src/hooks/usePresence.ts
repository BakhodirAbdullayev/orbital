// src/hooks/usePresence.ts
import { useEffect } from "react";
import {
  onValue,
  ref,
  set,
  onDisconnect,
  serverTimestamp as rtdbServerTimestamp,
} from "firebase/database";
import { auth, rtdb } from "@/config/firebase"; // firebase.js faylingizdan to'g'ri yo'lni kiriting
import { onAuthStateChanged } from "firebase/auth";

export const usePresence = () => {
  useEffect(() => {
    let unsubscribeAuth: (() => void) | null = null;
    let connectedRefUnsubscribe: (() => void) | null = null;

    unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // Har safar foydalanuvchi holati o'zgarganda (login/logout/qayta ulanish),
      // avvalgi eshituvchilarni va onDisconnect sozlamalarini tozalash.
      if (connectedRefUnsubscribe) {
        connectedRefUnsubscribe();
        connectedRefUnsubscribe = null;
      }

      if (user) {
        const userStatusDatabaseRef = ref(rtdb, `/status/${user.uid}`);
        const connectedRef = ref(rtdb, ".info/connected");

        // Oldingi onDisconnect operatsiyasini bekor qilish.
        // Bu foydalanuvchi brauzerni yopmasdan qayta ulanganda toza holatni ta'minlaydi.
        onDisconnect(userStatusDatabaseRef).cancel().catch(console.error);

        // `.info/connected` ref'ga eshituvchi sozlash
        connectedRefUnsubscribe = onValue(connectedRef, (snap) => {
          if (snap.val() === true) {
            // Foydalanuvchi hozirda Realtime Database'ga ulangan.
            // 1. Ulanish uzilganda bajariladigan operatsiyani sozlash (foydalanuvchini oflayn belgilash).
            onDisconnect(userStatusDatabaseRef)
              .set({
                online: false,
                lastOnline: rtdbServerTimestamp(), // Server tomonidan belgilangan vaqt
              })
              .catch(console.error); // Xatolarni qayd etish

            // 2. Foydalanuvchini hozirda onlayn deb belgilash.
            set(userStatusDatabaseRef, {
              online: true,
              lastOnline: rtdbServerTimestamp(), // Onlayn bo'lgan vaqt
            }).catch(console.error); // Xatolarni qayd etish
          } else {
            // Foydalanuvchi RTDB'dan uzilgan. `onDisconnect` avtomatik tarzda holatni yangilaydi.
            // Bu yerda qo'shimcha harakat kerak emas.
          }
        });
      }
      // Agar 'user' null bo'lsa (tizimdan chiqqan),
      // yuqoridagi `if (user)` bloki ishga tushmaydi va tozalash return funksiyasida amalga oshadi.
    });

    // Komponent o'chirilganda yoki effekt qayta ishga tushganda eshituvchilarni tozalash funksiyasi.
    return () => {
      if (unsubscribeAuth) {
        unsubscribeAuth();
      }
      if (connectedRefUnsubscribe) {
        connectedRefUnsubscribe();
      }
      // Komponent o'chirilganda ham mavjud onDisconnect operatsiyasini bekor qilishni urinish
      // Bu foydalanuvchi chiqib ketganda (masalan, sahifani yopganda) muhim.
      if (auth.currentUser) {
        const userStatusDatabaseRef = ref(
          rtdb,
          `/status/${auth.currentUser.uid}`
        );
        onDisconnect(userStatusDatabaseRef).cancel().catch(console.error);
      }
    };
  }, []); // Dependensiyalar massivi bo'sh, shu sababli effekt faqat bir marta komponent yuklanganda ishga tushadi.
};
