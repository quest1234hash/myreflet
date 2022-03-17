'use strict'; 

var Sequelize = require('sequelize');
    // bcrypt = require('bcrypt');
var User = require('./user');
var Master = require('./master');
var Wallet = require('./wallets');
var db = require('../services/database.js');

var modelDefinitionReflectId = {
    reflect_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    reflect_code: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
     },
     reflectid_by: {
        type: Sequelize.ENUM,
         values: ['entity','representative'],
        defaultValue:'representative'
    },
    reg_user_id: {
        type: Sequelize.INTEGER,
        references: {
            model: User.UserModel,
            key: 'reg_user_id'
        },
        allowNull: false
    },
    user_as:{
        type: Sequelize.ENUM,
        values: ['client','verifier'],
        defaultValue:'client'
    },
    verifier_type:{
        type: Sequelize.ENUM,
        values: ['public','private'],
        allowNull: true
    },
    verifier_category_id:{
        type: Sequelize.INTEGER,
        references: {
            model: Master.VerifierCategoryMasterModel,
            key: 'category_id'
        },
        allowNull:true
    },
    wallet_id:{
        type: Sequelize.INTEGER,
        references: {
            model: Wallet.WalletModel,
            key: 'wallet_id'
        },
        allowNull: false
    },
    rep_username:{
        type: Sequelize.STRING,
        allowNull: true
    },
    rep_firstname:{
        type: Sequelize.STRING,
        allowNull: true
    },
    rep_lastname:{
        type: Sequelize.STRING,
        allowNull: true
    },
    rep_emailid:{
        type: Sequelize.STRING,
        allowNull: true
    },
    rep_btc_address:{
        type: Sequelize.STRING,
        allowNull: true
    },
    rep_company_name:{
        type: Sequelize.STRING,
        allowNull: true
    },
    rep_dob:{
        type: Sequelize.DATE,
        allowNull: true
    },
    rep_eth_addess:{
        type: Sequelize.STRING,
        allowNull: true
    },
    rep_nationality:{
        type: Sequelize.STRING,
        allowNull: true
    },
    entity_company_name:{
        type: Sequelize.STRING,
        allowNull: true
    },
    entity_company_regno:{
        type: Sequelize.STRING,
        allowNull: true
    },
    entity_company_emailid:{
        type: Sequelize.STRING,
        allowNull: true
    },
    entity_dateof_incorporation:{
        type: Sequelize.DATE,
        allowNull: true
    },
    entity_company_country:{
        type: Sequelize.INTEGER,
        references: {
            model: Master.CountryModel,
            key: 'country_id'
        },
        allowNull: true
    },
    entity_company_address:{
        type: Sequelize.STRING,
        allowNull: true
    },
    entity_company_phoneno:{
        type: Sequelize.STRING,
        allowNull: true
    },
    additional_info:{
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
    },
    wallet_name:{
        type: Sequelize.STRING,
        allowNull: true
    },
};

var MyReflectIdModel = db.define('tbl_wallet_reflectid_rel',modelDefinitionReflectId);

var modelDocumentDefinition = {
    user_doc_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    doc_id:{
        type: Sequelize.INTEGER,
        references: {
            model: Master.DocumentMasterModel,
            key: 'doc_id'
        },
        allowNull: true
    },
    doc_unique_code:{
       type: Sequelize.STRING,
       allowNull: false
    },
    reflect_id:{
        type: Sequelize.INTEGER,
        references: {
            model: MyReflectIdModel,
            key: 'reflect_id'
        },
        allowNull: true
    },
    expire_date:{
        type: Sequelize.DATE,
        allowNull: true
    },
    self_assested: {
        type: Sequelize.ENUM,
        values: ['yes','no'],
        defaultValue:'no'
    },
    certified_status: {
        type: Sequelize.ENUM,
        values: ['yes','no'],
        defaultValue:'no'
    },
    dig_signature:{
        type: Sequelize.BLOB,
        default:'long',
        allowNull:true
    },
    admin_status:{
        type: Sequelize.ENUM,
        values: ['none', 'pending', 'verified'],
        defaultValue:'none'
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

var DocumentReflectIdModel = db.define('tbl_myreflectid_doc_rel',modelDocumentDefinition);


var filesDocSchema = {
    file_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    }, 
    user_doc_id:{
        type: Sequelize.INTEGER,
        references: {
            model: DocumentReflectIdModel,
            key: 'user_doc_id'
        },
        allowNull: true
    },
    file_content:{
       type: Sequelize.STRING,
       allowNull: false
    },
    type: {
        type: Sequelize.ENUM,
        values: ['image','video'],
        defaultValue:'image'
    },
    self_attested_hash: {
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

var FilesDocModel = db.define('tbl_files_doc',filesDocSchema);
module.exports ={
    MyReflectIdModel,
    DocumentReflectIdModel,FilesDocModel
};