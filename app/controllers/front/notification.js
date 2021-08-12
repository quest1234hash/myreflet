var {UserModel,LogDetailsModel}=require('../../models/user');
var {NotificationModel}=require('../../models/notification');

const nodemailer = require("nodemailer");
var db = require('../../services/database');
var sequelize = require('sequelize');
var dateTime = require('node-datetime');
const { base64encode, base64decode } = require('nodejs-base64');
const {encrypt,decrypt, encrypt1,decrypt1}=require('../../helpers/encrypt-decrypt');

/**show all notifications start**/

exports.notification_list= async (req,res,next) =>{

	var user_id=req.session.user_id;
	var user_type=req.session.user_type;

	console.log("user_type id : "+user_type);

	if(user_id)
	{
      
	 if(user_type==='validatore')
	     {
	     	
       	         		console.log("user_type id else"+user_type);

     	 db.query("select tbl_validator_notifications.*,tbl_user_registrations.profile_pic from tbl_validator_notifications inner join tbl_user_registrations ON  tbl_validator_notifications.sender_id=tbl_user_registrations.reg_user_id WHERE tbl_validator_notifications.deleted='0' and receiver_id="+user_id+" ORDER BY `notification_id` DESC",{ type:db.QueryTypes.SELECT}).then(async function(all_notifications){

          console.log('all_notifications : ',all_notifications)
       res.render('front/notifications/all-notifications',{
       	    all_notifications,
            session:req.session,
            base64encode,
			decrypt
        });
      });
         	
       }
       else
       {     // 
     	console.log("user_type id if"+user_type);

		     db.query("select tbl_notifications.*,tbl_user_registrations.profile_img_name from tbl_notifications inner join tbl_user_registrations ON  tbl_notifications.sender_id=tbl_user_registrations.reg_user_id WHERE tbl_notifications.deleted='0' and receiver_id="+user_id+" ORDER BY `notification_id` DESC",{ type:db.QueryTypes.SELECT}).then(async function(all_notifications){
               console.log("all notificationsssssssssssssssssss",all_notifications);

		       res.render('front/notifications/all-notifications',{
		       	    all_notifications,
		            session:req.session,
		            base64encode
		        });
      });
       }


	}
	else
	{
		redirect('/Login');
	}

}
/**show all notifications start**/


/**show all unread notifications start**/
exports.unreadnotification_list= async (req,res,next) =>{


	var user_id=req.session.user_id;
	var user_type=req.session.user_type;
	console.log("user_type id"+user_type);

	if(user_id)
	{
	 if(user_type==='validatore')
	     {
	     	     		console.log("user_type id else"+user_type);

             	db.query("select tbl_validator_notifications.*,tbl_user_registrations.profile_img_name from tbl_validator_notifications inner join tbl_user_registrations ON  tbl_validator_notifications.sender_id=tbl_user_registrations.reg_user_id WHERE tbl_validator_notifications.deleted='0' and tbl_validator_notifications.read_status='no' and tbl_validator_notifications.receiver_id="+user_id+" ORDER BY `notification_id` DESC" ,{ type:db.QueryTypes.SELECT}).then(async function(unread_notifications){

					console.log("unreaddddddddddddddddddddddd",unread_notifications);
// console.log("-----------------",unread_notifications);
		         res.render('front/notifications/unread-notifications',{
		         	unread_notifications,
		         	session:req.session,
		         	base64encode,
					 decrypt
		          });

         });
	     	         	
        }
       else
       {
       	    
         	console.log("user_type id if"+user_type);

		db.query("select tbl_notifications.*,tbl_user_registrations.profile_pic from tbl_notifications inner join tbl_user_registrations ON  tbl_notifications.sender_id=tbl_user_registrations.reg_user_id WHERE tbl_notifications.deleted='0' and tbl_notifications.read_status='no' and tbl_notifications.receiver_id="+user_id+" ORDER BY `notification_id` DESC",{ type:db.QueryTypes.SELECT}).then(async function(unread_notifications){
// console.log("-----------------",unread_notifications);
		         res.render('front/notifications/unread-notifications',{
		         	unread_notifications,
		         	session:req.session,
		         	base64encode
		          });

         });          	 
       }
	}
	else
	{
		res.redirect('/Login');
	}
	
}
/**show all unread notifications end**/

/**delete notification start**/
exports.delete_notification= async (req,res,next) =>{


	var user_id=req.session.user_id;
	var user_type=req.session.user_type;
	console.log("user_type id"+user_type);

	if(user_id)
	{
		var notification_id=req.params.id;

		if(notification_id)
		{
			var noteid=base64decode(notification_id);

		       if(user_type==='validatore')
                { 
                		console.log("user_type id else"+user_type);

		   db.query("update tbl_validator_notifications set deleted='1' where notification_id="+noteid).then(function(result){
		   	
          console.log('all_notifications : ',result)


			 res.redirect('/notification-list');	
			   });	
			         		
		        }
		   else
		  {
         	console.log("user_type id if"+user_type);

					   db.query("update tbl_notifications set deleted='1' where notification_id="+noteid).then(function(result){


						 res.redirect('/notification-list');

					   });	
		  }
		}
		else
		{
			res.redirect('/notification-list');
		}


	}
	else
	{
		res.redirect('/Login');
	}



}
/**delete notification end**/

/**count unread notifications start**/
exports.count_notification= async (req,res,next) =>{

	var user_id=req.session.user_id;
	var user_type=req.session.user_type;
	console.log("user_type id"+user_type);

	if(user_id)
	{
		  if(user_type==='validatore')
         { 

			 	         		console.log("user_type id else"+user_type);

			 		db.query("select count(*) as notification_count from tbl_validator_notifications where receiver_id="+user_id+" and read_status='no' and deleted='0'",{type:db.QueryTypes.SELECT}).then(function(result){
					 console.log("result",result);
					 res.send(result);
				});
         		
	   }
			 else
			 {
			 	console.log("user_type id if"+user_type);

		db.query("select count(*) as notification_count from tbl_notifications where receiver_id="+user_id+" and read_status='no' and deleted='0'",{type:db.QueryTypes.SELECT}).then(function(result){
			 console.log("result",result);
			 res.send(result);
		});
			 }

	}
	else
	{
		res.redirect('/Login');
	}

}
/**count unread notifications end**/


exports.sideBarMsgAlert= async (req,res,next) =>{

	console.log("---------------------------------sideBarMsgAlert start--------------------------------------------")

	var reg_user_id	=	req.session.user_id
	
   
	var QueryTypes	=	`select count(*) as msg_count FROM tbl_notifications WHERE receiver_id=${reg_user_id} AND read_status="no" AND deleted='0' AND notification_type="6"`

	  db.query(QueryTypes,{type:db.QueryTypes.SELECT})
	  .then(data=>{

		res.send(data)

	  })
	  .catch(err=>console.log("error",err))
}
