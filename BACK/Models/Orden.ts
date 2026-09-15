// Representa la tabla `ordenes` de mantenimiento_de_equipos.sql
// El ENUM aquí debe coincidir EXACTO con el de la BD (sin tildes, con espacios)

export const ESTADOS_ORDEN = [
  "RECIBIDO",
  "EN DIAGNOSTICO",
  "COTIZADO",
  "EN REPARACION",
  "TERMINADO",
  "ENTREGADO",
  "CANCELADO",
] as const;

export type EstadoOrden = typeof ESTADOS_ORDEN[number];

export interface Orden {
  id: number;
  numero_orden: string;
  fecha_recepcion: string;
  id_cliente: number;
  id_equipo: number;
  id_tecnico: number;
  descripcion_problema: string;
  estado: EstadoOrden;
  observaciones: string | null;
  valor_estimado: number;
  valor_final: number;
}