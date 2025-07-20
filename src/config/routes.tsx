// src/router.tsx
import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";

// Lazy load qilingan komponentlar
const LoginPage = lazy(() => import("@/features/auth/AuthPage"));
const PrivateRoute = lazy(() => import("@/components/PrivateRoute"));
const ChatPageLayout = lazy(() => import("@/components/layout/ChatPageLayout"));
const MyChatsPage = lazy(() => import("@/features/chat/MyChatsPage"));
const AllUsersPage = lazy(() => import("@/features/chat/AllUsersPage"));

// Suspense wrapper komponenti
const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={null}>{children}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <LazyWrapper>
        <LoginPage />
      </LazyWrapper>
    ),
  },
  {
    path: "/chat",
    element: (
      <LazyWrapper>
        <PrivateRoute>
          <ChatPageLayout />
        </PrivateRoute>
      </LazyWrapper>
    ),
    children: [
      {
        index: true,
        element: (
          <LazyWrapper>
            <MyChatsPage />
          </LazyWrapper>
        ),
      },
      {
        path: "dialog/:dialogId",
        element: (
          <LazyWrapper>
            <MyChatsPage />
          </LazyWrapper>
        ),
      },
      {
        path: "user/:userId",
        element: (
          <LazyWrapper>
            <MyChatsPage />
          </LazyWrapper>
        ),
      },
      {
        path: "users",
        element: (
          <LazyWrapper>
            <AllUsersPage />
          </LazyWrapper>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <h1>404 Not Found</h1>,
  },
]);

// App komponent ichida RouterProvider ni ishlatish:
// import { router } from './router';
// <RouterProvider router={router} />
