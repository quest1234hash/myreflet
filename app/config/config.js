
require('dotenv').config({path: __dirname + '/../../.env'})
// var config_details = require('./config.json');
var config_details = JSON.parse(process.env['configData'])

const MAIL_SEND_ID              = config_details.mail_send_id;
const PASS_OF_MAIL              = config_details.pass_of_mail
const TOKEN_SECRET              = config_details.TOKEN_SECRET
const DATABASE                  = config_details.database
const KEY_FOR_ENCRIPT_DECRIPT   = config_details.KEY_FOR_ENCRIPT_DECRIPT
const SESSION_SECRET            = config_details.SESSION_SECRET

//console.log("mail config chack",config_details)


module.exports = {
    MAIL_SEND_ID,
    PASS_OF_MAIL,
    TOKEN_SECRET,
    DATABASE,
    KEY_FOR_ENCRIPT_DECRIPT,
    SESSION_SECRET
}