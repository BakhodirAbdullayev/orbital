// src/components/LoginPage.tsx
import React, { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router"; // For redirection after login
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AnimatedBackground } from "./components/AnimatedBackground";
import SignInForm from "./components/SignInForm";
import SignUpForm from "./components/SignUpForm";
import "./autofill.css";
import Logo from "@/components/logo";

const LoginPage: React.FC = () => {
  const { signInWithGoogle, signInWithGithub, currentUser, loading } =
    useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const method = useMemo(
    () => searchParams.get("method") || "signIn",
    [searchParams]
  );

  const toggleSIgnMethod = () => {
    const method = searchParams.get("method");
    if (method === "signUp") {
      setSearchParams({ method: "signIn" });
    } else {
      setSearchParams({ method: "signUp" });
    }
  };

  // If user is already logged in and not loading, redirect to home
  React.useEffect(() => {
    if (!loading && currentUser) {
      navigate("/chat", { replace: true }); // Redirect to chat page
    }
  }, [currentUser, loading, navigate]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gray-100 px-4 relative">
      <AnimatedBackground />

      <Card className="w-full max-w-md relative z-10 bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-md">
        <CardHeader className="text-center space-y-4">
          <Logo />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={signInWithGoogle}
              className="cursor-pointer hover:bg-white/10 bg-white/5 text-white hover:text-white border-muted-foreground font-normal rounded-[4px]"
            >
              <img
                className="size-5"
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                alt="Google logo"
              />
              Google
            </Button>

            <Button
              variant="outline"
              onClick={signInWithGithub}
              className="cursor-pointer hover:bg-white/10 bg-white/5 text-white hover:text-white border-muted-foreground font-normal rounded-[4px]"
            >
              <img
                className="size-5"
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
                alt="GitHub logo"
              />
              GitHub
            </Button>
          </div>

          <div className="relative flex justify-center items-center my-6 gap-0">
            <div className="h-px w-full bg-white/30"></div>
            <div className="px-3 text-white text-xs min-w-max uppercase">
              Or continue with
            </div>
            <div className="h-px w-full bg-white/30"></div>
          </div>
          {
            {
              signIn: <SignInForm />,
              signUp: <SignUpForm />,
            }[method]
          }
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-lg pointer-events-none"></div>
          <div className="relative z-10 space-y-2">
            <div className="text-center text-sm text-white/60 font-normal">
              {method === "signUp"
                ? "Already have an account? "
                : "Don't have an account? "}
              <span
                className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer font-normal"
                onClick={toggleSIgnMethod}
              >
                {method === "signUp" ? "Sign In" : "Sign Up"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
