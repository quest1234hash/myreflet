'use strict'; 

var Sequelize = require('sequelize');
    // bcrypt = require('bcrypt');
var db = require('../services/database.js');
var Master = require('./master');


// 1: The model schema.
var modelDefinition = {
    reg_user_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    full_name: {
        type: Sequelize.STRING,
        allowNull: false
     },
     last_name: {
        type: Sequelize.STRING,
        allowNull: true
     },
    email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    country_code_id: {
        type: Sequelize.INTEGER,
        references: {
            model: Master.CountryCodeModel,
            key: 'country_code_id'
        },
        allowNull: false
    },
    mobile_number: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    birthplace:
    {
        type: Sequelize.STRING,

        allowNull: true
    },
    dob: {
        type: Sequelize.STRING,
        allowNull: true
    },
    
    complete_steps: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: true
    },
    otp:{
        type: Sequelize.STRING,
        allowNull: true
    },
    otp_expire:{
        type: Sequelize.DATE,
        allowNull: true
    },
    block_date:{
        type: Sequelize.DATE,
        allowNull: true
    },
    user_pin:{
        type: Sequelize.STRING,
        allowNull: true
    },
    profile_pic:{
        type: Sequelize.BLOB,
        default:'long',
        allowNull:true
    },
    email_verification_status:{
        type: Sequelize.ENUM,
        values: ['no', 'yes'],
        defaultValue:'no'
    },
    wrong_otp_count:{
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue:'0'
    },
    status:{
        type: Sequelize.ENUM,
        values: ['active', 'inactive', 'block'],
        defaultValue:'active'
    },
     type:{
        type: Sequelize.ENUM,
        values: ['user', 'validatore' ,'same'],
        defaultValue:'user'
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
    server_salt:{
        type: Sequelize.STRING,
        unique: true,
        allowNull: true,
        size:Sequelize.STRING(512)
         
    },
    hashOfemail:{
        type: Sequelize.STRING,
        unique: true,
        allowNull: true
    },
    profile_img_name:{
        type:Sequelize.STRING,
        allowNull:true,
        unique:false
    },
    client_salt:{
        type:Sequelize.STRING,
        allowNull:true,
        unique:false
    }
};

var UserModel = db.define('tbl_user_registration',modelDefinition);

var modelDefinitionLog = {
    log_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    reg_user_id: {
        type: Sequelize.INTEGER,
        references: {
            model: UserModel,
            key: 'reg_user_id'
        }
    },
    login_time : {
        type: Sequelize.DATE,
        allowNull: true
    },
    ip_address : {
        type: Sequelize.STRING,
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
    deleted_at:{
        type: Sequelize.DATE,
        allowNull: true
    }
};

var LogDetailsModel = db.define('tbl_log_details',modelDefinitionLog);


var loginManageSchema = {
    log_manage_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    reg_user_id: {
        type: Sequelize.INTEGER,
        references: {
            model: UserModel,
            key: 'reg_user_id'
        }
    },
    login_time : {
        type: Sequelize.DATE,
        allowNull: true
    },
    ip_address : {
        type: Sequelize.STRING,
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
    deleted_at:{
        type: Sequelize.DATE,
        allowNull: true
    }
};
var tbl_log_manage = db.define('tbl_log_manage',loginManageSchema);

var schemaForTokenVerification  = {

    token_id : {
        type : Sequelize.INTEGER,
        primaryKey : "true",
        autoIncrement : "true",
        allowNull : "false",

    },
    reg_user_id: {
        type: Sequelize.INTEGER,
        references: {
            model: UserModel,
            key: 'reg_user_id'
        }
    },
    try_cout : {
        type :Sequelize.STRING,
        defaultValue : "0"
    },
    status_of_token :{
        type : Sequelize.ENUM,
        values :['active', 'expire' ,'inactive'],
        defaultValue :"active"
    },
    token : {
        type : Sequelize.STRING,
        allowNull :"false"
    }
}

var tokeModel = db.define('tbl_tokens',schemaForTokenVerification)
module.exports ={
    UserModel,
    LogDetailsModel ,
    tbl_log_manage,
    tokeModel
};
