'use client';

import { useEffect, useState } from 'react';
import { fetchTiDB } from '@/lib/tidb-client';

interface UsuarioDB {
  id: number;
  nombre: string;
  correo: string;
  username: string;
  rol: 'Administrador' | 'Capturista' | 'Auditor' | string;
  estado: 'Activo' | 'Inactivo' | string;
}

export interface PermisosEstructura {
  rol: string | null;
  cargado: boolean;
  
  // Dashboard y Visualización de Módulos
  puedeVerUsuarios: boolean;
  puedeVerProductos: boolean;
  puedeVerRespaldos: boolean;
  
  // Acciones CRUD
  puedeEditarUsuarios: boolean;
  puedeEditarProductos: boolean;
  
  // Administrador exclusivo para respaldos
  esAdmin: boolean;
}

export function usePermisos(): PermisosEstructura {
  const [rol, setRol] = useState<string | null>(null);
  const [cargado, setCargado] = useState<boolean>(false);

  useEffect(() => {
    const obtenerPermisosDinamicos = async () => {
      try {
        const guardado = localStorage.getItem('usuario_otzo');
        if (!guardado) {
          setCargado(true);
          return;
        }

        const usuarioSesion = JSON.parse(guardado);

        if (usuarioSesion?.id) {
          const respuesta = await fetchTiDB<UsuarioDB[] | UsuarioDB>(`/usuarios/${usuarioSesion.id}`);
          const usuarioBD = Array.isArray(respuesta) ? respuesta[0] : respuesta;

          if (usuarioBD && usuarioBD.estado === 'Activo') {
            setRol(usuarioBD.rol);
          } else {
            setRol(null);
          }
        }
      } catch (err) {
        console.error('Error al consultar permisos dinámicos en TiDB:', err);
        setRol(null);
      } finally {
        setCargado(true);
      }
    };

    obtenerPermisosDinamicos();
  }, []);

  return {
    rol,
    cargado,
    
    // VISUALIZACIÓN EN DASHBOARD (Admin y Auditor ven todo. Capturista solo productos)
    puedeVerUsuarios: rol === 'Administrador' || rol === 'Auditor',
    puedeVerProductos: rol === 'Administrador' || rol === 'Auditor' || rol === 'Capturista',
    puedeVerRespaldos: rol === 'Administrador' || rol === 'Auditor',
    
    // PERMISOS DE EDICIÓN / CRUD
    puedeEditarUsuarios: rol === 'Administrador',
    puedeEditarProductos: rol === 'Capturista', // <-- CORRECCIÓN CLAVE: Admin NO puede editar, solo lectura
    
    // PERMISO DE GENERACIÓN DE RESPALDO JSON (Restricción explícita en botones)
    esAdmin: rol === 'Administrador',
  };
}