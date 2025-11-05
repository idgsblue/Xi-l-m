const router = require('express').Router();
const serviceController = require('../controllers/service.controller');

// ====================================
// RUTAS PÚBLICAS
// ====================================

// Obtener todos los servicios
router.get('/', serviceController.getAll);

// Obtener servicio por ID
router.get('/:id', serviceController.getById);

module.exports = router;