'use strict'; 

var Sequelize = require('sequelize');
    // bcrypt = require('bcrypt');
var User = require('./user');
var db = require('../services/database.js');

var modelDefinitionCountry = {
    country_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    country_name: {
        type: Sequelize.STRING,
        allowNull: false
     },
      iso: {
        type: Sequelize.STRING,
        allowNull: false
     },
      country_nice_name: {
        type: Sequelize.STRING,
        allowNull: false
     },
       iso3: {
        type: Sequelize.STRING,
        allowNull: false
     },
        numcode: {
        type: Sequelize.INTEGER,
        allowNull: false
     },   
     phonecode: {
        type: Sequelize.INTEGER,
        allowNull: false
     },
    status:{
        type: Sequelize.ENUM,
         values: ['active','inactive'],
        defaultValue:'active'
    }
};

var CountryModel = db.define('tbl_countries',modelDefinitionCountry);

var modelDefinitionVerifierCategory = {
    category_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    category_name: {
        type: Sequelize.STRING,
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

var VerifierCategoryMasterModel = db.define('tbl_verifier_category_master',modelDefinitionVerifierCategory);

var modelDocumentMaster = {
    doc_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    document_name: {
        type: Sequelize.STRING,
        allowNull: false
     },
    status:{
        type: Sequelize.ENUM,
         values: ['active','inactive'],
        defaultValue:'active'
    },
     document_type:{
        type: Sequelize.ENUM,
        values: ['master', 'other'],
        defaultValue:'master'
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

var DocumentMasterModel = db.define('tbl_documents_master',modelDocumentMaster);

var modelCountryCodeMaster = {
  
    country_code_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
     },
    iso: {
        type: Sequelize.STRING,
        allowNull: false
     },
      country_nice_name: {
        type: Sequelize.STRING,
        allowNull: false
     },
       iso3: {
        type: Sequelize.STRING,
        allowNull: false
     },
        numcode: {
        type: Sequelize.INTEGER,
        allowNull: false
     },   
     phonecode: {
        type: Sequelize.INTEGER,
        allowNull: false
     },

};
var CountryCodeModel = db.define('tbl_country_codes',modelCountryCodeMaster);

module.exports ={
    CountryModel,CountryCodeModel,
    VerifierCategoryMasterModel,
    DocumentMasterModel
};