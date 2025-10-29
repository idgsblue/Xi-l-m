const { User } = require('../models');
const jwtService = require('../services/jwt.service');
const emailService = require('../services/email.service');
const crypto = require('crypto');

class AuthController {
  async register(req, res, next) {
    try {
      const { name, email, password, phone, role = 'guest' } = req.body;

      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: 'El email ya está registrado' });
      }

      // Crear usuario
      const user = await User.create({
        name,
        email,
        password,
        phone,
        role: role === 'host' ? 'host' : 'guest' // Solo permitir guest o host
      });

      // Generar tokens
      const tokens = jwtService.generateTokens(user.id, user.role);
      
      // Guardar refresh token
      user.refreshToken = tokens.refreshToken;
      await user.save();

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
      if (!user.isActive) {
        return res.status(403).json({ error: 'Cuenta desactivada' });
      }

      // Generar tokens
      const tokens = jwtService.generateTokens(user.id, user.role);
      
      // Actualizar refresh token
      user.refreshToken = tokens.refreshToken;
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
      const user = await User.findByPk(req.userId);
      
      if (user) {
        user.refreshToken = null;
        await user.save();
      }

      res.json({ message: 'Sesión cerrada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await User.findByPk(req.userId, {
        attributes: { exclude: ['password', 'refreshToken'] }
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
      const { name, phone } = req.body;
      const user = await User.findByPk(req.userId);

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Actualizar solo campos permitidos
      if (name) user.name = name;
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

      // Generar token de recuperación
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

      // Guardar token (en producción, usar una tabla separada)
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpiry = resetTokenExpiry;
      await user.save();

      // Enviar email
      await emailService.sendPasswordReset(user, resetToken);

      res.json({ 
        message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña' 
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();