# Guía de Integración Frontend - Backend

## Estado Actual

### Backend Desplegado ✅
- **URL**: `https://arroyo-seco-backend-109610137190.us-central1.run.app`
- **Health Check**: `https://arroyo-seco-backend-109610137190.us-central1.run.app/api/health`
- **Estado**: Funcionando correctamente
- **Base de datos**: Conectada
- **Firebase**: Inicializado

### CORS Configurado ✅
El backend acepta requests desde:
- `http://localhost:3000` (desarrollo)
- `https://localhost:3000` (desarrollo SSL)
- Cualquier URL configurada en `FRONTEND_URL`
- Aplicaciones móviles (sin origin)

## Endpoints Disponibles

### Autenticación (`/api/auth`)
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh` - Refrescar token
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/forgot-password` - Recuperar contraseña
- `POST /api/auth/reset-password` - Resetear contraseña
- `GET /api/auth/me` - Obtener usuario actual

### Propiedades (`/api/properties`)
- `GET /api/properties` - Listar propiedades
- `GET /api/properties/:id` - Obtener propiedad por ID
- `POST /api/properties` - Crear propiedad (admin)
- `PUT /api/properties/:id` - Actualizar propiedad (admin)
- `DELETE /api/properties/:id` - Eliminar propiedad (admin)

### Reservas (`/api/bookings`)
- `GET /api/bookings` - Listar reservas del usuario
- `GET /api/bookings/:id` - Obtener reserva por ID
- `POST /api/bookings` - Crear nueva reserva
- `PUT /api/bookings/:id` - Actualizar reserva
- `DELETE /api/bookings/:id` - Cancelar reserva

### Pagos (`/api/payments`)
- `POST /api/payments/create-intent` - Crear intención de pago
- `POST /api/payments/confirm` - Confirmar pago
- `GET /api/payments/:id` - Obtener detalles de pago

### Admin (`/api/admin`)
- `GET /api/admin/bookings` - Listar todas las reservas
- `GET /api/admin/users` - Listar usuarios
- `PUT /api/admin/bookings/:id/status` - Actualizar estado de reserva
- `GET /api/admin/stats` - Obtener estadísticas

### Upload (`/api/upload`)
- `POST /api/upload/image` - Subir imagen a Firebase Storage

### Tipos de Alojamiento (`/api/accommodation-types`)
- `GET /api/accommodation-types` - Listar tipos de alojamiento
- `POST /api/accommodation-types` - Crear tipo (admin)
- `PUT /api/accommodation-types/:id` - Actualizar tipo (admin)
- `DELETE /api/accommodation-types/:id` - Eliminar tipo (admin)

### Disponibilidad (`/api/availability`)
- `GET /api/availability/:propertyId` - Verificar disponibilidad

## Configuración del Frontend

### 1. Variables de Entorno

Tu archivo `.env` ya está configurado correctamente:

```env
REACT_APP_API_URL=https://arroyo-seco-backend-109610137190.us-central1.run.app/api
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_51QKrZqP3tmWh6pjfYl64AJ6lRqWZQqNNpOuMEh3aVDp0gy7QxH9yRUJRExEgTxpg3E7O9HQ0t1cN0oJ0lXjXOwDD00yCr61LxW
GENERATE_SOURCEMAP=false
```

### 2. Ejemplo de Uso en el Frontend

#### Configurar Axios (si usas Axios)

```javascript
// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado, intentar refrescar
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/auth/refresh`,
          { refreshToken }
        );
        localStorage.setItem('token', response.data.token);
        // Reintentar request original
        error.config.headers.Authorization = `Bearer ${response.data.token}`;
        return api.request(error.config);
      } catch (refreshError) {
        // Si falla el refresh, redirigir a login
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

#### Ejemplo de Llamadas API

```javascript
// Login
import api from './services/api';

// Login
const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    return response.data;
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    throw error;
  }
};

// Obtener propiedades
const getProperties = async () => {
  try {
    const response = await api.get('/properties');
    return response.data;
  } catch (error) {
    console.error('Error al obtener propiedades:', error);
    throw error;
  }
};

// Crear reserva
const createBooking = async (bookingData) => {
  try {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  } catch (error) {
    console.error('Error al crear reserva:', error);
    throw error;
  }
};

// Subir imagen
const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.url;
  } catch (error) {
    console.error('Error al subir imagen:', error);
    throw error;
  }
};
```

### 3. Configurar Fetch (si usas fetch nativo)

```javascript
// src/utils/fetchWithAuth.js
const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    credentials: 'include',
  };

  const response = await fetch(
    `${process.env.REACT_APP_API_URL}${url}`,
    config
  );

  if (response.status === 401) {
    // Manejar token expirado
    localStorage.clear();
    window.location.href = '/login';
  }

  return response;
};

export default fetchWithAuth;
```

## Testing de la Integración

### 1. Probar Health Check

```bash
curl https://arroyo-seco-backend-109610137190.us-central1.run.app/api/health
```

Respuesta esperada:
```json
{
  "status": "OK",
  "message": "Servidor de Arroyo Seco funcionando correctamente",
  "timestamp": "2025-11-05T01:55:00.000Z"
}
```

### 2. Probar desde el Frontend

Abre la consola del navegador y ejecuta:

```javascript
// Test simple
fetch('https://arroyo-seco-backend-109610137190.us-central1.run.app/api/health')
  .then(res => res.json())
  .then(data => console.log('Backend response:', data))
  .catch(err => console.error('Error:', err));

// Test con autenticación
fetch('https://arroyo-seco-backend-109610137190.us-central1.run.app/api/properties', {
  credentials: 'include',
})
  .then(res => res.json())
  .then(data => console.log('Properties:', data))
  .catch(err => console.error('Error:', err));
```

## Configuración de Producción

### Si tu frontend está en un dominio personalizado

1. **Agregar el dominio a la lista de orígenes permitidos en Cloud Run:**

```bash
gcloud run services update arroyo-seco-backend \
  --region us-central1 \
  --update-env-vars="FRONTEND_URL=https://tu-dominio.com"
```

2. **O editar el código del backend** para agregar más orígenes permitidos:

En `backend/src/app.js`, línea 21-26, agrega tu dominio:

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://localhost:3000',
  'https://tu-dominio.com',
  'https://www.tu-dominio.com',
  process.env.FRONTEND_URL,
].filter(Boolean);
```

### Para Aplicaciones Móviles (Capacitor/React Native)

Las aplicaciones móviles no tienen un "origin" HTTP, por lo que el backend ya está configurado para aceptarlas automáticamente.

En tu aplicación móvil, simplemente usa:

```javascript
// capacitor.config.json
{
  "server": {
    "url": "https://arroyo-seco-backend-109610137190.us-central1.run.app"
  }
}
```

## Troubleshooting

### Error de CORS

Si ves un error como:
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Solución:**
1. Verifica que tu dominio esté en la lista de orígenes permitidos
2. Agrega el dominio con el comando:
   ```bash
   gcloud run services update arroyo-seco-backend \
     --region us-central1 \
     --update-env-vars="FRONTEND_URL=tu-dominio"
   ```
3. Reconstruye y despliega el backend si es necesario

### Error 401 (No autorizado)

**Solución:**
1. Verifica que estés enviando el token JWT en el header:
   ```javascript
   headers: {
     'Authorization': `Bearer ${token}`
   }
   ```
2. Verifica que el token no haya expirado
3. Implementa lógica de refresh token

### Error de conexión

**Solución:**
1. Verifica que la URL sea correcta
2. Comprueba que el backend esté funcionando: https://arroyo-seco-backend-109610137190.us-central1.run.app/api/health
3. Revisa los logs del backend:
   ```bash
   gcloud logging tail "resource.type=cloud_run_revision AND resource.labels.service_name=arroyo-seco-backend" --project=prueba-2476e
   ```

## Próximos Pasos

1. ✅ Backend desplegado y funcionando
2. ✅ CORS configurado
3. ⏳ Probar conexión desde el frontend
4. ⏳ Implementar manejo de autenticación
5. ⏳ Configurar Stripe para pagos
6. ⏳ Desplegar frontend

## Recursos Adicionales

- [Documentación de Cloud Run](https://cloud.google.com/run/docs)
- [Backend URL](https://arroyo-seco-backend-109610137190.us-central1.run.app)
- [Health Check](https://arroyo-seco-backend-109610137190.us-central1.run.app/api/health)
- [Logs del Backend](https://console.cloud.google.com/logs/query?project=prueba-2476e&query=resource.type%3D%22cloud_run_revision%22%0Aresource.labels.service_name%3D%22arroyo-seco-backend%22)
