const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { body } = require('express-validator');
const handleValidationErrors = require('../middleware/validation.middleware');

// Webhook de Stripe (sin autenticación)
router.post('/stripe-webhook', 
  express.raw({ type: 'application/json' }), 
  paymentController.stripeWebhook
);

// Rutas protegidas
router.use(authenticate);

router.get('/history', paymentController.getUserPayments);

router.get('/:id', paymentController.getPaymentDetails);

router.post('/retry', 
  body('bookingId')
    .notEmpty().withMessage('El ID de la reserva es requerido')
    .isInt().withMessage('ID de reserva inválido'),
  handleValidationErrors,
  paymentController.retryPayment
);

module.exports = router;