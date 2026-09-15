import { RouterContext } from "../Dependencies/Dependencias.ts";
import { TecnicoService } from "../Services/TecnicoService.ts";
import {
  CrearTecnicoSchema,
  EditarTecnicoSchema,
  CambiarEstadoTecnicoSchema,
} from "../Validators/Tecnico.squema.ts";

export class TecnicoController {
  static async crear(ctx: RouterContext<string>) {
    try {
      const body = await ctx.request.body.json();
      const data = CrearTecnicoSchema.parse(body);

      const id = await TecnicoService.crear(data);

      ctx.response.status = 201;
      ctx.response.body = { ok: true, mensaje: "Técnico creado", id };
    } catch (error) {
      ctx.response.status = 400;
      ctx.response.body = { ok: false, mensaje: `${error instanceof Error ? error.message : error}` };
    }
  }

  static async editar(ctx: RouterContext<string>) {
    try {
      const id = Number(ctx.params.id);
      if (isNaN(id)) {
        ctx.response.status = 400;
        ctx.response.body = { ok: false, mensaje: "Id inválido" };
        return;
      }

      const body = await ctx.request.body.json();
      const data = EditarTecnicoSchema.parse(body);

      await TecnicoService.editar(id, data);

      ctx.response.status = 200;
      ctx.response.body = { ok: true, mensaje: "Técnico actualizado" };
    } catch (error) {
      ctx.response.status = 400;
      ctx.response.body = { ok: false, mensaje: `${error instanceof Error ? error.message : error}` };
    }
  }

  static async cambiarEstado(ctx: RouterContext<string>) {
    try {
      const id = Number(ctx.params.id);
      if (isNaN(id)) {
        ctx.response.status = 400;
        ctx.response.body = { ok: false, mensaje: "Id inválido" };
        return;
      }

      const body = await ctx.request.body.json();
      const data = CambiarEstadoTecnicoSchema.parse(body);

      await TecnicoService.cambiarEstado(id, data);

      ctx.response.status = 200;
      ctx.response.body = {
        ok: true,
        mensaje: `Técnico ${data.estado === "activo" ? "activado" : "desactivado"}`,
      };
    } catch (error) {
      ctx.response.status = 400;
      ctx.response.body = { ok: false, mensaje: `${error instanceof Error ? error.message : error}` };
    }
  }
}