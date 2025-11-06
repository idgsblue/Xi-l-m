# Solución al Error 404 - Frontend no conecta con Backend

## Problema Identificado

El frontend estaba intentando conectarse a:
- ❌ `http://localhost:5000/api` (servidor local)
- ❌ `http://164.90.144.13:5000/api` (IP antigua)

En lugar de:
- ✅ `https://arroyo-seco-backend-109610137190.us-central1.run.app/api` (Cloud Run)

## Solución Aplicada

### 1. Actualizado el archivo de configuración de API

**Archivo**: `frontend/src/services/api.js`

**Antes** (línea 4):
```javascript
const API_URL = 'http://localhost:5000/api';
```

**Después** (línea 4):
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

### 2. Variable de entorno ya configurada

**Archivo**: `frontend/.env`
```env
REACT_APP_API_URL=https://arroyo-seco-backend-109610137190.us-central1.run.app/api
```

## Pasos para Aplicar los Cambios

### Opción 1: Reiniciar el servidor de desarrollo (Recomendado)

1. **Detén el servidor** que está corriendo (Ctrl + C en la terminal)

2. **Reinicia el servidor**:
   ```bash
   cd frontend
   npm start
   ```

3. **Refresca el navegador** (F5 o Ctrl + Shift + R para hard refresh)

### Opción 2: Limpiar cache y reconstruir

Si el problema persiste:

```bash
cd frontend

# Detener el servidor (Ctrl + C)

# Limpiar cache y node_modules
rm -rf node_modules/.cache

# Reiniciar
npm start
```

### Opción 3: Build de producción

Para crear un build de producción:

```bash
cd frontend
npm run build
```

Esto creará una carpeta `build/` con los archivos optimizados.

## Verificación

### 1. Verificar que las variables de entorno se carguen correctamente

Agrega esto temporalmente en cualquier componente para verificar:

```javascript
console.log('API_URL:', process.env.REACT_APP_API_URL);
```

Deberías ver en la consola:
```
API_URL: https://arroyo-seco-backend-109610137190.us-central1.run.app/api
```

### 2. Probar la conexión directamente

Abre la consola del navegador (F12) y ejecuta:

```javascript
fetch('https://arroyo-seco-backend-109610137190.us-central1.run.app/api/health')
  .then(res => res.json())
  .then(data => console.log('✅ Backend conectado:', data))
  .catch(err => console.error('❌ Error:', err));
```

Deberías ver:
```json
{
  "status": "OK",
  "message": "Servidor de Arroyo Seco funcionando correctamente",
  "timestamp": "2025-11-05T..."
}
```

### 3. Verificar en Network Tab

1. Abre DevTools (F12)
2. Ve a la pestaña **Network**
3. Refresca la página
4. Verifica que las peticiones vayan a:
   - ✅ `https://arroyo-seco-backend-109610137190.us-central1.run.app/api/...`
   - ❌ NO a `localhost:5000` o `164.90.144.13`

## Errores Comunes y Soluciones

### Error: "CORS blocked"

Si ves un error de CORS después de conectarte al backend correcto:

```bash
# Agregar tu dominio frontend a las variables de entorno del backend
gcloud run services update arroyo-seco-backend \
  --region us-central1 \
  --update-env-vars="FRONTEND_URL=http://localhost:3000"
```

### Error: "401 Unauthorized"

Verifica que estés enviando el token correctamente:

1. Revisa que el token esté en localStorage:
   ```javascript
   console.log('Token:', localStorage.getItem('accessToken'));
   ```

2. Verifica que el interceptor de Axios esté agregando el header:
   ```javascript
   // En api.js, el interceptor ya está configurado
   config.headers.Authorization = `Bearer ${token}`;
   ```

### Error: Las variables de entorno no se cargan

React solo carga variables de entorno que empiecen con `REACT_APP_`:

✅ Correcto: `REACT_APP_API_URL`
❌ Incorrecto: `API_URL`

Además, necesitas **reiniciar el servidor** después de cambiar el archivo `.env`.

## Verificación Final

Después de reiniciar el servidor, verifica:

1. ✅ El frontend inicia sin errores
2. ✅ La consola muestra la URL correcta de la API
3. ✅ Las peticiones en Network Tab van a Cloud Run
4. ✅ Las peticiones reciben respuesta 200 OK (o códigos esperados)
5. ✅ Los datos se cargan correctamente en la interfaz

## Para Desarrollo vs Producción

### Desarrollo (local)
```env
# frontend/.env
REACT_APP_API_URL=https://arroyo-seco-backend-109610137190.us-central1.run.app/api
```

### Producción
```env
# frontend/.env.production
REACT_APP_API_URL=https://arroyo-seco-backend-109610137190.us-central1.run.app/api
```

Ambos apuntan a Cloud Run porque el backend ya está en producción.

## Notas Importantes

1. **Siempre reinicia el servidor** después de cambiar archivos `.env`
2. **Usa hard refresh** (Ctrl + Shift + R) para limpiar cache del navegador
3. **Verifica la consola** para ver qué URL está usando realmente
4. **Revisa Network Tab** para confirmar las peticiones
5. **El backend ya está configurado** para aceptar peticiones desde localhost

## Contacto de Soporte

Si el problema persiste después de seguir estos pasos:

1. Verifica los logs del backend:
   ```bash
   gcloud logging tail "resource.type=cloud_run_revision AND resource.labels.service_name=arroyo-seco-backend" --project=prueba-2476e
   ```

2. Verifica que el backend esté funcionando:
   ```bash
   curl https://arroyo-seco-backend-109610137190.us-central1.run.app/api/health
   ```

3. Revisa la consola del navegador para ver el error exacto

## Estado Actual

✅ Backend desplegado en Cloud Run
✅ CORS configurado
✅ Variables de entorno configuradas
✅ Archivo api.js actualizado para usar variables de entorno
⏳ Esperando reinicio del servidor de desarrollo

**Próximo paso**: Reinicia tu servidor de desarrollo con `npm start`
