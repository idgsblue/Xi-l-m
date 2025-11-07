@echo off
REM Script para desplegar el backend a Google Cloud Run
REM Asegúrate de haber configurado .env.production con tus valores

echo ========================================
echo Desplegando Arroyo Seco Backend a Cloud Run
echo ========================================
echo.

REM Configuración
set PROJECT_ID=prueba-2476e
set SERVICE_NAME=arroyo-seco-backend
set REGION=us-central1
set IMAGE=gcr.io/%PROJECT_ID%/%SERVICE_NAME%

echo Paso 1: Construyendo y subiendo imagen Docker...
gcloud builds submit --tag %IMAGE%

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Fallo al construir la imagen
    exit /b 1
)

echo.
echo Paso 2: Desplegando a Cloud Run...
echo.
echo IMPORTANTE: Necesitas configurar las variables de entorno.
echo Por favor, ejecuta el siguiente comando manualmente reemplazando los valores:
echo.
echo gcloud run deploy %SERVICE_NAME% \
echo   --image %IMAGE% \
echo   --platform managed \
echo   --region %REGION% \
echo   --allow-unauthenticated \
echo   --port 5000 \
echo   --memory 512Mi \
echo   --cpu 1 \
echo   --set-env-vars="DB_HOST=TU_HOST,DB_PORT=5432,DB_NAME=arroyo_seco,DB_USER=TU_USUARIO,DB_PASSWORD=TU_PASSWORD,JWT_SECRET=TU_JWT_SECRET,REFRESH_SECRET=TU_REFRESH_SECRET,PORT=5000,NODE_ENV=production,FIREBASE_STORAGE_BUCKET=TU_BUCKET"
echo.
echo O usa el comando interactivo que se muestra a continuación.
pause
