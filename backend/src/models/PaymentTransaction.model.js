const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PaymentTransaction = sequelize.define('PaymentTransaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  booking_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'booking_id',
    references: {
      model: 'bookings',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  platform_commission: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'platform_commission'
  },
  payment_method: {
    type: DataTypes.STRING(50),
    field: 'payment_method'
  },
  transaction_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'transaction_date'
  },
  status: {
    type: DataTypes.STRING(20),
    validate: {
      isIn: [['success', 'failed', 'pending']]
    }
  }
}, {
  tableName: 'payment_transactions',
  timestamps: false
});

module.exports = PaymentTransaction;
