import { Router } from "../Dependencies/Dependencias.ts";
import { postLogin } from "../Controllers/LoginController.ts";

const LoginRouter = new Router();

LoginRouter.post("/login", postLogin);

export {LoginRouter};