const router = require('express').Router();
const propertyController = require('../controllers/property.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { isHost } = require('../middleware/roleCheck.middleware');
const { body, query } = require('express-validator');
const handleValidationErrors = require('../middleware/validation.middleware');

// Validaciones
const propertyValidation = [
  body('name')
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 3, max: 200 }).withMessage('El nombre debe tener entre 3 y 200 caracteres'),
  body('description')
    .notEmpty().withMessage('La descripción es requerida')
    .isLength({ min: 10, max: 1000 }).withMessage('La descripción debe tener entre 10 y 1000 caracteres'),
  body('shortDescription')
    .optional()
    .isLength({ max: 300 }).withMessage('La descripción corta no puede exceder 300 caracteres'),
  body('address')
    .notEmpty().withMessage('La dirección es requerida'),
  body('zone')
    .notEmpty().withMessage('La zona es requerida'),
  body('pricePerNight')
    .isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
  body('maxGuests')
    .optional()
    .isInt({ min: 1, max: 20 }).withMessage('El número de huéspedes debe estar entre 1 y 20'),
  body('bedrooms')
    .optional()
    .isInt({ min: 0 }).withMessage('El número de habitaciones debe ser positivo'),
  body('bathrooms')
    .optional()
    .isInt({ min: 0 }).withMessage('El número de baños debe ser positivo')
];

const searchValidation = [
  query('zone').optional().isString(),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('guests').optional().isInt({ min: 1 }),
  query('checkIn').optional().isISO8601().toDate(),
  query('checkOut').optional().isISO8601().toDate(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
];

// Rutas públicas (no requieren autenticación)
router.get('/', searchValidation, handleValidationErrors, propertyController.getAll);
router.get('/:id', propertyController.getById);

// Rutas protegidas
router.use(authenticate);

// Rutas para anfitriones
router.post('/', 
  isHost, 
  propertyController.uploadImages,
  propertyValidation, 
  handleValidationErrors, 
  propertyController.create
);

router.get('/host/my-properties', isHost, propertyController.getMyProperties);

router.put('/:id', 
  isHost,
  propertyController.uploadImages,
  propertyValidation, 
  handleValidationErrors, 
  propertyController.update
);

router.delete('/:id', isHost, propertyController.delete);

router.patch('/:id/availability', 
  isHost,
  body('isAvailable').isBoolean().withMessage('isAvailable debe ser booleano'),
  handleValidationErrors,
  propertyController.updateAvailability
);

module.exports = router;