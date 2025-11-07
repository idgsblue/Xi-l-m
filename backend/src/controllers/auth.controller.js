const { User } = require('../models');
const jwtService = require('../services/jwt.service');
const emailService = require('../services/email.service');
const crypto = require('crypto');

class AuthController {
  async register(req, res, next) {
    try {
      const { name, full_name, email, password, phone, role = 'guest' } = req.body;

      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: 'El email ya está registrado' });
      }

      // Crear usuario
      const user = await User.create({
        full_name: full_name || name, // Usar full_name o name para compatibilidad
        email,
        password,
        phone,
        role: role === 'host' ? 'host' : 'guest', // Solo permitir guest o host
        status: true,
        email_verified: false
      });

      // Generar tokens
      const tokens = jwtService.generateTokens(user.id, user.role);

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: user.toJSON(),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Buscar usuario
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Verificar contraseña
      const isValidPassword = await user.validatePassword(password);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Verificar si está activo
      if (!user.status) {
        return res.status(403).json({ error: 'Cuenta desactivada' });
      }

      // Generar tokens
      const tokens = jwtService.generateTokens(user.id, user.role);

      // Actualizar last_login
      user.last_login = new Date();
      await user.save();

      res.json({
        message: 'Inicio de sesión exitoso',
        user: user.toJSON(),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      // En el nuevo schema no guardamos refresh tokens en la BD
      // Solo enviamos respuesta exitosa
      res.json({ message: 'Sesión cerrada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await User.findByPk(req.userId, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({ user });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const { name, full_name, phone } = req.body;
      const user = await User.findByPk(req.userId);

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Actualizar solo campos permitidos
      if (full_name) user.full_name = full_name;
      if (name && !full_name) user.full_name = name; // Compatibilidad con nombre anterior
      if (phone) user.phone = phone;

      await user.save();

      res.json({
        message: 'Perfil actualizado exitosamente',
        user: user.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findByPk(req.userId);

      // Verificar contraseña actual
      const isValid = await user.validatePassword(currentPassword);
      if (!isValid) {
        return res.status(401).json({ error: 'Contraseña actual incorrecta' });
      }

      // Actualizar contraseña
      user.password = newPassword;
      await user.save();

      res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ where: { email } });

      if (!user) {
        // Por seguridad, no revelar si el email existe
        return res.json({
          message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña'
        });
      }

      // Generar código de recuperación (6 dígitos)
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 3600000); // 1 hora

      // Guardar código en user_verification_codes
      const { UserVerificationCode } = require('../models');
      await UserVerificationCode.upsert({
        user_id: user.id,
        code: resetCode,
        code_type: 'password_reset',
        expires_at: expiresAt,
        is_used: false
      });

      // Enviar email
      await emailService.sendPasswordReset(user, resetCode);

      res.json({
        message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña'
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(req, res, next) {
    try {
      const userId = req.userId;
      const { password, reason } = req.body;

      // Buscar usuario
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Verificar contraseña para seguridad
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Contraseña incorrecta' });
      }

      // Verificar si tiene reservas activas
      const { Booking } = require('../models');
      const activeBookings = await Booking.count({
        where: {
          guest_id: userId,
          booking_status: ['pending', 'confirmed', 'in_progress'],
          check_out_date: {
            [require('sequelize').Op.gte]: new Date()
          }
        }
      });

      if (activeBookings > 0) {
        return res.status(400).json({
          error: 'No puedes eliminar tu cuenta con reservas activas',
          activeBookings
        });
      }

      // Si es anfitrión, verificar propiedades con reservas activas
      if (user.role === 'host') {
        const { Property } = require('../models');
        const hostProperties = await Property.findAll({
          where: { host_id: userId },
          attributes: ['id']
        });

        const propertyIds = hostProperties.map(p => p.id);

        if (propertyIds.length > 0) {
          const activeHostBookings = await Booking.count({
            where: {
              property_id: propertyIds,
              booking_status: ['pending', 'confirmed', 'in_progress'],
              check_out_date: {
                [require('sequelize').Op.gte]: new Date()
              }
            }
          });

          if (activeHostBookings > 0) {
            return res.status(400).json({
              error: 'No puedes eliminar tu cuenta con reservas activas en tus propiedades',
              activeBookings: activeHostBookings
            });
          }
        }

        // Marcar propiedades como inactivas (no eliminar por historial)
        await Property.update(
          { status: 'inactive' },
          { where: { host_id: userId } }
        );
      }

      // Registrar motivo de eliminación (opcional, para análisis)
      console.log(`Usuario ${user.email} eliminó su cuenta. Motivo: ${reason || 'No especificado'}`);

      // IMPORTANTE: No eliminamos bookings completados (requisito fiscal/legal)
      // Solo marcamos las reservas canceladas
      await Booking.update(
        {
          booking_status: 'cancelled',
          cancellation_reason: 'Cuenta eliminada por el usuario',
          cancelled_at: new Date()
        },
        {
          where: {
            guest_id: userId,
            booking_status: 'pending'
          }
        }
      );

      // Eliminar datos personales pero mantener registro anónimo
      await user.update({
        full_name: 'Usuario Eliminado',
        email: `deleted_${userId}_${Date.now()}@deleted.local`,
        phone: null,
        password: 'DELETED',
        status: false
      });

      // Nota: En producción real, considera:
      // - Eliminar completamente después de período de retención legal (ej: 30 días)
      // - Mantener registros de transacciones por requisitos fiscales (5-7 años)
      // - Anonimizar en lugar de eliminar completamente

      res.json({
        message: 'Tu cuenta ha sido eliminada exitosamente',
        note: 'Los registros de transacciones completadas se mantendrán por requisitos legales'
      });

    } catch (error) {
      console.error('Error eliminando cuenta:', error);
      next(error);
    }
  }
}

module.exports = new AuthController();