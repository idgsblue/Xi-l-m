const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PropertyAvailability = sequelize.define('PropertyAvailability', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  property_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'property_id',
    references: {
      model: 'properties',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_available'
  }
}, {
  tableName: 'property_availability',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['property_id', 'date']
    }
  ]
});

module.exports = PropertyAvailability;
