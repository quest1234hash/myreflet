'use strict'; 

var Sequelize = require('sequelize');

var User = require('./user');
var admin = require('./admin');

var db = require('../services/database.js');

var schemaPurchaseDetaile = {
    purchase_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    plan_id: {
        type: Sequelize.INTEGER,
        references: {
            model: admin.tbl_verifier_plan_master,
            key: 'plan_id'
        }
    },
    reg_user_id: {
        type: Sequelize.INTEGER,
        references: {
            model: User.UserModel,
            key: 'reg_user_id'
        }
        
    },
    
    reflect_id:{
       type:Sequelize.INTEGER,
       references:{
            model: Reflect.MyReflectIdModel,
            key: 'reflect_id'
        },
        allowNull: true,
    },
    transaction_id: {
        type: Sequelize.STRING,
        allowNull: false
     },
    deleted_at:{
        type: Sequelize.DATE,
        allowNull: true
    }
};

var tbl_verfier_purchase_details = db.define('tbl_verfier_purchase_details',schemaPurchaseDetaile);

module.exports ={
    tbl_verfier_purchase_details
};