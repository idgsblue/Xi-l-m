# PWA Icon Generator - Guía de Uso

## 📱 Tu app ya es una PWA

Tu aplicación ya está configurada como PWA con:
- ✅ `manifest.json` configurado
- ✅ `service-worker.js` implementado
- ✅ Todas las referencias de iconos definidas

Solo faltan los archivos de iconos físicos.

## 🎨 Cómo Generar los Iconos

### Paso 1: Instalar dependencia

```bash
cd frontend
npm install sharp
```

### Paso 2: Preparar tu logo

Necesitas una imagen de tu logo con estas características:
- **Tamaño mínimo:** 512x512 px
- **Recomendado:** 1024x1024 px o superior
- **Formato:** PNG, JPG, SVG o WEBP
- **Fondo:** Preferiblemente transparente (PNG)
- **Diseño:** Centrado y sin texto muy pequeño

### Paso 3: Ejecutar el generador

```bash
node generate-icons.js ruta/a/tu/logo.png
```

Ejemplos:
```bash
# Si tu logo está en la carpeta frontend
node generate-icons.js logo.png

# Si está en assets
node generate-icons.js ../assets/logo.png

# Si está en public
node generate-icons.js public/logo.png
```

### Paso 4: Verificar

Los iconos se generarán en: `frontend/public/icons/`

Iconos generados:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## 🚀 Probar tu PWA

### En desarrollo local:

1. Inicia tu app:
```bash
npm run dev
```

2. Abre Chrome DevTools → Application → Manifest
3. Verifica que todos los iconos se muestren correctamente

### En producción:

1. Despliega tu app
2. Abre la app en un navegador móvil
3. Deberías ver el prompt "Agregar a pantalla de inicio"

## 🔍 Verificar configuración PWA

### Usar Lighthouse (Chrome DevTools)

1. Abre Chrome DevTools (F12)
2. Ve a la pestaña "Lighthouse"
3. Selecciona "Progressive Web App"
4. Click en "Generate report"

Deberías obtener un puntaje alto (90+) si todo está configurado correctamente.

## 📋 Checklist de PWA

- ✅ manifest.json configurado
- ✅ service-worker.js implementado
- ⏳ Iconos generados (pendiente - usa este script)
- ✅ HTTPS en producción (Firebase Hosting)
- ✅ Responsive design
- ✅ Start URL configurada
- ✅ Theme color configurado

## 🎨 Consejos para el logo

### Diseño recomendado:
- Usa formas simples y reconocibles
- Evita detalles muy finos
- Deja espacio alrededor del logo (padding)
- Prueba que se vea bien en tamaños pequeños

### Si no tienes un logo todavía:
Puedes crear uno rápido con:
- [Canva](https://www.canva.com) - Plantillas gratuitas
- [Figma](https://www.figma.com) - Diseño vectorial
- [LogoMakr](https://logomakr.com) - Generador simple

### Placeholder temporal:
Si necesitas un placeholder rápido mientras diseñas tu logo:

```javascript
// Generar un icono simple con iniciales
const { createCanvas } = require('canvas');

function createPlaceholder() {
  const canvas = createCanvas(512, 512);
  const ctx = canvas.getContext('2d');

  // Fondo
  ctx.fillStyle = '#0ea5e9';
  ctx.fillRect(0, 0, 512, 512);

  // Texto
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 200px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('AS', 256, 256);

  return canvas.toBuffer('image/png');
}

// Guarda como placeholder.png y úsalo para generar los iconos
```

## 🛠️ Troubleshooting

### Error: "Cannot find module 'sharp'"
```bash
npm install sharp
```

### Error: "Source file not found"
Verifica que la ruta al logo sea correcta y que el archivo exista.

### Los iconos se ven distorsionados
Tu imagen fuente es muy pequeña. Usa una imagen de al menos 1024x1024 px.

### El navegador no muestra el prompt de instalación
- Verifica que estés en HTTPS (excepto localhost)
- Revisa Chrome DevTools → Application → Manifest
- Asegúrate de que todos los iconos se carguen correctamente
- Verifica que el service worker esté registrado

## 📱 Características de tu PWA actual

Tu [manifest.json](frontend/public/manifest.json) ya incluye:

```json
{
  "short_name": "Arroyo Seco",
  "name": "Arroyo Seco - Plataforma de Reservas",
  "theme_color": "#0ea5e9",
  "background_color": "#ffffff",
  "display": "standalone",
  "orientation": "portrait-primary",
  "lang": "es-MX"
}
```

¡Todo listo para ser una PWA completa una vez generes los iconos! 🎉

## 📚 Recursos adicionales

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [MDN: Progressive Web Apps](https://developer.mozilla.org/es/docs/Web/Progressive_web_apps)
- [Google Workbox](https://developers.google.com/web/tools/workbox) - Service Worker library
