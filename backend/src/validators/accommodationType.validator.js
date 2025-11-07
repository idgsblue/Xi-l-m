const { body, param } = require('express-validator');

const createValidation = [
  body('name')
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .trim(),
  body('min_price')
    .optional()
    .isFloat({ min: 0 }).withMessage('El precio mínimo debe ser un número positivo'),
  body('max_price')
    .optional()
    .isFloat({ min: 0 }).withMessage('El precio máximo debe ser un número positivo'),
  body('platform_commission_percentage')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('El porcentaje de comisión debe estar entre 0 y 100')
];

const updateValidation = [
  param('id').isInt().withMessage('ID inválido'),
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .trim(),
  body('min_price')
    .optional()
    .isFloat({ min: 0 }).withMessage('El precio mínimo debe ser un número positivo'),
  body('max_price')
    .optional()
    .isFloat({ min: 0 }).withMessage('El precio máximo debe ser un número positivo'),
  body('platform_commission_percentage')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('El porcentaje de comisión debe estar entre 0 y 100')
];

const idValidation = [
  param('id').isInt().withMessage('ID inválido')
];

module.exports = {
  createValidation,
  updateValidation,
  idValidation
};