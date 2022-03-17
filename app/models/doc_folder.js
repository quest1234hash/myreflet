var Sequelize = require('sequelize');
    // bcrypt = require('bcrypt');
var User = require('./user');
var db = require('../services/database.js');

const folderSchema={
    folder_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    wallet_address:{
        type:Sequelize.STRING,
        allowNull:true
    },
    folder_name:{
        type:Sequelize.STRING,
        allowNull:false
    },
    reg_user_id:{
        type:Sequelize.INTEGER,
        allowNull:false
    },
    wallet_type:{
        type:Sequelize.STRING,
        allowNull:true
    },
    deleted:{
        type: Sequelize.ENUM,
        values: ['0', '1'],
        defaultValue:'0'
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

let DocFolderModel=db.define('tbl_doc_folder',folderSchema);
module.exports ={
    DocFolderModel
};