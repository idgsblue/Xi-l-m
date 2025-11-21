const rateLimit = require('express-rate-limit');

// Rate limiter general para todas las rutas
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 requests por ventana
  message: {
    error: 'Demasiadas solicitudes desde esta IP, por favor intenta de nuevo más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Saltar rate limiting en desarrollo si es necesario
  skip: (req) => process.env.NODE_ENV === 'development' && process.env.SKIP_RATE_LIMIT === 'true'
});

// Rate limiter estricto para autenticación (prevenir fuerza bruta)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Solo 5 intentos de login por ventana
  message: {
    error: 'Demasiados intentos de inicio de sesión, por favor intenta de nuevo en 15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // No contar requests exitosos
});

// Rate limiter para registro de usuarios
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // Solo 3 registros por IP por hora
  message: {
    error: 'Demasiados registros desde esta IP, por favor intenta de nuevo más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter para recuperación de contraseña
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // Solo 3 intentos de recuperación por hora
  message: {
    error: 'Demasiadas solicitudes de recuperación de contraseña, por favor intenta de nuevo más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter para creación de recursos (propiedades, bookings)
const createResourceLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 creaciones por hora
  message: {
    error: 'Has alcanzado el límite de creación de recursos, por favor intenta de nuevo más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter para subida de archivos
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // 20 uploads por 15 minutos
  message: {
    error: 'Demasiadas subidas de archivos, por favor intenta de nuevo más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  generalLimiter,
  authLimiter,
  registerLimiter,
  passwordResetLimiter,
  createResourceLimiter,
  uploadLimiter
};
