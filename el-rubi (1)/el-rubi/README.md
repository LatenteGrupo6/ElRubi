# 🍓 El Rubí — Control del Negocio

Aplicación web de **control financiero e inventario** para **Productos Artesanales El Rubí** — Finca Hospedaje & Productos Artesanales, San Francisco, Antioquia.

Construida con **React + Vite**, lista para desplegar en **Vercel**.

---

## ✨ Funcionalidades

- **Módulo Finanzas**: registrar ingresos y egresos, resumen de totales (ingresos, egresos, utilidad), filtros por tipo / categoría / mes, exportar CSV.
- **Módulo Inventario**: agregar, editar y eliminar productos con costo y precio de venta; cálculo automático del valor total.
- **Guardado automático** en `localStorage` del navegador.
- Identidad visual de marca (colores, tipografías Great Vibes / Cinzel / Lato).
- Responsive: funciona en celular y computador.

---

## 🛠️ Desarrollo local

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar servidor de desarrollo
npm run dev

# 3. Compilar para producción
npm run build

# 4. Previsualizar el build
npm run preview
```

---

## 🚀 Desplegar en Vercel

### Opción A — GitHub + Vercel (recomendado)

```bash
# 1. Subir a GitHub
git init
git add .
git commit -m "El Rubí — versión inicial"
git remote add origin https://github.com/TU_USUARIO/el-rubi.git
git branch -M main
git push -u origin main
```

2. Ir a [vercel.com](https://vercel.com) → **Add New Project** → importar el repositorio.
3. Vercel detecta Vite automáticamente gracias al `vercel.json` incluido → clic en **Deploy**.
4. En segundos tendrá una URL pública tipo `el-rubi.vercel.app`.

### Opción B — Vercel CLI

```bash
npm i -g vercel
vercel
```

---

## 📱 Uso desde celular

Una vez publicada, abra la URL desde Chrome o Safari en su celular.
Puede agregarla a la pantalla de inicio para usarla como una app.

## 💾 Respaldo de datos

Los datos se guardan en el navegador (`localStorage`). Se recomienda exportar
el CSV desde el módulo de Finanzas **una vez al mes** como respaldo.

---

## 📂 Estructura del proyecto

```
el-rubi/
├── index.html          # Punto de entrada de Vite
├── package.json        # Dependencias y scripts
├── vite.config.js      # Configuración de Vite + React
├── vercel.json         # Configuración de despliegue en Vercel
├── .env.example        # Variables de entorno (no requeridas por ahora)
├── .gitignore
├── README.md
└── src/
    ├── main.jsx        # Render raíz de React
    └── App.jsx         # Aplicación completa
```
