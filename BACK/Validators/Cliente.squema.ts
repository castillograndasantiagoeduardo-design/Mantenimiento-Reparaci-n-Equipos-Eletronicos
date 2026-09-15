import { z } from "../Dependencies/Dependencias.ts";

// Para crear un cliente (todos los campos obligatorios, salvo id_tecnico)
export const ClienteSchema = z.object({
  nombre_completo: z
    .string({ required_error: "El nombre completo es obligatorio" })
    .min(3, "El nombre completo debe tener al menos 3 caracteres"),

  documento: z
    .string({ required_error: "El documento es obligatorio" })
    .min(5, "El documento debe tener al menos 5 caracteres")
    .regex(/^[0-9]+$/, "El documento solo debe contener números"),

  telefono: z
    .string({ required_error: "El teléfono es obligatorio" })
    .min(7, "El teléfono debe tener al menos 7 dígitos")
    .regex(/^[0-9+ ]+$/, "El teléfono contiene caracteres inválidos"),

  correo: z
    .string({ required_error: "El correo es obligatorio" })
    .email("El correo electrónico no es válido"),

  id_tecnico: z.number().int().positive().nullable().optional(),
});

// Para actualizar desde el CRUD: SOLO nombre_completo, telefono e id_tecnico.
// documento y correo NO forman parte de este esquema a propósito (son inmutables).
export const ClienteUpdateSchema = z
  .object({
    nombre_completo: z
      .string()
      .min(3, "El nombre completo debe tener al menos 3 caracteres")
      .optional(),

    telefono: z
      .string()
      .min(7, "El teléfono debe tener al menos 7 dígitos")
      .regex(/^[0-9+ ]+$/, "El teléfono contiene caracteres inválidos")
      .optional(),

    id_tecnico: z.number().int().positive().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar",
  });