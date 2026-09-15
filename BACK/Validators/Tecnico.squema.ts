import { z } from "../Dependencies/Dependencias.ts";

export const CrearTecnicoSchema = z.object({
  nombre: z.string().min(3).max(100),
  documento: z.string().min(1).max(20),
  especialidad: z.string().min(1).max(100),
  telefono: z.string().min(7).max(20),
  correo: z.string().email().max(150),
  password: z.string().min(8).max(100),
  rol: z.enum(["superadmin", "tecnico"]).default("tecnico"),
});
export type CrearTecnicoDto = z.infer<typeof CrearTecnicoSchema>;

export const EditarTecnicoSchema = z
  .object({
    nombre: z.string().min(3).max(100).optional(),
    documento: z.string().min(1).max(20).optional(),
    especialidad: z.string().min(1).max(100).optional(),
    telefono: z.string().min(7).max(20).optional(),
    correo: z.string().email().max(150).optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "Debe enviar al menos un campo para editar",
  });
export type EditarTecnicoDto = z.infer<typeof EditarTecnicoSchema>;

export const CambiarEstadoTecnicoSchema = z.object({
  estado: z.enum(["activo", "inactivo"]),
});
export type CambiarEstadoTecnicoDto = z.infer<typeof CambiarEstadoTecnicoSchema>;

