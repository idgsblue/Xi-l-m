const { Property, User, Booking } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');

// Configuración de multer para imágenes
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/properties');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `property-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
    }
  }
}).array('images', 5);

class PropertyController {
  // Subir imágenes - middleware
  uploadImages(req, res, next) {
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  }

  // Crear propiedad
  async create(req, res, next) {
    try {
      const {
        name,
        description,
        shortDescription,
        address,
        zone,
        pricePerNight,
        maxGuests,
        bedrooms,
        bathrooms,
        amenities
      } = req.body;

      // Verificar que el usuario sea host
      if (req.user.role !== 'host' && req.user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Debes ser anfitrión para publicar propiedades' 
        });
      }

      // Procesar imágenes
      const images = req.files ? req.files.map(file => `/uploads/properties/${file.filename}`) : [];

      // Crear propiedad
      const property = await Property.create({
        name,
        description,
        shortDescription: shortDescription || description.substring(0, 300),
        address,
        zone,
        pricePerNight,
        maxGuests: maxGuests || 2,
        bedrooms: bedrooms || 1,
        bathrooms: bathrooms || 1,
        amenities: amenities ? amenities.split(',').map(a => a.trim()) : [],
        images,
        hostId: req.userId,
        status: 'pending' // Requiere aprobación del admin
      });

      res.status(201).json({
        message: 'Propiedad creada y enviada para aprobación',
        property
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener todas las propiedades aprobadas
  async getAll(req, res, next) {
    try {
      const {
        zone,
        minPrice,
        maxPrice,
        guests,
        checkIn,
        checkOut,
        page = 1,
        limit = 10
      } = req.query;

      // Construir filtros
      const where = { status: 'approved', isAvailable: true };
      
      if (zone) where.zone = { [Op.iLike]: `%${zone}%` };
      if (minPrice || maxPrice) {
        where.pricePerNight = {};
        if (minPrice) where.pricePerNight[Op.gte] = minPrice;
        if (maxPrice) where.pricePerNight[Op.lte] = maxPrice;
      }
      if (guests) where.maxGuests = { [Op.gte]: guests };

      // Paginación
      const offset = (page - 1) * limit;

      const { count, rows } = await Property.findAndCountAll({
        where,
        include: [{
          model: User,
          as: 'host',
          attributes: ['id', 'name', 'email']
        }],
        limit: parseInt(limit),
        offset,
        order: [['createdAt', 'DESC']]
      });

      // Si hay fechas, filtrar por disponibilidad
      let availableProperties = rows;
      
      if (checkIn && checkOut) {
        const propertyIds = rows.map(p => p.id);
        
        // Buscar reservas que coincidan con las fechas
        const bookings = await Booking.findAll({
          where: {
            propertyId: { [Op.in]: propertyIds },
            status: { [Op.in]: ['confirmed', 'pending'] },
            [Op.or]: [
              {
                checkIn: { [Op.between]: [checkIn, checkOut] }
              },
              {
                checkOut: { [Op.between]: [checkIn, checkOut] }
              },
              {
                [Op.and]: [
                  { checkIn: { [Op.lte]: checkIn } },
                  { checkOut: { [Op.gte]: checkOut } }
                ]
              }
            ]
          }
        });

        const bookedPropertyIds = bookings.map(b => b.propertyId);
        availableProperties = rows.filter(p => !bookedPropertyIds.includes(p.id));
      }

      res.json({
        properties: availableProperties,
        pagination: {
          total: count,
          pages: Math.ceil(count / limit),
          currentPage: parseInt(page),
          perPage: parseInt(limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener una propiedad por ID
  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const property = await Property.findByPk(id, {
        include: [{
          model: User,
          as: 'host',
          attributes: ['id', 'name', 'email', 'phone']
        }]
      });

      if (!property) {
        return res.status(404).json({ error: 'Propiedad no encontrada' });
      }

      // Solo mostrar propiedades aprobadas a usuarios no admin
      if (property.status !== 'approved' && req.user?.role !== 'admin' && property.hostId !== req.userId) {
        return res.status(403).json({ error: 'No tienes acceso a esta propiedad' });
      }

      res.json({ property });
    } catch (error) {
      next(error);
    }
  }

  // Obtener propiedades del anfitrión autenticado
  async getMyProperties(req, res, next) {
    try {
      const properties = await Property.findAll({
        where: { hostId: req.userId },
        order: [['createdAt', 'DESC']]
      });

      res.json({ properties });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar propiedad
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const property = await Property.findByPk(id);

      if (!property) {
        return res.status(404).json({ error: 'Propiedad no encontrada' });
      }

      // Verificar permisos
      if (property.hostId !== req.userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'No tienes permisos para editar esta propiedad' });
      }

      // Campos que se pueden actualizar
      const allowedFields = [
        'name', 'description', 'shortDescription', 'address', 'zone',
        'pricePerNight', 'maxGuests', 'bedrooms', 'bathrooms', 'amenities',
        'isAvailable'
      ];

      // Si se cambian ciertos campos, volver a pending
      const requiresReapproval = ['name', 'description', 'address', 'pricePerNight'];
      const needsReapproval = requiresReapproval.some(field => req.body[field] && req.body[field] !== property[field]);

      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          property[field] = req.body[field];
        }
      });

      // Procesar nuevas imágenes si las hay
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => `/uploads/properties/${file.filename}`);
        property.images = [...(property.images || []), ...newImages].slice(0, 5);
      }

      if (needsReapproval && property.status === 'approved') {
        property.status = 'pending';
      }

      await property.save();

      res.json({
        message: needsReapproval ? 'Propiedad actualizada y enviada para reaprobación' : 'Propiedad actualizada exitosamente',
        property
      });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar propiedad
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const property = await Property.findByPk(id);

      if (!property) {
        return res.status(404).json({ error: 'Propiedad no encontrada' });
      }

      // Verificar permisos
      if (property.hostId !== req.userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'No tienes permisos para eliminar esta propiedad' });
      }

      // Verificar si tiene reservas activas
      const activeBookings = await Booking.count({
        where: {
          propertyId: id,
          status: { [Op.in]: ['pending', 'confirmed'] },
          checkOut: { [Op.gte]: new Date() }
        }
      });

      if (activeBookings > 0) {
        return res.status(400).json({ 
          error: 'No se puede eliminar una propiedad con reservas activas' 
        });
      }

      // Eliminar imágenes del servidor
      if (property.images && property.images.length > 0) {
        for (const imagePath of property.images) {
          try {
            const fullPath = path.join(__dirname, '../..', imagePath);
            await fs.unlink(fullPath);
          } catch (err) {
            console.error('Error eliminando imagen:', err);
          }
        }
      }

      await property.destroy();

      res.json({ message: 'Propiedad eliminada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar disponibilidad
  async updateAvailability(req, res, next) {
    try {
      const { id } = req.params;
      const { isAvailable } = req.body;

      const property = await Property.findByPk(id);

      if (!property) {
        return res.status(404).json({ error: 'Propiedad no encontrada' });
      }

      if (property.hostId !== req.userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'No tienes permisos' });
      }

      property.isAvailable = isAvailable;
      await property.save();

      res.json({
        message: `Propiedad ${isAvailable ? 'activada' : 'desactivada'} exitosamente`,
        property
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PropertyController();