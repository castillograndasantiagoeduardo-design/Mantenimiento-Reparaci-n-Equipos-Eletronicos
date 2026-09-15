import { TecnicoModel } from "../Models/Tecnico.ts";
import { CrearTecnicoDto, EditarTecnicoDto, CambiarEstadoTecnicoDto } from "../Validators/Tecnico.squema.ts";

export class TecnicoService {
  static async crear(data: CrearTecnicoDto): Promise<number> {
    const existente = await TecnicoModel.buscarPorCorreo(data.correo);
    if (existente) {
      throw new Error("Ya existe un técnico registrado con ese correo");
    }
    return await TecnicoModel.crear(data);
  }

  static async editar(id: number, data: EditarTecnicoDto): Promise<void> {
    // Si en el futuro permites editar correo, aquí validarías que
    // el nuevo correo no choque con el de otro técnico distinto a `id`.
    await TecnicoModel.editar(id, data);
  }

  static async cambiarEstado(id: number, data: CambiarEstadoTecnicoDto): Promise<void> {
    await TecnicoModel.cambiarEstado(id, data);
  }
}