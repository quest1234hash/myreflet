'use strict'; 

var Sequelize = require('sequelize');

var tbl_verifier_plan_master = require('./admin');
var tbl_plan_features = require('./tbl_plan_features');


var User = require('./admin');
var db = require('../services/database.js');

var schemaFeaturePlanRel = {
    feature_rel_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    plan_id: {
        type: Sequelize.INTEGER,
        references: {
            model: tbl_verifier_plan_master.tbl_verifier_plan_master,
            key: 'plan_id'
        },
        allowNull: false
    },
    feature_id: {
        type: Sequelize.INTEGER,
        references: {
            model: tbl_plan_features.tbl_plan_features,
            key: 'plan_feature_id'
        },
        allowNull: false
    },
    feature_status: {
        type: Sequelize.ENUM,
        values: ['yes', 'no'],
        defaultValue:'yes'
     }
};

var tbl_plan_feature_rel = db.define('tbl_plan_feature_rel',schemaFeaturePlanRel);

module.exports ={
    tbl_plan_feature_rel
};