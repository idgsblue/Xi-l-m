const router = require('express').Router();
const bookingController = require('../controllers/booking.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { isHost } = require('../middleware/roleCheck.middleware');
const { body, query } = require('express-validator');
const handleValidationErrors = require('../middleware/validation.middleware');

// Validaciones
const createBookingValidation = [
  body('propertyId')
    .notEmpty().withMessage('El ID de la propiedad es requerido')
    .isInt().withMessage('ID de propiedad inválido'),
  body('checkIn')
    .notEmpty().withMessage('La fecha de check-in es requerida')
    .isISO8601().toDate().withMessage('Fecha de check-in inválida'),
  body('checkOut')
    .notEmpty().withMessage('La fecha de check-out es requerida')
    .isISO8601().toDate().withMessage('Fecha de check-out inválida'),
  body('numberOfGuests')
    .notEmpty().withMessage('El número de huéspedes es requerido')
    .isInt({ min: 1 }).withMessage('El número de huéspedes debe ser al menos 1'),
  body('specialRequests')
    .optional()
    .isString().withMessage('Las solicitudes especiales deben ser texto'),
  body('paymentMethodId')
    .optional()
    .isString().withMessage('ID de método de pago inválido')
];

const confirmBookingValidation = [
  body('bookingId')
    .notEmpty().withMessage('El ID de la reserva es requerido')
    .isInt().withMessage('ID de reserva inválido'),
  body('paymentIntentId')
    .notEmpty().withMessage('El ID del pago es requerido')
    .isString().withMessage('ID de pago inválido')
];

const checkAvailabilityValidation = [
  query('propertyId')
    .notEmpty().withMessage('El ID de la propiedad es requerido')
    .isInt().withMessage('ID de propiedad inválido'),
  query('checkIn')
    .notEmpty().withMessage('La fecha de check-in es requerida')
    .isISO8601().toDate().withMessage('Fecha de check-in inválida'),
  query('checkOut')
    .notEmpty().withMessage('La fecha de check-out es requerida')
    .isISO8601().toDate().withMessage('Fecha de check-out inválida')
];

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas para huéspedes
router.post('/', 
  createBookingValidation, 
  handleValidationErrors, 
  bookingController.create
);

router.post('/confirm', 
  confirmBookingValidation, 
  handleValidationErrors, 
  bookingController.confirmBooking
);

router.get('/my-bookings', bookingController.getMyBookings);

router.get('/check-availability', 
  checkAvailabilityValidation, 
  handleValidationErrors, 
  bookingController.checkAvailability
);

router.get('/:id', bookingController.getById);

router.post('/:id/cancel', 
  body('reason').optional().isString(),
  handleValidationErrors,
  bookingController.cancel
);

// Rutas para anfitriones
router.get('/host/bookings', isHost, bookingController.getHostBookings);

module.exports = router;