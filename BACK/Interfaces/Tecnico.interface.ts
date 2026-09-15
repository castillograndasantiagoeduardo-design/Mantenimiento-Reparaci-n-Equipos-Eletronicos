export interface Tecnico {
  id: number;
  nombre: string;
  documento: string;
  especialidad: string;
  telefono: string;
  correo: string;
  password: string;
  rol: "superadmin" | "tecnico";
  estado: "activo" | "inactivo";
  created_at: Date;
}