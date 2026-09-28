// Roles y Estados
export type RolUsuario = 'Administrador' | 'Capturista' | 'Auditor';
export type EstadoUsuario = 'Activo' | 'Inactivo';
export type CategoriaProducto = 'Bebida' | 'Alimento' | 'Servicio';

// Modelo de Usuario
export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  username: string;
  password_hash?: string;
  rol: RolUsuario;
  estado: EstadoUsuario;
}

// Modelo de Producto / Servicio
export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: CategoriaProducto;
  disponible: boolean;
}

// Modelo de Log / Respaldo
export interface RespaldoLog {
  id: number;
  usuario_id: number;
  usuario?: string;
  nombre_archivo: string;
  fecha_respaldo: string;
}
