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
const {
    VerifierRequestCategoryModel,VerifierCategoryReflectidModel,CategoryDocument,ManageCategoryDocument
}= require("../../models/verifier_category")
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
const paginate   =  require("paginate-array");

/**verifier_list Get method Start**/

exports.verifierList=async(req,res,next)=>{

   success_msg = req.flash('success_msg');
   err_msg = req.flash('err_msg');

   var userId=req.session.user_id
   var verifier_array=[]

   var page = req.query.page || 1
   var perPage = 10;
   var page_data=[]

   await  db.query("SELECT * FROM `tbl_wallet_reflectid_rels` WHERE user_as='verifier' and reg_user_id<>"+userId,{ type:db.QueryTypes.SELECT}).then(async(verifiers)=>{

    await  db.query("SELECT * FROM `tbl_wallet_reflectid_rels` WHERE user_as='client' and reg_user_id="+userId,{ type:db.QueryTypes.SELECT}).then(async(myClients)=>{

        await  db.query("SELECT * FROM tbl_wallet_reflectid_rels INNER JOIN tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id where tbl_wallet_reflectid_rels.user_as='verifier' AND tbl_wallet_reflectid_rels.deleted='0' AND tbl_wallet_reflectid_rels.reg_user_id!="+userId,{ type:db.QueryTypes.SELECT}).then(async(verifiers)=>{

        for(var i=0;i<verifiers.length;i++){
            await db.query('SELECT count(*) as total from tbl_myreflectid_doc_rels where reflect_id='+verifiers[i].reflect_id,{ type:db.QueryTypes.SELECT}).then(async function(verifier_docs){
                console.log("verifier_docs------------- ",verifier_docs)
                await db.query('SELECT count(*) as verified from tbl_myreflectid_doc_rels where admin_status="verified" AND reflect_id='+verifiers[i].reflect_id,{ type:db.QueryTypes.SELECT}).then(function(verified_docs){
                    console.log("verified_docs------------- ",verified_docs)
                    if(verifier_docs[0].total==verified_docs[0].verified && verifier_docs[0].total != 0){
                        verifier_array.push(verifiers[i]);
                    }
                })
            })
        }



        if (verifier_array.length > 0) {

            page_data=verifier_array
    
        }
        const verifier_array_list = paginate(page_data,page, perPage);

        // console.log("userdata verfier list",verifierListData)
        res.render("front/verifiers-list/verifier",{
            session:req.session,
            verifierListData:verifier_array_list,verifiers,myClients,
            success_msg,
            err_msg
        })
    })

        })
    }).catch(err=>console.log("err..verifier list.",err))
    
}
/***verifier_list Get method End*/

/** get-sub-category-list Post Method Start  **/
exports.get_sub_category_list_no = (req,res,next) =>{
    var category_id = req.body.category_id;
    var no = req.query.no;
    db.query("select * from tbl_verifier_request_categories WHERE deleted='0' and parent_category="+category_id,{ type:db.QueryTypes.SELECT}).then(function(sub_categories){
        console.log("-----------categories--------------",sub_categories);
        res.render("front/myReflect/ajax_sub_category",{
            sub_categories:sub_categories,no
        });
    });
}
/** get-sub-category-list Post Method End  **/

/**get_refletid_for_request Get method Start**/
exports.get_refletid_request = async (req,res,next) =>{
    var user_id =  req.session.user_id;
    var reflet_id = req.query.reflet_id;
    var no = req.query.i;
    console.log("user_id ",user_id," verifier_reflet_id ",reflet_id);
    db.query("select * from tbl_verifier_category_reflectids inner join tbl_verifier_request_categories ON tbl_verifier_category_reflectids.category_id=tbl_verifier_request_categories.category_id WHERE tbl_verifier_request_categories.deleted='0' and tbl_verifier_request_categories.parent_category='0' and tbl_verifier_category_reflectids.reflect_id="+reflet_id,{ type:db.QueryTypes.SELECT}).then(function(categories){
        console.log("-----------categories--------------",categories);
        db.query("SELECT * FROM tbl_wallet_reflectid_rels Where reflect_id="+reflet_id,{ type:db.QueryTypes.SELECT}).then((verifier_data)=>{
            console.log("-----------verifier_data--------------",verifier_data);
            db.query("SELECT * FROM tbl_wallet_reflectid_rels Where reflectid_by!='digitalWallet' AND reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then((myids)=>{
            console.log("-----------myids--------------",myids);
                res.render("front/verifiers-list/reflet_ajax",{myids,categories,verifier_data,no});
            }).catch(err=>console.log("err..verifier list.",err))
        }).catch(err=>console.log("err..verifier list.",err))
        
    }).catch(err=>console.log("err..verifier list.",err))
    
}
/**get_refletid_for_request Get method End**/

/**get_refletid_for_request Get method Start**/
exports.get_doc_from_myreflet = async (req,res,next) =>{
    var reflect_id = req.body.reflect_id;
        var category_id = req.body.category_id;

    var no = req.body.no;
    // db.query("SELECT *,tbl_myreflectid_doc_rels.createdAt as doc_create_date FROM tbl_myreflectid_doc_rels INNER JOIN tbl_documents_masters on tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id where tbl_myreflectid_doc_rels.deleted='0' and tbl_myreflectid_doc_rels.reflect_id="+reflect_id+" and tbl_myreflectid_doc_rels.doc_id IN (select DISTINCT doc_id from tbl_manage_category_documents INNER JOIN tbl_category_documents on tbl_manage_category_documents.category_doc_id=tbl_manage_category_documents.category_doc_id WHERE tbl_category_documents.deleted='0' and include='yes' AND tbl_manage_category_documents.deleted='0' and category_id="+category_id+")",{ type:db.QueryTypes.SELECT}).then(function(request_docs){


   db.query("SELECT *,tbl_myreflectid_doc_rels.createdAt as doc_create_date FROM tbl_myreflectid_doc_rels INNER JOIN tbl_documents_masters on tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id where tbl_myreflectid_doc_rels.deleted='0' and tbl_myreflectid_doc_rels.reflect_id="+reflect_id,{ type:db.QueryTypes.SELECT}).then(function(request_docs){
        console.log("-----------categories--------------",request_docs);

        res.render("front/verifiers-list/reflet-docs-ajax",{request_docs,reflect_id,no});  

    }).catch(err=>console.log("err..verifier list.",err))
    
}
/**get_refletid_for_request Get method End**/

/***verifier_add_to_ad_book Post method Start*/
exports.addVerifierToaddBokk= async(req,res,next )=>{
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    var lable = req.body.v_lable
    var verifier_code = req.body.v_code
    var reg_user_id   =req.session.user_id 
    console.log("us",lable)
    console.log("us",verifier_code)

    console.log("us",reg_user_id)

   

                 tbl_address_book.findOne({where:{verifier_code:verifier_code}}).then(async(AddressBookData)=>{
                    if(AddressBookData){
                        req.flash('err_msg', 'verifier is alredy exist in your list.')
                        res.redirect("/verifier_list")
                    }else{     // console.log("<><><><><><><><>",ver_result)
                    tbl_address_book.create({
                        lable_name     : lable,
                        verifier_code  : verifier_code,
                        reg_user_id    :reg_user_id,
                        
                                           }).then(async(result)=>{
                                            req.flash('success_msg', 'verifier has been added successfully in your list.')

                                            res.redirect("/verifier_list")
                    })

              

        }
                       
            })
    
    
}
/***verifier_add_to_ad_book Post method End*/

/***manage_verifier_meassge Post method Start*/
exports.manage_verifier_meassge= async(req,res,next )=>{
    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
   
    var reg_user_id   =req.session.user_id 
   
    console.log("us",reg_user_id)

    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]

      await  db.query("SELECT * FROM tbl_wallet_reflectid_rels INNER JOIN tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id  INNER JOIN tbl_user_wallets on tbl_user_wallets.wallet_id=tbl_wallet_reflectid_rels.wallet_id LEFT JOIN tbl_countries ON tbl_wallet_reflectid_rels.entity_company_country=tbl_countries.country_id WHERE tbl_wallet_reflectid_rels.user_as='verifier' AND tbl_wallet_reflectid_rels.deleted='0' AND tbl_wallet_reflectid_rels.reg_user_id="+reg_user_id,{ type:db.QueryTypes.SELECT}).then(async(verifiers)=>{

              
  
                 console.log("verifiers ",verifiers)
                        if (verifiers.length > 0) {

                                page_data=verifiers
                     
                            }


                    const verifiers_message_list = paginate(page_data,page, perPage);

                        res.render("front/verifiers-list/manage-verifier-message-list",{market_list_result:verifiers_message_list});

            })
    
    
}
/***manage_verifier_meassge Post method End*/
exports.verifier_message_list=(req,res,next)=>
{
    var reflect_id= req.query.reflect_id
    // var label= req.query.label

    var reg_id= req.session.user_id
    // console.log('.................................................................................')
    // console.log('reg_id........',reflect_id)
    success_msg=req.flash("success_msg")
    err_msg=req.flash("err_msg")
   
    // db.query("SELECT * FROM `tbl_market_place_msgs` INNER join tbl_user_registrations on tbl_market_place_msgs.sender_id=tbl_user_registrations.reg_user_id INNER JOIN tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_market_place_msgs.receiver_id WHERE tbl_market_place_msgs.status='active' and tbl_market_place_msgs.receiver_id="+reflect_id,{ type:db.QueryTypes.SELECT}).then(function(view_details){
        db.query("SELECT *from tbl_market_place_msgs inner join tbl_user_registrations ON tbl_market_place_msgs.sender_id=tbl_user_registrations.reg_user_id inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.reflect_id=tbl_market_place_msgs.receiver_id WHERE tbl_market_place_msgs.receiver_id="+reflect_id+" order by msg_id ASC",{ type:db.QueryTypes.SELECT}).then(function(view_details){
            console.log('view_details : ',view_details)
        res.render('front/verifiers-list/message-verifier',{ success_msg,
           err_msg,
           view_details,
           session:req.session,
           user_id:reg_id,reflect_id
         

         });
    }) 
}

exports.ajax_verfier_type_filter=async(req,res,next)=>{

    success_msg       =  req.flash('success_msg');
    err_msg           =  req.flash('err_msg');
    var userId        =  req.session.user_id
    var verfierType   = JSON.parse(req.body.verifierType)
    var verifier_array = []

   await  db
          
          .query("SELECT * FROM tbl_wallet_reflectid_rels INNER JOIN tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id where tbl_wallet_reflectid_rels.verifier_type_name IN ("+verfierType+") AND tbl_wallet_reflectid_rels.user_as='verifier' AND tbl_wallet_reflectid_rels.deleted='0' AND tbl_wallet_reflectid_rels.reg_user_id!="+userId,{ type:db.QueryTypes.SELECT})
          
          .then(async(verifiers)=>{

        for(var i=0;i<verifiers.length;i++){
            await db
                 .query('SELECT count(*) as total from tbl_myreflectid_doc_rels where reflect_id='+verifiers[i].reflect_id,{ type:db.QueryTypes.SELECT})
                 .then(async function(verifier_docs){
                                                     console.log("verifier_docs------------- ",verifier_docs)
              await db
                    .query('SELECT count(*) as verified from tbl_myreflectid_doc_rels where admin_status="verified" AND reflect_id='+verifiers[i].reflect_id,{ type:db.QueryTypes.SELECT})
                    
                    .then(function(verified_docs){
                    console.log("verified_docs------------- ",verified_docs)
                    if(verifier_docs[0].total==verified_docs[0].verified && verifier_docs[0].total != 0){
                        verifier_array.push(verifiers[i]);
                    }
                })
            })
        }


        // console.log("userdata verfier list",verifierListData)
        res.render("front/verifiers-list/ajax_verfier_filter.ejs",{
            session:req.session,
            verifierListData:verifier_array,
            success_msg,
            err_msg

        })
    }).catch(err=>console.log("err..verifier list.",err))
    
}
/**verifier_list Get method Start**/

exports.search_verifier_for_user=async(req,res,next)=>{

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
 
    var userId=req.session.user_id
    var verifier_array=[]
    
    var query = req.body.query

    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]
 
    await  db.query("SELECT * FROM tbl_wallet_reflectid_rels INNER JOIN tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id where (tbl_wallet_reflectid_rels.entity_company_name LIKE '%"+query+"%' or tbl_wallet_reflectid_rels.rep_username LIKE '%"+query+"%' or tbl_wallet_reflectid_rels.reflect_code LIKE '%"+query+"%' or tbl_user_registrations.full_name LIKE '%"+query+"%') and tbl_wallet_reflectid_rels.user_as='verifier' AND tbl_wallet_reflectid_rels.deleted='0' AND tbl_wallet_reflectid_rels.reg_user_id!="+userId,{ type:db.QueryTypes.SELECT}).then(async(verifiers)=>{
 
         for(var i=0;i<verifiers.length;i++){
             await db.query('SELECT count(*) as total from tbl_myreflectid_doc_rels where reflect_id='+verifiers[i].reflect_id,{ type:db.QueryTypes.SELECT}).then(async function(verifier_docs){
                 console.log("verifier_docs------------- ",verifier_docs)
                 await db.query('SELECT count(*) as verified from tbl_myreflectid_doc_rels where admin_status="verified" AND reflect_id='+verifiers[i].reflect_id,{ type:db.QueryTypes.SELECT}).then(function(verified_docs){
                     console.log("verified_docs------------- ",verified_docs)
                     if(verifier_docs[0].total==verified_docs[0].verified && verifier_docs[0].total != 0){
                         verifier_array.push(verifiers[i]);
                     }
                 })
             })
         }
 
 
 
        //  if (verifier_array.length > 0) {
 
        //      page_data=verifier_array
     
        //  }
        //  const verifier_array_list = paginate(page_data,page, perPage);
 
         // console.log("userdata verfier list",verifierListData)
         res.render("front/verifiers-list/ajax_verifier",{
             session:req.session,
             verifierListData:verifier_array,
             success_msg,
             err_msg
 
         })
     }).catch(err=>console.log("err..verifier list.",err))
     
 }
 /***verifier_list Get method End*/
//  exports.view_document_verifier = (req,res,next) =>{

//     var reflect_id = req.query.reflect_id

//     db
    
//     .query('SELECT * FROM tbl_verifier_terms_and_conditions WHERE reflect_id='+reflect_id+' AND deleted="0"',{type:db.QueryTypes.SELECT})
    
//     .then(data=>{

//         res.render('front/verifiers-list/manage-view-document',{data})

//     })

//     .catch(err=>console.log(err))

  
 
// }


 /***verifier_list Get method End*/
 exports.view_document_verifier = async (req,res,next) =>{

    console.log('....................................manage_category start.............................................')
    var reflect_id       = req.query.reflect_id
    var reg_id           = req.query.user_id
    
    console.log('reg_id........',reg_id)
    success_msg          = req.flash("success_msg")
    err_msg              = req.flash("err_msg")

   await VerifierRequestCategoryModel.findAll({where:{deleted:"0",status:"active",parent_category:"0"}})
    .then(async(cat_data)=>{
        // console.log("catreflectdata[i].category_id************** ",cat_data);
       await MyReflectIdModel.findAll({where:{user_as:"verifier",reg_user_id:reg_id, deleted:"0"}})
       .then(async(myrefelctData)=>{

             var sun_cat_data=[]
   


                await  db.query(`SELECT * FROM tbl_verifier_category_reflectids INNER JOIN tbl_verifier_request_categories on tbl_verifier_category_reflectids.category_id=tbl_verifier_request_categories.category_id INNER JOIN tbl_user_registrations ON tbl_user_registrations.reg_user_id=tbl_verifier_category_reflectids.reg_user_id 
                where 
                (
                    (tbl_verifier_category_reflectids.reg_user_id=${reg_id}) 
                
                    OR 
                    ( tbl_verifier_category_reflectids.reg_user_id IN(
                                                                        SELECT tbl_invite_sub_verifiers.sub_verifier_id FROM tbl_invite_sub_verifiers 
                                                                        WHERE (  
                                                                            tbl_invite_sub_verifiers.invite_status="accept" AND tbl_invite_sub_verifiers.status="active" AND tbl_invite_sub_verifiers.reg_user_id=${reg_id}
                                                                        ) 
                                                                        ) 
                        )  
                
                    OR (  tbl_verifier_category_reflectids.reg_user_id IN(SELECT tbl_invite_sub_verifiers.reg_user_id FROM tbl_invite_sub_verifiers 
                                                                        WHERE(  
                                                                            tbl_invite_sub_verifiers.invite_status="accept" AND tbl_invite_sub_verifiers.status="active" AND tbl_invite_sub_verifiers.sub_verifier_id=${reg_id}
                                                                        )
                
                                                                        )
                
                    )    
                ) and tbl_verifier_category_reflectids.deleted="0" and tbl_verifier_request_categories.parent_category="0" GROUP BY tbl_verifier_category_reflectids.category_id`,{type:db.QueryTypes.SELECT})
                .then(async(catreflectdata)=>{ 
                    let catreflectdata_copy = catreflectdata
                    console.log("catreflectdata",catreflectdata)
                    for(var i=0; i<catreflectdata.length ;i++){
                        
                
                            await db.query('SELECT *,tbl_verifier_request_categories.createdAt as sub_createAt,tbl_verifier_request_categories.category_id as cat_id, COUNT(tbl_manage_category_documents.category_id) as total  FROM `tbl_verifier_request_categories` INNER JOIN tbl_verifier_category_reflectids ON tbl_verifier_category_reflectids.category_id=tbl_verifier_request_categories.category_id INNER JOIN tbl_user_registrations ON  tbl_user_registrations.reg_user_id=tbl_verifier_category_reflectids.reg_user_id LEFT JOIN tbl_manage_category_documents ON ((tbl_verifier_request_categories.category_id=tbl_manage_category_documents.category_id) AND (tbl_manage_category_documents.include="yes")) WHERE tbl_verifier_request_categories.parent_category="'+catreflectdata[i].category_id+'" AND tbl_verifier_request_categories.deleted="0" GROUP BY tbl_verifier_category_reflectids.category_id ,tbl_manage_category_documents.category_id',{type:db.QueryTypes.SELECT})
                            
                            .then(async(P_S_data)=>{
                            console.log("P_S_data c_p_dat",P_S_data)

                            // catreflectdata[i].sub_array=P_S_data
                            sun_cat_data.push(P_S_data)
                            for(var k=0 ; k<P_S_data.length ; k++){

                                var category_id          = P_S_data[k].cat_id;
                                var new_test_array       = [];
                                var requested_doc_array  = [];

                                await db.query("select * from tbl_manage_category_documents WHERE include='yes' AND deleted='0' and category_id="+category_id,{ type:db.QueryTypes.SELECT})
                                .then(async function(cat_docs){
                                
                                    requested_doc_array  = cat_docs;
                                
                                    for(var t=0;t<cat_docs.length;t++){
                                
                                        var category_doc_id = cat_docs[t].category_doc_id;
                                        console.log("---------------cat_docs_id-------------- ",cat_docs[t].category_doc_id);
                                        await  db.query("select * from tbl_category_documents inner join tbl_documents_masters ON tbl_category_documents.doc_id=tbl_documents_masters.doc_id WHERE tbl_category_documents.deleted='0' and tbl_category_documents.category_doc_id="+category_doc_id,{ type:db.QueryTypes.SELECT})
                                        .then(async function(requested_docs){
                                            
                                                    if(requested_docs[0]!=null){
                                
                                                        requested_doc_array[t].document_name = requested_docs[0].document_name
                                                        new_test_array.push(requested_doc_array[t]) ;
                                                        console.log("-----------categories_inner--------------",requested_doc_array);
                                                        
                                                    }
                                            
                                            })
                                    
                                    }
                                    console.log("-----------categories_outer--------------",new_test_array);
                                
                                
                                    async function forsend(){
                                        P_S_data[k].cat_doc_req          = new_test_array
                                        catreflectdata_copy[i].sub_array = P_S_data
                                        // console.log("-----------insde forsend--------------",catreflectdata_copy[i])
                                    }
                                    await forsend();
                                    
                                });
                            }
                        })
                    }
            /*Loop End*/
            

                    console.log("sun_cat_data",catreflectdata)
                    // console.log("sun_cat_data2",catreflectdata[0].sub_array)
                    res.render('front/verifiers-list/manage-view-document',{ 
                        success_msg,
                        err_msg,
                        cat_data,
                        session:req.session,
                        myrefelctData,
                        catreflectdata:catreflectdata_copy,
                        sun_cat_data,
                        moment

                    });
                })
    
  
        }).catch(err=>console.log("cat err2..",err))
                      
    })
    .catch(err=>console.log("cat err1..",err))

  
 
}

