const jwt = require('jsonwebtoken');

class JWTService {
  generateTokens(userId, role) {
    const payload = { userId, role };
    
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '30m' }
    );
    
    const refreshToken = jwt.sign(
      { userId },
      process.env.REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    
    return { accessToken, refreshToken };
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }

  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.REFRESH_SECRET);
    } catch (error) {
      throw new Error('Refresh token inválido o expirado');
    }
  }

  decodeToken(token) {
    return jwt.decode(token);
  }
}

module.exports = new JWTService();