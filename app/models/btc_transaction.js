'use strict';

var Sequelize = require('sequelize');
// bcrypt = require('bcrypt');
var User = require('./user');
var Wallet= require('./wallets')
var Reflect= require('./reflect')

var db = require('../services/database.js');
/**transaction history model start**/
var modelDefinitionBtcTxHistory = {
    transaction_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    hash: {
        type: Sequelize.STRING,
        allowNull: false
    }
    ,
    sender_address: {
        type: Sequelize.STRING,
        allowNull: false
    }
    ,
    sender_reg_user_id: {
        type: Sequelize.INTEGER,
        references: {
            model: User.UserModel,
            key: 'reg_user_id'
        },
        allowNull: false
    },
    sender_wallet_id: {
        
        type: Sequelize.INTEGER,
        references: {
            model: Wallet.WalletModelImport,
            key: 'wallet_id'
        },
        allowNull: false
    },
    sender_reflect_id: {
        
        type: Sequelize.INTEGER,
        references: {
            model: Reflect.MyReflectIdModel,
            key: 'reflect_id'
        },
        allowNull: false
    },
    receiver_address: {
        type: Sequelize.STRING,
        allowNull: false
    }
    ,
    receiver_reg_user_id: {
        type: Sequelize.INTEGER,
        references: {
            model: User.UserModel,
            key: 'reg_user_id'
        },
        allowNull: false
    },
    receiver_wallet_id: {
        type: Sequelize.INTEGER,
        references: {
            model: Wallet.WalletModelImport,
            key: 'wallet_id'
        },
        allowNull: false
    },
    receiver_reflect_id: {
        type: Sequelize.INTEGER,
        references: {
            model: Reflect.MyReflectIdModel,
            key: 'reflect_id'
        },
        allowNull: false
    },
    amount: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: '0.0'
    },
    status: {
        type: Sequelize.ENUM,
        values: ['pending', 'confirmed'],
        defaultValue: 'pending'
    },
    eth_hash: {
        type: Sequelize.STRING,
        allowNull: false
    }


};

var btcTxHistoryModel = db.define('tbl_btc_transaction_historys', modelDefinitionBtcTxHistory);
/**transaction history model end**/


module.exports = {
    btcTxHistoryModel
};


