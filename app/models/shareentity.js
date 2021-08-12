var Sequelize = require('sequelize');
    // bcrypt = require('bcrypt');
var User = require('./user');
var Request = require('./request');
var db = require('../services/database.js');
const shareEntitySchema={
    share_id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        autoIncrement:true
    },
    sender_id:{
        type:Sequelize.INTEGER,
        allowNull:false
    },
    receiver_id:{
        type:Sequelize.INTEGER,
        allowNull:false
    },
    isBlock:{
        type:Sequelize.STRING,
        defaultValue:'no'
    },
    password:{
        type:Sequelize.STRING,
        allowNull:true
    },
    shared_entity:{
        type:Sequelize.STRING,
        allowNull:false
    },
    entity_owner:{
        type:Sequelize.STRING,
        allowNull:false
    },
    createdAt: {
        field: 'created_at',
        type: Sequelize.DATE,
    },
    updatedAt: {
        field: 'updated_at',
        type: Sequelize.DATE,
    }
}
var ShareEntityModel = db.define('tbl_share_entity',shareEntitySchema);

module.exports ={
    ShareEntityModel
};