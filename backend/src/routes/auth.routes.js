const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { authenticate, refreshToken } = require('../middleware/auth.middleware');
const { body } = require('express-validator');
const handleValidationErrors = require('../middleware/validation.middleware');

// Validaciones
const registerValidation = [
  body('name')
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('email')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/).withMessage('La contraseña debe contener letras y números'),
  body('phone')
    .optional()
    .matches(/^[0-9-+().\s]+$/).withMessage('Formato de teléfono inválido'),
  body('role')
    .optional()
    .isIn(['guest', 'host']).withMessage('Rol inválido')
];

const loginValidation = [
  body('email')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('La contraseña actual es requerida'),
  body('newPassword')
    .isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/).withMessage('La contraseña debe contener letras y números')
];

// Rutas públicas
router.post('/register', registerValidation, handleValidationErrors, authController.register);
router.post('/login', loginValidation, handleValidationErrors, authController.login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', 
  body('email').isEmail().withMessage('Email inválido'),
  handleValidationErrors,
  authController.forgotPassword
);

// Rutas protegidas
router.use(authenticate); // Middleware de autenticación para todas las rutas siguientes

router.get('/profile', authController.getProfile);
router.put('/profile', 
  [
    body('name')
      .optional()
      .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('phone')
      .optional()
      .matches(/^[0-9-+().\s]+$/).withMessage('Formato de teléfono inválido')
  ],
  handleValidationErrors,
  authController.updateProfile
);
router.post('/change-password', changePasswordValidation, handleValidationErrors, authController.changePassword);
router.post('/logout', authController.logout);

module.exports = router;