import type { FC } from "react";
import { Input } from "./input";
import { Button } from "@/components/ui/button";
import { Lock, Mail, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { SignUpSchema, type SignUpSchemaType } from "../types/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router";

const SignUpForm: FC = () => {
  const navigate = useNavigate();
  const { loading, signUpWithEmail } = useAuth();
  const form = useForm<SignUpSchemaType>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignUpSchemaType) => {
    // async qiling
    if (loading) return;

    try {
      await signUpWithEmail(data.email, data.password, data.username);
      toast.success("Account created successfully!");
      navigate("/");
    } catch (error: any) {
      console.error("Sign up failed:", error);
      // Firebase xatolarini foydalanuvchiga ko'rsatish
      if (error.code === "auth/email-already-in-use") {
        form.setError("email", {
          type: "manual",
          message:
            "This email is already in use. Please sign in or use Google.",
        });
      } else if (error.code === "auth/weak-password") {
        form.setError("password", {
          type: "manual",
          message: "Password is too weak. Please choose a stronger one.",
        });
      } else {
        toast.error(
          error.message || "An unexpected error occurred during signup."
        );
      }
    }
  };
  return (
    <Form {...form}>
      <form
        className="space-y-5 mb-5"
        onSubmit={form.handleSubmit(onSubmit)}
        autoComplete="off"
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field, fieldState: { error } }) => (
            <FormItem className="gap-px">
              <Input placeholder="Username" icon={User} {...field} />
              <FormMessage>{error?.message}</FormMessage>
            </FormItem>
          )}
        />

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
          className="w-full rounded-[4px] bg-gradient-to-r from-primary to-purple-700 hover:from-blue-600 hover:to-purple-700 cursor-pointer text-white font-normal"
        >
          Sign Up
        </Button>
      </form>
    </Form>
  );
};

export default SignUpForm;
