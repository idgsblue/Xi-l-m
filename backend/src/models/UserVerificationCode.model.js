const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserVerificationCode = sequelize.define('UserVerificationCode', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  code: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  code_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'code_type',
    validate: {
      isIn: [['email_verification', 'password_reset']]
    }
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at'
  },
  is_used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_used'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'user_verification_codes',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'code_type']
    }
  ]
});

module.exports = UserVerificationCode;
