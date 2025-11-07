const admin = require('firebase-admin');
const path = require('path');

// Cargar variables de entorno desde la raíz del proyecto backend
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

let bucket = null;
let firebaseInitialized = false;

try {
  console.log('🔍 Inicializando Firebase Admin SDK...');

  // Validar que las variables de entorno necesarias existan
  const requiredEnvVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`❌ Variables de entorno faltantes: ${missingVars.join(', ')}`);
  }

  // Construir objeto de credenciales desde variables de entorno
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Convertir \n literales a saltos de línea reales
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
  };

  console.log('📦 Project ID:', serviceAccount.project_id);
  console.log('📧 Client Email:', serviceAccount.client_email);

  // Obtener bucket de .env o construirlo desde project_id
  let storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
  
  if (!storageBucket) {
    // Intentar con el nuevo formato .firebasestorage.app
    storageBucket = `${serviceAccount.project_id}.firebasestorage.app`;
    console.log('⚠️  FIREBASE_STORAGE_BUCKET no encontrado en .env');
    console.log('   Usando valor por defecto:', storageBucket);
  }
  
  console.log('🪣 Storage Bucket:', storageBucket);

  // Inicializar Firebase Admin
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: storageBucket
  });

  bucket = admin.storage().bucket();
  firebaseInitialized = true;

  console.log('✅ Firebase Storage inicializado correctamente');
  console.log('✅ Bucket name:', bucket.name);

} catch (error) {
  console.error('❌ Error al inicializar Firebase:');
  console.error('   Mensaje:', error.message);
  
  // No mostrar stack trace completo en producción (puede exponer info sensible)
  if (process.env.NODE_ENV !== 'production') {
    console.error('   Stack:', error.stack);
  }
}

// Función helper para verificar si Firebase está listo
function isFirebaseReady() {
  return firebaseInitialized && bucket !== null;
}

module.exports = { 
  admin, 
  bucket,
  isFirebaseReady
};