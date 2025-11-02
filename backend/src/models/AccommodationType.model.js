const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AccommodationType = sequelize.define('AccommodationType', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  min_price: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'min_price'
  },
  max_price: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'max_price'
  },
  platform_commission_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    field: 'platform_commission_percentage'
  }
}, {
  tableName: 'accommodation_types',
  timestamps: false
});

module.exports = AccommodationType;
