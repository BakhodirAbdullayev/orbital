// src/lib/chatUtils.ts (example)

import {
  collection,
  addDoc,
  Timestamp,
  doc,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/config/firebase";

// sendMessage funksiyasiga chatId argumentini qo'shamiz

export const sendMessage = async (
  senderUid: string,
  chatId: string, // <-- Yangi argument
  receiverUid: string, // Bu argument endi messages kolleksiyasi uchun kerak emas, lekin chat.members ni yangilashda ishlatilishi mumkin
  content: string
) => {
  try {
    // 1. Xabarni messages sub-kolleksiyasiga yozish

    const messagesCollectionRef = collection(db, "chats", chatId, "messages");
    await addDoc(messagesCollectionRef, {
      senderId: senderUid,
      receiverId: receiverUid, // receiverId ni ham saqlash foydali bo'lishi mumkin
      content: content,
      timestamp: Timestamp.now(),
      read: false,
    }); // 2. Chat hujjatini oxirgi xabar va timestamp bilan yangilash

    const chatDocRef = doc(db, "chats", chatId);

    await updateDoc(chatDocRef, {
      lastMessage: content,
      lastMessageTimestamp: Timestamp.now(),
    });

    console.log("Xabar muvaffaqiyatli yuborildi va chat yangilandi!");
  } catch (error) {
    console.error("Xabar yuborishda yoki chatni yangilashda xato:", error);
    throw error; // Xatolikni yuqoriga uzatish
  }
};
