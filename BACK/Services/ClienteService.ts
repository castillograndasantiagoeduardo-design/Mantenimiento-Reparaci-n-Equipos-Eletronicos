import { conexion } from "../Models/Conexion.ts";
import type { Cliente, ClienteActualizable, ClienteInput } from "../Models/Cliente.ts";
import type { Orden } from "../Models/Orden.ts";

// Listado de clientes (con el nombre del técnico asignado, si tiene)
export const obtenerClientes = async (): Promise<Cliente[]> => {
  return await conexion.query(
    `SELECT c.*, t.nombre AS nombre_tecnico
     FROM clientes c
     LEFT JOIN tecnicos t ON t.id = c.id_tecnico
     ORDER BY c.id DESC`,
  );
};

export const obtenerClientePorId = async (id: number): Promise<Cliente | null> => {
  const resultado = await conexion.query(
    `SELECT c.*, t.nombre AS nombre_tecnico
     FROM clientes c
     LEFT JOIN tecnicos t ON t.id = c.id_tecnico
     WHERE c.id = ?`,
    [id],
  );
  return resultado[0] ?? null;
};

// Equipos del cliente, cada uno con el estado de su orden más reciente
// (un equipo puede tener varias órdenes en el tiempo — Regla 3)
export const obtenerEquiposConEstado = async (idCliente: number) => {
  return await conexion.query(
    `SELECT
        e.id AS id_equipo, e.tipo_equipo, e.marca, e.modelo, e.numero_serie,
        o.id AS id_orden, o.numero_orden, o.estado
     FROM equipos e
     LEFT JOIN ordenes o
        ON o.id = (
          SELECT o2.id FROM ordenes o2
          WHERE o2.id_equipo = e.id
          ORDER BY o2.fecha_recepcion DESC, o2.id DESC
          LIMIT 1
        )
     WHERE e.id_cliente = ?`,
    [idCliente],
  );
};

// Verifica duplicados de documento/correo (excluirId se usa al validar creación futura)
export const existeDocumentoOCorreo = async (
  documento: string,
  correo: string,
  excluirId?: number,
): Promise<boolean> => {
  let sql = "SELECT id FROM clientes WHERE (documento = ? OR correo = ?)";
  const parametros: (string | number)[] = [documento, correo];

  if (excluirId) {
    sql += " AND id != ?";
    parametros.push(excluirId);
  }

  const resultado = await conexion.query(sql, parametros);
  return resultado.length > 0;
};

export const crearCliente = async (data: ClienteInput): Promise<number> => {
  const resultado = await conexion.execute(
    "INSERT INTO clientes (nombre_completo, documento, telefono, correo, id_tecnico) VALUES (?, ?, ?, ?, ?)",
    [data.nombre_completo, data.documento, data.telefono, data.correo, data.id_tecnico ?? null],
  );
  return resultado.lastInsertId ?? 0;
};

// Solo permite tocar nombre_completo, telefono e id_tecnico (documento/correo nunca llegan aquí)
export const actualizarCliente = async (
  id: number,
  data: ClienteActualizable,
): Promise<boolean> => {
  const campos: string[] = [];
  const valores: (string | number | null)[] = [];

  for (const [campo, valor] of Object.entries(data)) {
    if (valor !== undefined) {
      campos.push(`${campo} = ?`);
      valores.push(valor as string | number | null);
    }
  }

  if (campos.length === 0) return false;

  valores.push(id);
  const resultado = await conexion.execute(
    `UPDATE clientes SET ${campos.join(", ")} WHERE id = ?`,
    valores,
  );

  return (resultado.affectedRows ?? 0) > 0;
};

export const eliminarCliente = async (id: number): Promise<boolean> => {
  const resultado = await conexion.execute("DELETE FROM clientes WHERE id = ?", [id]);
  return (resultado.affectedRows ?? 0) > 0;
};

// Regla de negocio 8: no eliminar cliente con equipos asociados
export const clienteTieneEquipos = async (id: number): Promise<boolean> => {
  const resultado = await conexion.query(
    "SELECT id FROM equipos WHERE id_cliente = ? LIMIT 1",
    [id],
  );
  return resultado.length > 0;
};

// Confirma que la orden pertenece realmente a ese cliente (seguridad del endpoint anidado)
export const obtenerOrdenDeCliente = async (
  idOrden: number,
  idCliente: number,
): Promise<Orden | null> => {
  const resultado = await conexion.query(
    "SELECT * FROM ordenes WHERE id = ? AND id_cliente = ?",
    [idOrden, idCliente],
  );
  return resultado[0] ?? null;
};

// El propio UPDATE puede fallar por los triggers de la BD (transición inválida,
// técnico inactivo, etc.) — eso se captura en el controlador.
export const actualizarEstadoOrden = async (idOrden: number, estado: string): Promise<void> => {
  await conexion.execute("UPDATE ordenes SET estado = ? WHERE id = ?", [estado, idOrden]);
};