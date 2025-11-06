# Información de Deployment - Arroyo Seco Backend

## URL del Servicio
**Production URL**: `https://arroyo-seco-backend-109610137190.us-central1.run.app`

## Configuración de Cloud Run
- **Proyecto**: prueba-2476e
- **Región**: us-central1
- **Nombre del servicio**: arroyo-seco-backend
- **Memoria**: 512Mi
- **CPU**: 1
- **Puerto**: 5000
- **Acceso**: Público (allow-unauthenticated)

## Variables de Entorno Configuradas

### Base de Datos
- `DB_HOST`: 164.90.144.13
- `DB_PORT`: 5432
- `DB_NAME`: db_arroyoseco_app
- `DB_USER`: mariana_dev
- `DB_PASSWORD`: ********
- `NODE_ENV`: production

### JWT (Autenticación)
- `JWT_SECRET`: arroyo_seco_jwt_secret_2025
- `REFRESH_SECRET`: arroyo_seco_refresh_secret_2025

### Stripe (Pagos)
- `STRIPE_SECRET_KEY`: sk_test_51QKrZqP3tmWh6pjf... (configurada)
- `STRIPE_PUBLIC_KEY`: pk_test_51QKrZqP3tmWh6pjf... (configurada)

### Email (Notificaciones)
- `EMAIL_HOST`: smtp.gmail.com
- `EMAIL_PORT`: 587
- `EMAIL_USER`: tu_email@gmail.com
- `EMAIL_PASS`: ******** (actualizar con credenciales reales)

### Firebase
- `FIREBASE_PROJECT_ID`: booking-app-12462
- `FIREBASE_STORAGE_BUCKET`: booking-app-12462.firebasestorage.app
- `FIREBASE_CLIENT_EMAIL`: firebase-adminsdk-fbsvc@booking-app-12462.iam.gserviceaccount.com
- `FIREBASE_CLIENT_ID`: 115610098810277947875
- `FIREBASE_PRIVATE_KEY_ID`: 80875d09554126ff4ca7a6cf3e3d14c7c7e44d6e
- `FIREBASE_PRIVATE_KEY`: Configurada (multilinea)
- `FIREBASE_CLIENT_CERT_URL`: https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40booking-app-12462.iam.gserviceaccount.com

## Estado del Servicio
✅ Servidor iniciado correctamente
✅ Conexión a base de datos establecida
✅ Firebase Storage inicializado correctamente
✅ Backend respondiendo a peticiones

## Comandos Útiles

### Ver logs en tiempo real
```bash
gcloud logging tail "resource.type=cloud_run_revision AND resource.labels.service_name=arroyo-seco-backend" --project=prueba-2476e
```

### Actualizar el servicio (después de cambios)
```bash
cd backend
gcloud builds submit --tag gcr.io/prueba-2476e/arroyo-seco-backend
gcloud run deploy arroyo-seco-backend --image gcr.io/prueba-2476e/arroyo-seco-backend --region us-central1
```

### Ver información del servicio
```bash
gcloud run services describe arroyo-seco-backend --region us-central1
```

### Actualizar variables de entorno
```bash
gcloud run services update arroyo-seco-backend --region us-central1 --update-env-vars="VARIABLE_NAME=value"
```

### Eliminar el servicio (si es necesario)
```bash
gcloud run services delete arroyo-seco-backend --region us-central1
```

## Próximos Pasos

1. **Actualizar Frontend**: Cambiar la URL del backend en tu aplicación frontend a:
   ```
   https://arroyo-seco-backend-109610137190.us-central1.run.app
   ```

2. **Configurar CORS**: Si tienes problemas de CORS, verifica que tu frontend esté en la lista permitida en el backend

3. **Configurar Dominio Personalizado** (opcional):
   - Ve a: https://console.cloud.google.com/run/domains
   - Mapea un dominio personalizado al servicio

4. **Configurar JWT y Stripe** (si aún no están configurados):
   ```bash
   gcloud run services update arroyo-seco-backend --region us-central1 \
     --update-env-vars="JWT_SECRET=tu-secret,REFRESH_SECRET=tu-refresh-secret,STRIPE_SECRET_KEY=tu-stripe-key,EMAIL_USER=tu-email,EMAIL_PASS=tu-password"
   ```

## Monitoreo

### Cloud Console
- **Dashboard**: https://console.cloud.google.com/run/detail/us-central1/arroyo-seco-backend/metrics?project=prueba-2476e
- **Logs**: https://console.cloud.google.com/logs/query?project=prueba-2476e&query=resource.type%3D%22cloud_run_revision%22%0Aresource.labels.service_name%3D%22arroyo-seco-backend%22

## Notas de Seguridad

- Las credenciales están almacenadas como variables de entorno en Cloud Run
- La base de datos está en un servidor externo (164.90.144.13)
- El servicio es público, asegúrate de tener autenticación adecuada en tus endpoints
- Considera usar Cloud SQL para mayor seguridad y mejor integración

## Costos Estimados

Cloud Run cobra por:
- Tiempo de CPU utilizado
- Memoria utilizada
- Número de solicitudes
- Tráfico de red

**Free tier**: 2 millones de solicitudes por mes gratis

Para ver costos actuales: https://console.cloud.google.com/billing

## Backup y Recuperación

Para hacer rollback a una versión anterior:
```bash
gcloud run services update-traffic arroyo-seco-backend --region us-central1 --to-revisions=arroyo-seco-backend-00008-vsd=100
```

## Contacto y Soporte

- Documentación Cloud Run: https://cloud.google.com/run/docs
- Estado de Google Cloud: https://status.cloud.google.com/
