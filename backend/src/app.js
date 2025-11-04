const express = require('express');
const cors = require('cors');
const path = require('path');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const propertyRoutes = require('./routes/property.routes');
const bookingRoutes = require('./routes/booking.routes');
const paymentRoutes = require('./routes/payment.routes');
const adminRoutes = require('./routes/admin.routes');
const uploadRoutes = require('./routes/upload.routes');
const accommodationTypeRoutes = require('./routes/accommodationType.routes');
const availabilityRoutes = require('./routes/availability.routes'); // ← NUEVA LÍNEA

// Importar middleware
const errorHandler = require('./middleware/errorHandler.middleware');

const app = express();

// Configuración CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://164.90.144.13:3000',
  credentials: true
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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