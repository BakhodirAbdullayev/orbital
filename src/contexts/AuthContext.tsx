// src/contexts/AuthContext.tsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { UserProfile } from '@/lib/types';

interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
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
    throw new Error('useAuth must be used within an AuthProvider');
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
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          let userProfileData: UserProfile;

          if (!userSnap.exists()) {
            userProfileData = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              createdAt: Timestamp.now(),
              lastOnline: Timestamp.now(),
              online: true,
              searchableName: (
                user.displayName ||
                user.email ||
                ''
              ).toLowerCase(),
            };
            await setDoc(userRef, userProfileData);
          } else {
            userProfileData = userSnap.data() as UserProfile;
          }
          setCurrentUser(userProfileData);
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAuthAction = async (
    provider: GoogleAuthProvider | GithubAuthProvider
  ) => {
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error(
        `Error signing in with ${provider.providerId}:`,
        error.message
      );
      setLoading(false);
    }
  };

  const signInWithGoogle = () => handleAuthAction(new GoogleAuthProvider());
  const signInWithGithub = () => handleAuthAction(new GithubAuthProvider());

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      console.error('Error signing out:', error.message);
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Error signing in with email:', error.code, error.message);
      setLoading(false);
      throw error;
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
      console.error('Error signing up with email:', error.code, error.message);
      throw error;
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
    signInWithEmail,
    signUpWithEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
