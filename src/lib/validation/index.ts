import * as z from "zod";

export const signupValidation = z.object({
   name: z.string().min(2 , {message: "Too short name"}),
   username: z.string().min(2, {message: "Username is too short"}),
   email: z.string().email({message: "Invalid email"}),
   password: z.string().min(8, {message: "Password must be atleast 8 characters."}),
});

export const signinValidation = z.object({
   email: z.string().email({message: "Invalid email"}),
   password: z.string().min(8, {message: "Password must be atleast 8 characters."}),
});

export const postValidation = z.object({
   caption: z.string().min(5).max(2200),
   file: z.custom<File[]>(), 
   location: z.string().min(2).max(100),
   tags: z.string()
});