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
      attributes: { exclude: ['password'] }
    });

    if (!user || !user.status) {
      return res.status(401).json({ error: 'Usuario no válido o cuenta desactivada' });
    }

    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;

    console.log('User ID:', req.userId);
console.log('User Role:', req.user?.role);
    
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

    if (!user || !user.status) {
      return res.status(401).json({ error: 'Usuario no válido o cuenta desactivada' });
    }

    // En el nuevo schema no guardamos refresh tokens en la BD
    // Solo generamos nuevos tokens
    const tokens = jwtService.generateTokens(user.id, user.role);

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    res.status(401).json({ error: 'Refresh token inválido o expirado' });
  }
};

module.exports = { authenticate, refreshToken };