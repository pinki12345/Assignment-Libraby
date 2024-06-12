'use strict';
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class otp extends Model {
    static associate(models) {
    }
  }
  otp.init({
    email: DataTypes.STRING,
    otp: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'otp',
  });
  return otp;
};