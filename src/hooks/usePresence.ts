// src/hooks/usePresence.ts
import { useEffect } from 'react';
import {
  onValue,
  ref,
  set,
  onDisconnect,
  serverTimestamp as rtdbServerTimestamp,
} from 'firebase/database';
import {
  doc,
  updateDoc,
  serverTimestamp as firestoreServerTimestamp,
} from 'firebase/firestore';
import { auth, rtdb, db } from '@/config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export const usePresence = () => {
  useEffect(() => {
    let unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // Foydalanuvchi holati o'zgarganda logikani bajarish
      if (user) {
        // Firestore dagi foydalanuvchi holatiga bog'lanish
        const userFirestoreRef = doc(db, 'users', user.uid);
        // Realtime Database dagi foydalanuvchi holatiga bog'lanish
        const userStatusDatabaseRef = ref(rtdb, `/status/${user.uid}`);
        const connectedRef = ref(rtdb, '.info/connected');

        // Foydalanuvchi onlayn bo'lganida ham Firestore'ni ham RTDB'ni yangilaymiz
        const updateOnlineStatus = (onlineStatus: boolean) => {
          // Firestore ni yangilash
          updateDoc(userFirestoreRef, {
            online: onlineStatus,
            lastOnline: firestoreServerTimestamp(),
          }).catch(console.error);

          // RTDB ni yangilash
          set(userStatusDatabaseRef, {
            online: onlineStatus,
            lastOnline: rtdbServerTimestamp(),
          }).catch(console.error);
        };

        // `.info/connected` ref'ga eshituvchi sozlash
        const connectedUnsubscribe = onValue(connectedRef, (snap) => {
          if (snap.val() === true) {
            // Agar ulanish o'rnatilgan bo'lsa
            // Ulanish uzilganda Firestore va RTDB holatini yangilashni sozlash
            onDisconnect(userStatusDatabaseRef)
              .set({
                online: false,
                lastOnline: rtdbServerTimestamp(),
              })
              .catch(console.error);

            // Foydalanuvchini hozirda onlayn deb belgilash
            updateOnlineStatus(true);
          } else {
            // Ulanish uzilganida onDisconnect avtomatik tarzda RTDB ni yangilaydi
            // Ammo Firestore ni yangilash kerak
            // Foydalanuvchi browserni yopganda bu blok ishlamasligi mumkin
            // Shu sababli, faqat server vaqtini Firestore da ham ishlatish muhim
            updateDoc(userFirestoreRef, {
              online: false,
              lastOnline: firestoreServerTimestamp(),
            }).catch(console.error);
          }
        });

        // onAuthStateChanged funksiyasi tugagach, eshituvchini tozalash funksiyasini qaytaring
        return () => {
          connectedUnsubscribe();
          onDisconnect(userStatusDatabaseRef).cancel();
        };
      } else {
        // Foydalanuvchi tizimdan chiqqanda, hech narsa qilmaymiz,
        // chunki onDisconnect o'z ishini bajaradi.
        // `return` funksiyasi ham ushbu holatni qamrab oladi.
      }
    });

    // Komponent o'chirilganda eshituvchilarni tozalash
    return () => {
      if (unsubscribeAuth) {
        unsubscribeAuth();
      }
    };
  }, []); // Dependensiyalar massivi bo'sh, shu sababli effekt faqat bir marta ishga tushadi
};
