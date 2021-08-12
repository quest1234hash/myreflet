var {UserModel,LogDetailsModel}=require('../../models/user');
var {SecurityMasterModel,UserSecurityModel}=require('../../models/securityMaster');
var{ WalletModel,WalletModelImport } = require('../../models/wallets');
var {MyReflectIdModel, DocumentReflectIdModel,FilesDocModel} = require('../../models/reflect');
var {CountryModel,VerifierCategoryMasterModel,DocumentMasterModel} = require('../../models/master');
var {  ClientVerificationModel, RequestDocumentsModel,RequestFilesModel,verifierRequestModel,updatePrmRequestModel} = require('../../models/request');
var {NotificationModel} = require('../../models/notification');
var { ComplaintModel,CommentModel} = require('../../models/complaint');
var { tbl_verifier_plan_master,tbl_verifier_doc_list} = require('../../models/admin');
var { tbl_verfier_purchase_details } =require("../../models/purchase_detaile")
var { tbl_address_book } =require("../../models/address_book")
const Op = require('sequelize').Op
var request = require('request');


const nodemailer = require("nodemailer");
var db = require('../../services/database');
var sequelize = require('sequelize');
var dateTime = require('node-datetime')
const formidable = require('formidable');
var crypto = require('crypto');
var text_func=require('../../helpers/text');
var mail_func=require('../../helpers/mail');
const util = require('util');
var async = require('async');
const ipfsAPI = require('ipfs-api');
const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})
const fs = require('fs');
var Jimp = require('jimp');
var toBuffer = require('blob-to-buffer')
var moment = require('moment');
const paginate = require("paginate-array");



const { base64encode, base64decode } = require('nodejs-base64');
const generateUniqueId = require('generate-unique-id');
var moment = require('moment');

/** myrequest Get method Start**/
exports.myRequest = async(req,res,next)=>{
  var userId =req.session.user_id 
  // console.log("user idv ", userId)
  var page = req.query.page || 1
  var perPage = 10
  var requestarray =[]
  
  // { [Op.or]: [{verifier_id: userId} , {client_id: userId}
  await ClientVerificationModel.findAll({where:{client_id: userId},order: [
    ['request_id', 'DESC']
]}).then(async(data)=>{
       console.log(".......................................................")
       var count =1
       for(var i=0; i<data.length ;i++){
        var v_req_or_not=null;
          count++
          await MyReflectIdModel.findOne({where:{reflect_id:data[i].reflect_id }}).then(async(myRefdata)=>
          {  

              UserModel.hasMany(MyReflectIdModel, {foreignKey: 'reg_user_id'})
             MyReflectIdModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
             await MyReflectIdModel.findOne({where:{reflect_id:data[i].verifer_my_reflect_id },include: [UserModel]}).then(async(v_myRefdata)=>
          {
           // console.log(v_myRefdata.tbl_user_registration)

           // console.log(".......................................................")
           // console.log(v_myRefdata.tbl_user_registration.dataValues)
           var match_to_client_or_veri ;
               if(data[i].verifier_id==userId){
                 match_to_client_or_veri=data[i].verifier_id
               }else{
                 match_to_client_or_veri=data[i].client_id
               }

           await UserModel.findOne({where:{reg_user_id:match_to_client_or_veri }}).then(async(userdata)=>{
                await updatePrmRequestModel.findOne({where:{request_id:data[i].request_id,update_req_status:"pending"}}).then(async(check_v_req_per_data)=>{
                  if(check_v_req_per_data){v_req_or_not="yes"}

                  await verifierRequestModel.findOne({where:{request_id:data[i].request_id,req_status:"pending"}}).then(async(check_v_req_doc_data)=>{
                    if(check_v_req_doc_data){v_req_or_not="yes"}
                 
              var obj ={
                verifier_requset:v_req_or_not,
                 ClientVerificationData : data[i].dataValues,
                 MyReflectIData :myRefdata.dataValues,
                 user : userdata.dataValues,
                 verifer_my_reflect_id_Data : v_myRefdata
                }
                requestarray.push(obj)
              })
            })
             
           })


          })
         

          })
       }
       //console.log("user idvddsvdsvdsvdsvds<><> ", verifer_my_reflect_id_Data)
     
       const pagedarray = paginate(requestarray, page, perPage);
       res.render("front/my-request/myrequest",{
        session : req.session,
        ClientVerificationModelData :pagedarray,
        moment
 })

   }).catch(err=>console.log("errr",err))

}
/** myrequest Get method End**/

/**myrequest_view Get method Start**/
exports.myRequestView = async(req,res,next)=>{
  var clientId =req.query.clientId 
  var request_id=req.query.request_id
  // RequestFilesModel
  // RequestDocumentsModel.
  await db.query("SELECT * FROM tbl_doc_prm_update_requests WHERE update_req_status='pending' AND request_id="+request_id,{ type:db.QueryTypes.SELECT}).then(async(update_request_data)=>{

   console.log("**************update_request_data************* ",update_request_data);

     await db.query("SELECT * FROM tbl_verifier_request_docs INNER JOIN tbl_category_documents ON tbl_verifier_request_docs.category_doc_id=tbl_category_documents.category_doc_id INNER JOIN tbl_manage_category_documents ON tbl_category_documents.category_doc_id=tbl_manage_category_documents.category_doc_id INNER JOIN tbl_documents_masters ON tbl_category_documents.doc_id=tbl_documents_masters.doc_id WHERE tbl_verifier_request_docs.req_status='pending' AND tbl_verifier_request_docs.request_id="+request_id,{ type:db.QueryTypes.SELECT}).then(async(verifier_requestData)=>{

       console.log("verifier_requestData******** ",verifier_requestData);

      



     await db.query("SELECT * FROM tbl_client_verification_requests WHERE tbl_client_verification_requests.request_id="+request_id+" AND tbl_client_verification_requests.deleted='0'",{ type:db.QueryTypes.SELECT}).then(async(clientrequstData)=>{
     
      var reflect_id = clientrequstData[0].reflect_id;

    await db.query("SELECT * FROM `tbl_myreflectid_doc_rels` INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id  WHERE reflect_id="+reflect_id,{ type:db.QueryTypes.SELECT}).then(async(reflect_id_data)=>{
     
     await db.query("SELECT * FROM tbl_request_documents INNER JOIN tbl_myreflectid_doc_rels ON tbl_request_documents.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id where tbl_request_documents.request_id="+request_id+" AND tbl_myreflectid_doc_rels.deleted='0'",{ type:db.QueryTypes.SELECT}).then(async(requestDoc)=>{

     for(var i=0; i<requestDoc.length; i++)
     {
     var final_hash_arr=[]
       for(var j=1; j<=requestDoc[i].version_count; j++)
             await db.query("SELECT * FROM tbl_request_documents_files WHERE tbl_request_documents_files.request_doc_id="+requestDoc[i].request_doc_id+" AND tbl_request_documents_files.deleted='0' AND tbl_request_documents_files.version="+j,{ type:db.QueryTypes.SELECT}).then(async(requestDocFile)=>{
                 if(requestDocFile.length>0){
                   console.log("**///////********///////requestDocFile ",requestDocFile);
                   var hash_arr=[]
                   for(var k=0; k<requestDocFile.length; k++){

                     let doc_type =  requestDocFile[k].doc_type
                     var url1='https://ipfs.io/ipfs/';
                     var url2=requestDocFile[k].request_file_hash;

                     if(doc_type){}else{}
                     var final_url=url1.concat(url2);
                     await request(final_url,callback);

                          

             async function callback(error, response, body) {
               
               if(!error){
                let tempObj
                      if(doc_type=='image'){

                          tempObj = {
                            doc_type,
                            doc_data_url:body
                        }
                       }else if(doc_type=='video'){
                            tempObj = {
                              doc_type,
                              doc_data_url:url2
                          }
                          console.log("length",tempObj);
                      } else {
                        
                        tempObj = {
                          doc_type,
                          doc_data_url:url2
                      }

                      }
                   hash_arr.push(tempObj);
                  //  hash_arr.push(body);
                   console.log("*******body**********");
                 //  console.log("length",all_self_attested.length);
                                       
                }
                               
            }

                   }
                   async function forPus(){

                     requestDocFile[0].request_doc_file=hash_arr
                     final_hash_arr.push(requestDocFile[0])
                   }
                     
                   await forPus()
                 }
             })
         
       async function forlatepush(){
         requestDoc[i].requset_doc_data=final_hash_arr

       }
   await forlatepush()
     }
   async function forrender(){
     console.log("requset doc data*************",requestDoc)
     UserModel.findOne({where:{reg_user_id:clientId }}).then(userdata=>{
         //  console.log("data.....",userdata)
         // res.send(requestDoc);
         res.render("front/my-request/request-view",{
           session : req.session,
           clientData: userdata,
           RequestData:requestDoc,
           tbl_client_re_data :clientrequstData,
           moment,
           verifier_requestData:verifier_requestData,
           update_request_data,reflect_id_data
     })
       }).catch(err=>{
         console.log("err..",err)
       })
     }
     await setTimeout(forrender,10000);

   })

      })
   })
   })
  })

}
/**myrequest_view Get method End**/

/**show-filter-my-request Post method Start**/
exports.MyRequestFilter = async(req,res,next)=>{
  var userId =req.session.user_id 
  var page = req.query.page || 1
  var perPage = 10
  var reflect_code_list=[]
  var filterArray =[]
  reflect_code_list=JSON.parse(req.body.reflect_code_list);
//   console.log("reflect_code_list..",reflect_code_list)

//   var complaint_reflect_code_list=reflect_code_list.join("','");
//   console.log("complaint_reflect_code_list..",complaint_reflect_code_list)

 var userId =req.session.user_id 
 // console.log("user idv ", userId)
 var requestarray =[]
 
 await ClientVerificationModel.findAll({where:{ [Op.or]: [{verifier_id: userId} , {client_id: userId} ]} }).then(async(data)=>{
      console.log(".......................................................")
      var count =1
      for(var i=0; i<data.length ;i++){
        var v_req_or_not=null;
         count++
         await MyReflectIdModel.findOne({where:{reflect_id:data[i].reflect_id }}).then(async(myRefdata)=>
         {  

             UserModel.hasMany(MyReflectIdModel, {foreignKey: 'reg_user_id'})
            MyReflectIdModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
            await MyReflectIdModel.findOne({where:{reflect_id:data[i].verifer_my_reflect_id },include: [UserModel]}).then(async(v_myRefdata)=>
         {
        //   console.log(v_myRefdata.tbl_user_registration)

          // console.log(".......................................................")
          // console.log(v_myRefdata.tbl_user_registration.dataValues)
          var match_to_client_or_veri ;
              if(data[i].verifier_id==userId){
                match_to_client_or_veri=data[i].verifier_id
              }else{
                match_to_client_or_veri=data[i].client_id
              }

          await UserModel.findOne({where:{reg_user_id:match_to_client_or_veri }}).then(async(userdata)=>{
           await updatePrmRequestModel.findOne({where:{request_id:data[i].request_id,update_req_status:"pending"}}).then(async(check_v_req_per_data)=>{
             if(check_v_req_per_data){v_req_or_not="yes"}

             await verifierRequestModel.findOne({where:{request_id:data[i].request_id,req_status:"pending"}}).then(async(check_v_req_doc_data)=>{
               if(check_v_req_doc_data){v_req_or_not="yes"}
             var obj ={
               verifier_requset:v_req_or_not,
                ClientVerificationData : data[i].dataValues,
                MyReflectIData :myRefdata.dataValues,
                user : userdata.dataValues,
                verifer_my_reflect_id_Data : v_myRefdata,
                session_user_id :userId ,
                moment : moment
               }
               requestarray.push(obj)
             })
           })
        })


         })
        

         })
      }
     //  console.log("user idvddsvdsvdsvdsvds<><> ", count)
    for(var j=0; j<reflect_code_list.length ;j++){

      for(var k=0; k<requestarray.length ;k++){   
               
             if(requestarray[k].MyReflectIData.reflect_code==reflect_code_list[j]){
              filterArray.push(requestarray[k])
             }
        }

      }
     //  console.log("test whole data",filterArray)
//     var obj2=  {
//         session : req.session,
//         ClientVerificationModelData :filterArray,
//         moment
//  }
//  res.send(obj2)
// res.send(filterArray)
// const pagedarray = paginate(sub_verifiers_list, page, perPage); 
      res.render("front/my-request/my_request_ajax_filter.ejs",{
       session : req.session,
       ClientVerificationModelData :filterArray,
       moment
})

  }).catch(err=>console.log("errr",err))


}
/**show-filter-my-request Post method End**/




/**show-filter-my-request Post method Start**/
exports.MyRequestVerfierIdFilter = async(req,res,next)=>{
  var userId =req.session.user_id 
  var page = req.query.page || 1
  var perPage = 10
  var reflect_code_list=[]
  var filterArray =[]
  reflect_code_list=JSON.parse(req.body.reflect_code_list);
//   console.log("reflect_code_list..",reflect_code_list)

//   var complaint_reflect_code_list=reflect_code_list.join("','");
//   console.log("complaint_reflect_code_list..",complaint_reflect_code_list)

 var userId =req.session.user_id 
 // console.log("user idv ", userId)
 var requestarray =[]
 
 await ClientVerificationModel.findAll({where:{ [Op.or]: [{verifier_id: userId} , {client_id: userId} ]} }).then(async(data)=>{
      console.log(".......................................................")
      var count =1
      for(var i=0; i<data.length ;i++){
        var v_req_or_not=null;
         count++
         await MyReflectIdModel.findOne({where:{reflect_id:data[i].reflect_id }}).then(async(myRefdata)=>
         {  

             UserModel.hasMany(MyReflectIdModel, {foreignKey: 'reg_user_id'})
            MyReflectIdModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
            await MyReflectIdModel.findOne({where:{reflect_id:data[i].verifer_my_reflect_id },include: [UserModel]}).then(async(v_myRefdata)=>
         {
        //   console.log(v_myRefdata.tbl_user_registration)

          // console.log(".......................................................")
          // console.log(v_myRefdata.tbl_user_registration.dataValues)
          var match_to_client_or_veri ;
              if(data[i].verifier_id==userId){
                match_to_client_or_veri=data[i].verifier_id
              }else{
                match_to_client_or_veri=data[i].client_id
              }

          await UserModel.findOne({where:{reg_user_id:match_to_client_or_veri }}).then(async(userdata)=>{
           await updatePrmRequestModel.findOne({where:{request_id:data[i].request_id,update_req_status:"pending"}}).then(async(check_v_req_per_data)=>{
             if(check_v_req_per_data){v_req_or_not="yes"}

             await verifierRequestModel.findOne({where:{request_id:data[i].request_id,req_status:"pending"}}).then(async(check_v_req_doc_data)=>{
               if(check_v_req_doc_data){v_req_or_not="yes"}
             var obj ={
               verifier_requset:v_req_or_not,
                ClientVerificationData : data[i].dataValues,
                MyReflectIData :myRefdata.dataValues,
                user : userdata.dataValues,
                verifer_my_reflect_id_Data : v_myRefdata,
                session_user_id :userId ,
                moment : moment
               }
               requestarray.push(obj)
             })
           })
        })


         })
        

         })
      }
     //  console.log("user idvddsvdsvdsvdsvds<><> ", count)
    for(var j=0; j<reflect_code_list.length ;j++){

      for(var k=0; k<requestarray.length ;k++){   
               
             if(requestarray[k].verifer_my_reflect_id_Data.reflect_code==reflect_code_list[j]){
              filterArray.push(requestarray[k])
             }
        }

      }
     //  console.log("test whole data",filterArray)
//     var obj2=  {
//         session : req.session,
//         ClientVerificationModelData :filterArray,
//         moment
//  }
//  res.send(obj2)
// res.send(filterArray)
// const pagedarray = paginate(sub_verifiers_list, page, perPage); 
      res.render("front/my-request/my_request_ajax_filter.ejs",{
       session : req.session,
       ClientVerificationModelData :filterArray,
       moment
})

  }).catch(err=>console.log("errr",err))


}
/**show-filter-my-request Post method End**/





/**upload_version_request_doc Post method Start**/
exports.uploadVesionDoc=async(req,res,next)=>{


  const form = formidable({ multiples: true });

  console.log("........********************.uploadVesionDoc-start*******************************.......",form)

  await  form.parse(req, async(err, fields, files) => {

                if (err) {
                console.log(err);
                }

        var request_doc_id  = fields.request_doc_id
        var type_attr = fields.type_attr;

        var doc_array       = []
        console.log(".........request_doc_id.......",request_doc_id)
        console.log(".........files.......",type_attr)

        if ( files.staff_image.length == undefined ) {
          console.log("if")

          doc_array.push(files.staff_image)

        } else {
          console.log("else")

          doc_array = files.staff_image

        }
  
   await  RequestDocumentsModel.findOne({where:{request_doc_id:request_doc_id ,deleted:"0"}}).then(async(requestDocData)=>{
     await ClientVerificationModel.findOne({where:{request_id:requestDocData.request_id,deleted:"0"}}).then(async client_v_r_data=>{
       
     var new_version =parseInt(requestDocData.version_count) +1
     console.log(".........new_version.......",new_version)
   await RequestDocumentsModel.update({approve_status:"pending",version_count:new_version},{where:{request_doc_id:request_doc_id,deleted:"0"}}).then(async(updata)=>{
    //  if(err){
    //    console.log(err)
    //  }
     console.log("updata",updata)
     var coutForSend=doc_array.length
    async.each(doc_array,async function (imagesfromEjs, cb) {
          // for(var x; x<files.staff_image.length ; x++) {
            
  console.log("files.staff_image.length",coutForSend)

    let testFile = fs.readFileSync(imagesfromEjs.path);

    let testBuffer = new Buffer(testFile);
  
    await  ipfs.files.add(testBuffer,async function (err, file1) {
      if (err) {
                 console.log("err from ejs",err);
                 res.send(err)
               }else
               {
                var w_text="MY_reflect"+client_v_r_data.request_code;
             
                   var fun_hash =file1[0].hash
                   console.log("hello-----------1 ");
                   var a;
                   a= await Jimp.read(`https://ipfs.io/ipfs/${fun_hash}`,async function(err, image) {

                    console.log("hello-----------2 ");
                 
                     await Jimp.create(image.bitmap.width ,image.bitmap.height+((image.bitmap.width/4)+30),'#ffffff',async function(err, nova_new) {
                 
                                                                     
                           console.log("hello-----------3 ");
                           var b;
                            b=  await Jimp.loadFont(Jimp.FONT_SANS_12_BLACK ,async function(err, font) {
                        
                            console.log("hello-----------4 ");
                            var c;
                            //  image.print(font,image.bitmap.width/2.5,image.bitmap.height/2.5,w_text)
    
                            nova_new.print(font,(image.bitmap.width/4)/3,image.bitmap.height,w_text,)
                 
                           nova_new.composite(image,0,0);
                          
                          //  image.resize(200,200);
                       
                                   console.log("hello-----------5 ");
                       var d;
                                    d= await   nova_new.getBase64Async(Jimp.MIME_PNG)
                                
                                        console.log("hello-----------6 ");
                                   
                                     let testBuffer = new Buffer(d);
    
                        var e;
                                        e = await  ipfs.files.add(testBuffer, async function (err, file) {
                                           if (err) {
                                           console.log("err from ejs",err);
                                           }else{
                                          
                                               console.log("hello-----------7 ");
                                               var z;
                                                z =  await  RequestFilesModel.create({
                                                request_doc_id:request_doc_id,
                                                request_file_hash:file[0].hash,
                                                version:new_version
                                               }
                                           
                                               ).then(async (dataForReturn)=>{
                                                console.log("hello-----------8 ");
                                                coutForSend=parseInt(coutForSend)-1
                              console.log("coutForSend.....",coutForSend)
                              if(coutForSend==0){
                                console.log("finish ");
                                  res.redirect("/myrequest_view?clientId="+client_v_r_data.client_id+"&request_id="+requestDocData.request_id)
                                
                              }
                                                // return "dataForReturn"; 
                                               }).catch(err=>console.log("err",err))
                                           
                                           }
                                                                       
                                       })
                               
                                       
                }) 
                
                       })
                       
                   });

               }



   })

  })

// async function forRender(){
//   res.redirect("/myrequest_view?clientId="+client_v_r_data.client_id+"&request_id="+requestDocData.request_id)
// }
// await forRender()

     })

    }).catch(err=>console.log("err",err))
    }).catch(err=>console.log("err",err))
})
}
/**upload_version_request_doc Post method End**/

/**Check User Document by Id Post method Start**/
exports.check_user_doc_id = async (req,res,next) => {
 var request_id = req.body.request_id;
 var doc_id = req.body.doc_id;
 console.log("doc_id********** ",doc_id);
  await db.query("SELECT * FROM tbl_client_verification_requests WHERE request_id="+request_id,{ type:db.QueryTypes.SELECT}).then(async(requestData)=>{
      console.log("requestData ",requestData);
      var reflect_id = requestData[0].reflect_id;
      await db.query("SELECT * FROM tbl_myreflectid_doc_rels INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id WHERE tbl_myreflectid_doc_rels.doc_id="+doc_id+" AND tbl_myreflectid_doc_rels.reflect_id="+reflect_id,{ type:db.QueryTypes.SELECT}).then(async(doc_data)=>{
        console.log("doc_data ",doc_data);
        if(doc_data.length>0){
          res.send({doc_data:doc_data})
        }else{
          res.send({doc_data:"fail"});
        }
      })
  })
}
/**Check User Document by Id Post method End**/

/**upload_verifier_requested_dococument Post method Start**/
exports.upload_ver_req_doc = async (req,res,next) =>{
  var user_doc_id = req.body.user_doc_id;
  var request_id = req.body.request_id;
  var client_id;
  if(req.body.down_check!="yes"){
  var download = "no" ;
  }else{
    var download = "yes"
  }
  if(req.body.view_check!="yes"){
  var view = "no" ;
  }else{
    var view = "yes"
  }
  if(req.body.certify_check!="yes"){
  var certify = "no" ;
  }else{
    var certify = "yes"
  }
 
  await RequestDocumentsModel.create({request_id:request_id,user_doc_id:user_doc_id,download:download,view:view,certified:certify}).then(async(reques_doc) =>{
      await verifierRequestModel.update({req_status:"completed"},{where:{request_id:request_id}}).then(async req_success =>{                         // res.send("success");
      async function upload_water_mark(){
   
       await db.query('SELECT * FROM tbl_request_documents WHERE request_id='+request_id+' AND user_doc_id='+user_doc_id,{ type:db.QueryTypes.SELECT}).then(async(requestDocumentData)=>{
        console.log("req_document",requestDocumentData);
           var new_hash_array =[]
          for(var z=0; z<requestDocumentData.length;z++)
          {
            console.log("*****************user_doc_id************** ",requestDocumentData[z].user_doc_id);
              await db.query("SELECT * FROM tbl_request_documents INNER JOIN tbl_files_docs ON tbl_request_documents.user_doc_id=tbl_files_docs.user_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id= tbl_client_verification_requests.request_id WHERE tbl_request_documents.request_id='"+request_id+"' AND tbl_request_documents.deleted='0' AND tbl_files_docs.deleted='0' AND tbl_request_documents.user_doc_id="+requestDocumentData[z].user_doc_id,{ type:db.QueryTypes.SELECT}).then(async(SortrequestDocumentData)=>{
               // console.log("/////////SortrequestDocumentData////////////",SortrequestDocumentData);
               client_id = SortrequestDocumentData[0].client_id;
               console.log("/////////client_id////////////",client_id);

                  // new_hash_array.push(SortrequestDocumentData[0])
               //    for(var k=0; k<SortrequestDocumentData.length; k++){
                   async.each(SortrequestDocumentData,async function (content1, cb) {
   
                  var w_text="MY_reflect"+content1.request_code;
               //    var fun_hash =SortrequestDocumentData[k].file_content
                  var fun_hash =content1.file_content
                  var a;
                  a= await Jimp.read(`https://ipfs.io/ipfs/${fun_hash}`,async function(err, image) {

                  console.log("hello-----------1 ");

                     await Jimp.create(image.bitmap.width ,image.bitmap.height+((image.bitmap.width/4)+30),'#ffffff',async function(err, nova_new) {

                   //  .then(async nova_new =>{
                       console.log("hello-----------2 ");
                       
                       //  .then(async image => {
                          // var srcImage=blob_url.split(',')[1];
                          console.log("hello-----------3 ");
                          var b;
                           b=  await Jimp.loadFont(Jimp.FONT_SANS_12_BLACK,async function(err, font) {
                       //    .then(async (font) => {
                           console.log("hello-----------4 ");
                          //  var c;
                          //   image.print(font,image.bitmap.width/2.5,image.bitmap.height/2.5,w_text
                          //  //     ,async function(err, font1) {
                          //  // }
                          //  )

                           nova_new.print(font,(image.bitmap.width/4)/3,image.bitmap.height,w_text,)

   
                           
                      
                                      nova_new.composite(image,0,0);
                                
                                  // image.resize(200,200);
                      
                      
                           //    let text_img = nova_new.getBase64Async(Jimp.MIME_PNG);
                      
                                  console.log("hello-----------5 ");
                                    var d;
                                   d= await   nova_new.getBase64Async(Jimp.MIME_PNG)
                                   
                               // .exec(async function(err, result) {
                               // .then(async(result) => {
                                       console.log("hello-----------6 ");
                                   //    let testBuffer = new Buffer(result);
                                    let testBuffer = new Buffer(d);
   
                                       var e;
                                       e = await  ipfs.files.add(testBuffer, async function (err, file) {
                                          if (err) {
                                          console.log("err from ejs",err);
                                          }else{
                                           //    console.log("from ipfs ",file);
                                              console.log("hello-----------7 ");
                                              var p;
                                               p =  await  RequestFilesModel.create({
                                               request_doc_id:content1.request_doc_id,
                                               request_file_hash:file[0].hash
                                              }).then(async (dataForReturn)=>{
                                              //  console.log("hello-----------8 ",z," ",requestDocumentData.length-1);
                                               if(z==(requestDocumentData.length)){
                                                 res.redirect(`/myrequest_view?clientId=${client_id}&request_id=${request_id}`);
                                                }
                                               // return "dataForReturn"; 
                                              })
          
                                          }
                                                                      
                                      })
                                    }) 
                                  })
                                });
                              })
                            })
                          }
                        })
                      }
                      await upload_water_mark();
   //        async function finalRespone(){
   //     res.redirect(`/myrequest_view?clientId=${client_id}&request_id=${request_id}`);
   // }
   // setTimeout(finalRespone(),30000);

      })
  });
                            
}
/**upload_verifier_requested_dococument Post method End**/

/**upload_verifier_requested_dococument_file Post method Start**/
exports.upload_ver_req_doc_file = (req,res,next) => {
  // var doc_id = req.body.doc_id;
  // var request_id = req.body.request_id;
  var client_id;
 const form = formidable({ multiples: true });
    form.parse(req, (err, fields, files) => {
        if (err) {
         console.log(err);
        }
        // console.log("fields ",fields);
        // console.log("files ",files);
        var request_id = fields.request_id;
        var doc_id = fields.doc_id_new;
        var id_number = fields.unique_id;
        var expiry_date = fields.expiry_date;
        if(!fields.down_check_new){
        var download = "no" ;
        }else{
          var download = "yes"
        }
        if(!fields.view_check_new){
        var view = "no" ;
        }else{
          var view = "yes"
        }
        if(!fields.certify_check_new){
        var certify = "no" ;
        }else{
          var certify = "yes"
        }

        let testFile = fs.readFileSync(files.staff_image.path);
        let testBuffer = new Buffer(testFile);

        ipfs.files.add(testBuffer, async function (err, file) {
            if (err) {
            console.log("err from ejs",err);
            }
            console.log("from ipfs ",file);
        
               await db.query('SELECT * FROM tbl_client_verification_requests WHERE request_id='+request_id,{ type:db.QueryTypes.SELECT}).then(async(reflectData)=>{
                await DocumentReflectIdModel.create({doc_id:doc_id,doc_unique_code:id_number,reflect_id:reflectData[0].reflect_id,expire_date:expiry_date}).then(async doc =>{
                    await FilesDocModel.create({user_doc_id:doc.user_doc_id,file_content:file[0].hash}).then(async doc_content =>{
                      await RequestDocumentsModel.create({request_id:request_id,user_doc_id:doc.user_doc_id,download:download,view:view,                        certified:certify}).then(async(reques_doc) =>{
                          await verifierRequestModel.update({req_status:"completed"},{where:{request_id:request_id}}).then(async req_success =>{                         // res.send("success");
                            async function upload_water_mark(){
   
                            await db.query("SELECT * FROM tbl_request_documents WHERE request_id='"+request_id+"' AND user_doc_id="+doc.user_doc_id,{ type:db.QueryTypes.SELECT}).then(async(requestDocumentData)=>{
                              console.log("req_document",requestDocumentData);

                                var new_hash_array =[]
                                for(var z=0; z<requestDocumentData.length;z++)
                                {
                                  console.log("*****************user_doc_id************** ",requestDocumentData[z].user_doc_id);
                                    await db.query('SELECT * FROM tbl_request_documents INNER JOIN tbl_files_docs ON tbl_request_documents.user_doc_id=tbl_files_docs.user_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents.request_id="'+request_id+'" AND tbl_request_documents.deleted="0" AND tbl_files_docs.deleted="0" AND tbl_request_documents.user_doc_id='+requestDocumentData[z].user_doc_id,{ type:db.QueryTypes.SELECT}).then(async(SortrequestDocumentData)=>{
                                    // console.log("/////////SortrequestDocumentData////////////",SortrequestDocumentData);
                                    client_id = SortrequestDocumentData[0].client_id;
                                    console.log("/////////client_id////////////",client_id);

                                        // new_hash_array.push(SortrequestDocumentData[0])
                                    //    for(var k=0; k<SortrequestDocumentData.length; k++){
                                        async.each(SortrequestDocumentData,async function (content1, cb) {
                        
                                        var w_text="MY_reflect"+content1.request_code;
                                    //    var fun_hash =SortrequestDocumentData[k].file_content
                                        var fun_hash =content1.file_content
                        
                                        console.log("hello-----------1 ");
                                          await Jimp.create(500,500,'#ffffff',async function(err, nova_new) {
                                        //  .then(async nova_new =>{
                                            console.log("hello-----------2 ");
                                            var a;
                                              a= await Jimp.read(`https://ipfs.io/ipfs/${fun_hash}`,async function(err, image) {
                                            //  .then(async image => {
                                                // var srcImage=blob_url.split(',')[1];
                                                console.log("hello-----------3 ");
                                                var b;
                                                b=  await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK ,async function(err, font) {
                                                  
                                                  console.log("hello-----------4 ");
                                                var c;
                                                  image.print(font,image.bitmap.width/2.5,image.bitmap.height/2.5,w_text
                                                //     ,async function(err, font1) {
                                                // }
                                                )
                        
                                                
                                            
                                                nova_new.composite(image,0,0);
                                              
                                                image.resize(200,200);
                                            
                                            
                                                //    let text_img = nova_new.getBase64Async(Jimp.MIME_PNG);
                                            
                                                        console.log("hello-----------5 ");
                                                          var d;
                                                        d= await   nova_new.getBase64Async(Jimp.MIME_PNG)
                                                    // .exec(async function(err, result) {
                                                    // .then(async(result) => {
                                                            console.log("hello-----------6 ");
                                                        //    let testBuffer = new Buffer(result);
                                                          let testBuffer = new Buffer(d);
                        
                                                            var e;
                                                            e = await  ipfs.files.add(testBuffer, async function (err, file) {
                                                                if (err) {
                                                                console.log("err from ejs",err);
                                                                }else{
                                                                
                                                                    console.log("hello-----------7 ");
                                                                    var p;
                                                                    p =  await  RequestFilesModel.create({
                                                                    request_doc_id:content1.request_doc_id,
                                                                    request_file_hash:file[0].hash
                                                                    }).then(async (dataForReturn)=>{
                                                                      console.log("hello-----------8 ",z," ",requestDocumentData.length);
                                                                      if(z==(requestDocumentData.length)){
                                                                      res.redirect(`/myrequest_view?clientId=${client_id}&request_id=${request_id}`);
                                                                      }
                                                                      
                                                                    })
                                
                                                                }
                                                                                            
                                                            })
                                                    
                                                            
                                                          }) 
                                    
                                                        })
                                            
                                                      });
                        
                        
                                                    })//
                        
                        
                                        
                                                  })
                                                }
                                              })
                            }
                    await upload_water_mark();
   //        async function finalRespone(){
   //     res.redirect(`/myrequest_view?clientId=${client_id}&request_id=${request_id}`);
   // }
   // // await finalRespone()
   // setTimeout(finalRespone(),30000);

                          })
                        });
                      })
                    })
                  })
                })
              })
}
/**upload_verifier_requested_dococument_file Post method End**/

/**Update Request Confirmed Post method Start**/
exports.update_request = async (req,res,next) => {
 var update_req_id = req.body.update_req_id;
 var request_id = req.body.request_id;
 var user_doc_id = req.body.user_doc_id;
 var download = req.body.download;
 var view = req.body.view;
 var certify = req.body.certify;

 await updatePrmRequestModel.update({update_req_status:"confirmed"},{where:{update_req_id:update_req_id}}).then(async success_result =>{
   await RequestDocumentsModel.update({download:download,view:view,certified:certify},{where:{request_id:request_id,user_doc_id:user_doc_id}}).then(async update_success =>{
    await db.query('SELECT * FROM tbl_client_verification_requests WHERE request_id='+request_id,{ type:db.QueryTypes.SELECT}).then(async(reflectData)=>{
      await db.query('SELECT * FROM tbl_myreflectid_doc_rels INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_myreflectid_doc_rels.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE tbl_myreflectid_doc_rels.user_doc_id='+user_doc_id,{ type:db.QueryTypes.SELECT}).then(async(clientData)=>{
      var notification_msg = `Your request to update permission for ${clientData[0].document_name} has been confirmed by ${clientData[0].rep_firstname}.`;
      var sender_id = reflectData[0].client_id;
      var receiver_id = reflectData[0].verifier_id;
      // var request_id = request_id;
      var notification_type='6';
      var notification_date = new Date();
      await NotificationModel.create({notification_msg:notification_msg,sender_id:sender_id,receiver_id:receiver_id,request_id:request_id,notification_type:notification_type,notification_date:notification_date}).then(async notification =>{
        res.send(update_success);
      })
    })
  })
   })
 })

}
/**Update Request Confirmed Post method End**/

/**Update Request Rejected Post method Start**/
exports.update_request_rejected = async (req,res,next) =>{
  var update_req_id = req.body.update_req_id;
  var request_id = req.body.request_id;
  var user_doc_id = req.body.user_doc_id;
  await updatePrmRequestModel.update({update_req_status:"rejected"},{where:{update_req_id:update_req_id}}).then(async success_result =>{
    await db.query('SELECT * FROM tbl_client_verification_requests WHERE request_id='+request_id,{ type:db.QueryTypes.SELECT}).then(async(reflectData)=>{
      await db.query('SELECT * FROM tbl_myreflectid_doc_rels INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id INNER JOIN tbl_wallet_reflectid_rels ON tbl_myreflectid_doc_rels.reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE tbl_myreflectid_doc_rels.user_doc_id='+user_doc_id,{ type:db.QueryTypes.SELECT}).then(async(clientData)=>{
      var notification_msg = `Your request to update permission for ${clientData[0].document_name} has been rejected by ${clientData[0].rep_firstname}.`;
      var sender_id = reflectData[0].client_id;
      var receiver_id = reflectData[0].verifier_id;
      // var request_id = request_id;
      var notification_type='6';
      var notification_date = new Date();
      await NotificationModel.create({notification_msg:notification_msg,sender_id:sender_id,receiver_id:receiver_id,request_id:request_id,notification_type:notification_type,notification_date:notification_date}).then(async notification =>{
      res.send(success_result);
      })
     })
    })
  })
}
/**Update Request Rejected Post method End**/

/**get-verifier-list Get method Start**/
exports.get_verifier_list_request = async (req,res,next) =>{
  var verifier_array=[];
  var user_id = req.session.user_id;
  await db.query('select * from tbl_wallet_reflectid_rels inner join tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id WHERE tbl_wallet_reflectid_rels.user_as="verifier" and  tbl_wallet_reflectid_rels.reg_user_id!='+user_id,{ type:db.QueryTypes.SELECT}).then(async function(verifiers){
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
      res.send(verifier_array);
  });
}
/**get-verifier-list Get method End**/

/** get-requested-doc Post Method Start  **/
exports.get_requested_doc_for_request = async (req,res,next) =>{
  console.log("./././.---------------get_requested_doc start------------------------------------------------./././/. ");
  var category_id = req.body.category_id;
  var user_id = req.session.user_id;
  var new_test_array=[];
  var requested_doc_array=[];
  await db.query("select * from tbl_wallet_reflectid_rels WHERE reflectid_by!='digitalWallet' and user_as='client' AND deleted='0' and reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(myIds){
    console.log(myIds);
  await db.query("select * from tbl_manage_category_documents WHERE include='yes' AND deleted='0' and category_id="+category_id,{ type:db.QueryTypes.SELECT}).then(async function(cat_docs){
      console.log("---------------cat_docs 1-------------- ",cat_docs);
      requested_doc_array=cat_docs;

      for(var i=0;i<cat_docs.length;i++){
          var category_doc_id = cat_docs[i].category_doc_id;
          console.log("---------------cat_docs_id-------------- ",cat_docs[i].category_doc_id);
       await  db.query("select * from tbl_category_documents inner join tbl_documents_masters ON tbl_category_documents.doc_id=tbl_documents_masters.doc_id WHERE tbl_category_documents.deleted='0' and tbl_category_documents.category_doc_id="+category_doc_id,{ type:db.QueryTypes.SELECT})
        .then(async function(requested_docs){
                  console.log("---------------requested_docs-------------- ",requested_docs);
                  console.log("---------------cat_docs[i]-------------- ",cat_docs[i]);
                  console.log("---------------cat_docs_iner_id-------------- ",cat_docs[i].category_doc_id);
          // console.log("---------------cat_docs[i]-------------- ",cat_docs[i]);
       if(requested_docs[0]!=null){
          requested_doc_array[i].document_name = requested_docs[0].document_name
          new_test_array.push(requested_doc_array[i]) ;
          console.log("-----------categories_inner--------------",requested_doc_array);
       }
                
              })
       
      }
       console.log("-----------categories_outer--------------",new_test_array);
     
     
  async function forsend(){
          res.render("front/my-request/sub-category-docs-ajax",{
              requested_docs:new_test_array,myIds
          });
      }
      await forsend();
      
  });
  })
}
/** get-requested-doc Post Method End  **/ 


/**get_refletid_for_request Get method Start**/
exports.get_doc_from_myreflet_for_request = async (req,res,next) =>{
  var reflect_id = req.body.reflect_id;
  db.query("select * from tbl_myreflectid_doc_rels inner join tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id WHERE tbl_myreflectid_doc_rels.deleted='0' and tbl_myreflectid_doc_rels.reflect_id="+reflect_id,{ type:db.QueryTypes.SELECT}).then(function(request_docs){
      console.log("-----------categories--------------",request_docs);
      res.render("front/my-request/myreflet-docs-ajax",{request_docs,reflect_id});    
  }).catch(err=>console.log("err..verifier list.",err))
  
}
/**get_refletid_for_request Get method End**/