const nodemailer        = require("nodemailer");
const {  MAIL_SEND_ID,  PASS_OF_MAIL}    = require('../config/config')
		

module.exports = {

    sendMail:async function(to_mail,mail_subject,mail_content) {

    	 var mail_footer='<p>Thanks & Regards,<br/>Team Myreflect</p>';

    	  const mailOptions = {
           to:to_mail,
           from: 'questtestmail@gmail.com',
           subject: mail_subject,
           html:mail_content+mail_footer
         };

    	 var smtpTransport = nodemailer.createTransport({
                                  service: 'gmail',
                                  auth: {
                                         user: MAIL_SEND_ID,
                                         pass: PASS_OF_MAIL
                                        }
                   });

                  

        await smtpTransport.sendMail(mailOptions, function (err,result) {
                   		
                   		var mail_result;
                   		if(err)
                   		{
                             mail_result=err;

                   		}
                   		else
                   		{
                   			mail_result=1;
                   			
                   		}

                   		// callback(mail_result);

                   		//console.log("success",mail_result);

                   		 

                   });


          //             console.log("mail re",mail_re);

          // return mail_re;
        
    }


}
