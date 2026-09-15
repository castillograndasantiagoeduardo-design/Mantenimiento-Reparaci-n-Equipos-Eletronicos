import { compare } from "../Dependencies/Dependencias.ts";
import { TecnicoModel } from "../Models/Tecnico.ts";
import { LoginDto } from "../Validators/Login.schema.ts";
import { CrearToken } from "../Helpers/auth/Jwt.ts";

interface ResultadoLogin {
  token: string;
  idTecnico: number;
  rol: "superadmin" | "tecnico";
}

export class LoginService {
  public async IniciarSesion(datos: LoginDto): Promise<ResultadoLogin> {
    const tecnico = await TecnicoModel.buscarPorCorreo(datos.correo);

    if (!tecnico) {
      throw new Error("Correo o contraseña incorrectos");
    }

    if (tecnico.estado === "inactivo") {
      throw new Error("El técnico se encuentra inactivo");
    }

    const passwordValida = await compare(datos.password, tecnico.password);
    if (!passwordValida) {
      throw new Error("Correo o contraseña incorrectos");
    }

    const token = await CrearToken(tecnico);
    return { token, idTecnico: tecnico.id, rol: tecnico.rol };
  }
}