// src/Routes/emailRoutes.ts

import { Router } from "https://deno.land/x/oak@v17.2.0/mod.ts";
import { postEnviarCorreo } from "../Controllers/emailController.ts";

// creamos el router específico para el módulo de correos
const emailRoutes = new Router();

// POST /api/email/enviar -> ejecuta postEnviarCorreo
emailRoutes.post("/api/email/enviar", postEnviarCorreo);

export default emailRoutes;