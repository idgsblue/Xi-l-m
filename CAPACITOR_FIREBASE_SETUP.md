# Manual de Implementación: Capacitor + Firebase Hosting

Este manual detalla paso a paso cómo implementar Capacitor en tu aplicación React y configurar Firebase Hosting.

## 📋 Tabla de Contenidos
1. [Prerequisitos](#prerequisitos)
2. [Instalación de Capacitor](#instalación-de-capacitor)
3. [Configuración de Capacitor](#configuración-de-capacitor)
4. [Configuración de Plataformas (Android/iOS)](#configuración-de-plataformas)
5. [Firebase Hosting Setup](#firebase-hosting-setup)
6. [Scripts Útiles](#scripts-útiles)
7. [Comandos de Desarrollo](#comandos-de-desarrollo)

---

## Prerequisitos

Antes de comenzar, asegúrate de tener instalado:

- Node.js (v18 o superior)
- npm o bun
- Android Studio (para desarrollo Android)
- Xcode (para desarrollo iOS - solo en macOS)
- Firebase CLI: `npm install -g firebase-tools`

---

## 1. Instalación de Capacitor

### Paso 1.1: Instalar dependencias de Capacitor

Navega a tu directorio frontend:

```bash
cd apps/frontend
```

Instala Capacitor Core y CLI:

```bash
npm install @capacitor/core
npm install -D @capacitor/cli
```

### Paso 1.2: Instalar plataformas específicas

```bash
# Para Android
npm install @capacitor/android

# Para iOS (solo si tienes macOS)
npm install @capacitor/ios

# Plugins útiles (opcionales)
npm install @capacitor/app @capacitor/haptics @capacitor/keyboard @capacitor/status-bar @capacitor/splash-screen
```

---

## 2. Configuración de Capacitor

### Paso 2.1: Inicializar Capacitor

```bash
npx cap init
```

Cuando te pregunte:
- **App name**: `Lab System` (o el nombre que prefieras)
- **App ID**: `com.labsystem.app` (formato: com.tudominio.nombreapp)
- **Web directory**: `dist` (es donde Vite construye la app)

Esto creará el archivo `capacitor.config.ts`

### Paso 2.2: Configurar `capacitor.config.ts`

El archivo debería verse así:

```typescript
import type { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.labsystem.app',
  appName: 'Lab System',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false
    }
  }
};

export default config;
```

### Paso 2.3: Actualizar `package.json`

Agrega estos scripts al `package.json` de tu frontend:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:mobile": "vite build && cap sync",
    "lint": "eslint .",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit -p tsconfig.app.json",
    "cap:add:android": "cap add android",
    "cap:add:ios": "cap add ios",
    "cap:sync": "cap sync",
    "cap:open:android": "cap open android",
    "cap:open:ios": "cap open ios",
    "cap:run:android": "cap run android",
    "cap:run:ios": "cap run ios",
    "android": "npm run build:mobile && cap open android",
    "ios": "npm run build:mobile && cap open ios"
  }
}
```

### Paso 2.4: Actualizar `.gitignore`

Agrega estas líneas al `.gitignore` del frontend:

```
# Capacitor
android/
ios/
*.orig
.DS_Store
```

---

## 3. Configuración de Plataformas

### Paso 3.1: Construir la aplicación

Antes de agregar plataformas, construye tu app:

```bash
npm run build
```

### Paso 3.2: Agregar plataforma Android

```bash
npm run cap:add:android
```

Esto creará la carpeta `android/` con un proyecto de Android Studio completo.

### Paso 3.3: Agregar plataforma iOS (solo macOS)

```bash
npm run cap:add:ios
```

Esto creará la carpeta `ios/` con un proyecto de Xcode.

### Paso 3.4: Sincronizar cambios

Cada vez que hagas cambios en tu código web:

```bash
npm run build:mobile
```

O manualmente:

```bash
npm run build
npx cap sync
```

---

## 4. Firebase Hosting Setup

### Paso 4.1: Instalar Firebase Tools

```bash
npm install -g firebase-tools
```

### Paso 4.2: Login en Firebase

```bash
firebase login
```

### Paso 4.3: Inicializar Firebase en el proyecto

Desde la raíz del proyecto (`/home/infix/project_lab`):

```bash
firebase init hosting
```

Responde a las preguntas:
- **Select a default Firebase project**: Selecciona tu proyecto o crea uno nuevo
- **What do you want to use as your public directory?**: `apps/frontend/dist`
- **Configure as a single-page app?**: `Yes`
- **Set up automatic builds and deploys with GitHub?**: `No` (o `Yes` si quieres CI/CD)
- **Overwrite index.html?**: `No`

### Paso 4.4: Configurar `firebase.json`

Edita el archivo `firebase.json` en la raíz:

```json
{
  "hosting": {
    "public": "apps/frontend/dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=7200"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

### Paso 4.5: Agregar scripts para Firebase

Agrega estos scripts al `package.json` raíz:

```json
{
  "scripts": {
    "deploy:web": "cd apps/frontend && npm run build && cd ../.. && firebase deploy --only hosting",
    "firebase:serve": "cd apps/frontend && npm run build && cd ../.. && firebase serve"
  }
}
```

### Paso 4.6: Crear archivo `.firebaserc`

En la raíz del proyecto:

```json
{
  "projects": {
    "default": "tu-proyecto-id"
  }
}
```

Reemplaza `tu-proyecto-id` con el ID de tu proyecto Firebase.

---

## 5. Scripts Útiles

### Configuración completa del frontend

Agrega al `package.json` del frontend (`apps/frontend/package.json`):

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:mobile": "vite build && cap sync",
    "lint": "eslint .",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit -p tsconfig.app.json",

    "cap:sync": "cap sync",
    "cap:update": "cap update",
    "cap:copy": "cap copy",

    "android:add": "cap add android",
    "android:open": "cap open android",
    "android:run": "cap run android",
    "android:build": "npm run build:mobile && cap open android",

    "ios:add": "cap add ios",
    "ios:open": "cap open ios",
    "ios:run": "cap run ios",
    "ios:build": "npm run build:mobile && cap open ios"
  }
}
```

---

## 6. Comandos de Desarrollo

### Desarrollo Web

```bash
cd apps/frontend
npm run dev
```

### Desarrollo Android

1. Construir y abrir Android Studio:
   ```bash
   cd apps/frontend
   npm run android:build
   ```

2. Ejecutar en emulador/dispositivo desde Android Studio o:
   ```bash
   npm run android:run
   ```

### Desarrollo iOS

1. Construir y abrir Xcode:
   ```bash
   cd apps/frontend
   npm run ios:build
   ```

2. Ejecutar en simulador/dispositivo desde Xcode o:
   ```bash
   npm run ios:run
   ```

### Deploy a Firebase Hosting

Desde la raíz del proyecto:

```bash
npm run deploy:web
```

O manualmente:

```bash
cd apps/frontend
npm run build
cd ../..
firebase deploy --only hosting
```

### Probar Firebase Hosting localmente

```bash
npm run firebase:serve
```

---

## 7. Workflow Completo

### Primera vez configurando Capacitor

```bash
# 1. Navegar al frontend
cd apps/frontend

# 2. Instalar dependencias
npm install @capacitor/core @capacitor/android @capacitor/ios
npm install -D @capacitor/cli
npm install @capacitor/app @capacitor/haptics @capacitor/keyboard @capacitor/status-bar

# 3. Inicializar Capacitor
npx cap init

# 4. Construir la app
npm run build

# 5. Agregar plataformas
npm run android:add
# npm run ios:add  # Solo en macOS

# 6. Abrir IDE nativo
npm run android:open
```

### Desarrollo día a día

```bash
# Hacer cambios en el código...

# Construir y sincronizar
cd apps/frontend
npm run build:mobile

# Abrir Android Studio/Xcode para probar
npm run android:open
# o
npm run ios:open
```

### Deploy a producción

```bash
# Desde la raíz del proyecto
npm run deploy:web
```

---

## 8. Consideraciones Importantes

### Capacitor

1. **Sincronización**: Siempre ejecuta `cap sync` después de:
   - Instalar nuevos plugins de Capacitor
   - Cambiar configuración en `capacitor.config.ts`
   - Hacer build de la aplicación web

2. **Actualización de plugins**:
   ```bash
   npm run cap:update
   ```

3. **Live Reload** (desarrollo móvil):
   Puedes configurar live reload editando `capacitor.config.ts`:
   ```typescript
   server: {
     url: 'http://192.168.1.X:5173', // Tu IP local
     cleartext: true
   }
   ```

### Firebase Hosting

1. **Variables de entorno**: Asegúrate de configurar las variables correctas para producción en Firebase.

2. **Múltiples ambientes**: Puedes crear múltiples sitios en Firebase:
   ```bash
   firebase hosting:channel:deploy staging
   ```

3. **Preview URLs**: Firebase genera URLs de preview automáticamente en cada deploy.

---

## 9. Solución de Problemas Comunes

### Error: "Web directory not found"

```bash
npm run build  # Asegúrate de construir antes de sync
```

### Android Studio no encuentra el proyecto

```bash
cd apps/frontend
rm -rf android
npm run android:add
```

### Cambios no se reflejan en la app móvil

```bash
npm run build:mobile
```

### Firebase deploy falla

```bash
firebase login --reauth
firebase use --add  # Selecciona el proyecto correcto
```

---

## 10. Recursos Adicionales

- [Documentación de Capacitor](https://capacitorjs.com/docs)
- [Capacitor Plugins](https://capacitorjs.com/docs/plugins)
- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Vite + Capacitor](https://capacitorjs.com/docs/guides/vite)

---

## ✅ Checklist de Verificación

- [ ] Capacitor instalado y configurado
- [ ] `capacitor.config.ts` creado
- [ ] Plataforma Android agregada
- [ ] Plataforma iOS agregada (si aplica)
- [ ] Firebase CLI instalado
- [ ] Firebase proyecto inicializado
- [ ] `firebase.json` configurado
- [ ] Scripts de npm agregados
- [ ] `.gitignore` actualizado
- [ ] Build exitoso
- [ ] Deploy a Firebase exitoso
- [ ] App móvil corriendo en emulador/dispositivo
