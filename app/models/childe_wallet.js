'use strict'; 

var Sequelize = require('sequelize');
    // bcrypt = require('bcrypt');
var User = require('./user');
var db = require('../services/database.js');
var Reflect = require('./reflect')

var childWalletSchama = {
    child_wallet_id:{
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
        allowNull: false
     },
    child_reflect_id: {
        type: Sequelize.INTEGER,
        references: {
            model: Reflect.MyReflectIdModel,
            key: 'reflect_id'
        },
        allowNull: false
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
    // deleted:{
    //     type: Sequelize.ENUM,
    //     values: ['0', '1'],
    //     defaultValue:'0'
    // },
    // deleted_at:{
    //     type: Sequelize.DATE,
    //     allowNull: true
    // }
};
/**Import wallet end**/

var childWalletModel = db.define('tbl_child_wallets',childWalletSchama);
module.exports ={
    childWalletModel,
  
};