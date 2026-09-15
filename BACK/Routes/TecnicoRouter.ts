import { Router } from "../Dependencies/Dependencias.ts";
import { TecnicoController } from "../Controllers/TecnicoController.ts";
import { ValidarSesion } from "../Middlewares/ValidarSesion.ts";
import { ValidarRol } from "../Middlewares/ValidarRol.ts";

const TecnicoRouter = new Router();

TecnicoRouter.post(
  "/tecnicos",
  ValidarSesion,
  ValidarRol(["superadmin"]),
  TecnicoController.crear,
);

TecnicoRouter.put(
  "/tecnicos/:id",
  ValidarSesion,
  ValidarRol(["superadmin"]),
  TecnicoController.editar,
);

TecnicoRouter.patch(
  "/tecnicos/:id/estado",
  ValidarSesion,
  ValidarRol(["superadmin"]),
  TecnicoController.cambiarEstado,
);

export {TecnicoRouter};