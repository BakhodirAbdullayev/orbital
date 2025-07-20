// src/lib/types.ts

import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Timestamp;
  lastOnline: Timestamp;
  online: boolean;
  searchableName: string; // Boshqa maydonlar
}

export interface Chat {
  id: string; // <-- Chat ID ni shu yerga qo'shing
  members: string[]; // Foydalanuvchi UID'lari
  lastMessage: string;
  lastMessageTimestamp: Timestamp;
  createdAt: Timestamp;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string; // Odatda message qaysi chatga tegishli ekanligini bilish kifoya
  content: string;
  timestamp: Timestamp;
  read: boolean;
}
