'use strict'; 

var Sequelize = require('sequelize');

var User = require('./user');
var admin = require('./admin');
var Reflect = require('./reflect')

var db = require('../services/database.js');

var AccreditationMaster = {
    accreditation_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    accreditation_level: {
        type: Sequelize.STRING,
        allowNull: false
     },
  
    accreditation_status:{
        type: Sequelize.ENUM,
         values: ['active','inactive'],
        defaultValue:'active'
    },
    acc_type:{
        type: Sequelize.ENUM,
         values: ['client','verifier','validator'],
        defaultValue:'client'
    },
    deleted: {
        type: Sequelize.ENUM,
         values: ['0','1'],
        defaultValue:'0'
    },
    
};

var AccreditaionMasterModel = db.define('tbl_accreditation_masters',AccreditationMaster);

var tblAccreditationFeatures = {
    acc_feature_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    acc_feature: {
        type: Sequelize.STRING,
        allowNull: false
     },
  
    acc_status:{
        type: Sequelize.ENUM,
         values: ['active','inactive'],
        defaultValue:'active'
    },
    acc_type:{
        type: Sequelize.ENUM,
         values: ['client','verifier','validator'],
        defaultValue:'client'
    },
    deleted: {
        type: Sequelize.ENUM,
         values: ['0','1'],
        defaultValue:'0'
    },
    
};

var AccreditaionFeatureModel = db.define('tbl_accreditation_features',tblAccreditationFeatures);

var tblAccreditationFeaturesRel = {
    acc_rel_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    acc_feature_id: {
        type: Sequelize.INTEGER,
        references: {
            model: AccreditaionFeatureModel,
            key: 'acc_feature_id'
        },
        allowNull: false
     },
     accreditation_id: {
        type: Sequelize.INTEGER,
        references: {
            model: AccreditaionMasterModel,
            key: 'accreditation_id'
        },
        allowNull: false
     },
     user_reflect_id:{
        type: Sequelize.INTEGER,
        references: {
            model: Reflect.MyReflectIdModel,
            key: 'reflect_id'
        },
        allowNull: false
    },
    acc_rel_status:{
        type: Sequelize.ENUM,
         values: ['active','inactive'],
        defaultValue:'active'
    },
    // acc_type:{
    //     type: Sequelize.ENUM,
    //      values: ['client','verifier','validator'],
    //     defaultValue:'client'
    // },
    deleted: {
        type: Sequelize.ENUM,
         values: ['0','1'],
        defaultValue:'0'
    },
    
};

var AccreditaionFeatureRelModel = db.define('tbl_acc_features_rel',tblAccreditationFeaturesRel);

var accreditationRelation = {
    acc_rel_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    user_reflect_id:{
        type: Sequelize.INTEGER,
        references: {
            model: Reflect.MyReflectIdModel,
            key: 'reflect_id'
        },
        allowNull: false
    },
     accreditation_id: {
        type: Sequelize.INTEGER,
        references: {
            model: AccreditaionMasterModel,
            key: 'accreditation_id'
        },
        allowNull: false
     },
    acc_rel_status:{
        type: Sequelize.ENUM,
         values: ['active','inactive'],
        defaultValue:'active'
    },
    acc_type:{
        type: Sequelize.ENUM,
         values: ['client','verifier','validator'],
        defaultValue:'client'
    },
    deleted: {
        type: Sequelize.ENUM,
         values: ['0','1'],
        defaultValue:'0'
    },
    
};

var AccreditatiRelModel = db.define('tbl_accreditation_rel',accreditationRelation);

module.exports ={
    AccreditaionMasterModel,
    AccreditaionFeatureModel,
    AccreditaionFeatureRelModel,
    AccreditatiRelModel
};