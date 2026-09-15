import { conexion } from "./Conexion.ts";
import { hash } from "../Dependencies/Dependencias.ts";
import { Tecnico } from "../Interfaces/Tecnico.interface.ts";
import {
  CrearTecnicoDto,
  EditarTecnicoDto,
  CambiarEstadoTecnicoDto,
} from "../Validators/Tecnico.squema.ts";

export class TecnicoModel {
  static async crear(data: CrearTecnicoDto): Promise<number> {
    const passwordHash = await hash(data.password);
    const result = await conexion.execute(
      `INSERT INTO tecnicos (nombre, documento, especialidad, telefono, correo, password, rol, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'activo')`,
      [data.nombre, data.documento, data.especialidad, data.telefono, data.correo, passwordHash, data.rol],
    );
    return result.lastInsertId!;
  }

  static async editar(id: number, data: EditarTecnicoDto): Promise<void> {
    const campos = Object.keys(data);
    if (campos.length === 0) return;

    const sets = campos.map((campo) => `${campo} = ?`).join(", ");
    const valores = campos.map((campo) => (data as Record<string, unknown>)[campo]);

    await conexion.execute(
      `UPDATE tecnicos SET ${sets} WHERE id = ?`,
      [...valores, id],
    );
  }

  static async cambiarEstado(id: number, data: CambiarEstadoTecnicoDto): Promise<void> {
    await conexion.execute(
      `UPDATE tecnicos SET estado = ? WHERE id = ?`,
      [data.estado, id],
    );
  }

  static async buscarPorCorreo(correo: string): Promise<Tecnico | undefined> {
    const result = await conexion.query(
      `SELECT * FROM tecnicos WHERE correo = ? LIMIT 1`,
      [correo],
    );
    return result[0] as Tecnico | undefined;
  }
}