const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Property = sequelize.define('Property', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  host_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'host_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  accommodation_type_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'accommodation_type_id',
    references: {
      model: 'accommodation_types',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  price_per_night: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'price_per_night'
  },
  location: {
    type: DataTypes.STRING(255)
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING(20),
    validate: {
      isIn: [['inactive', 'published', 'blocked']]
    }
  },
  is_advertised: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_advertised'
  }
}, {
  tableName: 'properties',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Property;
