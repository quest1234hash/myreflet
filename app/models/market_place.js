

var Sequelize = require('sequelize');
var MyReflectIdModel = require('./reflect');

var User = require('./user');
var reflect = require('./reflect');

var db = require('../services/database.js');
var  DocumentMasterModel = require('./master');

var MsgSchema = {
    msg_id:{
        type: Sequelize.INTEGER, 
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    sender_id: {
        type: Sequelize.INTEGER,
        references: {
            model:User.UserModel, 
            key: 'reg_user_id'
        },
        allowNull: false
     },
    receiver_id:
     {
        type: Sequelize.INTEGER,
        references: {
            model:reflect.MyReflectIdModel,
            key: 'reflect_id'
        },
        allowNull: false 
     },
     message:
     {
        type: Sequelize.STRING,
        allowNull: false
        
     },
     status:{
        type: Sequelize.ENUM,
         values: ['active','inactive'],
        defaultValue:'active'
    },
    msg_date: {
        type: Sequelize.DATE, 
        allowNull: true
     },
    created_at:{
        type: Sequelize.DATE,
        allowNull: true
    },
    updated_at:{
        type: Sequelize.DATE,
        allowNull: true
    },
   

};

var MarketPlaceMsg = db.define('tbl_market_place_msg',MsgSchema);

module.exports ={
    MarketPlaceMsg
};