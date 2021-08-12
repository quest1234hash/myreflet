const crypto                     = require('crypto');

const {ENCRYPTION_KEY}           = require('../services/key'); // Must be 256 bits (32 characters)
const {KEY_FOR_ENCRIPT_DECRIPT}                     = require('../config/config');

const IV_LENGTH     =  16;               // For AES, this is always 16
//var algorithm       = 'aes256'; 
let algorithm='aes-256-cbc';       // or any other algorithm supported by OpenSSL
var key             = KEY_FOR_ENCRIPT_DECRIPT;      /** this key will be change, currently it is for devlopment-mode in production we will change it */

//var iv = new Buffer.from('0000000000000000');
var iv=[0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
iv=new Int8Array(iv);
function encrypt(text) {
       var cipher      = crypto.createCipher(algorithm, key);  
        var encrypted   = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
        return  encrypted.toString('hex');

}


//with cryptojs
function encrypt1(text){
        let key= 'p2g0MlAv4m0CBNgau14AMipdjMnvoifd';
      //  console.log("key:::::",key.toString('hex'))
      var decodeKey = crypto.createHash('sha256').update(key, 'utf-8').digest();
     let cipherText=crypto.createCipheriv('aes-256-cbc', decodeKey, iv);
    // console.log("cipherText",cipherText);
     var encrypted   = cipherText.update(text,'utf8', 'base64') + cipherText.final('base64');
   //  console.log("encrypted:",encrypted);
        return  encrypted.toString('base64'); 
}


function decrypt(text) {
        var decipher    = crypto.createDecipher(algorithm, key);
        var decrypted   = decipher.update(text, 'hex', 'utf8') + decipher.final('utf8');
        return decrypted.toString();

}
//decrypt for password
function decrypt1(text) {
        let key="p2g0MlAv4m0CBNgau14AMipdjMnvoifd";
        var decodeKey = crypto.createHash('sha256').update(key, 'utf-8').digest();
          var cipher = crypto.createDecipheriv('aes-256-cbc', decodeKey, iv);
          var decrypted= cipher.update(text,'base64', 'utf8') + cipher.final('utf8');
          return decrypted.toString();
}
module.exports = { decrypt, encrypt, encrypt1, decrypt1 };