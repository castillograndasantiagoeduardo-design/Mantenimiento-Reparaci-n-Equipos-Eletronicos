// src/Controller/emailController.ts

import { Context } from "https://deno.land/x/oak@v17.2.0/mod.ts";
import { enviarCorreo } from "../Services/emailService.ts";

export const postEnviarCorreo = async (ctx: Context) => {
  // sacamos response y request del contexto
  const { response, request } = ctx;

  try {
    // leemos el body de la petición como JSON
    const body = await request.body.json();

    // llamamos al service que valida y envía
    const resultado = await enviarCorreo(body);

    if (resultado.success) {
      // 200 = todo salió bien
      response.status = 200;
      response.body = {
        success: true,
        message: resultado.message,
      };
    } else {
      // 400 = error del cliente (datos inválidos) o de envío
      response.status = 400;
      response.body = {
        success: false,
        message: resultado.message,
      };
    }
  } catch (error) {
    // 500 = error inesperado del servidor
    response.status = 500;
    response.body = {
      success: false,
      message: "Error al procesar la solicitud",
      errors: error,
    };
  }
};