const jwtService = require('../services/jwt.service');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const decoded = jwtService.verifyAccessToken(token);
    
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password', 'refreshToken'] }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Usuario no válido' });
    }

    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;
    
    next();
  } catch (error) {
    if (error.message.includes('expired')) {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(401).json({ error: 'Token inválido' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token requerido' });
    }

    const decoded = jwtService.verifyRefreshToken(refreshToken);
    
    const user = await User.findByPk(decoded.userId);
    
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: 'Refresh token inválido' });
    }

    const tokens = jwtService.generateTokens(user.id, user.role);
    
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    res.status(401).json({ error: 'Refresh token inválido o expirado' });
  }
};

module.exports = { authenticate, refreshToken };