var Sequelize = require('sequelize');
    // bcrypt = require('bcrypt');
var User = require('./user');
var db = require('../services/database.js');


const VerifierSchema={
    verifier_id:{
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
    },
    natural_reflet_id:{
        type:Sequelize.STRING,
        allowNull:false
    },
    status:{
        type:Sequelize.ENUM,
        values:['active','inactive'],
        defaultValue:'inactive'
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
let VerifierModel=db.define('tbl_verifier_lists',VerifierSchema);
module.exports ={
    VerifierModel
};