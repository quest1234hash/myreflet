'use strict'; 

var Sequelize = require('sequelize');
    // bcrypt = require('bcrypt');
var Reflect = require('./reflect');
var User = require('./user');


var db = require('../services/database.js');

var complaintModelDefinition = {

    complain_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    reflect_id: {
        type: Sequelize.INTEGER,
        references: {
            model: Reflect.MyReflectIdModel,
            key: 'reflect_id'
        },
        allowNull: true
    },
    client_reflect_code: {
        type: Sequelize.INTEGER,
        allowNull: false
    },   
    client_reflect_name:
    {
        type: Sequelize.STRING,
        allowNull: false
    },
    complain_message: {
        type: Sequelize.STRING,
        allowNull: false
     },
     complaint_status:{
        type: Sequelize.ENUM,
        values: ['pending', 'closed','responded'],
        defaultValue:'pending'
    },
    created_at:{
        type: Sequelize.DATE,
        allowNull: true
    },
    updated_at:{
        type: Sequelize.DATE,
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

var ComplaintModel = db.define('tbl_complaints',complaintModelDefinition);

var CommentModelDefinition = {

    comment_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    comment: {
        type: Sequelize.STRING,
        allowNull: false
     },
    complain_id: {
        type: Sequelize.INTEGER,
        references: {
            model: ComplaintModel,
            key: 'complain_id'
        },
        allowNull: true
    },
    comment_user_id:
     {
        type: Sequelize.INTEGER,
        references: {
            model:User.UserModel,
            key: 'reg_user_id'
        },
        allowNull: false
     },
    comment_date: {
        type: Sequelize.DATE,
        allowNull: true
     },
    created_at:{
        type: Sequelize.DATE,
        allowNull: true
    },
    updated_at:{
        type: Sequelize.DATE,
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

var CommentModel = db.define('tbl_complaint_comment',CommentModelDefinition);


var termsAndCondition = {

    t_c_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    reg_user_id:
    {
       type: Sequelize.INTEGER,
       references: {
           model:User.UserModel,
           key: 'reg_user_id'
       },
       allowNull: false
    },
    terms: {
        type: Sequelize.STRING,
        allowNull: false
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

var TermsAndCondition = db.define('tbl_terms_and_conditions',termsAndCondition);

module.exports ={

    ComplaintModel,CommentModel,TermsAndCondition
};