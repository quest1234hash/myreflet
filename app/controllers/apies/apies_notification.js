// import express from 'express'
// import bodyparser from 'body-parser'
// import { admin } from './firebase-config'
// myreflect-65b05-firebase-adminsdk-vy7xp-e1666e4540.json
// const app = express()
// app.use(bodyparser.json())

// const port = 3000
// const notification_options = {
//     priority: "high",
//     timeToLive: 60 * 60 * 24
//   };
var { NotificationModel,tbl_notification_registration_tokens } = require('../../models/notification');

var db = require('../../services/database');

var admin = require("firebase-admin");

var serviceAccount = require("../../config/myreflect-65b05-firebase-adminsdk-vy7xp-e1666e4540.json");


// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://sample-project-e1a84.firebaseio.com"
// })
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
//   });

// module.exports.admin = admin


const apies_notification = async ({notification_id = null  ,r_user_id = null})=>{

// exports.apies_notification = async (req, res)=>{

    // const  registrationToken = req.body.registrationToken
    // const {notification_id = null  ,r_user_id = null}            =    req.body
    // console.log("notification_id" ,notification_id ,registrationToken)
  
   let data_0f_not =await db.query("select tbl_notifications.*,tbl_user_registrations.profile_pic from tbl_notifications inner join tbl_user_registrations ON  tbl_notifications.sender_id=tbl_user_registrations.reg_user_id WHERE tbl_notifications.deleted='0' AND tbl_notifications.notification_type=11 AND tbl_notifications.notification_id="+notification_id+"  ORDER BY `notification_id` DESC",{ type:db.QueryTypes.SELECT})

   let n_token_data = await tbl_notification_registration_tokens.findOne({where:{reg_user_id :r_user_id}})
   
   console.log(notification_id,r_user_id,registrationToken,data_0f_not)


   let registrationToken = n_token_data.registrationToken

   console.log(notification_id,r_user_id,registrationToken,data_0f_not)



   if ( data_0f_not[0] != null ) {

    var topic = 'general';
    var message = {
        notification: {
          title: 'MyReflet share Documents',
          body: data_0f_not[0].notification_msg 
        },
        topic: topic
      };
      //   admin.messaging().sendToDevice(registrationToken, message, options)
        admin.messaging().sendToDevice(registrationToken, message)
  
        .then( response => {
  
       // //  res.status(200).send({status:1,msg:"Notification sent successfully",response})
        console.log("Notification has sent successfuly......",response);
        //  res.json({ status: 1, msg: "Notification sent successfully", data: { response } })
        return { status: 1, msg: "Notification sent successfully", data: { response } }

         
        })
        .catch( error => {
            console.log(error);
            // res.json({ status: 0, msg: "Somthing went wrong.", data: {  } })
            return { status: 0, msg: "Somthing went wrong.", data: {  } }


        });

   } else {

    console.log("no notification data found............")
    // res.json({ status: 0, msg: "No data found.", data: {  } })
    return { status: 0, msg: "No data found.", data: {  } }


   }



}




// exports.apies_notification = (req, res)=>{


//     var topic = 'general';

//     var message = {
//       notification: {
//         title: 'Message from node',
//         body: 'hey there'
//       },
//       topic: topic
//     };
    
//     // Send a message to devices subscribed to the provided topic.
//     admin.messaging().send(message)
//       .then((response) => {
//         // Response is a message ID string.
//         console.log('Successfully sent message:', response);
//       })
//       .catch((error) => {
//         console.log('Error sending message:', error);
//     });

// }


module.exports = { apies_notification
 }