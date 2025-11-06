const { Property, User, Booking, AccommodationType, PropertyImage } = require('../models');
const { Op } = require('sequelize');
const emailService = require('../services/email.service');

class AdminController {
  // Dashboard con métricas
  async getDashboard(req, res, next) {
    try {
      const totalProperties = await Property.count();
      const publishedProperties = await Property.count({ where: { status: 'published' } });
      const pendingProperties = await Property.count({ where: { status: 'pending_approval' } });
      
      const totalUsers = await User.count();
      const hostCount = await User.count({ where: { role: 'host' } });
      const guestCount = await User.count({ where: { role: 'guest' } });

      const currentMonth = new Date();
      currentMonth.setDate(1);
      
      const monthlyBookings = await Booking.count({
        where: {
          created_at: { [Op.gte]: currentMonth }
        }
      });

     const totalBookings = await Booking.count();
const cancelledBookings = await Booking.count({
  where: { booking_status: 'cancelled' }
});
const cancellationRate = totalBookings > 0 ? 
  ((cancelledBookings / totalBookings) * 100).toFixed(2) : 0;

      res.json({
        properties: {
          total: totalProperties,
          published: publishedProperties,
          pending: pendingProperties
        },
        users: {
          total: totalUsers,
          hosts: hostCount,
          guests: guestCount
        },
        bookings: {
          thisMonth: monthlyBookings,
          cancellationRate: cancellationRate
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener propiedades pendientes de aprobación
  async getPendingProperties(req, res, next) {
    try {
      const properties = await Property.findAll({
        where: { status: 'pending_approval' },
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
            model: AccommodationType,
            as: 'accommodationType',
            attributes: ['id', 'name', 'min_price', 'max_price']
          }
        ],
        order: [['created_at', 'ASC']]
      });

      res.json({ 
        properties,
        total: properties.length
      });
    } catch (error) {
      next(error);
    }
  }

  // Aprobar propiedad
  async approveProperty(req, res, next) {
    try {
      const { id } = req.params;
      const property = await Property.findByPk(id, {
        include: [
          {
            model: User,
            as: 'host',
            attributes: ['id', 'full_name', 'email']
          }
        ]
      });

      if (!property) {
        return res.status(404).json({ error: 'Propiedad no encontrada' });
      }

      if (property.status !== 'pending_approval') {
        return res.status(400).json({
          error: 'Solo puedes aprobar propiedades en estado "pending_approval"',
          currentStatus: property.status
        });
      }

      // Cambiar estado a APPROVED (no directamente a published)
      property.status = 'approved';
      property.rejection_reason = null; // Limpiar cualquier razón anterior
      await property.save();

      // Enviar email de notificación al host
      try {
        await emailService.sendPropertyApprovalNotification(property.host, property);
      } catch (emailError) {
        console.error('Error enviando email de aprobación:', emailError);
        // No fallar la aprobación si falla el email
      }

      res.json({
        message: 'Propiedad aprobada exitosamente. El anfitrión puede anunciarla cuando lo desee.',
        property
      });
    } catch (error) {
      next(error);
    }
  }

  // Rechazar propiedad
  async rejectProperty(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason || reason.trim().length < 10) {
        return res.status(400).json({
          error: 'Debes proporcionar una razón del rechazo (mínimo 10 caracteres)'
        });
      }

      const property = await Property.findByPk(id, {
        include: [
          {
            model: User,
            as: 'host',
            attributes: ['id', 'full_name', 'email']
          }
        ]
      });

      if (!property) {
        return res.status(404).json({ error: 'Propiedad no encontrada' });
      }

      if (property.status !== 'pending_approval') {
        return res.status(400).json({
          error: 'Solo puedes rechazar propiedades en estado "pending_approval"',
          currentStatus: property.status
        });
      }

      // Cambiar estado a REJECTED con razón
      property.status = 'rejected';
      property.rejection_reason = reason.trim();
      property.is_advertised = false;
      await property.save();

      // Enviar email de notificación al host
      try {
        await emailService.sendPropertyRejectionNotification(property.host, property, reason);
      } catch (emailError) {
        console.error('Error enviando email de rechazo:', emailError);
      }

      res.json({
        message: 'Propiedad rechazada. El anfitrión ha sido notificado.',
        property
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener todos los usuarios con filtros
  async getUsers(req, res, next) {
    try {
      const { role, isActive, search, page = 1, limit = 20 } = req.query;

      const where = {};
      if (role) where.role = role;
      if (isActive !== undefined) where.status = isActive === 'true';
      if (search) {
        where[Op.or] = [
          { full_name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await User.findAndCountAll({
        where,
        attributes: { exclude: ['password'] },
        limit: parseInt(limit),
        offset,
        order: [['created_at', 'DESC']]
      });

      res.json({
        users: rows,
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

  // Activar/Desactivar usuario
  async toggleUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // No permitir desactivar al propio admin
      if (user.id === req.userId) {
        return res.status(400).json({ error: 'No puedes desactivar tu propia cuenta' });
      }

      user.status = isActive;
      await user.save();

      res.json({
        message: `Usuario ${isActive ? 'activado' : 'desactivado'} exitosamente`,
        user: user.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  // Cambiar rol de usuario
  async changeUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      const validRoles = ['guest', 'host', 'admin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Rol inválido' });
      }

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // No permitir cambiar el propio rol
      if (user.id === req.userId) {
        return res.status(400).json({ error: 'No puedes cambiar tu propio rol' });
      }

      user.role = role;
      await user.save();

      res.json({
        message: `Rol de usuario actualizado a ${role} exitosamente`,
        user: user.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  // Configurar rango de precios (DEPRECADO - usar accommodation_types)
  async setPriceRange(req, res, next) {
    try {
      return res.status(410).json({
        error: 'Este endpoint está obsoleto',
        message: 'Usa POST /api/accommodation-types o PUT /api/accommodation-types/:id para gestionar rangos de precios'
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener todas las reservas con filtros
  async getAllBookings(req, res, next) {
    try {
      const { status, startDate, endDate, page = 1, limit = 20 } = req.query;

      const where = {};
      if (status) where.booking_status = status;
      if (startDate || endDate) {
        where.check_in_date = {};
        if (startDate) where.check_in_date[Op.gte] = startDate;
        if (endDate) where.check_in_date[Op.lte] = endDate;
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await Booking.findAndCountAll({
        where,
        include: [
          {
            model: Property,
            as: 'property',
            attributes: ['id', 'title', 'location']
          },
          {
            model: User,
            as: 'guest',
            attributes: ['id', 'full_name', 'email']
          },
          {
            model: User,
            as: 'host',
            attributes: ['id', 'full_name', 'email']
          }
        ],
        limit: parseInt(limit),
        offset,
        order: [['created_at', 'DESC']]
      });

      res.json({
        bookings: rows,
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

  // Generar reportes
  async generateReport(req, res, next) {
  try {
    const { type, startDate, endDate } = req.query;

    let report = {};

    switch (type) {
      case 'bookings':
        // Reporte de reservas
        const bookingWhere = {};
        if (startDate || endDate) {
          bookingWhere.created_at = {};
          if (startDate) bookingWhere.created_at[Op.gte] = new Date(startDate);
          if (endDate) bookingWhere.created_at[Op.lte] = new Date(endDate);
        }

        const total = await Booking.count({ where: bookingWhere });
        const confirmed = await Booking.count({ where: { ...bookingWhere, booking_status: 'confirmed' } });
        const cancelled = await Booking.count({ where: { ...bookingWhere, booking_status: 'cancelled' } });
        const completed = await Booking.count({ where: { ...bookingWhere, booking_status: 'completed' } });

        report = { total, confirmed, cancelled, completed };
        break;

      case 'revenue':
        // Reporte de ingresos
        const revenueWhere = { payment_status: 'confirmed' };
        if (startDate || endDate) {
          revenueWhere.created_at = {};
          if (startDate) revenueWhere.created_at[Op.gte] = new Date(startDate);
          if (endDate) revenueWhere.created_at[Op.lte] = new Date(endDate);
        }

        const bookings = await Booking.findAll({
          where: revenueWhere,
          attributes: ['total_price']
        });

        const totalRevenue = bookings.reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);
        const totalBookings = bookings.length;

        report = { totalRevenue, totalBookings };
        break;

      case 'properties':
        // Reporte de propiedades
        const totalProps = await Property.count();
        const published = await Property.count({ where: { status: 'published' } });
        const pending = await Property.count({ where: { status: 'pending_approval' } });
        const approved = await Property.count({ where: { status: 'approved' } });
        const rejected = await Property.count({ where: { status: 'rejected' } });
        const blocked = await Property.count({ where: { status: 'blocked' } });

        report = { total: totalProps, published, pending, approved, rejected, blocked };
        break;

      default:
        return res.status(400).json({ error: 'Tipo de reporte inválido' });
    }

    res.json({ report });
  } catch (error) {
    next(error);
  }
}
  // Métodos auxiliares
  async calculateCancellationRate() {
    const totalBookings = await Booking.count();
    const cancelledBookings = await Booking.count({
      where: { booking_status: 'cancelled' }
    });

    return totalBookings > 0 ? ((cancelledBookings / totalBookings) * 100).toFixed(2) : 0;
  }

  async getBookingsReport(startDate, endDate) {
    const where = {};
    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at[Op.gte] = new Date(startDate);
      if (endDate) where.created_at[Op.lte] = new Date(endDate);
    }

    const total = await Booking.count({ where });
    const confirmed = await Booking.count({ where: { ...where, booking_status: 'confirmed' } });
    const cancelled = await Booking.count({ where: { ...where, booking_status: 'cancelled' } });
    const completed = await Booking.count({ where: { ...where, booking_status: 'completed' } });

    return { total, confirmed, cancelled, completed };
  }

  async getRevenueReport(startDate, endDate) {
    const where = { payment_status: 'paid' };
    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at[Op.gte] = new Date(startDate);
      if (endDate) where.created_at[Op.lte] = new Date(endDate);
    }

    const result = await Booking.findAll({
      where,
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total_price')), 'totalRevenue'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalBookings']
      ]
    });

    return result[0] || { totalRevenue: 0, totalBookings: 0 };
  }

  async getPropertiesReport() {
    const total = await Property.count();
    const published = await Property.count({ where: { status: 'published' } });
    const pending = await Property.count({ where: { status: 'pending_approval' } });
    const approved = await Property.count({ where: { status: 'approved' } });
    const rejected = await Property.count({ where: { status: 'rejected' } });
    const blocked = await Property.count({ where: { status: 'blocked' } });

    return { total, published, pending, approved, rejected, blocked };
  }
}

module.exports = new AdminController();