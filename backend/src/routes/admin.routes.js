const router = require('express').Router();
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/roleCheck.middleware');
const { body, query, param } = require('express-validator');
const handleValidationErrors = require('../middleware/validation.middleware');

// Todas las rutas requieren autenticación de administrador
router.use(authenticate);
router.use(isAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Gestión de propiedades
router.get('/properties/pending', adminController.getPendingProperties);

router.post('/properties/:id/approve', 
  param('id').isInt().withMessage('ID de propiedad inválido'),
  handleValidationErrors,
  adminController.approveProperty
);

router.post('/properties/:id/reject', 
  param('id').isInt().withMessage('ID de propiedad inválido'),
  body('reason')
    .notEmpty().withMessage('La razón del rechazo es requerida')
    .isLength({ min: 10 }).withMessage('La razón debe tener al menos 10 caracteres'),
  handleValidationErrors,
  adminController.rejectProperty
);

// Gestión de usuarios
router.get('/users', 
  query('role').optional().isIn(['guest', 'host', 'admin']),
  query('isActive').optional().isBoolean(),
  query('search').optional().isString(),
  handleValidationErrors,
  adminController.getUsers
);

router.patch('/users/:id/status', 
  param('id').isInt().withMessage('ID de usuario inválido'),
  body('isActive').isBoolean().withMessage('isActive debe ser booleano'),
  handleValidationErrors,
  adminController.toggleUserStatus
);

router.patch('/users/:id/role', 
  param('id').isInt().withMessage('ID de usuario inválido'),
  body('role').isIn(['guest', 'host', 'admin']).withMessage('Rol inválido'),
  handleValidationErrors,
  adminController.changeUserRole
);

// Configuración de precios
router.post('/price-range', 
  body('zone').notEmpty().withMessage('La zona es requerida'),
  body('minPrice').isFloat({ min: 0 }).withMessage('El precio mínimo debe ser positivo'),
  body('maxPrice').isFloat({ min: 0 }).withMessage('El precio máximo debe ser positivo'),
  handleValidationErrors,
  adminController.setPriceRange
);

// Gestión de reservas
router.get('/bookings', 
  query('status').optional().isIn(['pending', 'confirmed', 'cancelled', 'completed']),
  query('startDate').optional().isISO8601().toDate(),
  query('endDate').optional().isISO8601().toDate(),
  handleValidationErrors,
  adminController.getAllBookings
);

// Reportes
router.get('/reports', 
  query('type').isIn(['bookings', 'revenue', 'properties']).withMessage('Tipo de reporte inválido'),
  query('startDate').optional().isISO8601().toDate(),
  query('endDate').optional().isISO8601().toDate(),
  handleValidationErrors,
  adminController.generateReport
);

module.exports = router;