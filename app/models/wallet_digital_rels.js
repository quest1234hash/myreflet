'use strict'; 

var Sequelize = require('sequelize');
    // bcrypt = require('bcrypt');
var User = require('./user');
var db = require('../services/database.js');
var Reflect = require('./reflect')

var digitalWalletRelsSchema = {
    dig_wallet_rel:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    parent_reflect_id: {
        type: Sequelize.INTEGER,
         references: {
            model: Reflect.MyReflectIdModel, 
            key: 'reflect_id'
        },
        allowNull: true
     },
    dig_wal_reflect_id: {
        type: Sequelize.INTEGER,
        references: {
            model: Reflect.MyReflectIdModel,
            key: 'reflect_id'
        },
        allowNull: true
    },
    reg_user_id:{
        type: Sequelize.INTEGER,
        references: {
            model: User.UserModel,
            key: 'reg_user_id'
        },
        allowNull: false
    },
    status:{
        type: Sequelize.ENUM,
         values: ['active','inactive'],
        defaultValue:'active'
    },
    deleted:{
        type: Sequelize.ENUM,
        values: ['0', '1'],
        defaultValue:'0'
    },
    wallet_address:{
        type:Sequelize.STRING,
        allowNull:false
    },
    wallet_name:{
        type:Sequelize.STRING,
        allowNull:true
    },
    balance:{
        type:Sequelize.STRING,
        defaultValue:'0',
    },
    digital_type:{
        type:Sequelize.STRING,
        allowNull:true
    }

};
/**Import wallet end**/

var DigitalWalletRelsModel = db.define('tbl_digital_wallet_rel',digitalWalletRelsSchema);
module.exports ={
    DigitalWalletRelsModel,
  
};