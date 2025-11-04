const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Cargar variables de entorno desde la raíz del proyecto backend
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

let bucket = null;
let firebaseInitialized = false;

try {
  // Ruta al service account
  const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
  
  console.log('🔍 Buscando archivo de credenciales en:', serviceAccountPath);

  // Verificar que el archivo existe
  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(`❌ Archivo no encontrado: ${serviceAccountPath}`);
  }

  console.log('✅ Archivo de credenciales encontrado');

  // Leer el archivo
  const serviceAccount = require(serviceAccountPath);
  
  // Validar que tenga los campos necesarios
  if (!serviceAccount.project_id) {
    throw new Error('❌ El archivo JSON no tiene project_id');
  }

  console.log('📦 Project ID:', serviceAccount.project_id);

  // Obtener bucket de .env
  let storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
  
  // Si no está en .env, construirlo desde project_id
  // Intentar primero con .firebasestorage.app (nuevo formato)
  // Si falla, usar .appspot.com (formato antiguo)
  if (!storageBucket) {
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
  console.error('❌ ERROR AL INICIALIZAR FIREBASE STORAGE:');
  console.error('   Mensaje:', error.message);
  console.error('   Stack:', error.stack);
  console.error('\n⚠️  SOLUCIÓN:');
  console.error('   1. Verifica que el archivo firebase-service-account.json existe en src/config/');
  console.error('   2. Verifica que FIREBASE_STORAGE_BUCKET está en backend/.env');
  console.error('   3. Asegúrate que la URL termina en .firebasestorage.app (nuevo formato)');
  console.error('   4. Descarga de nuevo el Service Account desde Firebase Console\n');
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