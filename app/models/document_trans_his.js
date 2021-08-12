var Sequelize = require('sequelize');
    // bcrypt = require('bcrypt');
var User = require('./user');
var db = require('../services/database.js');


const docTransactionHistorySchema={
    transaction_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    file_id:{
        type: Sequelize.STRING,
        allowNull: true
     },
    transaction_hash:{
        type: Sequelize.STRING,
        allowNull: true
    },
    sender_wallet_pubKey:{
        type: Sequelize.STRING,
        allowNull: false
    },
    receiver_wallet_pubKey:{
        type: Sequelize.STRING,
        allowNull: false
    },
    receiver_refletid:{
        type: Sequelize.STRING,
        allowNull: false
    },
    reg_user_id:{
        type: Sequelize.STRING,
        allowNull: false
    },
    receiver_birth_address:{
        type: Sequelize.STRING,
        allowNull: false
    },
    amount:{
        type: Sequelize.STRING,
        allowNull: true
    },
     receiver_name:{
        type: Sequelize.STRING,
        allowNull: true
     },
     action:{
        type: Sequelize.STRING,
        allowNull: true
     },
     createdAt:{
        type: Sequelize.TIME,
        allowNull: true
    },
        updatedAt:{
        type: Sequelize.TIME,
        allowNull: true
    },
}


let DocumentTransactionModel=db.define('tbl_docs_trans',docTransactionHistorySchema);
module.exports ={
    DocumentTransactionModel
};