'use strict'; 

var Sequelize = require('sequelize');
    // bcrypt = require('bcrypt');
var User = require('./user');
var Reflect = require('./reflect')
var db = require('../services/database.js');
var CategoryModel=require("./verifier_category");
// var {FilesDocModel}=require("./reflect");
var clientVerificationDefinition = {
    request_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    request_code:{
        type: Sequelize.STRING,
        unique: true,
        allowNull: true
    },
    verifier_id:{
        type: Sequelize.INTEGER,
        references: {
            model: User.UserModel,
            key: 'reg_user_id'
        },
        allowNull: false
    },
    request_pin:{
        type: Sequelize.STRING,
        unique: true,
        allowNull: true
    },
    p_category_id:{
        type: Sequelize.INTEGER,
        references: {
            model: CategoryModel.VerifierRequestCategoryModel,
            key: 'category_id'
        },
        allowNull: true
    },
    sub_category_id:{
        type: Sequelize.INTEGER,
        references: {
            model: CategoryModel.VerifierRequestCategoryModel,
            key: 'category_id'
        },
        allowNull: true
    },
    verifer_my_reflect_id:{
        type: Sequelize.INTEGER,
        references: {
            model: Reflect.MyReflectIdModel,
            key: 'reflect_id'
        },
        allowNull: true
    },
    reflect_id:{
        type: Sequelize.INTEGER,
        references: {
            model: Reflect.MyReflectIdModel,
            key: 'reflect_id'
        },
        allowNull: true
    },
    client_id:{
        type: Sequelize.INTEGER,
        references: {
            model: User.UserModel,
            key: 'reg_user_id'
        },
        allowNull: false
    },
    request_status:{
        type: Sequelize.ENUM,
        values: ['pending', 'accept', 'reject'],
        defaultValue:'pending'
    },
    due_date:{
        type: Sequelize.DATE,
        allowNull: true
    },
    removed_request:{
        type: Sequelize.ENUM,
        values: ['yes', 'no'],
        defaultValue:'no'
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

var ClientVerificationModel = db.define('tbl_client_verification_request',clientVerificationDefinition);

var requestDocumentsDefinition = {
    request_doc_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    request_id:{
        type: Sequelize.INTEGER,
        references: {
            model: ClientVerificationModel,
            key: 'request_id'
        },
        allowNull: false
    },
    user_doc_id:{
        type: Sequelize.INTEGER,
        references: {
            model: Reflect.DocumentReflectIdModel,
            key: 'user_doc_id'
        },
        allowNull: false
    },
    version_count:{
        type: Sequelize.STRING,
        defaultValue:'1'
    },
    download: {
        type: Sequelize.ENUM,
        values: ['yes','no'],
        defaultValue:'no'
    },
    view: {
        type: Sequelize.ENUM,
        values: ['yes','no'],
        defaultValue:'no'
    },
    certified: {
        type: Sequelize.ENUM,
        values: ['yes','no'],
        defaultValue:'no'
    },
    self_certify: {
        type: Sequelize.ENUM,
        values: ['yes','no'],
        defaultValue:'no'
    },
    video_proof: {
        type: Sequelize.ENUM,
        values: ['yes','no'],
        defaultValue:'no'
    },
    complete: {
        type: Sequelize.ENUM,
        values: ['yes','no'],
        defaultValue:'no'
    },
    sign: {
        type: Sequelize.ENUM,
        values: ['yes','no'],
        defaultValue:'no'
    },
    approve_status: {
        type: Sequelize.ENUM,
        values: ['approved','rejected','pending'],
        defaultValue:'pending'
    },
   validatore_status: {
        type: Sequelize.ENUM,
        values: ['assigned','accept','NA','reject'],
        defaultValue:'NA'
    },
    message:{
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

var RequestDocumentsModel = db.define('tbl_request_documents',requestDocumentsDefinition);

var requestDocumentFilesDefinition = {
    request_file_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    request_doc_id:{
        type: Sequelize.INTEGER,
        references: {
            model: RequestDocumentsModel,
            key: 'request_doc_id'
        },
        allowNull: false
    },
    version:{
        type: Sequelize.STRING,
        defaultValue:'1'
    },
    reason:
    {
        type: Sequelize.STRING,
        allowNull: true
    },
    
    request_file_hash:{
        type: Sequelize.STRING,
        allowNull: false
    },
    transaction_hash: {
        type: Sequelize.STRING,
        allowNull: true
    },
    docfile_status:{
        type: Sequelize.ENUM,
        values: ['pending', 'accept', 'reject'],
        defaultValue:'pending'
    },
    doc_type:{
        type: Sequelize.ENUM,
        values: ['image', 'video','pdf'],
        defaultValue:'image'
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

var RequestFilesModel = db.define('tbl_request_documents_file',requestDocumentFilesDefinition);

var verifierRequestDefinition = {
    ver_req_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    request_id:{
        type: Sequelize.INTEGER,
        references: {
            model: ClientVerificationModel,
            key: 'request_id'
        },
        allowNull: false
    },
    category_doc_id:{
        type: Sequelize.INTEGER,
        references: {
            model: CategoryModel.CategoryDocument,
            key: 'category_doc_id'
        },
        allowNull: false
    },
    req_status:{
        type: Sequelize.ENUM,
        values: ['pending', 'completed'],
        defaultValue:'pending'
    }
}

var verifierRequestModel = db.define('tbl_verifier_request_doc',verifierRequestDefinition);

var updatePrmRequestDefinition = {
    update_req_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    request_id:{
        type: Sequelize.INTEGER,
        references: {
            model: ClientVerificationModel,
            key: 'request_id'
        },
        allowNull: false
    },
    user_doc_id:{
        type: Sequelize.INTEGER,
        references: {
            model: Reflect.DocumentReflectIdModel,
            key: 'user_doc_id'
        },
        allowNull: false
    },
    version_count:{
        type: Sequelize.INTEGER,
        allowNull: true
    },
    view_status:{
        type: Sequelize.ENUM,
        values: ['yes', 'no'],
        defaultValue:'no'
    },
    download_status:{
        type: Sequelize.ENUM,
        values: ['yes', 'no'],
        defaultValue:'no'
    },
    certify_status:{
        type: Sequelize.ENUM,
        values: ['yes', 'no'],
        defaultValue:'no'
    },
    complete:{
        type: Sequelize.ENUM,
        values: ['yes', 'no'],
        defaultValue:'no'
    },
    sign:{
        type: Sequelize.ENUM,
        values: ['yes', 'no'],
        defaultValue:'no'
    },
    video_proof:{
        type: Sequelize.ENUM,
        values: ['yes', 'no'],
        defaultValue:'no'
    },
    self_attest:{
        type: Sequelize.ENUM,
        values: ['yes', 'no'],
        defaultValue:'no'
    },
    update_req_status:{
        type: Sequelize.ENUM,
        values: ['pending', 'confirmed', 'rejected'],
        defaultValue:'pending'
    }
}

var updatePrmRequestModel = db.define('tbl_doc_prm_update_request',updatePrmRequestDefinition);


var schemaAdminRequestDocument= {
    admin_request_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    reflect_id:{
        type: Sequelize.INTEGER,
        references: {
            model: Reflect.MyReflectIdModel,
            key: 'reflect_id'
        },
        allowNull: true
    },
    document_name: {
        type: Sequelize.STRING,
        allowNull: false
     },
     descriptions: {
        type: Sequelize.STRING,
        allowNull: false
     },
     
    file_template: { 
        type: Sequelize.BLOB,
        default:'long',
        allowNull:true
     },
    
    request_status:{
        type: Sequelize.ENUM,
         values: ['accept','pending','reject'],
        defaultValue:'pending'
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
    createdAt:{
        type: Sequelize.DATE,
        allowNull: true
    },
    updatedAt:{
        type: Sequelize.DATE,
        allowNull: true
    }
};

var AdminDocumentRequest = db.define('tbl_admin_document_requests',schemaAdminRequestDocument);
module.exports ={
    ClientVerificationModel,
    RequestDocumentsModel,
    RequestFilesModel,
    verifierRequestModel,
    updatePrmRequestModel,
    AdminDocumentRequest
};