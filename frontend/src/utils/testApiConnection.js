// Función para probar la conexión a la API
export const testApiConnection = async () => {
  const API_URL = process.env.REACT_APP_API_URL;

  console.log('🔍 Probando conexión a API...');
  console.log('📍 URL configurada:', API_URL);

  try {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/health`);
    const data = await response.json();

    console.log('✅ Conexión exitosa:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    return { success: false, error: error.message };
  }
};

// Para usar en la consola del navegador:
// import { testApiConnection } from './utils/testApiConnection';
// testApiConnection();
