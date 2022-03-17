'use strict'; 

var Sequelize = require('sequelize');
    // bcrypt = require('bcrypt');
var User = require('./user');
var Reflect = require('./reflect')
var db = require('../services/database.js');
var CategoryModel=require("./verifier_category");
var Reflect = require('./reflect')
var {ClientVerificationModel,RequestDocumentsModel,RequestFilesModel} = require('./request');

// var {FilesDocModel}=require("./reflect");
// 'use strict'; 

// var Sequelize = require('sequelize');
//     // bcrypt = require('bcrypt');
// var User = require('./user');
// var db = require('../services/database.js');

var subverifierDefinition = {
    invite_sub_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    reg_user_id:{
        type: Sequelize.INTEGER,
        references: {
            model: User.UserModel,
            key: 'reg_user_id'
        },
        allowNull: false
    },
    sub_verifier_id:{
        type: Sequelize.INTEGER,
        references: {
            model: User.UserModel,
            key: 'reg_user_id'
        },
        allowNull: true
    },
    sub_verifier_reflectId:{
        type: Sequelize.INTEGER,
        references: {
            model: Reflect.MyReflectIdModel,
            key: 'reflect_id'
        },
        allowNull: true
    },
    email:
    {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true
    },
    invite_status:{
        type: Sequelize.ENUM,
        values: ['pending', 'accept', 'reject'],
        defaultValue:'pending'
    },
    status:{
        type: Sequelize.ENUM,
        values: ['active', 'inactive'],
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

var InviteSubVerifier = db.define('tbl_invite_sub_verifier',subverifierDefinition);

var subVerifierClient = {
    sub_client_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    sub_verifier_reflect_id:{
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
     sub_verifier_reg_id:{
        type: Sequelize.INTEGER,
        references: {
            model: User.UserModel,
            key: 'reg_user_id'
        },
        allowNull: true
    },
    client_request_id:{
        type: Sequelize.INTEGER,
        references: {
            model: ClientVerificationModel.request_id,
            key: 'request_id'
        },
        allowNull: false
    },
    sub_client_status:{
        type: Sequelize.ENUM,
        values: ['active', 'inactive'],
        defaultValue:'active'
    },
    deleted:{
        type: Sequelize.ENUM,
        values: ['0', '1'],
        defaultValue:'0'
    },
    // deleted_at:{
    //     type: Sequelize.DATE,
    //     allowNull: true
    // }
    // status:{
    //     type: Sequelize.ENUM,
    //     values: ['pending', 'completed'],
    //     defaultValue:'pending'
    // }
}
var SubVerifierClient = db.define('tbl_sub_verifier_client',subVerifierClient);

module.exports ={
    InviteSubVerifier,
    SubVerifierClient
 
};
