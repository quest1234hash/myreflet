var QRCode = require('qrcode');

async function get_qr(text){
  try {
    return await QRCode.toDataURL(text);
  } catch (err) {
   return 0;
  }
}



module.exports = {

	get_qr

	// get_qr:function(text) {
 //        return QRCode.toDataURL(text);
 //        //return text;
 //    }

}

