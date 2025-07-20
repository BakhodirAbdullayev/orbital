// src/hooks/useUsers.ts
import { useEffect, useState, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { type UserProfile } from "@/lib/types";
import { areArraysDeepEqual } from "@/lib/arrayCompare";

interface UseUsersResult {
  users: UserProfile[];
  loading: boolean;
  error: Error | null;
}

export const useUsers = (): UseUsersResult => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Store the previous users array reference for deep equality comparison
  const prevUsersRef = useRef<UserProfile[]>([]);

  useEffect(() => {
    // If no current user, clear state and stop loading
    if (!currentUser) {
      setUsers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const usersCollectionRef = collection(db, "users");

    // Query for all users except the current user, ordered by display name
    // This query is standard and efficient.
    const q = query(
      usersCollectionRef,
      where("uid", "!=", currentUser.uid),
      orderBy("displayName") // Required with a '!=' where clause for indexing
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedUsers: UserProfile[] = snapshot.docs.map((doc) => ({
          uid: doc.id,
          ...(doc.data() as Omit<UserProfile, "uid">),
        }));

        // Optimize: Only update state if the content of the users array has truly changed.
        // This is where `areArraysDeepEqual` plays its key role to prevent unnecessary renders.
        if (!areArraysDeepEqual(prevUsersRef.current, fetchedUsers)) {
          setUsers(fetchedUsers);
          prevUsersRef.current = fetchedUsers; // Update ref for next comparison
        }
        // else: data is the same, skip state update, no re-render.

        setLoading(false); // Data loaded, stop loading indicator
      },
      (err) => {
        // Handle any errors during data fetching
        console.error("Error fetching users:", err);
        setError(err);
        setLoading(false);
      }
    );

    // Cleanup function: unsubscribe from Firestore listener when component unmounts
    return () => unsubscribe();
  }, [currentUser]); // Re-run effect only if currentUser object changes

  return { users, loading, error };
};
