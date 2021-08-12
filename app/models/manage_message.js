

var Sequelize = require('sequelize');
var MyReflectIdModel = require('./reflect');

var User = require('./user');
var reflect = require('./reflect');

var db = require('../services/database.js');
var  DocumentMasterModel = require('./master');

var MsgRequestSchema = {
    request_msg_id:{
        type: Sequelize.INTEGER, 
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    create_sender_id: {
        type: Sequelize.INTEGER,
        references: {
            model:User.UserModel, 
            key: 'reg_user_id'
        },
        allowNull: false
     },
      create_receiver_id: {
        type: Sequelize.INTEGER,
        references: {
            model:User.UserModel, 
            key: 'reg_user_id'
        },
        allowNull: false
     },
    reflect_id:
     {
        type: Sequelize.INTEGER,
        references: {
            model:reflect.MyReflectIdModel,
            key: 'reflect_id'
        },
        allowNull: false 
     },
    //  sender_user_type:{
    //     type: Sequelize.ENUM,
    //      values: ['client','verifier'],
    //      allowNull: true
    // },
    // receiver_user_type:{
    //     type: Sequelize.ENUM,
    //      values: ['client','verifier'],
    //      allowNull: true
    // },
     status:{
        type: Sequelize.ENUM,
         values: ['active','inactive'],
        defaultValue:'active'
    },
      
    request_date: {
        type: Sequelize.DATE, 
        allowNull: true
     },
   
   

};

var RequestRefletManageMessage = db.define('tbl_msg_requests',MsgRequestSchema);

var MsgSchema = {
    msg_id:{
        type: Sequelize.INTEGER, 
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    request_msg_id: {
        type: Sequelize.INTEGER,
        references: {
            model: RequestRefletManageMessage,
            key: 'request_msg_id'
        },
        allowNull: true
    },
    sender_user_id : {
        type: Sequelize.INTEGER,
        references: {
            model:User.UserModel, 
            key: 'reg_user_id'
        },
        allowNull: false
     },
  receiver_user_id: {
        type: Sequelize.INTEGER,
        references: {
            model:User.UserModel, 
            key: 'reg_user_id'
        },
        allowNull: false
     },
     message:
     {
        type: Sequelize.STRING,
        allowNull: false
        
     },
       seen_status:{
        type: Sequelize.ENUM,
         values: ['unread','read'],
        defaultValue:'unread'
    },
    online_type:{
        type: Sequelize.ENUM,
         values: ['client','veriifer'],
    },
     status:{
        type: Sequelize.ENUM,
         values: ['active','inactive'],
        defaultValue:'active'
    },
    msg_date: {
        type: Sequelize.DATE, 
        allowNull: true
     }

};

var RefletManageMessage = db.define('tbl_verifier_to_client_msgs',MsgSchema);




module.exports ={
    RefletManageMessage,RequestRefletManageMessage
};