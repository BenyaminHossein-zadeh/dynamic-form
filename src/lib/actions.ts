'use server';

import { formSchema } from "./schemas/FormSchema";

export async function submitForm(data: unknown) {
  const parsed = formSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error("Invalid form data");
  }

  console.log("Received form data on server:", parsed.data);

  return { success: true };
}