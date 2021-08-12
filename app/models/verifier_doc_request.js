var Sequelize = require('sequelize');
    // bcrypt = require('bcrypt');
var User = require('./user');
var db = require('../services/database.js');
const verifierDocRequestSchema={
    request_id:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    verifier_id:{
        type: Sequelize.INTEGER,
        allowNull:false
    },
    doc_file_hash:{
        type:Sequelize.STRING,
        allowNull:false
    },
    trans_hash:{
        type:Sequelize.STRING,
        allowNull:false
    },
    reason:{
        type: Sequelize.STRING,
        allowNull: true
    },
    doc_status:{
        type: Sequelize.ENUM,
        values: ['pending', 'accept', 'reject'],
        defaultValue:'pending'
    },
    sender_reflet_id:{
        type: Sequelize.STRING,
        allowNull: false
    },
    verifeir_comment:{
        type: Sequelize.STRING,
        allowNull: true
    },
    sender_comment:{
        type: Sequelize.STRING,
        allowNull: true
    },
    download_status:{
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
    },
    video_proof:{
        type: Sequelize.ENUM,
        values: ['yes', 'no'],
        defaultValue:'no'
    },
    sign:{
        type: Sequelize.ENUM,
        values: ['yes', 'no'],
        defaultValue:'no'
    },
    certify_status:{
        type: Sequelize.ENUM,
        values: ['yes', 'no'],
        defaultValue:'no'
    },
    createdAt:{
        type: Sequelize.TIME,
        allowNull: true
    },
    updatedAt:{
        type: Sequelize.TIME,
        allowNull: true
    }

}

let DocReqForVerificarionModel=db.define('tbl_doc_request_for_verifications',verifierDocRequestSchema);
module.exports ={
    DocReqForVerificarionModel
};