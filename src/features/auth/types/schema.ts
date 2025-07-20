import { z } from "zod";

export const SignInSchema = z.object({
  email: z.email().min(1, "Email is required"),
  password: z.string().min(5, "Password must be at least 5 characters"),
});

export type SignInSchemaType = z.infer<typeof SignInSchema>;

export const SignUpSchema = z.object({
  email: z.email().min(1, "Email is required"),
  password: z.string().min(5, "Password must be at least 5 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(25, "Username must be at most 25 characters"),
});

export type SignUpSchemaType = z.infer<typeof SignUpSchema>;
