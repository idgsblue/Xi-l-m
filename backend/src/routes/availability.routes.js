const router = require('express').Router();
const availabilityController = require('../controllers/availability.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { isHost, isAdmin } = require('../middleware/roleCheck.middleware');
const { body, param, query } = require('express-validator');
const handleValidationErrors = require('../middleware/validation.middleware');

// Validaciones
const monthYearValidation = [
  param('id').isInt().withMessage('ID de propiedad inválido'),
  param('year')
    .isInt({ min: 2020, max: 2100 })
    .withMessage('Año inválido'),
  param('month')
    .isInt({ min: 1, max: 12 })
    .withMessage('Mes inválido (1-12)')
];

const updateAvailabilityValidation = [
  param('id').isInt().withMessage('ID de propiedad inválido'),
  body('dates')
    .isArray({ min: 1 })
    .withMessage('Debe proporcionar un array de fechas'),
  body('dates.*')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Formato de fecha debe ser YYYY-MM-DD'),
  body('isAvailable')
    .isBoolean()
    .withMessage('isAvailable debe ser true o false')
];

const blockRangeValidation = [
  param('id').isInt().withMessage('ID de propiedad inválido'),
  body('startDate')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('startDate debe tener formato YYYY-MM-DD'),
  body('endDate')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('endDate debe tener formato YYYY-MM-DD')
];

const checkAvailabilityValidation = [
  param('id').isInt().withMessage('ID de propiedad inválido'),
  query('checkIn')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('checkIn debe tener formato YYYY-MM-DD'),
  query('checkOut')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('checkOut debe tener formato YYYY-MM-DD')
];

// ====================================
// RUTAS PÚBLICAS
// ====================================

// Obtener fechas no disponibles (público - para huéspedes al buscar)
router.get('/:id/unavailable-dates',
  param('id').isInt().withMessage('ID de propiedad inválido'),
  handleValidationErrors,
  availabilityController.getUnavailableDates
);

// Verificar disponibilidad para fechas específicas (público)
router.get('/:id/check-availability',
  checkAvailabilityValidation,
  handleValidationErrors,
  availabilityController.checkAvailability
);

// ====================================
// RUTAS PROTEGIDAS (HOST/ADMIN)
// ====================================

// Obtener calendario mensual completo (solo propietario o admin)
router.get('/:id/:year/:month',
  authenticate,
  monthYearValidation,
  handleValidationErrors,
  availabilityController.getMonthlyAvailability
);

// Actualizar disponibilidad de fechas específicas (solo propietario o admin)
router.post('/:id',
  authenticate,
  isHost,
  updateAvailabilityValidation,
  handleValidationErrors,
  availabilityController.updateAvailability
);

// Bloquear rango de fechas (atajo) (solo propietario o admin)
router.post('/:id/block-range',
  authenticate,
  isHost,
  blockRangeValidation,
  handleValidationErrors,
  availabilityController.blockDateRange
);

// Sincronizar con reservas (solo admin)
router.post('/:id/sync',
  authenticate,
  isAdmin,
  param('id').isInt().withMessage('ID de propiedad inválido'),
  handleValidationErrors,
  availabilityController.syncAvailability
);

module.exports = router;