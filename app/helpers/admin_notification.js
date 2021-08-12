var {AdminModel,DurationModel,tbl_verifier_plan_master,PlanFeatures,PlanFeatureRel,MarketPlace,AllotMarketPlace,adminNotificationModel}=require('../models/admin');

module.exports =function admin_notification(msg , senderId ,reflectId ,type){
    console.log(".................................admin notification called..................................")
    var obj={
        msg: msg,
        senderId: senderId,
        reflectId: reflectId,
        type: type
    }
    console.log("obj...",obj)
    adminNotificationModel.create({
        notification_msg:msg,
        sender_id:senderId,
        receiver_id:"1",
        reflect_id: parseInt(reflectId) ,
        notification_type:type
    }).then(data=>console.log(data)).catch(err=>console.log("admin notification",err))

}