# SmartMoney Frontend

Frontend de la aplicación SmartMoney - Control Inteligente de Gastos Personales.

## Tecnologías

- HTML5
- CSS3 (Tailwind CSS via CDN)
- JavaScript ES6+ (Vanilla JS - Módulos)
- Chart.js para gráficos
- Font Awesome para iconos

## Estructura del Proyecto

```
smartmoney-frontend/
├── index.html
├── assets/
│   ├── css/
│   │   └── main.css
│   └── js/
│       ├── app.js
│       ├── router.js
│       ├── config.js
│       ├── api/
│       │   ├── auth.api.js
│       │   ├── gastos.api.js
│       │   ├── categorias.api.js
│       │   ├── dashboard.api.js
│       │   ├── presupuestos.api.js
│       │   └── reportes.api.js
│       ├── pages/
│       │   ├── auth/
│       │   │   ├── login.page.js
│       │   │   └── register.page.js
│       │   ├── dashboard.page.js
│       │   ├── gastos.page.js
│       │   ├── presupuestos.page.js
│       │   └── reportes.page.js
│       └── utils/
│           ├── storage.util.js
│           ├── format.util.js
│           └── validation.util.js
└── README.md
```

## Configuración

### 1. Configurar la URL del API

Edita el archivo `assets/js/config.js` y cambia la URL del API:

```javascript
const CONFIG = {
  API_URL: 'https://tu-api.onrender.com/api', // Tu URL de Render
  // ...
};
```

### 2. Servidor de Desarrollo Local

Para probar localmente, necesitas un servidor HTTP simple. Opciones:

**Opción A: VS Code Live Server**
1. Instala la extensión "Live Server" en VS Code
2. Click derecho en `index.html` > "Open with Live Server"

**Opción B: Python HTTP Server**
```bash
# Python 3
python -m http.server 5500

# Luego abre http://localhost:5500
```

**Opción C: Node HTTP Server**
```bash
npx http-server -p 5500
```

### 3. CORS en Desarrollo

Si estás probando localmente, asegúrate de que tu backend acepte requests desde `http://localhost:5500`:

En Render, agrega la variable de entorno:
```
CORS_ORIGIN=http://localhost:5500
```

O para permitir todos los orígenes durante desarrollo:
```
CORS_ORIGIN=*
```

## Despliegue en Netlify

### 1. Preparar el Proyecto

1. Asegúrate de que la URL del API en `config.js` apunte a tu backend en Render
2. Commit y push a GitHub

### 2. Desplegar en Netlify

**Método 1: Desde GitHub**

1. Ve a [Netlify](https://www.netlify.com)
2. Click en "Add new site" > "Import an existing project"
3. Conecta tu repositorio de GitHub
4. Configura:
   - **Build command:** Dejar vacío
   - **Publish directory:** `.` (punto)
5. Click en "Deploy site"

**Método 2: Drag and Drop**

1. Ve a [Netlify](https://www.netlify.com)
2. Arrastra la carpeta del proyecto directamente a Netlify
3. Netlify lo desplegará automáticamente

### 3. Configurar el Dominio

1. Netlify te dará una URL como: `https://nombre-aleatorio.netlify.app`
2. Puedes cambiar el nombre en "Site settings" > "Change site name"

### 4. Actualizar CORS en el Backend

Una vez que tengas tu URL de Netlify, actualiza la variable de entorno en Render:

```
CORS_ORIGIN=https://tu-app.netlify.app
```

## Características Implementadas

### Autenticación
- Registro de usuarios
- Inicio de sesión
- Cierre de sesión
- Manejo de tokens JWT

### Dashboard
- Resumen de gastos del día y mes
- Indicador de presupuesto usado
- Gráfico circular de gastos por categoría
- Gráfico de línea de gastos por día
- Mensajes motivacionales dinámicos

### Diseño
- Mobile-first responsive
- Interfaz limpia y profesional
- Sin emojis
- Paleta de colores consistente
- Animaciones suaves

## Navegación

La aplicación usa routing del lado del cliente con hash (#):

- `#login` - Página de inicio de sesión
- `#register` - Página de registro
- `#dashboard` - Dashboard principal
- `#gastos` - Gestión de gastos (en desarrollo)
- `#presupuestos` - Gestión de presupuestos (en desarrollo)
- `#reportes` - Reportes mensuales (en desarrollo)

## Almacenamiento Local

La aplicación usa `localStorage` para:
- Token de autenticación (`smartmoney_token`)
- Datos del usuario (`smartmoney_user`)

## Próximos Pasos

Para completar el frontend, necesitas implementar las páginas:

1. **Gastos** (`gastos.page.js`)
   - Formulario para crear/editar gastos
   - Lista de gastos con filtros
   - Botón de gasto rápido
   - Eliminación de gastos

2. **Presupuestos** (`presupuestos.page.js`)
   - Crear presupuestos por categoría
   - Visualización de presupuestos con barras de progreso
   - Alertas visuales según porcentaje usado

3. **Reportes** (`reportes.page.js`)
   - Selector de mes/año
   - Visualización de estadísticas
   - Comparación con mes anterior
   - Recomendaciones personalizadas
   - Exportación a PDF/CSV

## Solución de Problemas

### Error: CORS Policy

Si ves este error en la consola:
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

Solución:
- Verifica que `CORS_ORIGIN` en el backend incluya tu URL del frontend
- Para desarrollo local, usa `http://localhost:5500` (sin la barra final)
- Para producción, usa tu URL de Netlify completa

### Error: Network Request Failed

Posibles causas:
1. Backend no está corriendo
2. URL incorrecta en `config.js`
3. Problema de internet

### Dashboard no carga

1. Abre la consola del navegador (F12)
2. Verifica que el token esté guardado: `localStorage.getItem('smartmoney_token')`
3. Si no hay token, cierra sesión y vuelve a iniciar sesión

## Personalización

### Cambiar Colores

Edita `index.html` en la sección de configuración de Tailwind:

```javascript
tailwind.config = {
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',  // Tu color principal
        secondary: '#10B981', // Tu color secundario
      }
    }
  }
}
```

### Cambiar Formato de Moneda

Edita `format.util.js`:

```javascript
formatCurrency(amount) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'  // Cambia a USD, EUR, etc.
  }).format(amount);
}
```

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/NuevaFuncionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/NuevaFuncionalidad`)
5. Abre un Pull Request

## Licencia

ISC