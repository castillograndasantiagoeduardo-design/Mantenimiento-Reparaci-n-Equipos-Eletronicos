import { Context, Next } from "../Dependencies/Dependencias.ts";

export const ValidarRol = (rolesPermitidos: Array<"superadmin" | "tecnico">) => {
  return async (ctx: Context, next: Next) => {
    const tecnico = ctx.state.tecnico;

    if (!tecnico || !rolesPermitidos.includes(tecnico.Rol_Tecnico)) {
      ctx.response.status = 403;
      ctx.response.body = { success: false, msg: "No tienes permiso para esta acción" };
      return;
    }

    await next();
  };
};