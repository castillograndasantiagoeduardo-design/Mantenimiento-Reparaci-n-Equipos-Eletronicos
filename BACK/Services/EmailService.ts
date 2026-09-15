// src/Services/emailService.ts

// z y SMTPClient salen del barrel de dependencias, igual que Client en conexion.ts
// z: librería de validación de datos
// SMTPClient: cliente para conectarnos a un servidor SMTP y enviar correos
import { z, SMTPClient } from "../Dependencies/Dependencias.ts";
// conexión ya abierta a la base de datos mantenimiento_de_equipos
import { conexion } from "../Models/Conexion.ts";

// -----------------------------------------------------------------------------
// TIPOS
// -----------------------------------------------------------------------------

// tipo de notificación: es el ENUM de la columna `tipo` en notificaciones_correo
type TipoNotificacion = "cambio_estado_orden" | "cambio_estado_tecnico";

// forma de una fila de la tabla `notificaciones_correo`
interface NotificacionCorreo {
  id: number;
  tipo: TipoNotificacion;
  destinatario_correo: string;
  destinatario_nombre: string;
  asunto: string;
  mensaje: string;
  id_orden: number | null;
  enviado: number; // tinyint(1): 0 = pendiente, 1 = enviado
  // se agrega con el JOIN a `ordenes`, no existe en notificaciones_correo
  numero_orden?: string | null;
}

// datos que llegan desde el controlador cuando se envía un correo manual
interface CorreoData {
  destinatario: string;
  asunto: string;
  mensaje: string;
  nombre?: string;
  numeroOrden?: string; // antes era numeroSolicitud: aquí es ordenes.numero_orden
}

type Resultado = { success: boolean; message: string };

// -----------------------------------------------------------------------------
// VALIDACIÓN
// -----------------------------------------------------------------------------

// schema de zod: mismas reglas que valida la BD en los triggers
const CorreoSchema = z.object({
  // .email() ya valida el formato; varchar(150) en la BD, por eso el .max(150)
  destinatario: z.string().email({ message: "El destinatario no es un correo válido" }).max(150),
  // asunto es varchar(200) en notificaciones_correo
  asunto: z.string().min(1, { message: "El asunto no puede estar vacío" }).max(200),
  mensaje: z.string().min(1, { message: "El mensaje no puede estar vacío" }),
  // destinatario_nombre es varchar(150)
  nombre: z.string().max(150).optional(),
  // numero_orden es varchar(20) en la tabla ordenes
  numeroOrden: z.string().max(20).optional(),
});

// -----------------------------------------------------------------------------
// PLANTILLA HTML (estilo retro Windows 95/XP Classic)
// -----------------------------------------------------------------------------

// arma el cuerpo HTML del correo a partir de los datos recibidos
function generarHtml(datos: {
  nombre?: string;
  mensaje: string;
  numeroOrden?: string | null;
  tipo?: TipoNotificacion;
}): string {
  // si no viene nombre, usamos un texto genérico
  const nombreMostrar = datos.nombre ?? "usuario";

  // el título cambia según el tipo de notificación que generó el trigger
  const titulo =
    datos.tipo === "cambio_estado_tecnico"
      ? "Actualización de tu estado en el sistema"
      : "Estado de tu orden de mantenimiento";

  // bloque opcional del número de orden, con el mismo look "campo de Windows"
  const bloqueOrden = datos.numeroOrden
    ? `
      <tr>
        <td style="padding-top:14px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"
                 style="border:1px solid #808080; border-top-color:#404040; border-left-color:#404040;
                        background:#ffffff; padding:8px 12px;">
            <tr>
              <td style="font-family:'MS Sans Serif', Tahoma, Geneva, sans-serif; font-size:12px; color:#000000;">
                Número de orden: <strong>${datos.numeroOrden}</strong>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    : "";

  return `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<title>${titulo}</title>
</head>
<body style="margin:0; padding:24px; background:#008080; font-family:'MS Sans Serif', Tahoma, Geneva, sans-serif;">

  <!-- Ventana estilo Windows 95/XP Classic -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="480"
         align="center"
         style="background:#c0c0c0; border:2px solid #ffffff; border-right-color:#404040; border-bottom-color:#404040;">

    <!-- Barra de título -->
    <tr>
      <td style="background:linear-gradient(90deg,#000080,#1084d0); padding:4px 6px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="font-family:'MS Sans Serif', Tahoma, Geneva, sans-serif; font-size:12px; font-weight:bold; color:#ffffff;">
              🛠️ Notificación del sistema
            </td>
            <td align="right">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width:18px; height:16px; background:#c0c0c0; border:1px solid #ffffff; border-right-color:#404040; border-bottom-color:#404040; text-align:center; font-size:11px; font-weight:bold; color:#000000; line-height:16px;">✕</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Cuerpo de la ventana -->
    <tr>
      <td style="padding:18px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">

          <!-- Título tipo "panel hundido" -->
          <tr>
            <td style="padding:10px 12px; background:#ffffff; border:1px solid #808080; border-top-color:#404040; border-left-color:#404040;">
              <span style="font-family:'MS Sans Serif', Tahoma, Geneva, sans-serif; font-size:14px; font-weight:bold; color:#000080;">
                ${titulo}
              </span>
            </td>
          </tr>

          <tr>
            <td style="padding-top:16px; font-family:'MS Sans Serif', Tahoma, Geneva, sans-serif; font-size:12px; color:#000000; line-height:1.5;">
              Hola <strong>${nombreMostrar}</strong>,
            </td>
          </tr>

          <tr>
            <td style="padding-top:8px; font-family:'MS Sans Serif', Tahoma, Geneva, sans-serif; font-size:12px; color:#000000; line-height:1.5;">
              ${datos.mensaje}
            </td>
          </tr>

          ${bloqueOrden}

          <tr>
            <td style="padding-top:16px; font-family:'MS Sans Serif', Tahoma, Geneva, sans-serif; font-size:12px; color:#000000; line-height:1.5;">
              Gracias por confiar en nuestro servicio técnico.
            </td>
          </tr>

          <!-- Botón estilo "OK" de Windows -->
          <tr>
            <td align="right" style="padding-top:20px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:#c0c0c0; border:2px solid #ffffff; border-right-color:#404040; border-bottom-color:#404040; padding:6px 22px;">
                    <span style="font-family:'MS Sans Serif', Tahoma, Geneva, sans-serif; font-size:12px; color:#000000;">OK</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

// -----------------------------------------------------------------------------
// CLIENTE SMTP
// -----------------------------------------------------------------------------

// crea el cliente SMTP leyendo las variables de entorno
// devuelve null si falta alguna variable
function crearClienteSmtp(): SMTPClient | null {
  const host = Deno.env.get("SMTP_HOST");
  const port = Deno.env.get("SMTP_PORT");
  const user = Deno.env.get("SMTP_USER");
  const password = Deno.env.get("SMTP_PASSWORD");

  if (!host || !port || !user || !password) return null;

  return new SMTPClient({
    connection: {
      hostname: host,
      port: Number(port), // Deno.env.get devuelve string, hay que convertir
      tls: true,          // conexión segura (necesaria para el puerto 465)
      auth: { username: user, password: password },
    },
  });
}

// -----------------------------------------------------------------------------
// ENVÍO DE UN CORREO SUELTO (por ejemplo, desde un controlador)
// -----------------------------------------------------------------------------

export async function enviarCorreo(datos: CorreoData): Promise<Resultado> {
  try {
    // 1) validamos los datos con el schema de zod
    const DatosValidos = CorreoSchema.parse(datos);

    // 2) creamos el cliente SMTP
    const client = crearClienteSmtp();
    if (!client) {
      return { success: false, message: "Faltan variables de entorno del servidor SMTP" };
    }

    // 3) enviamos el correo
    await client.send({
      from: Deno.env.get("SMTP_USER")!,
      to: DatosValidos.destinatario,
      subject: DatosValidos.asunto,
      content: DatosValidos.mensaje,   // versión en texto plano
      html: generarHtml(DatosValidos), // versión en HTML
    });

    // 4) cerramos la conexión SMTP (libera recursos)
    await client.close();

    return { success: true, message: "Correo enviado correctamente" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0].message };
    }
    return { success: false, message: "Error al enviar el correo: " + error };
  }
}

// -----------------------------------------------------------------------------
// COLA DE NOTIFICACIONES (lo que generan los triggers de la BD)
// -----------------------------------------------------------------------------

// Los triggers trg_ordenes_after_insert_correo, trg_ordenes_after_update_correo
// y trg_tecnicos_after_update_estado insertan filas en notificaciones_correo
// con enviado = 0. Aquí las leemos.

export async function obtenerNotificacionesPendientes(
  limite = 20,
): Promise<NotificacionCorreo[]> {
  // LEFT JOIN porque las notificaciones de técnico no tienen id_orden
  const filas = await conexion.query(
    `SELECT n.id, n.tipo, n.destinatario_correo, n.destinatario_nombre,
            n.asunto, n.mensaje, n.id_orden, n.enviado,
            o.numero_orden
       FROM notificaciones_correo n
       LEFT JOIN ordenes o ON o.id = n.id_orden
      WHERE n.enviado = 0
      ORDER BY n.fecha_creacion ASC
      LIMIT ?`,
    [limite],
  );
  return filas as NotificacionCorreo[];
}

// marca una notificación como enviada y guarda la fecha real de envío
async function marcarComoEnviada(id: number): Promise<void> {
  await conexion.execute(
    `UPDATE notificaciones_correo
        SET enviado = 1, fecha_envio = NOW()
      WHERE id = ?`,
    [id],
  );
}

// Recorre las notificaciones pendientes, envía cada una y la marca como enviada.
// Úsala desde un endpoint (ej: POST /notificaciones/enviar) o desde un
// setInterval en tu servidor para que corra cada cierto tiempo.
export async function procesarNotificacionesPendientes(): Promise<
  { success: boolean; message: string; enviados: number; fallidos: number }
> {
  const client = crearClienteSmtp();
  if (!client) {
    return {
      success: false,
      message: "Faltan variables de entorno del servidor SMTP",
      enviados: 0,
      fallidos: 0,
    };
  }

  let enviados = 0;
  let fallidos = 0;

  try {
    const pendientes = await obtenerNotificacionesPendientes();

    // abrimos la conexión SMTP una sola vez para todo el lote
    for (const n of pendientes) {
      try {
        await client.send({
          from: Deno.env.get("SMTP_USER")!,
          to: n.destinatario_correo,
          subject: n.asunto,
          content: n.mensaje, // el mensaje ya viene armado por el trigger
          html: generarHtml({
            nombre: n.destinatario_nombre,
            mensaje: n.mensaje,
            numeroOrden: n.numero_orden,
            tipo: n.tipo,
          }),
        });

        // solo marcamos como enviada si el send() no lanzó error
        await marcarComoEnviada(n.id);
        enviados++;
      } catch (error) {
        // si una falla, seguimos con las demás y la dejamos en enviado = 0
        console.error(`Error enviando notificación ${n.id}:`, error);
        fallidos++;
      }
    }

    await client.close();

    return {
      success: true,
      message: `Proceso terminado: ${enviados} enviados, ${fallidos} fallidos`,
      enviados,
      fallidos,
    };
  } catch (error) {
      try {
      await client.close();
    } catch {
      // sin acción
    }
    return {
      success: false,
      message: "Error al procesar las notificaciones: " + error,
      enviados,
      fallidos,
    };
  }
}