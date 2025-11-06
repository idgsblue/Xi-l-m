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
        images
      } = req.body;

      // Verificar que el usuario sea host
      if (req.user.role !== 'host' && req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Debes ser anfitrión para publicar propiedades'
        });
      }


      // ============ VALIDACIÓN DE RANGO DE PRECIO ============
      if (accommodation_type_id && price_per_night) {
        const accommodationType = await AccommodationType.findByPk(accommodation_type_id);
        
        if (accommodationType) {
          const minPrice = parseFloat(accommodationType.min_price);
          const maxPrice = parseFloat(accommodationType.max_price);
          const price = parseFloat(price_per_night);

          if (minPrice && price < minPrice) {
            return res.status(400).json({
              error: `El precio está por debajo del mínimo permitido para ${accommodationType.name}`,
              minPrice,
              maxPrice,
              accommodationType: accommodationType.name
            });
          }

          if (maxPrice && price > maxPrice) {
            return res.status(400).json({
              error: `El precio está por encima del máximo permitido para ${accommodationType.name}`,
              minPrice,
              maxPrice,
              accommodationType: accommodationType.name
            });
          }
        }
      }
      // ============ FIN VALIDACIÓN ============

      // Crear propiedad con estado PENDING_APPROVAL
      const property = await Property.create({
        host_id: req.userId,
        title,
        description,
        location,
        accommodation_type_id: accommodation_type_id || null,
        price_per_night,
        capacity: capacity || 2,
        status: 'pending_approval', // ← CAMBIO CRÍTICO
        is_advertised: false
      });

      // Guardar imágenes de Firebase Storage
      if (images && Array.isArray(images) && images.length > 0) {
        const imagePromises = images.map((imageUrl, index) => {
          return PropertyImage.create({
            property_id: property.id,
            image_url: imageUrl,
            is_main: index === 0
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
        message: 'Propiedad creada exitosamente. Está pendiente de aprobación por un administrador.',
        property: propertyWithRelations
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener todas las propiedades publicadas (PÚBLICAS)
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

      // Construir filtros - SOLO PROPIEDADES PUBLICADAS
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
            attributes: ['id', 'name', 'min_price', 'max_price', 'platform_commission_percentage']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      // Agregar información adicional de estado
      const propertiesWithStats = properties.map(prop => {
        const statusMessages = {
          'pending_approval': 'Pendiente de aprobación por administrador',
          'approved': 'Aprobada. Puedes anunciarla cuando quieras',
          'rejected': `Rechazada. Motivo: ${prop.rejection_reason || 'No especificado'}`,
          'published': 'Publicada y visible para huéspedes',
          'inactive': 'Inactiva',
          'blocked': 'Bloqueada por administrador'
        };

        return {
          ...prop.toJSON(),
          canAdvertise: prop.status === 'approved' && !prop.is_advertised,
          canEdit: ['pending_approval', 'approved', 'rejected', 'inactive'].includes(prop.status),
          statusMessage: statusMessages[prop.status] || 'Estado desconocido'
        };
      });

      res.json({ properties: propertiesWithStats });
    } catch (error) {
      next(error);
    }
  }

  

  // Método auxiliar para mensajes de estado
  getStatusMessage(status, rejectionReason) {
    const messages = {
      'pending_approval': 'Pendiente de aprobación por administrador',
      'approved': 'Aprobada. Puedes anunciarla cuando quieras',
      'rejected': `Rechazada. Motivo: ${rejectionReason || 'No especificado'}`,
      'published': 'Publicada y visible para huéspedes',
      'inactive': 'Inactiva',
      'blocked': 'Bloqueada por administrador'
    };
    return messages[status] || 'Estado desconocido';
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

      // No permitir editar propiedades publicadas o bloqueadas
      if (property.status === 'published') {
        return res.status(400).json({ 
          error: 'Debes despublicar la propiedad antes de editarla' 
        });
      }

      if (property.status === 'blocked') {
        return res.status(400).json({ 
          error: 'No puedes editar una propiedad bloqueada. Contacta al administrador' 
        });
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

      // ============ VALIDACIÓN DE RANGO DE PRECIO ============
      const typeId = accommodation_type_id !== undefined ? accommodation_type_id : property.accommodation_type_id;
      const newPrice = price_per_night !== undefined ? price_per_night : property.price_per_night;

      if (typeId && newPrice) {
        const accommodationType = await AccommodationType.findByPk(typeId);
        
        if (accommodationType) {
          const minPrice = parseFloat(accommodationType.min_price);
          const maxPrice = parseFloat(accommodationType.max_price);
          const price = parseFloat(newPrice);

          if (minPrice && price < minPrice) {
            return res.status(400).json({
              error: `El precio está por debajo del mínimo permitido para ${accommodationType.name}`,
              minPrice,
              maxPrice,
              accommodationType: accommodationType.name
            });
          }

          if (maxPrice && price > maxPrice) {
            return res.status(400).json({
              error: `El precio está por encima del máximo permitido para ${accommodationType.name}`,
              minPrice,
              maxPrice,
              accommodationType: accommodationType.name
            });
          }
        }
      }
      // ============ FIN VALIDACIÓN ============

      // Si se cambian ciertos campos importantes, volver a pending_approval
      const requiresReapproval = ['title', 'description', 'location', 'price_per_night', 'accommodation_type_id'];
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

      // Si requiere reaprobación y está aprobada/rechazada, cambiar a pending_approval
      if (needsReapproval && ['approved', 'rejected'].includes(property.status)) {
        property.status = 'pending_approval';
        property.rejection_reason = null; // Limpiar razón anterior
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
          'Propiedad actualizada. Los cambios requieren nueva aprobación de un administrador' :
          'Propiedad actualizada exitosamente',
        property: updatedProperty,
        requiresReapproval: needsReapproval
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

  // NUEVO: Anunciar propiedad (SOLO SI ESTÁ APPROVED)
  async advertiseProperty(req, res, next) {
    try {
      const { id } = req.params;
      const property = await Property.findByPk(id, {
        include: [
          { model: AccommodationType, as: 'accommodationType' },
          { model: PropertyImage, as: 'images' }
        ]
      });

      if (!property) {
        return res.status(404).json({ error: 'Propiedad no encontrada' });
      }

      // Verificar permisos
      if (property.host_id !== req.userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'No tienes permisos' });
      }

      // Validar que esté APPROVED
      if (property.status !== 'approved') {
        return res.status(400).json({
          error: 'Solo puedes anunciar propiedades que hayan sido aprobadas',
          currentStatus: property.status,
          statusMessage: this.getStatusMessage(property.status, property.rejection_reason)
        });
      }

      // Validar que tenga al menos una imagen
      if (!property.images || property.images.length === 0) {
        return res.status(400).json({
          error: 'La propiedad debe tener al menos una imagen antes de anunciarse'
        });
      }

      // Calcular comisión de la plataforma
      let commission = 0;
      let commissionPercentage = 0;
      let hostEarnings = property.price_per_night;

      if (property.accommodationType && property.accommodationType.platform_commission_percentage) {
        commissionPercentage = parseFloat(property.accommodationType.platform_commission_percentage);
        commission = (property.price_per_night * commissionPercentage) / 100;
        hostEarnings = property.price_per_night - commission;
      }

      // Cambiar estado a PUBLISHED
      property.status = 'published';
      property.is_advertised = true;
      await property.save();

      res.json({
        message: 'Propiedad anunciada exitosamente',
        property,
        commissionInfo: {
          pricePerNight: parseFloat(property.price_per_night),
          platformCommission: parseFloat(commission.toFixed(2)),
          commissionPercentage: commissionPercentage,
          hostEarnings: parseFloat(hostEarnings.toFixed(2))
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // NUEVO: Despublicar propiedad
  async unadvertiseProperty(req, res, next) {
    try {
      const { id } = req.params;
      const property = await Property.findByPk(id);

      if (!property) {
        return res.status(404).json({ error: 'Propiedad no encontrada' });
      }

      // Verificar permisos
      if (property.host_id !== req.userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'No tienes permisos' });
      }

      if (property.status !== 'published') {
        return res.status(400).json({
          error: 'Solo puedes despublicar propiedades que estén publicadas',
          currentStatus: property.status
        });
      }

      // Verificar si tiene reservas activas o pendientes
      const activeBookings = await Booking.count({
        where: {
          property_id: id,
          booking_status: { [Op.in]: ['pending', 'confirmed'] },
          check_out_date: { [Op.gte]: new Date() }
        }
      });

      if (activeBookings > 0) {
        return res.status(400).json({
          error: `No puedes despublicar una propiedad con ${activeBookings} reserva(s) activa(s). Las reservas existentes no se cancelarán.`,
          activeBookings
        });
      }

      // Cambiar estado a APPROVED (no a inactive)
      property.status = 'approved';
      property.is_advertised = false;
      await property.save();

      res.json({
        message: 'Propiedad despublicada exitosamente. Puedes volver a anunciarla cuando quieras.',
        property
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar estado de propiedad (DEPRECADO - usar advertise/unadvertise)
  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validar status permitidos para HOST
      const validHostStatuses = ['inactive', 'pending_approval'];
      
      // Admin puede usar todos los estados
      const validAdminStatuses = ['inactive', 'pending_approval', 'approved', 'rejected', 'published', 'blocked'];
      
      const isAdmin = req.user.role === 'admin';
      const allowedStatuses = isAdmin ? validAdminStatuses : validHostStatuses;

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          error: `Estado inválido. Estados permitidos: ${allowedStatuses.join(', ')}`,
          hint: isAdmin ? 
            'Los administradores deben usar /admin/properties/:id/approve o /admin/properties/:id/reject' :
            'Los hosts deben usar /properties/:id/advertise o /properties/:id/unadvertise'
        });
      }

      const property = await Property.findByPk(id);

      if (!property) {
        return res.status(404).json({ error: 'Propiedad no encontrada' });
      }

      // Verificar permisos
      if (property.host_id !== req.userId && !isAdmin) {
        return res.status(403).json({ error: 'No tienes permisos' });
      }

      // HOST: Solo puede cambiar de rejected/approved a pending_approval o inactive
      if (!isAdmin) {
        if (property.status === 'published') {
          return res.status(400).json({
            error: 'Usa POST /properties/:id/unadvertise para despublicar'
          });
        }

        if (property.status === 'blocked') {
          return res.status(400).json({
            error: 'No puedes modificar una propiedad bloqueada'
          });
        }

        if (status === 'pending_approval' && !['rejected', 'approved', 'inactive'].includes(property.status)) {
          return res.status(400).json({
            error: 'Solo puedes solicitar reaprobación desde estados: rejected, approved o inactive'
          });
        }
      }

      property.status = status;
      
      // Limpiar rejection_reason si se cambia a otro estado
      if (status !== 'rejected') {
        property.rejection_reason = null;
      }

      await property.save();

      const statusMessages = {
        'pending_approval': 'pendiente de aprobación',
        'approved': 'aprobada',
        'rejected': 'rechazada',
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