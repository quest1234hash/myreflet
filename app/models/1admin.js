'use strict'; 

var Sequelize = require('sequelize');

var User = require('./user');
var db = require('../services/database.js');

var schemaPlanMaster = {
    plan_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    plan_name: {
        type: Sequelize.STRING,
        allowNull: false
     },
     plan_price: {
        type: Sequelize.DOUBLE,
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

var tbl_verifier_plan_master = db.define('tbl_verifier_plan_master',schemaPlanMaster);

var AdminModelDefinition = {
    admin_user_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    first_name: {
        type: Sequelize.STRING,
        allowNull: false
     },
     last_name: {
        type: Sequelize.STRING,
        allowNull: false
     },
    email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    mobile_number: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    profile_pic:{
        type: Sequelize.BLOB,
        default:'long',
        allowNull:true
    },
    status:{
        type: Sequelize.ENUM,
        values: ['active', 'inactive', 'block'],
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

var AdminModel = db.define('tbl_admin_registration',AdminModelDefinition);

module.exports ={
    tbl_verifier_plan_master,AdminModel
};