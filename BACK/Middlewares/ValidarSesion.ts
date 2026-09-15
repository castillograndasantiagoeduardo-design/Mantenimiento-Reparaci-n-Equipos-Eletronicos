import { Context, Next } from "../Dependencies/Dependencias.ts";
import { VerificarTokenAcceso } from "../Helpers/auth/Jwt.ts";

export const ValidarSesion = async (ctx: Context, next: Next) => {
  const token = await ctx.cookies.get("token");

  if (!token) {
    ctx.response.status = 401;
    ctx.response.body = { success: false, msg: "No autenticado" };
    return;
  }

  try {
    const payload = await VerificarTokenAcceso(token);

    if (!payload) {
      ctx.response.status = 401;
      ctx.response.body = { success: false, msg: "Token inválido o expirado" };
      return;
    }

    ctx.state.tecnico = payload;
    await next();
  } catch (error) {
    console.error("🔴 ERROR EN ValidarSesion:", error);
    ctx.response.status = 401;
    ctx.response.body = { success: false, msg: "Token inválido o expirado" };
  }
};