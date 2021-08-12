var {UserModel,LogDetailsModel}=require('../../models/user');
var {SecurityMasterModel,UserSecurityModel}=require('../../models/securityMaster');
var{ WalletModel,WalletModelImport } = require('../../models/wallets');
var {MyReflectIdModel, DocumentReflectIdModel, FilesDocModel} = require('../../models/reflect');
var {CountryModel,VerifierCategoryMasterModel,DocumentMasterModel} = require('../../models/master');
var {ClientVerificationModel,RequestDocumentsModel,RequestFilesModel} = require('../../models/request');
var { ComplaintModel,CommentModel,TermsAndCondition} = require('../../models/complaint');
var {NotificationModel} = require('../../models/notification');
var {
    VerifierRequestCategoryModel,VerifierCategoryReflectidModel,ManageCategoryDocument,CategoryDocument,VerifierTermsAndCondition
} =require('../../models/verifier_category');

const nodemailer = require("nodemailer");
var db = require('../../services/database');
var sequelize = require('sequelize');

const Op = sequelize.Op;

var dateTime = require('node-datetime')
var crypto = require('crypto'); 
var text_func=require('../../helpers/text');
var mail_func=require('../../helpers/mail');
const util = require('util');
const { base64encode, base64decode } = require('nodejs-base64');
const generateUniqueId = require('generate-unique-id');
var moment = require('moment');
const formidable = require('formidable');
var Jimp = require('jimp');
var toBuffer = require('blob-to-buffer')
const request = require('request');

const ipfsAPI = require('ipfs-api');
const fs = require('fs');
var async = require('async');

const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})
const paginate   =  require("paginate-array");




//***********************entity start******************
exports.Entity = (req,res,next )=> {
    

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    var ref_id= req.query.reflect_id
    var wallet_id = req.query.wallet_id
    var reflect_code = req.query.reflect_code
    var reflectid_by="entity"
    var  reg_user_id=req.session.user_id
    var  user_as = req.session.user_type 
    var doc_data = []
 
    if(ref_id!=null){
       MyReflectIdModel.findOne({where:{reflect_id:ref_id,deleted:"0"}}).then(result => {
           DocumentReflectIdModel.findAll({where:{reflect_id:ref_id}}).then(doc_data=>{
 
             db.query("SELECT * FROM tbl_myreflectid_doc_rels INNER JOIN tbl_documents_masters on tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id where tbl_myreflectid_doc_rels.reflect_id="+ref_id,{ type:db.QueryTypes.SELECT}).then(async function(document){
                 var documents;
                 if(document==""){
                   documents = null;
                 }else{
                     documents=document;
               //   console.log("---------doc_content----------123",documents);
               for(var i=0;i<document.length;i++){
                //    console.log(i);
                   var doc_id=document[i].user_doc_id;
                   //console.log("doc_id",doc_id);
                   var all_doc_content =[];
                   var all_video_content=[];
                   let all_self_attested =[];

                   var counter=0;

                 await db.query("SELECT * FROM tbl_files_docs where deleted='0' and user_doc_id="+doc_id,{ type:db.QueryTypes.SELECT}).then(async doc_content=>{
                    
                    //await doc_content.forEach(async content =>{
                        async.each(doc_content,async function (content, cb) {

                        if(content.type=='image'){


                            all_doc_content.push(content.file_content);
                           

                           
            if(content.self_attested_hash){

                console.log("content.file_content",content.self_attested_hash);
                var url1='https://ipfs.io/ipfs/';
                var url2=content.self_attested_hash;
                var final_url=url1.concat(url2);

                console.log('final url',final_url);


                console.log("content.self",content.self_attested_hash);

               // console.log('https://ipfs.io/ipfs/'+content.self_attested_hash);
              

                await request(final_url,callback);


              function callback(error, response, body) {
                
                if(!error){

                    //return body;

                   all_self_attested.push(body); 

                   console.log("length",all_self_attested.length);
                                        
                 }
                                
             }

             console.log("self attested 1---",all_self_attested);

            
                                
                            }
                        }
                        else
                        {

                            all_video_content.push(content.file_content);
                        }
                        
                        
                     
                           // cb(null);
                        //console.log(' ------------------------c b-----------fgdfg',res_data);
                        // all_self_attested.push(data);cb();
                        
                        }, function (err) { // called once all iteration callbacks have returned (or an error was thrown)
                        if (err) { console.log("err",err); }
                        console.log('all_self_attested')
                        console.log(all_self_attested); // Final version of eventList
                    });
                })
                    // console.log("---------doc_content---------- ",all_self_attested);


                     documents[i].file_content = all_doc_content;
                     documents[i].video_content = all_video_content;
                     documents[i].self_attested_content = all_self_attested;
                    
                        // var all_docs = all_doc_content.join(',');
                       
                
               }
                //   console.log("---------doc_content---------- ",documents);
                  setTimeout(fordocuments,10000);
                 
                  function fordocuments(){
                 CountryModel.findAll().then(async (allCountries)=>{
                 DocumentMasterModel.findAll({where:{status:'active',deleted:'0',document_type:'master'}}).then(docMasterData=>{
 
                 
                     res.render('front/verifier_myreflect/verifier_my-reflet-id-view-for-entity',{
                         success_msg,
                         err_msg,
                         session:req.session,
                         myreflectEntityData :result,
                         reflect_id:result.reflect_id,
                         DocData: document,
                         allCountries,
                         docMasterData,
                         moment,
                         documents
                     })
 
                 })
             })
            }
        }
         })
     })
 
     })
 
 
 }else{
    
                 MyReflectIdModel.create({reflect_code:reflect_code,
                     reflectid_by:reflectid_by,
                     reg_user_id:reg_user_id,
                     user_as:user_as,
                     wallet_id:wallet_id })
                     .then(result=>{
 
                         MyReflectIdModel.findOne({where:{reflect_id:result.reflect_id,deleted:"0"}}).then(result => {
                             DocumentReflectIdModel.findAll({where:{reflect_id:result.reflect_id}}).then(doc_data=>{
                     
                                 db.query("SELECT * FROM tbl_myreflectid_doc_rels INNER JOIN tbl_documents_masters on tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id where tbl_myreflectid_doc_rels.reflect_id="+result.reflect_id,{ type:db.QueryTypes.SELECT}).then(async function(document){
                                     var documents;
                                     if(document==""){
                                       documents = null;
                                     }else{
                                         documents=document;
                                   //   console.log("---------doc_content----------123",documents);
                                      for(var i=0;i<document.length;i++){
                                       //    console.log(i);
                                          var doc_id=document[i].user_doc_id;
                                          console.log("doc_id",doc_id);
                                          var all_doc_content =[];
                                       var doc_content = await db.query("SELECT * FROM tbl_files_docs where tbl_files_docs.user_doc_id="+doc_id,{ type:db.QueryTypes.SELECT});
                                           // console.log("---------doc_content---------- ",doc_content);
                                           doc_content.forEach(content =>{
                                               all_doc_content.push(content.file_content);
                                               
                                               })
                                               // var all_docs = all_doc_content.join(',');
                                               documents[i].file_content = all_doc_content;
                                       
                                      }
                                      console.log("---------doc_content---------- ",documents);
                                     }
                                     CountryModel.findAll().then(allCountries=>{
                                         DocumentMasterModel.findAll({where:{status:'active',deleted:'0',document_type:'master'}}).then(docMasterData=>{
 
                 
                                             res.render('front/verifier_myreflect/verifier_my-reflet-id-view-for-entity',{
                                                 success_msg,
                                                 err_msg,
                                                 session:req.session,
                                                 myreflectEntityData :result,
                                                 reflect_id:result.reflect_id,
                                                 DocData: document,
                                                 allCountries,
                                                 docMasterData,
                                                 documents,
                                                 moment
                                             })
                         
                                         })
                             })
                         })
                         })
                     
                         })
 
                       
     }).catch(err=>console.log("err",err));
 
          
 }
  
 
    
 }


 exports.submitEntity = (req,res,next) =>{
    var reflect_id = req.body.reflect_id.trim();
     var phone_no = req.body.phone_no;
    var company_email = req.body.company_email;
    var registration_No = req.body.registration_No;
    var country_name = req.body.country_name;
    var company_address = req.body.company_address;
    var company_name = req.body.company_name;
    // var btc_wallet_address = req.body.btc_wallet_address;
    // var eth_wallet_address = req.body.eth_wallet_address;
    // var rep_nationality = req.body.nationality;
    var dateofInco = req.body.date;
console.log("country_name..",country_name)
console.log("country_name..",company_address)

console.log("country_name..",company_name)

console.log("country_name..",dateofInco)


   
    if(country_name!=undefined){
        CountryModel.findOne({where:{country_id:country_name}}).then(countryupdate =>{
            var country_id_new = countryupdate.country_id;
            MyReflectIdModel.update({entity_company_country:country_id_new},{where:{ reflect_id: reflect_id} }).then( (success) => {
                MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
                    var wall_id = result.wallet_id;
                    var country_id = result.entity_company_country;
                    if(country_id!=null){
                        CountryModel.findOne({where:{country_id:country_id}}).then(country =>{
                            UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                            WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                            WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                                console.log("userdatatat.,.,.,.,.,.",user)
                            
                                res.redirect(`/verifier_entity?reflect_id=${reflect_id}`)
                            })
                        })
                    }else{
                        var country = "";
                        UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                        WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                        WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                            
                        
                            res.redirect(`/verifier_entity?reflect_id=${reflect_id}`)
                     
                       
                        })
                    }
                })
            
            })
        })
    } else if(dateofInco!=undefined){
        MyReflectIdModel.update({entity_dateof_incorporation:dateofInco},{where:{ reflect_id: reflect_id} }).then(async (success) => {
            MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
                var wall_id = result.wallet_id;
                var country_id = result.entity_company_country;
                if(country_id!=null){
                    CountryModel.findOne({where:{country_id:country_id}}).then(country =>{
                        UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                        WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                        WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                            
                          
                            res.redirect(`/verifier_entity?reflect_id=${reflect_id}`)
                       
                        })
                    })
                }else{
                    var country = "";
                    UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                    WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                    WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                        
                            res.redirect(`/verifier_entity?reflect_id=${reflect_id}`)
                   
                    })
                }
            })
        
        })
    }else if(company_name!=undefined){
        MyReflectIdModel.update({entity_company_name:company_name},{where:{ reflect_id: reflect_id} }).then(async (success) => {
            MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
                var wall_id = result.wallet_id;
                var country_id = result.entity_company_country;
                if(country_id!=null){
                    CountryModel.findOne({where:{country_id:country_id}}).then(country =>{
                        UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                        WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                        WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                            
                                                       res.redirect(`/verifier_entity?reflect_id=${reflect_id}`)
                       
                        })
                    })
                }else{
                    var country = "";
                    UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                    WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                    WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                       
                        res.redirect(`/verifier_entity?reflect_id=${reflect_id}`)
                   
                    })
                }
            })
        
        })
    }else if(company_address!=undefined){
        MyReflectIdModel.update({entity_company_address:company_address},{where:{ reflect_id: reflect_id} }).then(async (success) => {
            MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
                var wall_id = result.wallet_id;
                var country_id = result.entity_company_country;
                if(country_id!=null){
                    CountryModel.findOne({where:{country_id:country_id}}).then(country =>{
                        UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                        WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                        WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                            
                            res.redirect(`/verifier_entity?reflect_id=${reflect_id}`)
                       
                        })
                    })
                }else{
                    var country = "";
                    UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                    WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                    WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                        
                              res.redirect(`/verifier_entity?reflect_id=${reflect_id}`)
                   
                    })
                }
            })
        
        })
    }else if(registration_No!=undefined){
        MyReflectIdModel.update({entity_company_regno:registration_No},{where:{ reflect_id: reflect_id} }).then(async (success) => {
            MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
                var wall_id = result.wallet_id;
                var country_id = result.entity_company_country;
                if(country_id!=null){
                    CountryModel.findOne({where:{country_id:country_id}}).then(country =>{
                        UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                        WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                        WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                            
                         
                            res.redirect(`/verifier_entity?reflect_id=${reflect_id}`)
                       
                        })
                    })
                }else{
                    var country = "";
                    UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                    WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                    WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                      
                        res.redirect(`/verifier_entity?reflect_id=${reflect_id}`)
                   
                    })
                }
            })
        
        })
    }else if(company_email!=undefined){
        MyReflectIdModel.update({entity_company_emailid:company_email},{where:{ reflect_id: reflect_id} }).then(async (success) => {
            MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
                var wall_id = result.wallet_id;
                var country_id = result.entity_company_country;
                if(country_id!=null){
                    CountryModel.findOne({where:{country_id:country_id}}).then(country =>{
                        UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                        WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                        WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                            
                           
                            res.redirect(`/verifier_entity?reflect_id=${reflect_id}`)
                       
                        })
                    })
                }else{
                    var country = "";
                    UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                    WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                    WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                        
                     
                        res.redirect(`/verifier_entity?reflect_id=${reflect_id}`)
                    })
                }
            })
        
        })
    
    }else if(phone_no!=undefined){
        MyReflectIdModel.update({entity_company_phoneno:phone_no},{where:{ reflect_id: reflect_id} }).then(async (success) => {
            MyReflectIdModel.findOne({where:{reflect_id:reflect_id}}).then(result => {
                var wall_id = result.wallet_id;
                var country_id = result.entity_company_country;
                if(country_id!=null){
                    CountryModel.findOne({where:{country_id:country_id}}).then(country =>{
                        UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                        WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                        WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                            
                           
                            res.redirect(`/verifier_entity?reflect_id=${reflect_id}`)
                       
                        })
                    })
                }else{
                    var country = "";
                    UserModel.hasMany(WalletModel, {foreignKey: 'reg_user_id'})
                    WalletModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
                    WalletModel.findOne({where:{wallet_id:wall_id},include: [UserModel]}).then(function(user){
                       
                        res.redirect(`/verifier_entity?reflect_id=${reflect_id}`)
                    })
                }
            })
        
        })
    
    }

   
   
}

//******add documents*****************************8 *
exports.AddNewDoc = async(req,res,next )=> {
    // console.log(".........files1.......",req.file)


    const form = formidable({ multiples: true });
  await  form.parse(req, async(err, fields, files) => {
        if (err) {
         console.log(err);
        }
            console.log(".........files.......",files)

// res.send({fields:fields,files:files})
    var exp_date = fields.exp_date
    var doc_name_id= fields.doc_name
    // console.log(".........files.......",files)
   var doc_id_number =fields.id_number
   var reflect_id=fields.reflect_id

//     var exp_date = req.body.exp_date
//     var doc_name_id= parseInt(req.body.doc_name) 
//     // console.log(".........req...",req)
//     var doc= req.file.filename
//    var doc_id_number =parseInt( req.body.id_number)
//    var reflect_id=parseInt(req.body.reflect_id) 
// //    console.log(".........req...",exp_date)

   let testFile = fs.readFileSync(files.document.path);
   let testBuffer = new Buffer(testFile);
 
 await  ipfs.files.add(testBuffer,async function (err, file) {
     if (err) {
       console.log("err from ejs",err);
     }

    await DocumentReflectIdModel.create({doc_id:doc_name_id,doc_unique_code:doc_id_number,reflect_id:reflect_id,expire_date:exp_date}).then(async(doc) =>{
        // console.log("&&&&&&&&&&&&&&&&&&&&&&&&&",doc)

        // console.log("logocvjdwsnvjknsdjvnsdfvjfkvh<><><<<sdf",doc.user_doc_id)
     await   FilesDocModel.create({user_doc_id:doc.user_doc_id,file_content:file[0].hash}).then(async(doc_content) =>{
        
          
            res.redirect(`/verifier_entity?reflect_id=${reflect_id}`)
        
    }).catch(err=>{console.log("errr1 DocumentReflectIdModel",err)})
       }).catch(err=>{console.log("errr1 FilesDocModel ",err)})

    })
})


 
   
}
// **************** Document Show ********************
exports.request_doc = async(req,res,next) =>{
    console.log("...........................................request_doc start*******....................................");
       var client_id = req.session.user_id;
   
       var reflect_id = req.body.reflect_id;
       var verifier_id = req.body.verifier_id;
       var ver_ref_id = req.body.verifier_reflect_id;
       var sub_cat_id =req.body.sub_cat_id
       var p_cat_id =req.body.p_cat_id
       console.log(".....***sub_cat_id****.....",sub_cat_id);
       console.log(".....***p_cat_id****.....",p_cat_id);
   
       const request_code = generateUniqueId({
           length: 6,
           useLetters: false
         });
       var doc_id =[]; 
       var download =[];
       var view =[];
       var certify =[];
   
       doc_id = JSON.parse(req.body.total_doc);
       download = JSON.parse(req.body.download);
       view = JSON.parse(req.body.view);
       certify = JSON.parse(req.body.certify);
       // console.log(".....*******.....",doc_id);   
   
      await MyReflectIdModel.findOne({where:{deleted:"0",reflect_id:reflect_id}}).then(async(c_re_data)=>{
   
       UserModel.hasMany(MyReflectIdModel, {foreignKey: 'reg_user_id'})
       MyReflectIdModel.belongsTo(UserModel, {foreignKey: 'reg_user_id'})
       await MyReflectIdModel.findOne({where:{deleted:"0",reflect_id:ver_ref_id},include:[UserModel]}).then(async(v_re_data)=>{
   
       //    console.log("my reflect c $ v data",v_re_data,c_re_data)
   
         var  request_pin =   v_re_data.reflect_code+c_re_data.reflect_code+v_re_data.tbl_user_registration.user_pin
         var mykey = crypto.createCipher('aes-128-cbc', 'mypass');
        var mystr = mykey.update(request_pin, 'utf8', 'hex')
        mystr += mykey.final('hex');
        var cript_64_request_pin = mystr
       //   console.log("cript_64_request_pin",cript_64_request_pin)
   
   
   
        await ClientVerificationModel.create({
                                        request_code:request_code,
                                        verifier_id:verifier_id,
                                        verifer_my_reflect_id:ver_ref_id,
                                        reflect_id:reflect_id,
                                        client_id:client_id,
                                        request_pin:cript_64_request_pin,
                                        p_category_id: p_cat_id,
                                       sub_category_id:sub_cat_id,
                                    }).then(async(verifyRequest) =>{
   // console.log("/////////////////////------",verifyRequest);
   
   var request_id = verifyRequest.request_id;
       await UserModel.findOne({ where: {reg_user_id: client_id} }).then(async(userData) =>{
                        await  NotificationModel.create({
                                                    notification_msg:`You have recieved a request from ${userData.full_name}.`,
                                                    sender_id:client_id,
                                                    receiver_id:verifier_id,
                                                    request_id:request_id,
                                                    notification_type:'1',
                                                    notification_date:new Date()
                                        }).then(async(notification) =>{
   for(var i=0;i<doc_id.length;i++){
                       //   console.log("/////////////////////",doc_id[i]);
    await RequestDocumentsModel.create({request_id:request_id,user_doc_id:doc_id[i],download:download[i],view:view[i],                        certified:certify[i]}).then(async(success) =>{
                               // res.send("success");
                             }).catch(err=>console.log("RequestDocumentsModel err",err))
                            }
   
    async function upload_water_mark(){
   
       await db.query('SELECT * FROM tbl_request_documents WHERE request_id='+request_id+' AND deleted="0"',{ type:db.QueryTypes.SELECT}).then(async(requestDocumentData)=>{
           var new_hash_array =[]
          for(var z=0; z<requestDocumentData.length;z++)
          {
              await db.query('SELECT * FROM tbl_request_documents INNER JOIN tbl_files_docs ON tbl_request_documents.user_doc_id=tbl_files_docs.user_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id= tbl_client_verification_requests.request_id WHERE tbl_request_documents.request_id='+request_id+' AND tbl_request_documents.deleted="0" AND tbl_files_docs.deleted="0" AND tbl_request_documents.user_doc_id='+requestDocumentData[z].user_doc_id,{ type:db.QueryTypes.SELECT}).then(async(SortrequestDocumentData)=>{
               console.log("/////////SortrequestDocumentData////////////",SortrequestDocumentData);
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
                       //    .then(async (font) => {
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
                                           //    console.log("from ipfs ",file);
                                              console.log("hello-----------7 ");
                                              var z;
                                               z =  await  RequestFilesModel.create({
                                               request_doc_id:content1.request_doc_id,
                                               request_file_hash:file[0].hash
                                              }).then(async (dataForReturn)=>{
                                               console.log("hello-----------8 ");
                                               return "dataForReturn"; 
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
   async function finalRespone(){
       res.send("success")
   }
   await finalRespone()
   
   }).catch(err=>console.log("notification err",err))
   }).catch(err=>console.log("notification err err",err))
   
   }).catch(err=>console.log("notification err err ",err))
   }).catch(err=>console.log("err client",err))
   }).catch(err => console.log("err v_code",err))
       
   }

   exports.request_check_pin = (req,res,next) =>{
    var otp = req.body.pin;
    var user_id = req.session.user_id;
    console.log("-----------------------",user_id);
    UserModel.findOne({where:{reg_user_id:user_id}}).then(user =>{
        if(user.user_pin!=otp){
            res.send("");
        }else{
            var data ={
                success_data:"success"
            }
            res.send(data);
        }
    })
}
exports.request_doc_individual = async (req,res,next) =>{
    var client_id = req.session.user_id;
    const request_code = generateUniqueId({
        length: 6,
        useLetters: false
      });
    var reflect_id = req.body.reflect_id;
    var verifier_id = req.body.verifier_id;
    var ver_ref_id = req.body.verifier_reflect_id;
    var doc_id =req.body.doc_id;
    var download =req.body.download;
    var view =req.body.view;
    var certify =req.body.certify;
    var msg = req.body.msg;
    console.log("------------------msg ",msg);

    await ClientVerificationModel.create({request_code:request_code,verifier_id:verifier_id,verifer_my_reflect_id:ver_ref_id,
        reflect_id:reflect_id,
        client_id:client_id}).then(verifyRequest =>{
        var request_id = verifyRequest.request_id;
            RequestDocumentsModel.create({request_id:request_id,user_doc_id:doc_id,download:download,view:view,certified:certify,message:msg}).then(success =>{
                console.log("sssssssssssssss",success);
                res.send("success");
            })
    })    
}
exports.self_attested = async (req,res,next) =>{
    var user_doc_id = req.body.attested_doc_id;
    var blob_url = req.body.blob_url;
    
  let attachments=[];
    // console.log("sign",blob_url);
    // console.log("user_doc_id",user_doc_id);
   var hashes =[];
    await FilesDocModel.findAll({where:{user_doc_id:user_doc_id,type:"image",deleted:'0'}}).then(async all_doc_hash =>{
       
       for(var i=0;i<all_doc_hash.length;i++){
 
         hashes.push(all_doc_hash[i].file_content);
           
        }
 
      //  console.log("-------hashes---------" ,hashes);
         await DocumentReflectIdModel.update({self_assested:'yes',dig_signature:blob_url},{where:{ user_doc_id: user_doc_id} }).then(async results =>{
             
             
             for(var j=0;j<hashes.length;j++){
 
                 fun_hash = hashes[j];
 
                 var data_img=await get_digi_hash(fun_hash,blob_url);
                 
 
             }
 
 
             var all_attested_images=await FilesDocModel.findAll({where:{user_doc_id:user_doc_id,type:"image",deleted:'0'}});
 
            
 
            if(all_attested_images.length>0)
            {
                 for(j=0;j<all_attested_images.length;j++)
                 {
                     var final_url="https://ipfs.io/ipfs/".concat(all_attested_images[j].self_attested_hash);
                    
                     await request(final_url,callback);
 
 
                           function callback(error, response, body) {
                             
                             if(!error){
 
                                 //return body;
                             var img_obj={
                              filename:'Attachment'.concat(j).concat('.png'),
                              content: body.split("base64,")[1],
                              encoding: 'base64'
                             }
                             
                                // new_imgs[j]['filename']='Attachment'.concate(j);
 
                              attachments.push(img_obj); 
 
                                // console.log("length",new_imgs.length);
                                                     
                              }
                                             
                          }
                 }
            }
 
         setTimeout(send_mail,10000);
 
      
             /**send email start**/
            async function send_mail()
            {
 
             //self_attested_hash start
            // console.log("images",new_imgs);
             //self_attested_hash end
 
             var email = req.session.email;
             //var email ='surabhivinchurkar@questglt.com';
             var full_name = req.session.name;
             var smtpTransport = nodemailer.createTransport({
                 service: 'gmail',
                 auth: {
                   user: 'info.myreflet@gmail.com',
                   pass: 'myquest321'
                 }
               });
 
 
               var html_data_part1=`<!DOCTYPE html>
                 <html>
                   <head>
                     <title>My Reflet</title>
                     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                     <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                      <style>
                     @media only screen and (max-width: 600px) {
                     .inner-body {
                     width: 100% !important;
                     }
                     .footer {
                     width: 100% !important;
                     }
                     }
                     @media only screen and (max-width: 500px) {
                     .button {
                     width: 100% !important;
                     }
                     }
                     </style> 
                   </head>
                   <body>
                     <div style="border:1px solid #000; width: 900px; max-width: 100%;margin: 30px auto;font-family: sans-serif;">
                       <div style="background-color: #3A3183;padding: 10px 30px 5px;">
                         <img src="http://165.22.209.72:3008/admin-assets/images/logo-white.png" style="width: 120px;">
                       </div>
                       <div style="padding: 30px;line-height: 32px; text-align: justify;">
                         <h4 style="font-size: 20px; margin-bottom: 0;">Dear  ${full_name},</h4>
                         <p>Please find your attested document : </p>`;
 
 
              var html_data_part2='';
 
              // if(new_imgs.length>0)
              // {
              //    for(j=0;j<new_imgs.length;j++)
              //    {
              //      // console.log("--hash--",`https://ipfs.io/ipfs/${all_attested_images[j].self_attested_hash}`);
 
              //         // var buffer_image = new Buffer(new_imgs[j],"base64");
              //         // buffer_image.toString();
 
              //         var buffer_image = new Buffer(new_imgs[j].split("base64,")[1], "base64");
 
              //            console.log("buffer img",buffer_image);
 
              //         html_data_part2+=`<p><img src="${buffer_image}" width="100" height="100" ></p>`;
              //    }
              // }
 
 
              var html_data_part3=`<p>Please contact to administrator for more details.</p>
                         <h4 style="margin: 0;line-height: 20px; margin-top: 50px;">Thanks & Regards</h4>
                         <h4 style="margin: 10px 0 20px;line-height: 20px;">My Reflet</h4>
                 
                        
                       </div>
                        <div style="background-color:  #3A3183; color: #fff; padding: 20px 30px;">
                          &copy; Copyright 2020 - My Reflet. All rights reserved.
                         </div>
                     </div>
                   </body>
                 </html>`;
 
 
                 var part1 = html_data_part1.concat(html_data_part2);
                 var html_final=part1.concat(html_data_part3);
 
 
 
 
               const mailOptions = {
                 to: email,
                 from: 'questtestmail@gmail.com',
                 subject: "My Reflect self attested documents.",
                 html:html_final,
                 attachments:attachments
                      
                     
               };
               smtpTransport.sendMail(mailOptions, function (err) {
                
               });
                 console.log("***************when will you be here?************");
                 res.send("success");
 
             }
 
             /**send email end**/
         
         })
    })
 
    
 
 
   
 }

 exports.get_verifier_list = (req,res,next) =>{
    db.query('select * from tbl_wallet_reflectid_rels inner join tbl_user_registrations ON tbl_wallet_reflectid_rels.reg_user_id=tbl_user_registrations.reg_user_id WHERE tbl_wallet_reflectid_rels.user_as="verifier"',{ type:db.QueryTypes.SELECT}).then(function(verifiers){
        res.send(verifiers);
    });
}

exports.get_category_list = (req,res,next) =>{
    var reflect_id = req.body.reflect_id;
    db.query("select * from tbl_verifier_category_reflectids inner join tbl_verifier_request_categories ON tbl_verifier_category_reflectids.category_id=tbl_verifier_request_categories.category_id WHERE tbl_verifier_request_categories.deleted='0' and tbl_verifier_request_categories.parent_category='0' and tbl_verifier_category_reflectids.reflect_id="+reflect_id,{ type:db.QueryTypes.SELECT}).then(function(categories){
        console.log("-----------categories--------------",categories);
        res.render("front/myReflect/ajax_category",{
            categories:categories
        });
    });
}  

exports.get_sub_category_list = (req,res,next) =>{
    var category_id = req.body.category_id;
    db.query("select * from tbl_verifier_request_categories WHERE deleted='0' and parent_category="+category_id,{ type:db.QueryTypes.SELECT}).then(function(sub_categories){
        console.log("-----------categories--------------",sub_categories);
        res.render("front/myReflect/ajax_sub_category",{
            sub_categories:sub_categories
        });
    });
}
exports.get_requested_doc = async (req,res,next) =>{
    console.log("./././.---------------get_requested_doc start------------------------------------------------./././/. ");
    var category_id = req.body.category_id;
    var new_test_array=[];
    var requested_doc_array=[];
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
            res.render("front/myReflect/ajax_category_docs",{
                requested_docs:new_test_array
            });
        }
        await forsend();
        
    });
}

exports.terms_and_condition = async (req,res,next) =>{

    err_msg     = req.flash('err_msg')
    success_msg = req.flash('success_msg')

    var reg_user_id = req.session.user_id
    
    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]
    var verifier_data=[]

    
       await db.query("SELECT *,tbl_verifier_terms_and_conditions.createdAt as 'term_created_date',tbl_verifier_terms_and_conditions.updatedAt as 'term_updated_date' FROM `tbl_wallet_reflectid_rels`  inner join tbl_verifier_terms_and_conditions on tbl_verifier_terms_and_conditions.reflect_id = tbl_wallet_reflectid_rels.reflect_id WHERE user_as='verifier' and tbl_verifier_terms_and_conditions.reg_user_id="+reg_user_id+" AND tbl_verifier_terms_and_conditions.deleted='0'",{type:db.QueryTypes.SELECT})
         .then(async all_data_term=>{

                  
                                   
                   await db.query("SELECT * FROM `tbl_verifier_terms_and_conditions` WHERE reg_user_id="+reg_user_id,{type:db.QueryTypes.SELECT})
                         .then(async terms_data=>{
                        
                             if(terms_data.length>0)
                             {
                                for(var k = 0;k<terms_data.length;k++)
                                {
                                 var reflect_id = terms_data[k].reflect_id;

                                   await db.query("SELECT * FROM `tbl_wallet_reflectid_rels` WHERE user_as='verifier' and reflect_id="+reflect_id+" and   reg_user_id="+reg_user_id+" AND deleted='0'",{type:db.QueryTypes.SELECT})
                                                     .then(verifier_data_1=>{
                                                        
                                                  if(terms_data.length>0)
                                                   {
                                                             verifier_data[k] = verifier_data_1;
                                                   }
                                       })
                                }
                             }else
                             {
                                  await db.query("SELECT * FROM `tbl_wallet_reflectid_rels` WHERE user_as='verifier'  and   reg_user_id="+reg_user_id+" AND deleted='0'",{type:db.QueryTypes.SELECT})
                                                     .then(verifier_data_1=>{
                                                             verifier_data = verifier_data_1;
                                                     })

                             }

                         })

                                            
                                      
                                                if (all_data_term.length > 0) {

                                                    page_data=all_data_term
                                            
                                                }
                                    
                                    
                                    console.log(verifier_data)
                                     
                                    const all_data = paginate(page_data,page, perPage);

                                res.render("front/verifier_terms_and _conditions_create",
                                        {
                                            err_msg,success_msg,verifier_data,all_data,moment
                                       })
              
                           
     })

        
    
}

exports.submit_terms_and_condition = async (req,res,next) =>{

    var termsCondition  = req.body.terms_data
    var reg_user_id     = req.session.user_id

    var reflet_list = [];
    reflet_list = JSON.parse(req.body.reflect_id);
    
    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');

    for(var i = 0;i<reflet_list.length; i++ ){
                      console.log('done : ',i,'  length : ',(reflet_list.length-1)," reflet_list[i] :",reflet_list[i])
      
                
          await VerifierTermsAndCondition.create({terms_and_condition:termsCondition,reg_user_id:reg_user_id,reflect_id:reflet_list[i],created_at:formatted}).
               then(result=>{
    
              })
                   
        }   
                
         res.send("done")
                
}
exports.edit_submit_terms_and_condition = async (req,res,next) =>{

    var termsCondition  = req.body.terms_data
    var reg_user_id     = req.session.user_id

    var term_id = req.body.term_id;
    
    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');

       
    var updateValues=
    {
        updatedAt:formatted,
        terms_and_condition:termsCondition
    }
    await VerifierTermsAndCondition.update(updateValues, { where: { verifier_t_and_c_id: term_id } }).then((result) => 
    {

            req.flash('success_msg', 'Your Entry successfully updated!');
            res.redirect('/verifier-terms-and-condition')
         
    })          
         
                   
                
        
}

exports.terms_reflect_filter = (req,res,next) =>{

    var reg_user_id = req.session.user_id
    var reflet_list = [];

    reflet_list = JSON.parse(req.body.reflect_id);
    
    var term_reflet_list=reflet_list.join("','");


       db.query("SELECT *,tbl_verifier_terms_and_conditions.createdAt as 'term_created_date',tbl_verifier_terms_and_conditions.updatedAt as 'term_updated_date' FROM `tbl_wallet_reflectid_rels`  inner join tbl_verifier_terms_and_conditions on tbl_verifier_terms_and_conditions.reflect_id = tbl_wallet_reflectid_rels.reflect_id WHERE user_as='verifier' and tbl_verifier_terms_and_conditions.reg_user_id="+reg_user_id+" AND tbl_verifier_terms_and_conditions.deleted='0' AND tbl_verifier_terms_and_conditions.reflect_id IN ('"+term_reflet_list+"')",{ type:db.QueryTypes.SELECT}).then(async function(all_data){


            res.render('front/ajax_veriier_terms_and_conditions',{all_data,moment})

        })

    .catch(err=>console.log(err))

  
 
}

exports.search_terms_reflect_filter = (req,res,next) =>{

    var reg_user_id = req.session.user_id
    var query = req.body.query;


       db.query("SELECT *,tbl_verifier_terms_and_conditions.createdAt as 'term_created_date',tbl_verifier_terms_and_conditions.updatedAt as 'term_updated_date' FROM `tbl_wallet_reflectid_rels`  inner join tbl_verifier_terms_and_conditions on tbl_verifier_terms_and_conditions.reflect_id = tbl_wallet_reflectid_rels.reflect_id WHERE user_as='verifier' and tbl_verifier_terms_and_conditions.reg_user_id="+reg_user_id+" AND tbl_verifier_terms_and_conditions.deleted='0' AND (rep_firstname LIKE '%"+query+"%' or entity_company_name LIKE '%"+query+"%' or reflectid_by LIKE '%"+query+"%' or tbl_verifier_terms_and_conditions.createdAt LIKE '%"+query+"%' or reflectid_by LIKE '%"+query+"%' or tbl_verifier_terms_and_conditions.updatedAt LIKE '%"+query+"%')",{ type:db.QueryTypes.SELECT}).then(async function(all_data){


            res.render('front/ajax_veriier_terms_and_conditions',{all_data,moment})

        })

    .catch(err=>console.log(err))

  
 
}
exports.verifier_terms_and_conditions = (req,res,next) =>{

    var reflect_id = req.query.reflect_id

    db
    
    .query('SELECT * FROM tbl_verifier_terms_and_conditions WHERE reflect_id='+reflect_id+' AND deleted="0"',{type:db.QueryTypes.SELECT})
    
    .then(data=>{

        res.render('front/verifier_terms_and_condition',{data})

    })

    .catch(err=>console.log(err))

  
 
}


