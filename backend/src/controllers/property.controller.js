const { Property, User, Booking, PropertyImage, AccommodationType, Service, PropertyAvailability } = require('../models');
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
      title,
      description,
      location,
      accommodation_type_id,
      price_per_night,
      capacity,
      services,
      images // ← Ahora es un array de URLs de Firebase
    } = req.body;

    // Verificar que el usuario sea host
    if (req.user.role !== 'host' && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Debes ser anfitrión para publicar propiedades'
      });
    }

    // Crear propiedad
    const property = await Property.create({
      host_id: req.userId,
      title,
      description,
      location,
      accommodation_type_id: accommodation_type_id || null,
      price_per_night,
      capacity: capacity || 2,
      status: 'inactive', // Inicia como inactiva, requiere aprobación
      is_advertised: false
    });

    // Guardar imágenes de Firebase Storage
    if (images && Array.isArray(images) && images.length > 0) {
      const imagePromises = images.map((imageUrl, index) => {
        return PropertyImage.create({
          property_id: property.id,
          image_url: imageUrl, // URL completa de Firebase Storage
          is_main: index === 0 // Primera imagen como principal
        });
      });
      await Promise.all(imagePromises);
    }

    // Asociar servicios si los hay
    if (services && Array.isArray(services)) {
      await property.setServices(services);
    }

    // Cargar propiedad con relaciones
    const propertyWithRelations = await Property.findByPk(property.id, {
      include: [
        { model: PropertyImage, as: 'images' },
        { model: Service, as: 'services' },
        { model: AccommodationType, as: 'accommodationType' }
      ]
    });

    res.status(201).json({
      message: 'Propiedad creada exitosamente',
      property: propertyWithRelations
    });
  } catch (error) {
    next(error);
  }
}

  // Obtener todas las propiedades publicadas
  async getAll(req, res, next) {
    try {
      const {
        location,
        minPrice,
        maxPrice,
        guests,
        checkIn,
        checkOut,
        accommodation_type_id,
        page = 1,
        limit = 10
      } = req.query;

      // Construir filtros
      const where = { status: 'published' };

      if (location) where.location = { [Op.iLike]: `%${location}%` };
      if (minPrice || maxPrice) {
        where.price_per_night = {};
        if (minPrice) where.price_per_night[Op.gte] = minPrice;
        if (maxPrice) where.price_per_night[Op.lte] = maxPrice;
      }
      if (guests) where.capacity = { [Op.gte]: guests };
      if (accommodation_type_id) where.accommodation_type_id = accommodation_type_id;

      // Paginación
      const offset = (page - 1) * limit;

      const { count, rows } = await Property.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'host',
            attributes: ['id', 'full_name', 'email']
          },
          {
            model: PropertyImage,
            as: 'images'
          },
          {
            model: Service,
            as: 'services',
            attributes: ['id', 'name', 'icon']
          },
          {
            model: AccommodationType,
            as: 'accommodationType',
            attributes: ['id', 'name']
          }
        ],
        limit: parseInt(limit),
        offset,
        order: [['created_at', 'DESC']]
      });

      // Si hay fechas, filtrar por disponibilidad
      let availableProperties = rows;

      if (checkIn && checkOut) {
        const propertyIds = rows.map(p => p.id);

        // Buscar reservas que coincidan con las fechas
        const bookings = await Booking.findAll({
          where: {
            property_id: { [Op.in]: propertyIds },
            booking_status: { [Op.in]: ['confirmed', 'pending', 'in_progress'] },
            [Op.or]: [
              {
                check_in_date: { [Op.between]: [checkIn, checkOut] }
              },
              {
                check_out_date: { [Op.between]: [checkIn, checkOut] }
              },
              {
                [Op.and]: [
                  { check_in_date: { [Op.lte]: checkIn } },
                  { check_out_date: { [Op.gte]: checkOut } }
                ]
              }
            ]
          }
        });

        const bookedPropertyIds = bookings.map(b => b.property_id);
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
        include: [
          {
            model: User,
            as: 'host',
            attributes: ['id', 'full_name', 'email', 'phone']
          },
          {
            model: PropertyImage,
            as: 'images'
          },
          {
            model: Service,
            as: 'services',
            attributes: ['id', 'name', 'icon', 'description']
          },
          {
            model: AccommodationType,
            as: 'accommodationType'
          }
        ]
      });

      if (!property) {
        return res.status(404).json({ error: 'Propiedad no encontrada' });
      }

      // Solo mostrar propiedades publicadas a usuarios públicos
      // Admins y hosts dueños pueden ver propiedades no publicadas
      const isAdmin = req.user?.role === 'admin';
      const isOwner = req.userId && property.host_id === req.userId;
      const isPublished = property.status === 'published';

      if (!isPublished && !isAdmin && !isOwner) {
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
        where: { host_id: req.userId },
        include: [
          {
            model: PropertyImage,
            as: 'images'
          },
          {
            model: Service,
            as: 'services',
            attributes: ['id', 'name', 'icon']
          },
          {
            model: AccommodationType,
            as: 'accommodationType',
            attributes: ['id', 'name']
          }
        ],
        order: [['created_at', 'DESC']]
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
      if (property.host_id !== req.userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'No tienes permisos para editar esta propiedad' });
      }

      const {
        title,
        description,
        location,
        accommodation_type_id,
        price_per_night,
        capacity,
        services
      } = req.body;

      // Si se cambian ciertos campos importantes, cambiar a inactive para reaprobación
      const requiresReapproval = ['title', 'description', 'location', 'price_per_night'];
      const needsReapproval = requiresReapproval.some(field =>
        req.body[field] !== undefined && req.body[field] !== property[field]
      );

      // Actualizar campos permitidos
      if (title !== undefined) property.title = title;
      if (description !== undefined) property.description = description;
      if (location !== undefined) property.location = location;
      if (accommodation_type_id !== undefined) property.accommodation_type_id = accommodation_type_id;
      if (price_per_night !== undefined) property.price_per_night = price_per_night;
      if (capacity !== undefined) property.capacity = capacity;

      // Si requiere reaprobación y está publicada, cambiar a inactiva
      if (needsReapproval && property.status === 'published') {
        property.status = 'inactive';
      }

      await property.save();

      // Procesar nuevas imágenes si las hay
      if (req.files && req.files.length > 0) {
        const imagePromises = req.files.map((file, index) => {
          return PropertyImage.create({
            property_id: property.id,
            image_url: `/uploads/properties/${file.filename}`,
            is_main: false
          });
        });
        await Promise.all(imagePromises);
      }

      // Actualizar servicios si se proporcionan
      if (services && Array.isArray(services)) {
        await property.setServices(services);
      }

      // Cargar propiedad actualizada con relaciones
      const updatedProperty = await Property.findByPk(property.id, {
        include: [
          { model: PropertyImage, as: 'images' },
          { model: Service, as: 'services' },
          { model: AccommodationType, as: 'accommodationType' }
        ]
      });

      res.json({
        message: needsReapproval ?
          'Propiedad actualizada. Cambios significativos requieren reaprobación' :
          'Propiedad actualizada exitosamente',
        property: updatedProperty
      });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar propiedad
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const property = await Property.findByPk(id, {
        include: [{ model: PropertyImage, as: 'images' }]
      });

      if (!property) {
        return res.status(404).json({ error: 'Propiedad no encontrada' });
      }

      // Verificar permisos
      if (property.host_id !== req.userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'No tienes permisos para eliminar esta propiedad' });
      }

      // Verificar si tiene reservas activas
      const activeBookings = await Booking.count({
        where: {
          property_id: id,
          booking_status: { [Op.in]: ['pending', 'confirmed', 'in_progress'] },
          check_out_date: { [Op.gte]: new Date() }
        }
      });

      if (activeBookings > 0) {
        return res.status(400).json({
          error: 'No se puede eliminar una propiedad con reservas activas'
        });
      }

      // Eliminar imágenes del servidor
      if (property.images && property.images.length > 0) {
        for (const image of property.images) {
          try {
            const fullPath = path.join(__dirname, '../..', image.image_url);
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

  // Actualizar estado de propiedad (publicar/despublicar)
  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validar status
      const validStatuses = ['inactive', 'published', 'blocked'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: 'Estado inválido. Debe ser: inactive, published o blocked'
        });
      }

      const property = await Property.findByPk(id);

      if (!property) {
        return res.status(404).json({ error: 'Propiedad no encontrada' });
      }

      // Solo el host o admin pueden cambiar el estado
      if (property.host_id !== req.userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'No tienes permisos' });
      }

      // Solo admins pueden bloquear propiedades
      if (status === 'blocked' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Solo administradores pueden bloquear propiedades' });
      }

      property.status = status;
      await property.save();

      const statusMessages = {
        'published': 'publicada',
        'inactive': 'desactivada',
        'blocked': 'bloqueada'
      };

      res.json({
        message: `Propiedad ${statusMessages[status]} exitosamente`,
        property
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PropertyController();