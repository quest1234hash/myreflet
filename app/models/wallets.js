'use strict'; 

var Sequelize = require('sequelize');
    // bcrypt = require('bcrypt');
var User = require('./user');
var db = require('../services/database.js');
/**user wallet start**/
var modelDefinitionWallet = {
    wallet_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    wallet_address: {
        type: Sequelize.STRING,
        allowNull: false
     }
     ,
    validator_wallet_name: {
        type: Sequelize.STRING,
        allowNull: true
     },
     public_key: {
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
        allowNull:false,
        defaultValue:'0.0'
    },
    status:{
        type: Sequelize.ENUM,
         values: ['active','inactive'],
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

var WalletModel = db.define('tbl_user_wallet',modelDefinitionWallet);
/**user wallet end**/

/**Import wallet start**/
var importDefinitionWallet = {
    import_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    wallet_id: {
        type: Sequelize.INTEGER,
         references: {
            model: WalletModel,
            key: 'wallet_id'
        },
        allowNull: false
     },
    reg_user_id: {
        type: Sequelize.INTEGER,
        references: {
            model: User.UserModel,
            key: 'reg_user_id'
        },
        allowNull: false
    },
    wallet_type:{
        type: Sequelize.ENUM,
        values: ['BTC', 'ETH'],
        allowNull: true

    },
    status:{
        type: Sequelize.ENUM,
         values: ['active','inactive'],
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
/**Import wallet end**/

var WalletModelImport = db.define('tbl_wallet_import',importDefinitionWallet);

module.exports ={
    WalletModel,
    WalletModelImport 
};


