import { z } from "../Dependencies/Dependencias.ts";

export const LoginSchema = z.object({
  correo: z.string().email(),
  password: z.string().min(1),
});
export type LoginDto = z.infer<typeof LoginSchema>;