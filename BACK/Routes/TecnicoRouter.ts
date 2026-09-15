import { Router } from "../Dependencies/Dependencias.ts";
import { TecnicoController } from "../Controllers/TecnicoController.ts";
import { ValidarSesion } from "../Middlewares/ValidarSesion.ts";
import { ValidarRol } from "../Middlewares/ValidarRol.ts";

const TecnicoRouter = new Router();

TecnicoRouter.post(
  "/tecnicos",
  TecnicoController.crear,
);

TecnicoRouter.put(
  "/tecnicos/:id",
  TecnicoController.editar,
);

TecnicoRouter.patch(
  "/tecnicos/:id/estado",
  TecnicoController.cambiarEstado,
);

export {TecnicoRouter};