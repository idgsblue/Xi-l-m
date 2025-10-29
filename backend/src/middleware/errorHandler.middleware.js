const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Error de Sequelize
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    return res.status(400).json({ error: 'Error de validación', details: errors });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ 
      error: 'El registro ya existe',
      field: err.errors[0].path 
    });
  }

  // Error personalizado
  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Error genérico
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

module.exports = errorHandler;