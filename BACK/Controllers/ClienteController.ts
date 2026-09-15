import { RouterContext } from "../Dependencies/Dependencias.ts";
import { mensajeError } from "../Helpers/ManejoErrores.ts";
import { ClienteSchema, ClienteUpdateSchema } from "../Validators/Cliente.squema.ts";
import { EstadoOrdenSchema } from "../Validators/Orden.squema.ts";
import * as ClienteService from "../Services/ClienteService.ts";
// Ojo: el nombre real del archivo es EmailService.ts (con mayúscula). Si tu
// import falla en Linux/Deno Deploy por sensibilidad a mayúsculas, corrígelo aquí.
import { enviarCorreo } from "../Services/EmailService.ts";

// GET /api/clientes
export const getClientes = async (ctx: RouterContext<string>) => {
  const { response } = ctx;
  try {
    const clientes = await ClienteService.obtenerClientes();
    response.status = 200;
    response.body = { success: true, data: clientes };
  } catch (error) {
    response.status = 500;
    response.body = { success: false, message: "Error al consultar clientes", error: mensajeError(error) };
  }
};

// GET /api/clientes/:id  -> incluye sus equipos con el estado de su orden más reciente
export const getClientePorId = async (ctx: RouterContext<string>) => {
  const { response, params } = ctx;
  const id = Number(params.id);

  if (!id) {
    response.status = 400;
    response.body = { success: false, message: "El ID del cliente no es válido" };
    return;
  }

  try {
    const cliente = await ClienteService.obtenerClientePorId(id);

    if (!cliente) {
      response.status = 404;
      response.body = { success: false, message: "Cliente no encontrado" };
      return;
    }

    const equipos = await ClienteService.obtenerEquiposConEstado(id);

    response.status = 200;
    response.body = { success: true, data: { ...cliente, equipos } };
  } catch (error) {
    response.status = 500;
    response.body = { success: false, message: "Error al consultar el cliente", error: mensajeError(error) };
  }
};

// POST /api/clientes
export const postCliente = async (ctx: RouterContext<string>) => {
  const { response, request } = ctx;

  try {
    const body = await request.body.json();
    const validacion = ClienteSchema.safeParse(body);

    if (!validacion.success) {
      response.status = 400;
      response.body = {
        success: false,
        message: "Datos inválidos",
        errores: validacion.error.flatten().fieldErrors,
      };
      return;
    }

    const datos = validacion.data;

    const yaExiste = await ClienteService.existeDocumentoOCorreo(datos.documento, datos.correo);
    if (yaExiste) {
      response.status = 400;
      response.body = { success: false, message: "Ya existe un cliente con ese documento o correo" };
      return;
    }

    const idGenerado = await ClienteService.crearCliente({
      ...datos,
      id_tecnico: datos.id_tecnico ?? null,
    });

    // Correo de confirmación: se manda directo, sin pasar por la BD.
    // Si el envío falla (SMTP mal configurado, etc.) NO se revierte el registro
    // del cliente, solo se informa en la respuesta.
    const correoResultado = await enviarCorreo({
      destinatario: datos.correo,
      asunto: "Registro exitoso en el sistema",
      mensaje: `Hola ${datos.nombre_completo}, tu registro como cliente se realizó correctamente. Documento: ${datos.documento}.`,
      nombre: datos.nombre_completo,
    });

    response.status = 201;
    response.body = {
      success: true,
      message: "Cliente registrado correctamente",
      data: { id: idGenerado, ...datos },
      correoEnviado: correoResultado.success,
      correoMensaje: correoResultado.message,
    };
  } catch (error) {
    response.status = 500;
    response.body = { success: false, message: "Error al registrar el cliente", error: mensajeError(error) };
  }
};

// PUT /api/clientes/:id
// Edita SOLO nombre_completo, telefono e id_tecnico.
// documento y correo son inmutables: si vienen en el body, se rechaza con un mensaje claro.
export const putCliente = async (ctx: RouterContext<string>) => {
  const { response, request, params } = ctx;
  const id = Number(params.id);

  if (!id) {
    response.status = 400;
    response.body = { success: false, message: "El ID del cliente no es válido" };
    return;
  }

  try {
    const body = await request.body.json();

    if ("documento" in body || "correo" in body) {
      response.status = 400;
      response.body = {
        success: false,
        message: "El documento y el correo no se pueden modificar",
      };
      return;
    }

    const validacion = ClienteUpdateSchema.safeParse(body);

    if (!validacion.success) {
      response.status = 400;
      response.body = {
        success: false,
        message: "Datos inválidos",
        errores: validacion.error.flatten().fieldErrors,
      };
      return;
    }

    const existente = await ClienteService.obtenerClientePorId(id);
    if (!existente) {
      response.status = 404;
      response.body = { success: false, message: "Cliente no encontrado" };
      return;
    }

    await ClienteService.actualizarCliente(id, validacion.data);

    response.status = 200;
    response.body = { success: true, message: "Cliente actualizado correctamente" };
  } catch (error) {
    response.status = 500;
    response.body = { success: false, message: "Error al actualizar el cliente", error: mensajeError(error) };
  }
};

// DELETE /api/clientes/:id
export const deleteCliente = async (ctx: RouterContext<string>) => {
  const { response, params } = ctx;
  const id = Number(params.id);

  if (!id) {
    response.status = 400;
    response.body = { success: false, message: "El ID del cliente no es válido" };
    return;
  }

  try {
    const existente = await ClienteService.obtenerClientePorId(id);
    if (!existente) {
      response.status = 404;
      response.body = { success: false, message: "Cliente no encontrado" };
      return;
    }

    const tieneEquipos = await ClienteService.clienteTieneEquipos(id);
    if (tieneEquipos) {
      response.status = 400;
      response.body = {
        success: false,
        message: "No se puede eliminar: el cliente tiene equipos asociados",
      };
      return;
    }

    await ClienteService.eliminarCliente(id);

    response.status = 200;
    response.body = { success: true, message: "Cliente eliminado correctamente" };
  } catch (error) {
    response.status = 500;
    response.body = { success: false, message: "Error al eliminar el cliente", error: mensajeError(error) };
  }
};

// PUT /api/clientes/:idCliente/ordenes/:idOrden/estado
// Cambia el estado de la orden de un equipo del cliente, directamente desde el CRUD.
// Las reglas de transición (no volver de ENTREGADO/CANCELADO, técnico activo, valores
// no negativos) ya están garantizadas por los triggers de la base de datos: si se violan,
// MySQL lanza un error con SIGNAL, que aquí se traduce en un 400 con el mensaje real.
export const putEstadoOrdenDeCliente = async (ctx: RouterContext<string>) => {
  const { response, request, params } = ctx;
  const idCliente = Number(params.idCliente);
  const idOrden = Number(params.idOrden);

  if (!idCliente || !idOrden) {
    response.status = 400;
    response.body = { success: false, message: "El ID del cliente o de la orden no es válido" };
    return;
  }

  try {
    const body = await request.body.json();
    const validacion = EstadoOrdenSchema.safeParse(body);

    if (!validacion.success) {
      response.status = 400;
      response.body = {
        success: false,
        message: "Datos inválidos",
        errores: validacion.error.flatten().fieldErrors,
      };
      return;
    }

    const orden = await ClienteService.obtenerOrdenDeCliente(idOrden, idCliente);
    if (!orden) {
      response.status = 404;
      response.body = { success: false, message: "Esa orden no existe o no pertenece a este cliente" };
      return;
    }

    await ClienteService.actualizarEstadoOrden(idOrden, validacion.data.estado);

    response.status = 200;
    response.body = { success: true, message: "Estado de la orden actualizado correctamente" };
  } catch (error) {
    // Casi siempre llega aquí por una regla de negocio violada (trigger de la BD)
    response.status = 400;
    response.body = { success: false, message: "No se pudo cambiar el estado", error: mensajeError(error) };
  }
};