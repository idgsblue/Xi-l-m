const User = require('./User.model');
const AccommodationType = require('./AccommodationType.model');
const Property = require('./Property.model');
const PropertyImage = require('./PropertyImage.model');
const PropertyAvailability = require('./PropertyAvailability.model');
const Service = require('./Service.model');
const Booking = require('./Booking.model');
const PaymentTransaction = require('./PaymentTransaction.model');
const Review = require('./Review.model');
const UserVerificationCode = require('./UserVerificationCode.model');

// ========== RELACIONES ==========

// Usuario - Propiedades (Host)
User.hasMany(Property, { as: 'properties', foreignKey: 'host_id' });
Property.belongsTo(User, { as: 'host', foreignKey: 'host_id' });

// Tipo de Alojamiento - Propiedades
AccommodationType.hasMany(Property, { as: 'properties', foreignKey: 'accommodation_type_id' });
Property.belongsTo(AccommodationType, { as: 'accommodationType', foreignKey: 'accommodation_type_id' });

// Propiedad - Imágenes
Property.hasMany(PropertyImage, { as: 'images', foreignKey: 'property_id' });
PropertyImage.belongsTo(Property, { as: 'property', foreignKey: 'property_id' });

// Propiedad - Disponibilidad
Property.hasMany(PropertyAvailability, { as: 'availability', foreignKey: 'property_id' });
PropertyAvailability.belongsTo(Property, { as: 'property', foreignKey: 'property_id' });

// Propiedad - Servicios (Many-to-Many)
Property.belongsToMany(Service, {
  through: 'property_service_relations',
  as: 'services',
  foreignKey: 'property_id',
  otherKey: 'service_id',
  timestamps: false
});
Service.belongsToMany(Property, {
  through: 'property_service_relations',
  as: 'properties',
  foreignKey: 'service_id',
  otherKey: 'property_id',
  timestamps: false
});

// Usuario - Reservas (Guest)
User.hasMany(Booking, { as: 'bookings', foreignKey: 'guest_id' });
Booking.belongsTo(User, { as: 'guest', foreignKey: 'guest_id' });

// Propiedad - Reservas
Property.hasMany(Booking, { as: 'bookings', foreignKey: 'property_id' });
Booking.belongsTo(Property, { as: 'property', foreignKey: 'property_id' });

// Reserva - Transacciones de Pago
Booking.hasMany(PaymentTransaction, { as: 'transactions', foreignKey: 'booking_id' });
PaymentTransaction.belongsTo(Booking, { as: 'booking', foreignKey: 'booking_id' });

// Reserva - Reseñas
Booking.hasOne(Review, { as: 'review', foreignKey: 'booking_id' });
Review.belongsTo(Booking, { as: 'booking', foreignKey: 'booking_id' });

// Usuario - Códigos de Verificación
User.hasMany(UserVerificationCode, { as: 'verificationCodes', foreignKey: 'user_id' });
UserVerificationCode.belongsTo(User, { as: 'user', foreignKey: 'user_id' });

module.exports = {
  User,
  AccommodationType,
  Property,
  PropertyImage,
  PropertyAvailability,
  Service,
  Booking,
  PaymentTransaction,
  Review,
  UserVerificationCode
};
