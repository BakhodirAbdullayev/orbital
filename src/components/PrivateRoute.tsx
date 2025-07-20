// src/components/PrivateRoute.tsx
import { type FC, type ReactNode } from "react";
import { Navigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import AnimatedBackgroundLoader from "./loader/AnimatedBackgroundLoader";

const PrivateRoute: FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    // Optionally render a loading spinner or message while checking auth state
    return <AnimatedBackgroundLoader />;
  }

  // If user is not logged in, redirect to login page
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  // If user is logged in, render the child routes/component
  return <>{children}</>;
};

export default PrivateRoute;
