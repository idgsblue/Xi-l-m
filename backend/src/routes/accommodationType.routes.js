const router = require('express').Router();
const accommodationTypeController = require('../controllers/accommodationType.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/roleCheck.middleware');
const handleValidationErrors = require('../middleware/validation.middleware');
const { 
  createValidation, 
  updateValidation, 
  idValidation 
} = require('../validators/accommodationType.validator');

// Rutas públicas (cualquiera puede ver los tipos)
router.get('/', accommodationTypeController.getAll);
router.get('/:id', idValidation, handleValidationErrors, accommodationTypeController.getById);

// Rutas protegidas (solo admin)
router.use(authenticate);
router.use(isAdmin);

router.post('/', 
  createValidation, 
  handleValidationErrors, 
  accommodationTypeController.create
);

router.put('/:id', 
  updateValidation, 
  handleValidationErrors, 
  accommodationTypeController.update
);

router.delete('/:id', 
  idValidation, 
  handleValidationErrors, 
  accommodationTypeController.delete
);

module.exports = router;