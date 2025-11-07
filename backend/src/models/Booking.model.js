const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  property_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'property_id',
    references: {
      model: 'properties',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  guest_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'guest_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  check_in_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'check_in_date'
  },
  check_out_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'check_out_date'
  },
  total_guests: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'total_guests'
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_price'
  },
  payment_status: {
    type: DataTypes.STRING(20),
    field: 'payment_status',
    validate: {
      isIn: [['pending', 'confirmed', 'rejected', 'cancelled']]
    }
  },
  booking_status: {
    type: DataTypes.STRING(20),
    field: 'booking_status',
    validate: {
      isIn: [['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']]
    }
  },
  stripe_payment_intent_id: {
    type: DataTypes.STRING(255),
    field: 'stripe_payment_intent_id'
  },
  cancellation_reason: {
    type: DataTypes.TEXT,
    field: 'cancellation_reason'
  },
  cancelled_at: {
    type: DataTypes.DATE,
    field: 'cancelled_at'
  }
}, {
  tableName: 'bookings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  validate: {
    checkDates() {
      if (this.check_out_date <= this.check_in_date) {
        throw new Error('Check-out date must be after check-in date');
      }
    }
  }
});

module.exports = Booking;
