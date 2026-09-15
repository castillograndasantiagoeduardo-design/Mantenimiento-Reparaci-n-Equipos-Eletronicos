import { RouterContext } from "../Dependencies/Dependencias.ts";
import { mensajeError } from "../Helpers/ManejoErrores.ts";
import { LoginDto, LoginSchema } from "../Validators/Login.schema.ts";
import { LoginService } from "../Services/LoginService.ts";

export const postLogin = async (ctx: RouterContext<"/login">) => {
  const { response, request, cookies } = ctx;
  try {
    const datos: LoginDto = await request.body.json();
    const data = LoginSchema.parse(datos);

    const loginService = new LoginService();
    const { token, idTecnico, rol } = await loginService.IniciarSesion(data);

    await cookies.set("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 horas, debe coincidir con el exp del JWT
      path: "/",
    });

    response.status = 200;
    response.body = {
      ok: true,
      mensaje: "Login exitoso",
      idTecnico,
      rol,
    };
  } catch (error) {
    response.status = 401;
    response.body = { ok: false, mensaje: mensajeError(error) };
  }
};