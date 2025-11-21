const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const hpp = require('hpp');

// Importar configuración de seguridad
const { helmetConfig, corsOptions, securityHeaders, validateSecurityEnv } = require('./config/security.config');

// Importar middleware de seguridad
const { sanitizeRequest, validateNoSQLInjection } = require('./middleware/sanitization.middleware');
const { generalLimiter } = require('./middleware/rateLimiter.middleware');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const propertyRoutes = require('./routes/property.routes');
const bookingRoutes = require('./routes/booking.routes');
const paymentRoutes = require('./routes/payment.routes');
const adminRoutes = require('./routes/admin.routes');
const uploadRoutes = require('./routes/upload.routes');
const accommodationTypeRoutes = require('./routes/accommodationType.routes');
const availabilityRoutes = require('./routes/availability.routes');
const serviceRoutes = require('./routes/service.routes');

// Importar middleware
const errorHandler = require('./middleware/errorHandler.middleware');

const app = express();

// ============================================
// VALIDACIÓN DE SEGURIDAD AL INICIO
// ============================================
validateSecurityEnv();

// ============================================
// MIDDLEWARE DE SEGURIDAD (ORDEN IMPORTANTE)
// ============================================

// 1. Helmet - Headers de seguridad HTTP
app.use(helmet(helmetConfig));

// 2. Headers de seguridad adicionales
app.use(securityHeaders);

// 3. CORS con configuración segura
app.use(cors(corsOptions));

// 4. Parseo de JSON con límite de tamaño (prevenir DoS)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Protección contra HTTP Parameter Pollution
app.use(hpp());

// 6. Rate limiting general (aplicar a todas las rutas)
app.use(generalLimiter);

// 7. Sanitización de inputs (XSS, NoSQL injection)
app.use(sanitizeRequest);
app.use(validateNoSQLInjection);

// Servir archivos estáticos (imágenes locales antiguas)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/accommodation-types', accommodationTypeRoutes);
app.use('/api/availability', availabilityRoutes); // ← NUEVA LÍNEA
app.use('/api/services', serviceRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor de Arroyo Seco funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

module.exports = app;