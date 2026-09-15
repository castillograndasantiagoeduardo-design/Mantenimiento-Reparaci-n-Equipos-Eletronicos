//Funcion que maneja los errores del catch de los controladores 
export function mensajeError(error: unknown): string {
    return error instanceof Error? error.message : String(error)
}