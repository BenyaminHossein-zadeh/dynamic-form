
import z from "zod";


export type FormData = z.infer<typeof formSchema>;

export const formSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(80),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email format"),
  mobileNumber: z
    .string()
    .min(6, "Must be at least 6 digits")
    .max(12, "Must be at most 12 digits"),
  title: z
    .enum(["Mr", "Mrs", "Miss", "Dr"])
    .refine((val) => val.length > 0, { message: "Please select a title" }),
  developer: z
    .enum(["Yes", "No"])
    .refine((val) => val.length > 0, { message: "Please choose Yes or No" }),
});

