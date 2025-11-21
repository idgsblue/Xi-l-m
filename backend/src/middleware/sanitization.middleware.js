/**
 * Middleware de sanitización de inputs
 * Protege contra XSS, NoSQL injection, y otros ataques de inyección
 */

// Función para sanitizar strings eliminando caracteres peligrosos
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;

  // Eliminar caracteres de control y scripts potencialmente peligrosos
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Eliminar tags script
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Eliminar iframes
    .replace(/javascript:/gi, '') // Eliminar javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Eliminar event handlers (onclick, onerror, etc)
    .trim();
};

// Función recursiva para sanitizar objetos profundamente
const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Sanitizar la clave también (protección contra prototype pollution)
        const sanitizedKey = sanitizeString(key);

        // No permitir claves que intenten modificar el prototype
        if (sanitizedKey === '__proto__' || sanitizedKey === 'constructor' || sanitizedKey === 'prototype') {
          continue;
        }

        sanitized[sanitizedKey] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  return obj;
};

// Middleware para sanitizar req.body
const sanitizeBody = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  next();
};

// Middleware para sanitizar req.query
const sanitizeQuery = (req, res, next) => {
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  next();
};

// Middleware para sanitizar req.params
const sanitizeParams = (req, res, next) => {
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
};

// Middleware combinado para sanitizar todo el request
const sanitizeRequest = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
};

// Validación adicional para campos específicos
const validateNoSQLInjection = (req, res, next) => {
  const checkForInjection = (obj) => {
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        // Detectar operadores de MongoDB/NoSQL
        if (key.startsWith('$') || key.startsWith('{')) {
          return true;
        }
        if (checkForInjection(obj[key])) {
          return true;
        }
      }
    }
    return false;
  };

  if (checkForInjection(req.body) || checkForInjection(req.query) || checkForInjection(req.params)) {
    return res.status(400).json({
      error: 'Solicitud inválida: Se detectaron patrones de inyección'
    });
  }

  next();
};

module.exports = {
  sanitizeString,
  sanitizeObject,
  sanitizeBody,
  sanitizeQuery,
  sanitizeParams,
  sanitizeRequest,
  validateNoSQLInjection
};
