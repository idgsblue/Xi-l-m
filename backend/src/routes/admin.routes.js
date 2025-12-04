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

// Gestión de usuarios - CORREGIDO
router.get('/users', 
  query('role').optional().custom(value => !value || ['guest', 'host', 'admin'].includes(value)),
  query('isActive').optional().custom(value => !value || ['true', 'false'].includes(value)),
  query('search').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
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
  query('status').optional().custom(value => !value || ['pending', 'confirmed', 'cancelled', 'completed'].includes(value)),
  query('startDate').optional().isISO8601().toDate(),
  query('endDate').optional().isISO8601().toDate(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  handleValidationErrors,
  adminController.getAllBookings
);

// Reportes - CORREGIDO
router.get('/reports', 
  query('type').custom(value => !value || ['bookings', 'revenue', 'properties'].includes(value)),
  query('startDate').optional().isISO8601().toDate(),
  query('endDate').optional().isISO8601().toDate(),
  handleValidationErrors,
  adminController.generateReport
);

// Estadísticas para gráficas
router.get('/stats/graphics', adminController.getGraphicsStats);

// Datos detallados para gráficas
router.get('/stats/graphics/detailed',
  query('type').isIn(['revenue', 'bookings', 'properties']).withMessage('Tipo de estadística inválido'),
  query('period').optional().isIn(['daily', 'weekly', 'monthly', 'yearly']).withMessage('Período inválido'),
  query('startDate').optional().isISO8601().toDate(),
  query('endDate').optional().isISO8601().toDate(),
  handleValidationErrors,
  adminController.getDetailedGraphicsData
);

// Top propiedades (para gráficas de ranking)
router.get('/stats/top-properties',
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('El límite debe estar entre 1 y 20'),
  query('orderBy').optional().isIn(['revenue', 'bookings', 'rating']).withMessage('Criterio de orden inválido'),
  handleValidationErrors,
  adminController.getTopProperties
);

// Datos de ocupación
router.get('/stats/occupancy',
  query('period').optional().isIn(['daily', 'weekly', 'monthly']).withMessage('Período inválido'),
  query('months').optional().isInt({ min: 1, max: 12 }).withMessage('Meses debe estar entre 1 y 12'),
  handleValidationErrors,
  adminController.getOccupancyStats
);

module.exports = router;