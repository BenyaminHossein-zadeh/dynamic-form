"use client";
import { FormData, formSchema } from "@/lib/schemas/FormSchema";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { submitForm } from "@/lib/actions";
const Form = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(data: FormData) {
    try {
      const res = await submitForm(data);
      if (res.success) {
        alert("Form submitted successfully!");
      }
    } catch (error) {
      alert("Submission failed: " + (error as Error).message);
    }
  }
  return (
   <form onSubmit={handleSubmit(onSubmit)}>
      <input placeholder="First name" {...register("firstName")} />
      {errors.firstName && <p>{errors.firstName.message}</p>}

      <input placeholder="Last name" {...register("lastName")} />
      {errors.lastName && <p>{errors.lastName.message}</p>}

      <input placeholder="Email" {...register("email")} />
      {errors.email && <p>{errors.email.message}</p>}

      <input placeholder="Mobile number" {...register("mobileNumber")} />
      {errors.mobileNumber && <p>{errors.mobileNumber.message}</p>}

      <select {...register("title")}>
        <option value="">Select title</option>
        <option value="Mr">Mr</option>
        <option value="Mrs">Mrs</option>
        <option value="Miss">Miss</option>
        <option value="Dr">Dr</option>
      </select>
      {errors.title && <p>{errors.title.message}</p>}

      <label>
        <input type="radio" value="Yes" {...register("developer")} /> Yes
      </label>
      <label>
        <input type="radio" value="No" {...register("developer")} /> No
      </label>
      {errors.developer && <p>{errors.developer.message}</p>}

      <input type="submit" />
    </form>
  );
};

export default Form;
