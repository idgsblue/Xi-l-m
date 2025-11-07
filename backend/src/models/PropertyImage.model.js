const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PropertyImage = sequelize.define('PropertyImage', {
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
  image_url: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'image_url'
  },
  is_main: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_main'
  }
}, {
  tableName: 'property_images',
  timestamps: false
});

module.exports = PropertyImage;
