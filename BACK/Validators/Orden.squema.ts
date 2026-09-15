import { z } from "../Dependencies/Dependencias.ts";
import { ESTADOS_ORDEN } from "../Models/Orden.ts";

export const EstadoOrdenSchema = z.object({
  estado: z.enum(ESTADOS_ORDEN, {
    errorMap: () => ({
      message: `El estado debe ser uno de: ${ESTADOS_ORDEN.join(", ")}`,
    }),
  }),
});