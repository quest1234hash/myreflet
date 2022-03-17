'use strict'; 

var Sequelize = require('sequelize');
var MyReflectIdModel = require('./reflect');

var User = require('./user');
var db = require('../services/database.js');
var  DocumentMasterModel = require('./master');

var Request = require('./request')
var Reflect = require('./reflect')

var modelValidatore = {

    validatore_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    // reg_user_id: {
    //     type: Sequelize.STRING,
    //     allowNull: false
    //  },
     reg_user_id: {
        type: Sequelize.INTEGER,
        references: {
            model: User.UserModel,
            key: 'reg_user_id'
        },
        allowNull: false
    },
    doc_id: {
        type: Sequelize.INTEGER,
        references: {
            model: DocumentMasterModel.DocumentMasterModel,
            key: 'doc_id'
        },
        allowNull: false
    },
    // reflect_id: {
    //     type: Sequelize.INTEGER,
    //     references: {
    //         model: MyReflectIdModel.MyReflectIdModel,
    //         key: 'reflect_id'
    //     },
    //     allowNull: true
    // },
    // notification_type:{
    //     type: Sequelize.ENUM,
    //     values: ['1','2','3','4','5','6']
       
    // },
    // notification_date:{
    //     type: Sequelize.DATE,
    //     allowNull:true
    // },
    // read_status:{
    //     type: Sequelize.ENUM,
    //     values: ['yes', 'no'],
    //     defaultValue:'no'
    // },
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
     createdAt:{
        type: Sequelize.DATE,
        allowNull: true
    },
    updatedAt:{
        type: Sequelize.DATE,
        allowNull: true
    }
    
};

var validatoreModel = db.define('tbl_validatore_rel',modelValidatore);


var validatoreRquests = {

    validatore_req_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
   
    validatore_id: {
        type: Sequelize.INTEGER,
        references: {
            model: validatoreModel,
            key: 'validatore_id'
        },
        allowNull: false
    },
    doc_id: {
        type: Sequelize.INTEGER,
        references: {
            model: DocumentMasterModel.DocumentMasterModel,
            key: 'doc_id'
        },
        allowNull: false
    },
    reflect_id: {
        type: Sequelize.INTEGER,
        references: {
            model: MyReflectIdModel.MyReflectIdModel,
            key: 'reflect_id'
        },
        allowNull: false
    },
    request_id: {
        type: Sequelize.INTEGER,
        references: {
            model: Request.ClientVerificationModel,
            key: 'request_id'
        },
        allowNull: false
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
    
};

var tbl_validatore_requests = db.define('tbl_validatore_requests',validatoreRquests);



var validatoreRquestsDocFile = {

    validatore_req_doc_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
   
    validatore_req_id: {
        type: Sequelize.INTEGER,
        references: {
            model: tbl_validatore_requests,
            key: 'validatore_id'
        },
        allowNull: false
    },
    doc_id: {
        type: Sequelize.INTEGER,
        references: {
            model: DocumentMasterModel.DocumentMasterModel,
            key: 'doc_id'
        },
        allowNull: false
    },
    // reflect_id: {
    //     type: Sequelize.INTEGER,
    //     references: {
    //         model: MyReflectIdModel.MyReflectIdModel,
    //         key: 'reflect_id'
    //     },
    //     allowNull: false
    // },
    request_id: {
        type: Sequelize.INTEGER,
        references: {
            model: Request.ClientVerificationModel,
            key: 'request_id'
        },
        allowNull: false
    },
    file_hase:{
        type: Sequelize.STRING,
        allowNull: true
    },
    doc_type:{
        type: Sequelize.ENUM,
        values: ['image', 'video','pdf'],
        defaultValue: null,
    },
    status:{
        type: Sequelize.ENUM,
        values: ['accept', 'reject'],
        defaultValue:'accept'
    },
    deleted:{
        type: Sequelize.ENUM,
        values: ['0', '1'],
        defaultValue:'0'
    },
    
};

var tbl_validatore_requests_doc_files = db.define('tbl_validatore_requests_doc_files',validatoreRquestsDocFile);


var notificationDefinition = {

    notification_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    notification_msg: {
        type: Sequelize.STRING,
        allowNull: false
     },
    sender_id: {
        type: Sequelize.INTEGER,
        references: {
            model: User.UserModel,
            key: 'reg_user_id'
        },
        allowNull: true
    },
    receiver_id: {
        type: Sequelize.INTEGER,
        references: {
            model: User.UserModel,
            key: 'reg_user_id'
        },
        allowNull: false
    },
    reflect_id:{
        type: Sequelize.INTEGER,
        references: {
            model: Reflect.MyReflectIdModel,
            key: 'reflect_id'
        },
        allowNull: true
    },
    notification_type:{
        type: Sequelize.ENUM,
        values: ['1','2']
       
    },
    notification_date:{
        type: Sequelize.DATE,
        allowNull:false
    },
    read_status:{
        type: Sequelize.ENUM,
        values: ['yes', 'no'],
        defaultValue:'no'
    },
     deleted:{
        type: Sequelize.ENUM,
        values: ['0', '1'],
        defaultValue:'0'
    },
    createdAt:{
        type: Sequelize.DATE,
        allowNull: true
    },
    updatedAt:{
        type: Sequelize.DATE,
        allowNull: true
    }
};

var ValidatorNotificationModel = db.define('tbl_validator_notifications',notificationDefinition);

module.exports ={
    validatoreModel,
    tbl_validatore_requests,
    tbl_validatore_requests_doc_files,ValidatorNotificationModel
};
