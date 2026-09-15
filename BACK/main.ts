import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { Application, oakCors } from "./Dependencies/Dependencias.ts";
import emailRoutes from "./Routes/emailRoutes.ts";

const app = new Application();

app.use(oakCors({
    origin: "*"
}));

const routes = [emailRoutes];

routes.forEach(router => {
    app.use(router.routes());
    app.use(router.allowedMethods());
})

console.log("Servidor corriendo por el puerto 8015");

app.listen({ port: 8015 });