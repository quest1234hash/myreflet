var mysql=require('mysql');
var Sequelize=require('sequelize');
const {DATABASE} = require("../config/config")
//console.log("DATABASE",DATABASE)
module.exports = new Sequelize(DATABASE);
