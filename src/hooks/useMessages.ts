import { useEffect, useState } from "react";
import { db } from "@/config/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore"; // Removed QueryDocumentSnapshot
import type { Message } from "@/lib/types";

/**

 * Custom hook to fetch messages for a specific chat.

 */

interface UseMessagesResult {
  messages: Message[];

  loading: boolean;

  error: Error | null;
}

export const useMessages = (chatId: string | null): UseMessagesResult => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const messagesCollectionRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesCollectionRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedMessages: Message[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Message[];
        setMessages(fetchedMessages);
        setLoading(false);
      },

      (err) => {
        console.error("Error fetching messages:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [chatId]);

  return { messages, loading, error };
};
