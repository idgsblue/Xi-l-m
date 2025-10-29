const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'MXN'
  },
  stripePaymentIntentId: {
    type: DataTypes.STRING,
    unique: true
  },
  stripePaymentMethodId: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'succeeded', 'failed', 'refunded'),
    defaultValue: 'pending'
  },
  refundAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  refundReason: {
    type: DataTypes.TEXT
  },
  bookingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Bookings',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  timestamps: true
});

module.exports = Payment;