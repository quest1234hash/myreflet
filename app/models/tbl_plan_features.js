'use strict'; 

var Sequelize = require('sequelize');

var db = require('../services/database.js');

var schemaFeaturePlan = {
    plan_feature_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    feature_name: {
        type: Sequelize.STRING,
        allowNull: false
     },
     
    deleted:{
        type: Sequelize.ENUM,
        values: ['0', '1'],
        defaultValue:'0'
    },
    
};

var tbl_plan_features = db.define('tbl_plan_features',schemaFeaturePlan);

module.exports ={
    tbl_plan_features
};