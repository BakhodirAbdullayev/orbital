// src/contexts/AuthContext.tsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
  signInWithEmailAndPassword, // <-- YANGI
  createUserWithEmailAndPassword, // <-- YANGI
  updateProfile, // <-- YANGI
} from "firebase/auth";
import { doc, setDoc, getDoc, Timestamp, updateDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import type { UserProfile } from "@/lib/types";

interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
  // <-- YANGI FUNKSIYALARNING TYPELARI
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user: FirebaseUser | null) => {
        if (user) {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          let userProfileData: UserProfile;

          if (!userSnap.exists()) {
            // New user! Create a profile document for them
            userProfileData = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName, // FirebaseUser dan kelgan displayName
              photoURL: user.photoURL,
              createdAt: Timestamp.now(),
              lastOnline: Timestamp.now(), // Initialize with client-side timestamp
              online: true,
              searchableName: (
                user.displayName ||
                user.email ||
                ""
              ).toLowerCase(),
            };
            await setDoc(userRef, userProfileData);
          } else {
            userProfileData = userSnap.data() as UserProfile;

            await updateDoc(userRef, {
              online: true,
              lastOnline: Timestamp.now(), // Keep lastSeen if it serves a distinct purpose
            });
            // Fetch updated data after update to reflect latest state in currentUser
            const updatedUserSnap = await getDoc(userRef);
            userProfileData = updatedUserSnap.data() as UserProfile;
          }
          // Set current user. This will trigger re-render, but useEffect won't loop.
          setCurrentUser(userProfileData);
        } else {
          if (currentUser) {
            // Check if currentUser was present before sign-out
            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, {
              online: false,
              lastOnline: Timestamp.now(), // Use client's now for immediate display
            }).catch(console.error);
          }
          setCurrentUser(null);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []); // currentUser dependensiyasi olib tashlandi, chunki onAuthStateChanged faqat user holatiga qarab ishlaydi

  const handleAuthAction = async (
    provider: GoogleAuthProvider | GithubAuthProvider
  ) => {
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged avtomatik ravishda foydalanuvchi profilini yuklab, setCurrentUser ni chaqiradi
    } catch (error: any) {
      console.error(
        `Error signing in with ${provider.providerId}:`,
        error.message
      );
      setLoading(false); // Xatolik yuz bersa, loadingni to'xtating
    }
  };

  const signInWithGoogle = () => handleAuthAction(new GoogleAuthProvider());
  const signInWithGithub = () => handleAuthAction(new GithubAuthProvider());

  const signOut = async () => {
    setLoading(true);
    try {
      // Explicitly mark user offline in Firestore on sign out
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, {
          online: false,
          lastOnline: Timestamp.now(),
        }).catch(console.error);
      }
      await firebaseSignOut(auth);
      // onAuthStateChanged avtomatik ravishda currentUser'ni null qiladi
    } catch (error: any) {
      console.error("Error signing out:", error.message);
      setLoading(false); // Xatolik yuz bersa, loadingni to'xtating
    }
  };

  // YANGI FUNKSIYALAR
  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged avtomatik ravishda foydalanuvchi profilini yuklab, setCurrentUser ni chaqiradi
    } catch (error: any) {
      console.error("Error signing in with email:", error.code, error.message);
      setLoading(false); // Xatolik yuz bersa, loadingni to'xtating
      throw error; // Xatolikni yuqoriga uzatish, komponentda ushlash uchun
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    displayName?: string
  ) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (displayName) {
        await updateProfile(user, { displayName: displayName });
      }
    } catch (error: any) {
      console.error("Error signing up with email:", error.code, error.message);
      throw error; // Xatolikni yuqoriga uzatish, komponentda ushlash uchun
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    signInWithGoogle,
    signInWithGithub,
    signOut,
    signInWithEmail, // <-- YANGI
    signUpWithEmail, // <-- YANGI
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
