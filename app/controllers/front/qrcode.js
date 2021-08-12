var QRCode = require('qrcode');


module.exports = {

	get_qr:function(text) {
        //return await QRCode.toDataURL(text);
        return text;
    }

}

// async function get_qr(text){
//   try {
//     return await QRCode.toDataURL(text);
//   } catch (err) {
//     console.error(err)
//   }
// }


// module.exports = {
//    get_qr
// }