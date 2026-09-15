export async function GenerarKey(secret: string):Promise<CryptoKey>{
    return await crypto.subtle.importKey(
        "raw",                             //Formato de entrada en bits sin codificar
        new TextEncoder().encode(secret),  //Convierte la clave en un Uint8array entendible para el importkey
        {name: "HMAC", hash:"SHA-256"},    //Define el algoritmo para HMAC crea una clave con formato SHA-256
        false,                             //Se define si la clave puede ser importada despues de creada
        ["sign", "verify"]                 //Define para que puede ser usada la clave sing = firmar datos verify= verificar firma
    )
}