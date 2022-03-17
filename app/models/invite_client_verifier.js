'use strict'; 

var Sequelize = require('sequelize');
    // bcrypt = require('bcrypt');
var User = require('./user');
var Reflect = require('./reflect');

var db = require('../services/database.js');
/**user wallet start**/
var modelDefinitionInvite = {
    invite_email_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    descriptions: {
        type: Sequelize.STRING,
        allowNull: false
     },
    sender_reflect_id: {
        type: Sequelize.INTEGER,
        references: {
            model: Reflect.MyReflectIdModel,
            key: 'reflect_id'
        },
        allowNull: false
    }, 
    receiver_reflect_id: {
        type: Sequelize.INTEGER,
        references: {
            model: Reflect.MyReflectIdModel,
            key: 'reflect_id'
        },
        allowNull: false
    },
    create_reg_user_id: {
        type: Sequelize.INTEGER,
        references: {
            model: User.UserModel,
            key: 'reg_user_id'
        },
        allowNull: false
    },
     type:{
        type: Sequelize.ENUM,
         values: ['verifier','client'],
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

var InviteClientVerifierModel = db.define('tbl_invite_client_verifier_by_emails',modelDefinitionInvite);
/**user wallet end**/

module.exports ={
    InviteClientVerifierModel
};


