const { Property, User, Booking, Payment } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const emailService = require('../services/email.service');

class AdminController {
  // Dashboard con estadísticas
  async getDashboard(req, res, next) {
    try {
      // Estadísticas generales
      const [
        totalUsers,
        totalProperties,
        totalBookings,
        pendingProperties,
        totalRevenue
      ] = await Promise.all([
        User.count(),
        Property.count({ where: { status: 'approved' } }),
        Booking.count({ where: { status: 'confirmed' } }),
        Property.count({ where: { status: 'pending' } }),
        Payment.sum('amount', { where: { status: 'succeeded' } })
      ]);

      // Estadísticas por mes (últimos 6 meses)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const monthlyBookings = await Booking.findAll({
        where: {
          createdAt: { [Op.gte]: sixMonthsAgo },
          status: 'confirmed'
        },
        attributes: [
          [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'month'],
          [sequelize.fn('COUNT', '*'), 'count'],
          [sequelize.fn('SUM', sequelize.col('totalPrice')), 'revenue']
        ],
        group: ['month'],
        order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'ASC']]
      });

      // Propiedades más reservadas
      const topProperties = await Property.findAll({
        attributes: [
          'id',
          'name',
          [sequelize.fn('COUNT', sequelize.col('bookings.id')), 'bookingCount']
        ],
        include: [{
          model: Booking,
          as: 'bookings',
          attributes: [],
          where: { status: 'confirmed' },
          required: false
        }],
        group: ['Property.id'],
        order: [[sequelize.fn('COUNT', sequelize.col('bookings.id')), 'DESC']],
        limit: 5
      });

      res.json({
        stats: {
          totalUsers,
          totalProperties,
          totalBookings,
          pendingProperties,
          totalRevenue: totalRevenue || 0
        },
        monthlyBookings,
        topProperties
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener propiedades pendientes de aprobación
  async getPendingProperties(req, res, next) {
    try {
      const properties = await Property.findAll({
        where: { status: 'pending' },
        include: [{
          model: User,
          as: 'host',
          attributes: ['id', 'name', 'email']
        }],
        order: [['createdAt', 'ASC']]
      });

      res.json({ properties });
    } catch (error) {
      next(error);
    }
  }

  // Aprobar propiedad
  async approveProperty(req, res, next) {
    try {
      const { id } = req.params;
      
      const property = await Property.findByPk(id, {
        include: [{
          model: User,
          as: 'host'
        }]
      });

      if (!property) {
        return res.status(404).json({ error: 'Propiedad no encontrada' });
      }

      if (property.status !== 'pending') {
        return res.status(400).json({ 
          error: `La propiedad ya está ${property.status === 'approved' ? 'aprobada' : 'rechazada'}` 
        });
      }

      property.status = 'approved';
      property.rejectionReason = null;
      await property.save();

      // Enviar email al anfitrión
      await emailService.sendPropertyApproval(property, property.host, true);

      res.json({
        message: 'Propiedad aprobada exitosamente',
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

      if (!reason) {
        return res.status(400).json({ error: 'Se requiere una razón para el rechazo' });
      }
      
      const property = await Property.findByPk(id, {
        include: [{
          model: User,
          as: 'host'
        }]
      });

      if (!property) {
        return res.status(404).json({ error: 'Propiedad no encontrada' });
      }

      if (property.status !== 'pending') {
        return res.status(400).json({ 
          error: `La propiedad ya está ${property.status === 'approved' ? 'aprobada' : 'rechazada'}` 
        });
      }

      property.status = 'rejected';
      property.rejectionReason = reason;
      await property.save();

      // Enviar email al anfitrión
      await emailService.sendPropertyApproval(property, property.host, false, reason);

      res.json({
        message: 'Propiedad rechazada',
        property
      });
    } catch (error) {
      next(error);
    }
  }

  // Gestión de usuarios
  async getUsers(req, res, next) {
    try {
      const { role, isActive, search } = req.query;

      const where = {};
      
      if (role) where.role = role;
      if (isActive !== undefined) where.isActive = isActive === 'true';
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const users = await User.findAll({
        where,
        attributes: { exclude: ['password', 'refreshToken'] },
        order: [['createdAt', 'DESC']]
      });

      res.json({ users });
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

      if (user.role === 'admin') {
        return res.status(400).json({ error: 'No se puede desactivar un administrador' });
      }

      user.isActive = isActive;
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

      if (!['guest', 'host', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Rol inválido' });
      }

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      user.role = role;
      await user.save();

      res.json({
        message: 'Rol actualizado exitosamente',
        user: user.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  // Configurar rangos de precios por zona
  async setPriceRange(req, res, next) {
    try {
      const { zone, minPrice, maxPrice } = req.body;

      // Aquí podrías crear una tabla de configuración para rangos de precios
      // Por ahora, actualizamos las propiedades existentes

      const result = await Property.update(
        { 
          pricePerNight: sequelize.literal(
            `CASE 
              WHEN "pricePerNight" < ${minPrice} THEN ${minPrice}
              WHEN "pricePerNight" > ${maxPrice} THEN ${maxPrice}
              ELSE "pricePerNight"
            END`
          )
        },
        { 
          where: { 
            zone: { [Op.iLike]: `%${zone}%` }
          }
        }
      );

      res.json({
        message: 'Rango de precios actualizado',
        affectedProperties: result[0],
        range: { zone, minPrice, maxPrice }
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener todas las reservas
  async getAllBookings(req, res, next) {
    try {
      const { status, startDate, endDate } = req.query;

      const where = {};
      
      if (status) where.status = status;
      if (startDate && endDate) {
        where.checkIn = {
          [Op.between]: [startDate, endDate]
        };
      }

      const bookings = await Booking.findAll({
        where,
        include: [
          { model: Property, as: 'property' },
          { model: User, as: 'guest', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'host', attributes: ['id', 'name', 'email'] },
          { model: Payment, as: 'payment' }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json({ bookings });
    } catch (error) {
      next(error);
    }
  }

  // Generar reporte
  async generateReport(req, res, next) {
    try {
      const { startDate, endDate, type } = req.query;

      let report = {};

      switch (type) {
        case 'bookings':
          report = await this.getBookingsReport(startDate, endDate);
          break;
        case 'revenue':
          report = await this.getRevenueReport(startDate, endDate);
          break;
        case 'properties':
          report = await this.getPropertiesReport();
          break;
        default:
          return res.status(400).json({ error: 'Tipo de reporte inválido' });
      }

      res.json({ report });
    } catch (error) {
      next(error);
    }
  }

  // Reporte de reservas
  async getBookingsReport(startDate, endDate) {
    const bookings = await Booking.findAll({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: ['property', 'guest', 'payment']
    });

    const stats = {
      total: bookings.length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      totalRevenue: bookings
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + parseFloat(b.totalPrice), 0)
    };

    return { bookings, stats };
  }

  // Reporte de ingresos
  async getRevenueReport(startDate, endDate) {
    const payments = await Payment.findAll({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate]
        },
        status: 'succeeded'
      },
      include: [{
        model: Booking,
        as: 'booking',
        include: ['property']
      }]
    });

    const totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const refundedAmount = payments.reduce((sum, p) => sum + parseFloat(p.refundAmount || 0), 0);

    return {
      totalRevenue,
      refundedAmount,
      netRevenue: totalRevenue - refundedAmount,
      payments
    };
  }

  // Reporte de propiedades
  async getPropertiesReport() {
    const properties = await Property.findAll({
      include: [{
        model: Booking,
        as: 'bookings',
        where: { status: 'confirmed' },
        required: false
      }]
    });

    const stats = {
      total: properties.length,
      approved: properties.filter(p => p.status === 'approved').length,
      pending: properties.filter(p => p.status === 'pending').length,
      rejected: properties.filter(p => p.status === 'rejected').length,
      averagePrice: properties.reduce((sum, p) => sum + parseFloat(p.pricePerNight), 0) / properties.length
    };

    return { properties, stats };
  }
}

module.exports = new AdminController();