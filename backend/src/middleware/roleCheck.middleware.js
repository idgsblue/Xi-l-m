const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'No tienes permisos para realizar esta acción' 
      });
    }

    next();
  };
};

const isAdmin = checkRole('admin');
const isHost = checkRole('host', 'admin');
const isGuest = checkRole('guest', 'host', 'admin');

module.exports = {
  checkRole,
  isAdmin,
  isHost,
  isGuest
};