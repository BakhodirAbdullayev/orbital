import { type FC } from "react";
import { RouterProvider } from "react-router";
import { router } from "./config/routes";
import { usePresence } from "./hooks/usePresence";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Toaster } from "./components/ui/sonner";

const App: FC = () => {
  // Use the presence hook only if the user is authenticated
  // This hook will then manage their RTDB presence status

  usePresence();

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
      <Toaster richColors position="top-center" />
    </ThemeProvider>
  );
};

export default App;
