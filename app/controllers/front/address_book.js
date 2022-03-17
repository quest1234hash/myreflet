var {UserModel,LogDetailsModel}=require('../../models/user');
var {SecurityMasterModel,UserSecurityModel}=require('../../models/securityMaster');
var{ WalletModel,WalletModelImport } = require('../../models/wallets');
var {MyReflectIdModel, DocumentReflectIdModel} = require('../../models/reflect');
var {CountryModel,VerifierCategoryMasterModel,DocumentMasterModel} = require('../../models/master');
var {ClientVerificationModel,RequestDocumentsModel} = require('../../models/request');
var { ComplaintModel,CommentModel} = require('../../models/complaint');
var { tbl_verifier_plan_master,tbl_verifier_doc_list} = require('../../models/admin');
var { tbl_verfier_purchase_details } =require("../../models/purchase_detaile")
var { tbl_address_book } =require("../../models/address_book")

var { decrypt, encrypt } = require('../../helpers/encrypt-decrypt')



const nodemailer = require("nodemailer");
var db = require('../../services/database');
var sequelize = require('sequelize');
var dateTime = require('node-datetime')
var crypto = require('crypto');
var text_func=require('../../helpers/text');
var mail_func=require('../../helpers/mail');
const util = require('util');
const { base64encode, base64decode } = require('nodejs-base64');
const generateUniqueId = require('generate-unique-id');
var moment = require('moment');

/**address-book get method Start**/

exports.AddressBook= async(req,res,next )=>{
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    var reg_user_id   =req.session.user_id 

    var addressBookArray =[]


    await  MyReflectIdModel.findAll({where:{user_as:"verifier"}}).then(async(ver_result)=>{


        await tbl_address_book.findAll({where:{reg_user_id:reg_user_id}}).then(async(AddressBookData)=>{
       /*outer loop Start*/

       for(var i=0; i<AddressBookData.length ;i++){
           /*inner loop Start*/
           for(var j=0 ;j<ver_result.length ; j++){
              if(AddressBookData[i].verifier_code ==ver_result[j].reflect_code){
                  // AddressBookData[i].dataValues['myreflect']  = "fghdhdhdfhdsfhbhdfhb"
                 var obj = {
                     address_data : AddressBookData[i].dataValues,
                     myreflectdata : ver_result[j]
                 }
                 addressBookArray.push(obj)
              }

           }
                             /*inner loop End*/


       }
             /*outer loop End*/

       res.render('front/address-book',
                                     {session:req.session,
                                       success_msg,
                                         err_msg,
                                         addressBookArray
                                          });
                      })



                  })








}
/**address-book get method End**/

/**submit-address-book post method Start**/
exports.SubmitAddressBook= async(req,res,next )=>{

    console.log(".............................SubmitAddressBook...............................................")

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    var lable = req.body.lable
    var verifier_code = (req.body.verifier_code).trim()
    var reg_user_id   =req.session.user_id 
    
    console.log("us",lable)
    console.log("us",verifier_code)
    console.log("us",reg_user_id)

    // MyReflectIdModel.findOne({where:{reflect_code:verifier_code,user_as:"verifier"}}).then(verData=>{
        
    // })
    var addressBookArray =[]
    //   await  MyReflectIdModel.findAll({where:{reflect_code:verifier_code,user_as:"verifier",reg_user_id:{ $ne: reg_user_id }}})
      await db.query('SELECT * FROM `tbl_wallet_reflectid_rels` WHERE reflect_code="'+verifier_code+'" AND  user_as="verifier" AND  reg_user_id!='+reg_user_id,{type:db.QueryTypes.SELECT})
      .then(async(ver_results)=>{

        console.log("add bokk",ver_results)
            if(ver_results[0]!=null){
                console.log("....if condition")
                await tbl_address_book.findOne({where:{verifier_code:verifier_code,deleted:"0",reg_user_id:reg_user_id}}).then(async(AddressBookData)=>{
                    if(AddressBookData){
                        req.flash('err_msg', 'verifier code is alredy exist.')
                        res.redirect("/address-book")
                    }else{     // console.log("<><><><><><><><>",ver_result)
                    tbl_address_book.create({
                        lable_name     : lable,
                        verifier_code  : verifier_code,
                        reg_user_id    :reg_user_id,
                        
                                           }).then(async(result)=>{
    
            await  MyReflectIdModel.findAll({where:{user_as:"verifier"}}).then(async(ver_result)=>{
    
    
              await tbl_address_book.findAll({where:{reg_user_id:reg_user_id}}).then(async(AddressBookData)=>{
                 /*outer loop Start*/

             for(var i=0; i<AddressBookData.length ;i++){
                /*inner loop Start*/

                 for(var j=0 ;j<ver_result.length ; j++){
                    if(AddressBookData[i].verifier_code ==ver_result[j].reflect_code){
                        // AddressBookData[i].dataValues['myreflect']  = "fghdhdhdfhdsfhbhdfhb"
                       var obj = {
                           address_data : AddressBookData[i].dataValues,
                           myreflectdata : ver_result[j]
                       }
                       addressBookArray.push(obj)
                    }
                         

                 }
                     /*inner loop End*/
             }
                       /*outer loop End*/

             success_msg='Verifier has been added successfully.'
                          res.render('front/address-book',
                                                {session:req.session,
                                                    success_msg,
                                                   err_msg,
                                                   addressBookArray
                                               });
                            })
    
    
    
                        })
    
               })
                        
                    }

              

        })
                       
            }else{
                 console.log(".....else conndition")
                 req.flash('err_msg', 'verifier code is invalid.')
                 res.redirect("/address-book")
            }
            
    })
    
    
}

/**submit-address-book post method End**/

/**delete_addressBooke_verifier get method Start**/
exports.DeleteAddressBookeVerifier =(req,res,next)=>{
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

    var reg_user_id =req.session.user_id 
    var verfier_code =req.query.verifier_code

    tbl_address_book.destroy({where:{verifier_code:verfier_code,reg_user_id:reg_user_id}}).then(data=>{
        console.log("datadatdatad<>><><<><, ",data)
        req.flash('success_msg', 'Verifier has been deleted successfully.')
                 res.redirect("/address-book")
    }).catch(err=>  {
        
        console.log("errr  ",err)
        req.flash('err_msg', 'Somthing went wrong try again.')
        res.redirect("/address-book")
      })

}
/**delete_addressBooke_verifier get method End**/


/**update-address-book post method Start**/
exports.updateAddressBookeVerifier =(req,res,next)=>{
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');

    var reg_user_id =req.session.user_id 
    var verfier_code =req.body.edit_code
    var lable =req.body.edit_lable
console.log("..................",verfier_code)
      tbl_address_book.update({lable_name:lable}, { where: { verifier_code:verfier_code }}).then((result) =>{
        console.log("dgsfhgsdhgfh<><><><",result)
        req.flash('success_msg', 'Verifier has been updated successfully.')
                 res.redirect("/address-book")
    }).catch(err=>  {
        
        console.log("errr  ",err)
        req.flash('err_msg', 'Somthing went wrong try again.')
        res.redirect("/address-book")
      })

  
}
/**update-address-book post method End**/

exports.submit_add_client_to_sub =async(req,res,next)=>{
     
    var reflect_ids= JSON.parse(req.body.reflect_ids)
    var reg_user_id=req.session.user_id
    for(var i=0;i<reflect_ids.length;i++){
  
     await MyReflectIdModel.findOne({where:{reflect_id:reflect_ids[i],deleted:"0"}}).then(async(myreflectData)=>{
          if(myreflectData){
              await tbl_address_book.findOne({where:{verifier_code:myreflectData.reflect_code,reg_user_id:reg_user_id}}).then(async(addverfierdata)=>{
                  if(!addverfierdata){
                                 await  tbl_address_book.create({
                                                             lable_name     : "others",
                                                             verifier_code  : myreflectData.reflect_code,
                                                             reg_user_id    :reg_user_id,
                                                         })
                  }
              })
          }
      })
  
    if(i==(reflect_ids.length-1)){
                               res.send("done")
    }
     
    }
    
  }