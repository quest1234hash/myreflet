'use strict'; 

var Sequelize = require('sequelize');
    // bcrypt = require('bcrypt');
var User = require('./user');
var Reflect = require('./reflect')
var db = require('../services/database.js');

var clientVerificationDefinition = {
    request_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    verifier_id:{
        type: Sequelize.INTEGER,
        references: {
            model: User.UserModel,
            key: 'reg_user_id'
        },
        allowNull: false
    },
    verifer_my_reflect_id:{
        type: Sequelize.INTEGER,
        references: {
            model: Reflect.MyReflectIdModel,
            key: 'reflect_id'
        },
        allowNull: true
    },
    reflect_id:{
        type: Sequelize.INTEGER,
        references: {
            model: Reflect.MyReflectIdModel,
            key: 'reflect_id'
        },
        allowNull: true
    },
    client_id:{
        type: Sequelize.INTEGER,
        references: {
            model: User.UserModel,
            key: 'reg_user_id'
        },
        allowNull: false
    },
    request_status:{
        type: Sequelize.ENUM,
        values: ['pending', 'accept', 'reject'],
        defaultValue:'pending'
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

var ClientVerificationModel = db.define('tbl_client_verification_request',clientVerificationDefinition);

var requestDocumentsDefinition = {
    request_doc_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    request_id:{
        type: Sequelize.INTEGER,
        references: {
            model: ClientVerificationModel,
            key: 'request_id'
        },
        allowNull: false
    },
    user_doc_id:{
        type: Sequelize.INTEGER,
        references: {
            model: Reflect.DocumentReflectIdModel,
            key: 'user_doc_id'
        },
        allowNull: false
    },
    download: {
        type: Sequelize.ENUM,
        values: ['yes','no'],
        defaultValue:'no'
    },
    view: {
        type: Sequelize.ENUM,
        values: ['yes','no'],
        defaultValue:'no'
    },
    certified: {
        type: Sequelize.ENUM,
        values: ['yes','no'],
        defaultValue:'no'
    },
    approve_status: {
        type: Sequelize.ENUM,
        values: ['approved','rejected','pending'],
        defaultValue:'pending'
    },
    message:{
        type: Sequelize.STRING,
        allowNull: true
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

var RequestDocumentsModel = db.define('tbl_request_document',requestDocumentsDefinition);

module.exports ={
    ClientVerificationModel,
    RequestDocumentsModel 
};