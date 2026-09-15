import { create, getNumericDate, verify } from "../../Dependencies/Dependencias.ts";
import { GenerarKey } from "./Criptokey.ts";

const key = Deno.env.get("MY_SECRET_KEY");
if (!key) {
  throw new Error("MY_SECRET_KEY no está configurada en el .env");
}

const server = Deno.env.get("SERVER");

export const CrearToken = async (usuario: Tecnico) => {
  const payload = {
    iss: server,
    sub: String(usuario.Id_Usuario),
    Rol_Usuario: usuario.Id_Rol,
    jti: crypto.randomUUID(),
    exp: getNumericDate(60 * 60 * 8), // 8 horas
  };

  const SecretKey = await GenerarKey(key);
  return await create({ alg: "HS256", typ: "JWT" }, payload, SecretKey);
};

export const VerificarTokenAcceso = async (token: string) => {
  const SecretKey = await GenerarKey(key!);
  try {
    return await verify(token, SecretKey);
  } catch (error) {
    console.error("Token inválido:", error);
    return null;
  }
};