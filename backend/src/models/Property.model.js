const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Property = sequelize.define('Property', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [10, 1000]
    }
  },
  shortDescription: {
    type: DataTypes.STRING(300),
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  zone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pricePerNight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  maxGuests: {
    type: DataTypes.INTEGER,
    defaultValue: 2,
    validate: {
      min: 1,
      max: 20
    }
  },
  bedrooms: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  bathrooms: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  amenities: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    validate: {
      arrayMaxLength(value) {
        if (value.length > 5) {
          throw new Error('Máximo 5 imágenes permitidas');
        }
      }
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  rejectionReason: {
    type: DataTypes.TEXT
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  hostId: {
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

module.exports = Property;