import { z } from "zod";

export const signupSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters long."),

    email: z.string().trim().email("Enter a valid email address."),

    password: z.string().min(8, "Password must be at least 8 characters long."),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),

  password: z.string().min(1, "Enter your password."),
});

export type LoginFormData = z.infer<typeof loginSchema>;
