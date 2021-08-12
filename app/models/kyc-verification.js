var Sequelize = require('sequelize');
    // bcrypt = require('bcrypt');
var User = require('./user');
var Request = require('./request');
var db = require('../services/database.js');
const kycSchema={
    kyc_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    doc_id:{
        type:Sequelize.STRING,
        allowNull:true
    },
    doc_name:{
        type:Sequelize.STRING,
        allowNull:false
    },
    reg_user_id:{
        type:Sequelize.INTEGER,
        allowNull:false
    },
    status:{
        type:Sequelize.ENUM,
        values: ['pending', 'reject','approved'],
        defaultValue:'pending'
    },
    doc_content:{
        type:Sequelize.STRING,
        allowNull:false
    },
    createdAt: {
        field: 'created_at',
        type: Sequelize.DATE,
    },
   updatedAt:{
          field: 'updated_at',
        type: Sequelize.DATE
    }

}
let KycModel=db.define('tbl_kyc',kycSchema);
module.exports ={
    KycModel
};