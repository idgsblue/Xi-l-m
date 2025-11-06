// Configuración de Stripe
const STRIPE_PUBLIC_KEY = process.env.REACT_APP_STRIPE_PUBLIC_KEY;

if (!STRIPE_PUBLIC_KEY) {
  console.error('❌ REACT_APP_STRIPE_PUBLIC_KEY no está definida');
  console.error('Variables de entorno disponibles:', Object.keys(process.env).filter(key => key.startsWith('REACT_APP')));
} else {
  console.log('✅ Stripe Public Key cargada:', STRIPE_PUBLIC_KEY.substring(0, 20) + '...');
}

export default STRIPE_PUBLIC_KEY;
