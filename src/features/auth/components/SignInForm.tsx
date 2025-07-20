import type { FC } from "react";
import { Input } from "./input";
import { Button } from "@/components/ui/button";
import { Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { SignInSchema, type SignInSchemaType } from "../types/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { FirebaseError } from "firebase/app";

const SignInForm: FC = () => {
  const { loading, signInWithEmail } = useAuth();
  const navigate = useNavigate();
  const form = useForm<SignInSchemaType>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInSchemaType) => {
    if (loading) return;

    try {
      await signInWithEmail(data.email, data.password);
      navigate("/chat");
    } catch (error: any) {
      console.error("Sign in failed:", error);
      // Xato turini aniqlash va aniq xabarlar ko'rsatish
      if (error instanceof FirebaseError) {
        // Firebasega xos xatolar
        switch (error.code) {
          case "auth/invalid-credential":
            // Bu email/parol noto'g'ri bo'lganda beriladi.
            // Qo'shimcha xavfsizlik uchun, email mavjud emasligini yoki parol noto'g'ri ekanligini aniq aytmaslik tavsiya etiladi.
            form.setError("email", {
              type: "manual",
              message: "Invalid email or password.",
            });
            form.setError("password", {
              type: "manual",
              message: "Invalid email or password.",
            });
            toast.error("Invalid email or password.");
            break;
          case "auth/user-disabled":
            form.setError("email", {
              type: "manual",
              message:
                "Your account has been disabled. Please contact support.",
            });
            toast.error("Your account has been disabled.");
            break;
          case "auth/too-many-requests":
            // Qisqa vaqt ichida juda ko'p urinishlar
            toast.error("Too many login attempts. Please try again later.");
            break;
          case "auth/operation-not-allowed":
            // Firebase konsolda Email/Password usuli yoqilmagan
            toast.error(
              "Email/Password sign-in is not enabled. Please contact support."
            );
            break;
          default:
            // Boshqa Firebase xatolari
            toast.error(error.message || "An unknown error occurred.");
            break;
        }
      } else if (error instanceof Error) {
        // Boshqa umumiy JavaScript xatolari
        toast.error(
          error.message || "An unexpected error occurred during sign in."
        );
      } else {
        // Noma'lum xato turlari
        toast.error("An unexpected error occurred during sign in.");
      }
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-5 mb-5" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field, fieldState: { error } }) => (
            <FormItem className="gap-px">
              <Input placeholder="Email" icon={Mail} {...field} />
              <FormMessage>{error?.message}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field, fieldState: { error } }) => (
            <FormItem className="gap-px">
              <Input
                placeholder="Password"
                icon={Lock}
                {...field}
                type="password"
              />
              <FormMessage>{error?.message}</FormMessage>
            </FormItem>
          )}
        />
        <Button
          disabled={loading}
          type="submit"
          className="w-full rounded-[4px] bg-gradient-to-r from-blue-500 to-purple-700 hover:from-blue-600 hover:to-purple-700 cursor-pointer font-normal text-white"
        >
          Sign In
        </Button>
      </form>
    </Form>
  );
};

export default SignInForm;
