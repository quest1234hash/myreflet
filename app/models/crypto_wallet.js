var Sequelize = require('sequelize');
    // bcrypt = require('bcrypt');
var User = require('./user');
var db = require('../services/database.js');
var modelDefinitionCryptoWallet = {
    wallet_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    public_key: {
        type: Sequelize.STRING,
        allowNull: false
     },
     wallet_address:{
        type: Sequelize.STRING,
        allowNull: true
     },
    reg_user_id: {
        type: Sequelize.INTEGER,
        references: {
            model: User.UserModel,
            key: 'reg_user_id'
        },
        allowNull: false
    },
    balance: {
        type: Sequelize.DOUBLE,
        defaultValue:'0.0'
    },
    status:{
        type: Sequelize.ENUM,
         values: ['active','inactive'],
        defaultValue:'active'
    },
    passphrase:{
        type:Sequelize.STRING,
        allowNull:true
    },
    deleted:{
        type: Sequelize.ENUM,
        values: ['0', '1'],
        defaultValue:'0'
    },
    wallet_type:{
        type: Sequelize.STRING,
        allowNull: false
    },
    reflectid_by:{
        type: Sequelize.STRING,
        allowNull: true
    },
    reflet_code:{
        type:Sequelize.STRING,
        allowNull:true
    },
    createdAt:{
        type: Sequelize.TIME,
        allowNull: true
    },
    updatedAt:{
        type: Sequelize.TIME,
        allowNull: true
    }
};

var CryptoWalletModel = db.define('tbl_crypto_wallet',modelDefinitionCryptoWallet);
module.exports ={
    CryptoWalletModel
};