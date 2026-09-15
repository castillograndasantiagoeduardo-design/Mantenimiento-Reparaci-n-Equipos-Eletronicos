import { Router } from "../Dependencies/Dependencias.ts";
import {
  getClientes,
  getClientePorId,
  postCliente,
  putCliente,
  deleteCliente,
  putEstadoOrdenDeCliente,
} from "../Controllers/ClienteController.ts";

const clienteRoutes = new Router();

// TODO: cuando el middleware de sesión (ValidarSesion.ts) esté listo,
// agregar .use(ValidarSesion) a las rutas que modifican información
// (POST, PUT, DELETE), tal como pide el Requerimiento 1.

clienteRoutes.get("/api/clientes", getClientes);
clienteRoutes.get("/api/clientes/:id", getClientePorId);
clienteRoutes.post("/api/clientes", postCliente);
clienteRoutes.put("/api/clientes/:id", putCliente);
clienteRoutes.delete("/api/clientes/:id", deleteCliente);

// Cambiar el estado de la orden de un equipo, desde el mismo CRUD de clientes
clienteRoutes.put("/api/clientes/:idCliente/ordenes/:idOrden/estado", putEstadoOrdenDeCliente);

export default clienteRoutes;