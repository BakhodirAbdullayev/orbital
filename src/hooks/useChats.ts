// src/hooks/useChats.ts

import { useEffect, useState } from "react";

import { db } from "@/config/firebase";

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
} from "firebase/firestore"; // Removed QueryDocumentSnapshot

import { useAuth } from "@/contexts/AuthContext";

import type { Chat } from "@/lib/types";

export const useChats = () => {
  const { currentUser } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setChats([]);
      setLoading(false);
      return;
    }

    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef,
      where("members", "array-contains", currentUser.uid),
      orderBy("lastMessageTimestamp", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedChats: Chat[] = [];

        querySnapshot.forEach((doc) => {
          const chatData = doc.data(); // This correctly returns Firestore Timestamp objects // This cast is usually sufficient if the data structure in Firestore matches your type // and you're not doing any intermediate serialization/deserialization.

          fetchedChats.push({
            id: doc.id,

            ...(chatData as Omit<Chat, "id">),
          }); // --- IMPORTANT DEBUGGING STEP --- // ADD THIS LOG HERE to see what `chatData` actually contains // right after `doc.data()`. If you see the "type: firestore/timestamp/1.0" // structure here, then the issue is NOT in your code but how // Firestore is returning the data, which is highly unusual // unless you're using a different Firebase SDK version or setup. // If it shows actual Timestamp objects (with .toDate() method), // then the issue is in how `fetchedChats` is then used or passed on. // console.log("Fetched chatData directly from doc.data():", chatData);
        });

        setChats(fetchedChats);
        setLoading(false);
      },

      (err) => {
        console.error("Error fetching chats:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  return { chats, loading, error };
};
