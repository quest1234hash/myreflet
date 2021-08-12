

let Sequelize = require("sequelize")

let db        = require('../services/database.js');

let tokenSchema = {

    token_id : {
        type:Sequelize.INTEGER,
        primaryKey : true,
        autoIncrement : true,
        allowNull : false
        
    },

    b_token :{
        type: Sequelize.STRING,
        allowNull : false
    },
    ip_add :{
        type:Sequelize.STRING,
        allowNull:false
    },
    date:{
        type:Sequelize.DATE
    }

}

const tbl_add_on_token = db.define("tbl_add_on_tokens",tokenSchema)

module.exports = {
    tbl_add_on_token
}
