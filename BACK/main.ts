import { Application, oakCors } from "./Dependencies/Dependencias.ts";
import { TecnicoRouter } from "./Routes/TecnicoRouter.ts"


const app = new Application();

app.use(oakCors({
    origin:"*"
}));

const routes = [TecnicoRouter];

routes.forEach(router =>{
    app.use(router.routes());
    app.use(router.allowedMethods());
})

console.log("Servidor corriendo por el puerto 8015");

app.listen({port: 8015});