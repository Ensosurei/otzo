# ☕ Cafeteria Otzo

![Estado](https://img.shields.io/badge/Estado-En_Desarrollo-orange?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16_Turbopack-black?style=for-the-badge&logo=nextdotjs)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)

Interfaz administrativa para la gestión de la **Cafetería Otzo**. El proyecto se encuentra actualmente en fase de desarrollo, priorizando la estructura visual de los módulos CRUD, la integración con TiDB Cloud y la experiencia de usuario.

---

## 📌 Estado del Proyecto & Módulos

Actualmente estamos construyendo los módulos principales del sistema bajo la misma identidad visual:

- [x] **Gestión de Usuarios:** CRUD completo (creación en modal, edición, eliminación), búsqueda en tiempo real (por nombre, `@username` o correo) y filtrado por roles.
- [x] **Catálogo de Productos:** En maquetación e integración.
- [x] **Respaldos y Sistema:** Pendiente de desarrollo.
- [ ] **Login**

---

## 🛠️ Desarrollo Local

Si deseas clonar y probar el avance del proyecto localmente:

1. **Clonar el repositorio:**  
   `git clone https://github.com/Ensosurei/otzo-web.git`  
   `cd otzo-web`

2. **Instalar dependencias:**  
   `npm install`

3. **Variables de entorno:**  
   Crea un archivo `.env.local` en la raíz con las credenciales de tu API / TiDB Cloud:  
   `TIDB_DATA_APP_URL=tu_endpoint_aqui`  
   `TIDB_PUBLIC_KEY=tu_public_key_aqui`  
   `TIDB_PRIVATE_KEY=tu_private_key_aqui`

4. **Ejecutar el servidor local:**  
   `npm run dev`  

Accede a `http://localhost:3000`.

---

## 🎨 Especificaciones de Diseño

* **Paleta de Colores:** Fondo Crema (`#F8F6F0`), Encabezado Oscuro (`#2B211B`), Acentuación Café (`#6F4E37`).
* **Tipografía:** *Plus Jakarta Sans*.
* **Iconografía:** Lucide React (`Coffee`, `UserPlus`, `Pencil`, etc.).
