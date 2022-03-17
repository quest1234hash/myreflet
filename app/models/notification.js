'use strict'; 

var Sequelize = require('sequelize');
    // bcrypt = require('bcrypt');
var User = require('./user');
var Request = require('./request');


var db = require('../services/database.js');

var modelDefinition = {

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
    request_id:{
        type: Sequelize.INTEGER,
        references: {
            model:Request.ClientVerificationModel,
            key:'request_id'
        },
        allowNull: true
    },
    notification_type:{
        type: Sequelize.ENUM,
        values: ['1','2','3','4','5','6','7','8','9','10','11']
       
    },
    // 1 - request create, 2 - accept request, 3 - reject request, 4 -  client/verifier create msg, 5 - Complaint,
     // 6 - update request, 7 - when admin accept/reject doc request ,
    //  8 -  when admin accept/reject document of verifier , 9-verfier to client doc request,10-for sub verifier,
    // 11 - shared Document
    notification_date:{
        type: Sequelize.DATE,
        allowNull:false
    },
    read_status:{
        type: Sequelize.ENUM,
        values: ['yes', 'no'],
        defaultValue:'no'
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
    },
    subject:{
        type:Sequelize.STRING,
        allowNull: true
     },
     profile_pic:{
        type: Sequelize.STRING,
        allowNull: true
    }
};

var NotificationModel = db.define('tbl_notifications',modelDefinition);


var registrationTokenSchema = {

    registration_token_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    registrationToken: {
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
  
    deleted:{
        type: Sequelize.ENUM,
        values: ['0', '1'],
        defaultValue:'0'
    }
};

var tbl_notification_registration_tokens = db.define('tbl_notification_registration_tokens',registrationTokenSchema);

module.exports ={

    NotificationModel,
    tbl_notification_registration_tokens
};