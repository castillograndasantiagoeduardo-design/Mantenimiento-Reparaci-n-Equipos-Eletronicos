// Representa la tabla `clientes` de mantenimiento_de_equipos.sql

export interface Cliente {
  id: number;
  nombre_completo: string;
  documento: string;
  telefono: string;
  correo: string;
  id_tecnico: number | null;
  created_at?: string;
}

// Campos requeridos para crear un cliente (el id lo genera la BD)
export type ClienteInput = Omit<Cliente, "id" | "created_at">;

// Único subconjunto de campos editable desde el CRUD:
// documento y correo quedan fuera a propósito, son inmutables.
export type ClienteActualizable = Partial<
  Pick<Cliente, "nombre_completo" | "telefono" | "id_tecnico">
>;