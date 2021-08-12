'use strict'; 

var Sequelize = require('sequelize');
    // bcrypt = require('bcrypt');
var Reflect = require('./reflect');
var User = require('./user');


var db = require('../services/database.js');

var aboutModelDefinition = {

    about_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },  
    descriptions:
    {
        type: Sequelize.STRING,
        allowNull: false
    },
    createdAt:{
        type: Sequelize.DATE,
        allowNull: true
    },
    updatedAt:{
        type: Sequelize.DATE,
        allowNull: true
    },

};

var AboutusModel = db.define('tbl_front_about_us',aboutModelDefinition);

var connectModelDefinition = {

    about_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },  
    address:
    {
        type: Sequelize.STRING,
        allowNull: true
    },
    connect_email:
    {
        type: Sequelize.STRING,
        allowNull: false
    },
    createdAt:{
        type: Sequelize.DATE,
        allowNull: true
    },
    updatedAt:{
        type: Sequelize.DATE,
        allowNull: true
    },

};

var ConnectWithModel = db.define('tbl_front_connect_with_us',connectModelDefinition);

var schemaWhyChooseUs= {
why_choose_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    why_label: {
        type: Sequelize.STRING,
        allowNull: false
     },
     why_descriptions: {
        type: Sequelize.STRING,
        allowNull: false
     },
     
    icon: { 
        type: Sequelize.BLOB,
        default:'long',
        allowNull:true
     },
    
};

var WhyChooseUs = db.define('tbl_why_choose_us',schemaWhyChooseUs);

var schemaBenifits= {

benifit_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    benifit_label: {
        type: Sequelize.STRING,
        allowNull: false
     },
    benifit_descriptions: {
        type: Sequelize.STRING,
        allowNull: false
     },
     
    icon: { 
        type: Sequelize.BLOB,
        default:'long',
        allowNull:true
     },
    
};

var Benifits = db.define('tbl_benifits',schemaBenifits);

var schemaFeatures= {

    feature_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    feature_label: {
        type: Sequelize.STRING,
        allowNull: false
     },
    feature_descriptions: {
        type: Sequelize.STRING,
        allowNull: false
     },
     
    icon: { 
        type: Sequelize.BLOB,
        default:'long',
        allowNull:true
     },
    
};

var Features = db.define('tbl_features',schemaFeatures);

var schemaFeaturesRelations= {

    feature_rel_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    feature_id: {
        type: Sequelize.INTEGER,
        references: {
            model: Features,
            key: 'feature_id'
        },
        allowNull: true
    },
    feature: {
        type: Sequelize.STRING,
        allowNull: false
     },
   
};

var FeaturesRelations = db.define('tbl_features_relations',schemaFeaturesRelations);

var keyPillarsModelDefinition = {

    key_pillar_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },  
    label:
    {
        type: Sequelize.STRING,
        allowNull: false
    },
    descriptions:
    {
        type: Sequelize.STRING,
        allowNull: false
    },
    createdAt:{
        type: Sequelize.DATE,
        allowNull: true
    },
    updatedAt:{
        type: Sequelize.DATE,
        allowNull: true
    },

};

var KeyPillarsModel = db.define('tbl_our_key_pillars',keyPillarsModelDefinition);

var termModelDefinition = {

    terms_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },  
    descriptions:
    {
        type: Sequelize.STRING,
        allowNull: false
    },
    createdAt:{
        type: Sequelize.DATE,
        allowNull: true
    },
    updatedAt:{
        type: Sequelize.DATE,
        allowNull: true
    },

};

var TermsConditionModel = db.define('tbl_front_terms_conditions',termModelDefinition);

module.exports ={

    AboutusModel,
    ConnectWithModel,
    WhyChooseUs,
    Benifits,
    Features,
    FeaturesRelations,
    KeyPillarsModel,
    TermsConditionModel
};
