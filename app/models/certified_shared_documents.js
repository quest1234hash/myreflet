var Sequelize = require('sequelize');
var User      = require('./user');
var Reflect   = require('./reflect')
var db        = require('../services/database.js');
var request   = require('./request')
var sharedcertifiedDoc = {

    shared_doc_id:{
                        type: Sequelize.INTEGER,
                        primaryKey:true,
                        allowNull: false,
                        autoIncrement:true
    },
    sender_my_reflect_id:{
                        type: Sequelize.INTEGER,
                        references: {
                            model: Reflect.MyReflectIdModel,
                            key: 'reflect_id'
                        },
                        allowNull: false
    },
   receiver_my_reflect_id:{
                        type: Sequelize.INTEGER,
                        references: {
                            model: Reflect.MyReflectIdModel,
                            key: 'reflect_id'
                        },
                        allowNull: false
    },
    sender_reg_user_id:{
                        type: Sequelize.INTEGER,
                        references: {
                            model: User.UserModel,
                            key: 'reg_user_id'
                        },
                        allowNull: false
    },
    request_id:{
                        type: Sequelize.INTEGER,
                        references: {
                            model: request.ClientVerificationModel,
                            key: 'request_id'
                        },
                        allowNull: false
    },
    request_doc_id:{
                        type: Sequelize.INTEGER,
                        references: {
                            model: request.RequestDocumentsModel,
                            key: 'request_doc_id'
                        },
                        allowNull: false
    },
   
    removed_doc:{
                        type: Sequelize.ENUM,
                        values: ['yes', 'no'],
                        defaultValue:'no'
    },
    descriptions:{
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

var tbl_shared_certified_doc = db.define('tbl_shared_certified_doc',sharedcertifiedDoc);

module.exports ={
                  tbl_shared_certified_doc
};
