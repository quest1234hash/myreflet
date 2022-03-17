'use strict'; 

var Sequelize = require('sequelize');

var User = require('./user');
var MyReflectIdModel = require('./reflect');

var  DocumentMasterModel = require('./master');

var db = require('../services/database.js');

var schemaAddressBook = {
    address_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    verifier_code: {
        type: Sequelize.STRING,
        allowNull: false
     },
     lable_name: {
        type: Sequelize.STRING,
        allowNull: false
     },
     reg_user_id: {
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
    deleted_at:{
        type: Sequelize.DATE,
        allowNull: true
    }
};

var tbl_address_book = db.define('tbl_address_book',schemaAddressBook);


module.exports ={
    tbl_address_book,
     
};