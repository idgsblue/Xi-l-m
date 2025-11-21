const helmet = require('helmet');

/**
 * Configuración de seguridad HTTP con Helmet
 * Implementa headers de seguridad recomendados para proteger contra vulnerabilidades comunes
 */

// Configuración de Content Security Policy (CSP)
const contentSecurityPolicy = {
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"], // Necesario para algunos frameworks
    scriptSrc: ["'self'"],
    imgSrc: [
      "'self'",
      'data:',
      'https://firebasestorage.googleapis.com', // Firebase Storage
      'https://*.googleapis.com'
    ],
    connectSrc: [
      "'self'",
      'https://firebasestorage.googleapis.com',
      'https://*.stripe.com', // Stripe API
      'https://api.stripe.com'
    ],
    fontSrc: ["'self'", 'data:'],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"], // Prevenir clickjacking
    upgradeInsecureRequests: [] // Forzar HTTPS (solo en producción)
  }
};

// Configuración completa de Helmet
const helmetConfig = {
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? contentSecurityPolicy : false,

  // HSTS - Forzar HTTPS (solo en producción)
  hsts: {
    maxAge: 31536000, // 1 año
    includeSubDomains: true,
    preload: true
  },

  // Prevenir MIME type sniffing
  noSniff: true,

  // Prevenir clickjacking
  frameguard: {
    action: 'deny'
  },

  // Eliminar header X-Powered-By
  hidePoweredBy: true,

  // Prevenir que el navegador infiera el tipo MIME
  xssFilter: true,

  // Referrer Policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  },

  // Permissions Policy (anteriormente Feature Policy)
  permittedCrossDomainPolicies: {
    permittedPolicies: 'none'
  }
};

// Configuración de CORS segura
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://localhost',
      'capacitor://localhost',
      'http://10.0.2.2:5000',
      'https://xilmq.com',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    // Permitir requests sin origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS bloqueado para origen: ${origin}`);
      callback(new Error('No permitido por política CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 600 // 10 minutos de cache para preflight requests
};

// Configuración de seguridad adicional
const securityHeaders = (req, res, next) => {
  // Prevenir que el sitio sea embebido en iframes (adicional a frameguard)
  res.setHeader('X-Frame-Options', 'DENY');

  // Deshabilitar DNS prefetching para prevenir fugas de información
  res.setHeader('X-DNS-Prefetch-Control', 'off');

  // Prevenir que el navegador adivine el tipo MIME
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevenir XSS en navegadores antiguos
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Permissions Policy: Deshabilitar features peligrosas
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=()'
  );

  next();
};

// Validación de variables de entorno críticas
const validateSecurityEnv = () => {
  const requiredEnvVars = [
    'JWT_SECRET',
    'REFRESH_SECRET',
    'DB_PASSWORD'
  ];

  const missing = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    console.error('⚠️  ADVERTENCIA DE SEGURIDAD: Faltan variables de entorno críticas:');
    console.error(`   ${missing.join(', ')}`);
  }

  // Validar que JWT_SECRET sea suficientemente fuerte
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  ADVERTENCIA: JWT_SECRET debería tener al menos 32 caracteres para mayor seguridad');
  }

  // Validar que REFRESH_SECRET sea diferente de JWT_SECRET
  if (process.env.JWT_SECRET === process.env.REFRESH_SECRET) {
    console.warn('⚠️  ADVERTENCIA: REFRESH_SECRET debería ser diferente de JWT_SECRET');
  }

  // En producción, asegurar que NODE_ENV esté configurado
  if (!process.env.NODE_ENV || process.env.NODE_ENV !== 'production') {
    if (process.env.NODE_ENV === 'production') {
      console.log('✅ Modo de producción activado con configuraciones de seguridad reforzadas');
    } else {
      console.log('ℹ️  Modo de desarrollo - Algunas protecciones están relajadas');
    }
  }
};

module.exports = {
  helmetConfig,
  corsOptions,
  securityHeaders,
  validateSecurityEnv
};
