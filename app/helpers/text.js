

module.exports = {

    ucFirst:function(text) {
        return text.charAt(0).toUpperCase()+text.slice(1).toLowerCase();
    },
    newOTP:function(){

    	var digits = '0123456789'; 
        let OTP=''; 

        for (let i = 0; i < 4; i++ ) { 
            OTP += digits[Math.floor(Math.random() * 10)]; 
        } 

        return OTP; 
    },
    expireOTPTime:function()
    {

       var now = new Date();
	   now.setMinutes(now.getMinutes() + 03); // timestamp
	   now = new Date(now); // Date object
	   var otp_expire_date =now;

	   return otp_expire_date;

    }

  


}