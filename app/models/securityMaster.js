'use strict'; 

var Sequelize = require('sequelize');
    // bcrypt = require('bcrypt');
var User = require('./user');
var db = require('../services/database.js');

//console.log(User.UserModel);

var modelDefinition = {
    question_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    question: {
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

var SecurityMasterModel = db.define('tbl_security_questions',modelDefinition);

var modelDefinition = {
    secu_question_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    question_id: {
        type: Sequelize.INTEGER,
        references: {
            model: SecurityMasterModel,
            key: 'question_id'
        }
    },
    reg_user_id: {
        type: Sequelize.INTEGER,
        references: {
            model: User.UserModel,
            key: 'reg_user_id'
        }
    },
    answer: {
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

var UserSecurityModel = db.define('tbl_user_security_question_rels',modelDefinition);

module.exports ={
    SecurityMasterModel,
    UserSecurityModel
};