const User = require('./User.model');
const Property = require('./Property.model');
const Booking = require('./Booking.model');
const Payment = require('./Payment.model');

// Definir relaciones
// Usuario - Propiedades (Anfitrión)
User.hasMany(Property, { as: 'properties', foreignKey: 'hostId' });
Property.belongsTo(User, { as: 'host', foreignKey: 'hostId' });

// Usuario - Reservas (Huésped)
User.hasMany(Booking, { as: 'bookingsAsGuest', foreignKey: 'guestId' });
Booking.belongsTo(User, { as: 'guest', foreignKey: 'guestId' });

// Usuario - Reservas (Anfitrión)
User.hasMany(Booking, { as: 'bookingsAsHost', foreignKey: 'hostId' });
Booking.belongsTo(User, { as: 'host', foreignKey: 'hostId' });

// Propiedad - Reservas
Property.hasMany(Booking, { as: 'bookings', foreignKey: 'propertyId' });
Booking.belongsTo(Property, { as: 'property', foreignKey: 'propertyId' });

// Reserva - Pagos
Booking.hasOne(Payment, { as: 'payment', foreignKey: 'bookingId' });
Payment.belongsTo(Booking, { as: 'booking', foreignKey: 'bookingId' });

// Usuario - Pagos
User.hasMany(Payment, { as: 'payments', foreignKey: 'userId' });
Payment.belongsTo(User, { as: 'user', foreignKey: 'userId' });

module.exports = {
  User,
  Property,
  Booking,
  Payment
};