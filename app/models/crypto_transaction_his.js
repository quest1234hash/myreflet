var Sequelize = require('sequelize');
    // bcrypt = require('bcrypt');
var User = require('./user');
var db = require('../services/database.js');


const transactionHistorySchema={
    transaction_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    transaction_hash:{
        type: Sequelize.STRING,
        allowNull: true
    },
    sender_wallet_id:{
        type: Sequelize.STRING,
        allowNull: false
    },
    sender_reg_user_id:{
        type: Sequelize.STRING,
        allowNull: false
    },
    sender_reflet_id:{
        type: Sequelize.STRING,
        allowNull: true
    },
    receiver_wallet_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    receiver_reg_user_id:{
        type: Sequelize.STRING,
        allowNull: false
    },
    receiver_reflect_id:{
        type: Sequelize.STRING,
        allowNull: true
    },
    amount: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '0.0'
    },
    wallet_type:{
        type: Sequelize.STRING,
        allowNull: false,
    },
    status:{
        type:Sequelize.STRING,
       allowNull:false
     },
    createdAt:{
         type: Sequelize.TIME,
          allowNull: true
      },
    updatedAt:{
          type: Sequelize.TIME,
          allowNull: true
},
operation:{
    type: Sequelize.STRING,
    allowNull: true,
},
reg_user_id:{
    type: Sequelize.STRING,
    allowNull: true,
},
amountIndollar:{
    type: Sequelize.STRING,
    allowNull: true,
}

}
let CryptoTransHistoryModel=db.define('tbl_crypto_trans',transactionHistorySchema);
module.exports ={
    CryptoTransHistoryModel
};