var {UserModel,LogDetailsModel}=require('../../models/user');
var {SecurityMasterModel,UserSecurityModel}=require('../../models/securityMaster');
var{ WalletModel,WalletModelImport } = require('../../models/wallets');
var {MyReflectIdModel, DocumentReflectIdModel, FilesDocModel} = require('../../models/reflect');
var {CountryModel,VerifierCategoryMasterModel,DocumentMasterModel} = require('../../models/master');
var {ClientVerificationModel,RequestDocumentsModel,RequestFilesModel} = require('../../models/request');
var { ComplaintModel,CommentModel} = require('../../models/complaint');
var {NotificationModel} = require('../../models/notification');
var {DigitalWalletRelsModel} = require('../../models/wallet_digital_rels');
var {tbl_shared_certified_doc} = require('../../models/certified_shared_documents');
var url = require('url');
var http = require('http');
var sizeOf = require('buffer-image-size');
const nodemailer = require("nodemailer");
var db = require('../../services/database');
var sequelize = require('sequelize');

const Op = sequelize.Op;
var dataUriToBuffer = require('data-uri-to-buffer');
var { decrypt, encrypt } = require('../../helpers/encrypt-decrypt')

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
var admin_notification = require('../../helpers/admin_notification.js')

const ipfsAPI = require('ipfs-api');
const fs = require('fs');
var async = require('async');

const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})
const paginate   =  require("paginate-array");


const Tx = require('ethereumjs-tx')
const Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://13.233.173.250:8501"));


const InputDataDecoder = require('ethereum-input-data-decoder');
var contractABI = [{ "constant": true, "inputs": [{ "name": "", "type": "uint256" }], "name": "documents", "outputs": [{ "name": "doc", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "doc", "type": "string" }, { "name": "verifier_email", "type": "string" }, { "name": "client_email", "type": "string" }, { "name": "doc_name", "type": "string" }, { "name": "verifier_myReflect_code", "type": "string" }, { "name": "client_myReflect_code", "type": "string" }, { "name": "request_status", "type": "string" }, { "name": "reason", "type": "string" }], "name": "addDocument", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getDocumentsCount", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "index", "type": "uint256" }], "name": "getDocument", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }]
        
const decoder = new InputDataDecoder(contractABI);

exports.all_reflect_list = (req,res,next) => {
    var reg_user_id =  req.session.user_id 
    db.query(`SELECT * FROM tbl_wallet_reflectid_rels WHERE tbl_wallet_reflectid_rels.user_as="client" AND tbl_wallet_reflectid_rels.deleted="0" and reg_user_id<>${reg_user_id}`,{type:db.QueryTypes.SELECT})
    .then(async(ver_result) => {
        res.render("front/myReflect/ajax_all_entity_rep_list",{reflect_list:ver_result})
    })
}

exports.share_certify_doc = async (req,res,next) => {
    var share_doc_data  = JSON.parse(req.body.share_doc_data)
    var reflect_id      = req.body.reflect_id
    var my_reflect_id   = req.body.my_reflect_id
    var reg_user_id     = req.session.user_id
    var descriptions    = req.body.descriptions_for_share_doc

    console.log(share_doc_data)
    console.log(reflect_id)
    console.log(my_reflect_id)
    console.log(reg_user_id)

    for(i=0; i<share_doc_data.length; i++) {
        console.log("share_doc_data : ",share_doc_data)

        tbl_shared_certified_doc.create({
            sender_my_reflect_id     :  my_reflect_id,
            receiver_my_reflect_id   :  reflect_id,
            sender_reg_user_id       :  reg_user_id,
            request_id               :  share_doc_data[i].request_id,
            request_doc_id           :  share_doc_data[i].request_doc_id,
            descriptions             :  descriptions
        })
        .then(async data => {          
            console.log("share_doc_data : ",share_doc_data.length," i val : ",i)
            if( i==(share_doc_data.length)){}    
        })
        .catch(err => console.log(err))
    }
    await MyReflectIdModel.findOne({where:{reflect_id:reflect_id }})
    .then(async(myRefdata) => {

        await UserModel.findOne({where:{reg_user_id:reg_user_id}})
        .then(async user_data => {

            var msg = ` ${decrypt(user_data.full_name)} is shared  a document for this reflet code-${myRefdata.reflect_code}.`

            await NotificationModel.create({
                notification_msg:msg,
                sender_id:reg_user_id,
                receiver_id:myRefdata.reg_user_id,
                notification_type:'11',
                notification_date:new Date()
            })
            .then(async(notification) =>{
                console.log(notification)
            })
        })
    })
    console.log("i ,share_doc_data.length",i,share_doc_data.length)
    res.send("success")
}

/**myreflect_all_client_doc Get method Start**/
exports.sender_all_client_doc =async (req,res,next)=>{
    // var email = req.session.email; 
    var  reflect_id = req.query.reflect_id;
    var reg_user_id     = req.session.user_id
    // var type=  req.session.user_type 

    //   console.log('type : ',type);
     
    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]
    

               await  db
               .query("SELECT * FROM tbl_shared_certified_docs inner join tbl_wallet_reflectid_rels on tbl_shared_certified_docs.receiver_my_reflect_id = tbl_wallet_reflectid_rels.reflect_id inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id WHERE tbl_shared_certified_docs.sender_reg_user_id="+reg_user_id+" AND  tbl_shared_certified_docs.sender_my_reflect_id ="+reflect_id+" and tbl_shared_certified_docs.deleted='0'  GROUP BY tbl_shared_certified_docs.receiver_my_reflect_id",{type:db.QueryTypes.SELECT})

                    .then(SharedClientDataResult=>{
                        // console.log('SharedClientData : ',SharedClientDataResult);

                        page_data = SharedClientDataResult
                        const SharedClientData = paginate(page_data,page, perPage);

                                 res.render('front/my_send_doc/myreflect-client-all-doc',{ session:req.session,moment,SharedClientData,reflect_id});

                    })

                    .catch(err=>console.log("err",err))
                      

    
}
/**myreflect_all_client_doc Get method End**/


/**myreflect_all_client_view_doc Get method Start**/
exports.sender_all_client_view_doc =async (req,res,next)=>{
    // var email = req.session.email; 
    const  reflect_id                   = req.query.sender_my_reflect_id;
    const  receiver_my_reflect_id       = req.query.receiver_my_reflect_id;
    
    var type=  req.session.user_type  

    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]

      console.log('type : ',type);

    

            //    await  db.query("SELECT *,tbl_documents_masters.document_name as doc_name,tbl_shared_certified_docs.createdAt as 'shared_created_at' FROM tbl_shared_certified_docs inner join tbl_wallet_reflectid_rels on tbl_shared_certified_docs.sender_my_reflect_id = tbl_wallet_reflectid_rels.reflect_id inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id inner join tbl_request_documents_files on tbl_request_documents_files.request_doc_id=tbl_shared_certified_docs.request_doc_id inner join tbl_request_documents ON tbl_request_documents.request_doc_id=tbl_request_documents_files.request_doc_id INNER JOIN tbl_myreflectid_doc_rels ON tbl_request_documents.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id WHERE sender_my_reflect_id ="+reflect_id+" and tbl_shared_certified_docs.deleted='0' GROUP By transaction_hash ",{type:db.QueryTypes.SELECT})
            await  db.query("SELECT *,tbl_documents_masters.document_name as doc_name,tbl_shared_certified_docs.createdAt as 'shared_created_at' FROM tbl_shared_certified_docs inner join tbl_wallet_reflectid_rels on tbl_shared_certified_docs.sender_my_reflect_id = tbl_wallet_reflectid_rels.reflect_id inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id inner join tbl_request_documents_files on tbl_request_documents_files.request_doc_id=tbl_shared_certified_docs.request_doc_id inner join tbl_request_documents ON tbl_request_documents.request_doc_id=tbl_request_documents_files.request_doc_id INNER JOIN tbl_myreflectid_doc_rels ON tbl_request_documents.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id WHERE sender_my_reflect_id ="+reflect_id+" and receiver_my_reflect_id ="+receiver_my_reflect_id+" and tbl_shared_certified_docs.deleted='0' GROUP By tbl_request_documents_files.request_doc_id ",{type:db.QueryTypes.SELECT})
                    .then(async SharedClientDocumentResult=>{
                                  
                        // console.log("SharedClientDocumentResult : ",SharedClientDocumentResult)    

                           console.log("SharedClientDocumentResult : ",SharedClientDocumentResult.length ,reflect_id)

                        
                        // if(i == (SharedClientDocumentResult.length - 1) && temp == 0){
                        //     res.render('front/personal-explorer/explorer_ver',{receipt_array:[],moment});
                        // }
                       
                        page_data = SharedClientDocumentResult
                                      
               
                        const SharedClientDocument = paginate(page_data,page, perPage);

                        res.render('front/my_send_doc/client-all-doc-view',{ session:req.session,moment,reflect_id,SharedClientDocument});

                       
                    })

                    .catch(err=>console.log("err",err))
                      

    
}

/**myreflect_all_client_doc Get method Start**/
exports.receiver_all_client_doc =async (req,res,next)=>{
    // var email = req.session.email; 
    var  reflect_id = req.query.reflect_id;

    
  var type=  req.session.user_type 

  var page = req.query.page || 1
  var perPage = 10;
  var page_data=[]

      console.log('type : ',type);

    

               await  db.query("SELECT *,tbl_shared_certified_docs.createdAt as 'shared_created_id' FROM tbl_shared_certified_docs inner join tbl_wallet_reflectid_rels on tbl_shared_certified_docs.sender_my_reflect_id = tbl_wallet_reflectid_rels.reflect_id inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id WHERE receiver_my_reflect_id ="+reflect_id+" and tbl_shared_certified_docs.deleted='0' GROUP By sender_my_reflect_id,reflect_id order by shared_doc_id desc ",{type:db.QueryTypes.SELECT})

                    .then(SharedClientDataResult=>{

                       

                    page_data = SharedClientDataResult                    
                                         
                    
                    console.log("tbl_shared_certified_docs : ",SharedClientDataResult)

                     
                    const SharedClientData = paginate(page_data,page, perPage);

                              console.log("tbl_shared_certified_docs : ",SharedClientDataResult)

                                 res.render('front/myReflect/myreflect-client-all-doc',{ session:req.session,moment,reflect_id,SharedClientData});

                    })
                    .catch(err=>console.log("err",err))
                      

    
}
/**myreflect_all_client_doc Get method End**/


/**myreflect_all_client_view_doc Get method Start**/
exports.receiver_all_client_view_doc =async (req,res,next)=>{
    // var email = req.session.email; 
    var  reflect_id = req.query.sender_my_reflect_id;
    const  receiver_my_reflect_id       = req.query.receiver_my_reflect_id;

    
    var type=  req.session.user_type  

    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[]

      console.log('type : ',type);

    

            //    await  db.query("SELECT *,tbl_documents_masters.document_name as doc_name,tbl_shared_certified_docs.createdAt as 'shared_created_at' FROM tbl_shared_certified_docs inner join tbl_wallet_reflectid_rels on tbl_shared_certified_docs.sender_my_reflect_id = tbl_wallet_reflectid_rels.reflect_id inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id inner join tbl_request_documents_files on tbl_request_documents_files.request_doc_id=tbl_shared_certified_docs.request_doc_id inner join tbl_request_documents ON tbl_request_documents.request_doc_id=tbl_request_documents_files.request_doc_id INNER JOIN tbl_myreflectid_doc_rels ON tbl_request_documents.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id WHERE sender_my_reflect_id ="+reflect_id+" and tbl_shared_certified_docs.deleted='0' GROUP By transaction_hash ",{type:db.QueryTypes.SELECT})

            await  db.query("SELECT *,tbl_documents_masters.document_name as doc_name,tbl_shared_certified_docs.createdAt as 'shared_created_at' FROM tbl_shared_certified_docs inner join tbl_wallet_reflectid_rels on tbl_shared_certified_docs.sender_my_reflect_id = tbl_wallet_reflectid_rels.reflect_id inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id inner join tbl_request_documents_files on tbl_request_documents_files.request_doc_id=tbl_shared_certified_docs.request_doc_id inner join tbl_request_documents ON tbl_request_documents.request_doc_id=tbl_request_documents_files.request_doc_id INNER JOIN tbl_myreflectid_doc_rels ON tbl_request_documents.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id WHERE sender_my_reflect_id ="+reflect_id+" and receiver_my_reflect_id ="+receiver_my_reflect_id+" and tbl_shared_certified_docs.deleted='0' GROUP By tbl_request_documents_files.request_doc_id",{type:db.QueryTypes.SELECT})

                    .then(async SharedClientDocumentResult=>{
                                  
                        // console.log("SharedClientDocumentResult : ",SharedClientDocumentResult)    

                           console.log("SharedClientDocumentResult : ",SharedClientDocumentResult.length)

                        
                        // if(i == (SharedClientDocumentResult.length - 1) && temp == 0){
                        //     res.render('front/personal-explorer/explorer_ver',{receipt_array:[],moment});
                        // }
                       
                        page_data = SharedClientDocumentResult
                                      
               
                        const SharedClientDocument = paginate(page_data,page, perPage);

                        res.render('front/myReflect/client-all-doc-view',{ session:req.session,moment,SharedClientDocument,reflect_id});

                       
                    })

                    .catch(err=>console.log("err",err))
                      

    
}
/**myreflect_all_client_view_doc Get method End**/
exports.shared_doc_view = async (req,res,next) =>{
   
    var query = req.body.tx_value;
    var reflect_id = req.body.reflect_id;

var user_reg_id =req.session.user_id
console.log("value **** 123 ***** ",query);
var page = req.query.page || 1
var perPage = 10;
var page_data=[];
var hash_data=[];
var temp = 0;
var doc = [];

// const receipt_array=[];
// await db.query("SELECT *,tbl_documents_masters.document_name as doc_name FROM tbl_shared_certified_docs inner join tbl_wallet_reflectid_rels on tbl_shared_certified_docs.sender_my_reflect_id = tbl_wallet_reflectid_rels.reflect_id inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id inner join tbl_request_documents_files on tbl_request_documents_files.request_doc_id=tbl_shared_certified_docs.request_doc_id inner join tbl_request_documents ON tbl_request_documents.request_doc_id=tbl_request_documents_files.request_doc_id INNER JOIN tbl_myreflectid_doc_rels ON tbl_request_documents.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id WHERE sender_my_reflect_id ="+reflect_id+" and transaction_hash ='"+query+"' and tbl_shared_certified_docs.deleted='0' GROUP By transaction_hash ",{type:db.QueryTypes.SELECT}).then(async hash_data_old =>{
    await db.query("SELECT *,tbl_documents_masters.document_name as doc_name FROM tbl_shared_certified_docs inner join tbl_wallet_reflectid_rels on tbl_shared_certified_docs.sender_my_reflect_id = tbl_wallet_reflectid_rels.reflect_id inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id inner join tbl_request_documents_files on tbl_request_documents_files.request_doc_id=tbl_shared_certified_docs.request_doc_id inner join tbl_request_documents ON tbl_request_documents.request_doc_id=tbl_request_documents_files.request_doc_id INNER JOIN tbl_myreflectid_doc_rels ON tbl_request_documents.user_doc_id=tbl_myreflectid_doc_rels.user_doc_id INNER JOIN tbl_documents_masters ON tbl_myreflectid_doc_rels.doc_id=tbl_documents_masters.doc_id WHERE sender_my_reflect_id ="+reflect_id+" and transaction_hash ='"+query+"' and tbl_shared_certified_docs.deleted='0' Group by tbl_request_documents_files.request_doc_id ",{type:db.QueryTypes.SELECT}).then(async hash_data_old =>{

    console.log('hash_data_old : ',hash_data_old);

        // hash_data = hash_data_old;
        // console.log(hash_data_old);

        const delay = (duration) => new Promise(resolve => setTimeout(resolve, duration))

            
            var hash = hash_data_old[0].transaction_hash;
            var created_at = hash_data_old[0].createdAt;

            await waitForReceipt_sec(hash);

            async function waitForReceipt_sec(hashes){

            await web3.eth.getTransaction(hashes, async function (err, receipt) {
                if (err) {
                error(err);
                }
                // console.log("result outside",hash_data_old[i]);
            
                if (receipt !== null) {
                  
                    // await request(`http://api-ropsten.etherscan.io/api?module=account&action=txlist&address=${receipt.from}&startblock=0&endblock=99999999&sort=asc&apikey=XMSYU3WSXHXSBNC81DCNJUZBZIVTBIN1HX`, async function (error, response, body) {

                        // console.log("error ",error);
                    
                        // if (!error && response.statusCode == 200) {
                        //     const tx = JSON.parse(body)
                        //     const result = tx.result;
                        //     // const message = tx.message;
                        //     // console.log("tx ",result);
                        //     // console.log("result inside api ",hash);

                        //     console.log("result inside length ",result.length);

                        //     for(var j=0;j<result.length;j++){
                        //         if(result[j].hash!=hashes){

                        //         }else{
                                    
                                    

                                    const result_input = decoder.decodeData(`${receipt.input}`);

                                    if(result_input.inputs.length>0){

                                        console.log("result result_input.inputs[0] api ",result_input.inputs[0]);
                                        
                                        var new_hash = [];
                                       
                                        new_hash = (result_input.inputs[0]).split(",")

                        
                                
                                        var  t_length = new_hash.length;
                                        var  t = 0;

                                        async function wait_ipfs_request(){
     
                                            async.each(new_hash,async function (content, cb) {
                                                let temp = content.split('-')
                                                let doc_hash = temp[1]
                                                let doc_type

                                                if ( temp[0] == "image" ) {

                                                    doc_type = "image"
                                                 
                                                    await request(`https://ipfs.io/ipfs/${doc_hash}`, async function (error, response, body) {
                                                        
                                                            // console.log("result_input inner",t," new_hash[t] :",content);

                                                                                
                                                            if (!error && response.statusCode == 200) {
                                                                console.log(" tttt : ",t);
                                                                doc.push({type: doc_type ,body});

                                                                t++; 
                                                        }
                                                })

                                                } else if (  temp[0] == "video" ) {

                                                    doc_type = "video"
                                                    // await request(`https://ipfs.io/ipfs/${doc}`, async function (error, response, body) {

                                                    //     console.log("result_input inner", t, " new_hash[t] :", content);
    
    
                                                    //     if (!error && response.statusCode == 200) {
                                                            console.log(" tttt : ", t);
                                                            doc.push({type: doc_type ,body:doc_hash});
                                                            t++;
                                                    //     }
                                                    // })

                                                }  else if (  temp[0] == "pdf" ) {

                                                    doc_type = "pdf"
                                                    // await request(`https://ipfs.io/ipfs/${doc}`, async function (error, response, body) {

                                                    //     console.log("result_input inner", t, " new_hash[t] :", content);
    
    
                                                    //     if (!error && response.statusCode == 200) {
                                                            console.log(" tttt : ", t);
                                                            doc.push({type: doc_type ,body:doc_hash});
                                                            t++;
                                                    //     }
                                                    // })

                                                }else {

                                                    doc_type = "image"
                                                   
                                                    await request(`https://ipfs.io/ipfs/${doc_hash}`, async function (error, response, body) {
                                                        
                                                            // console.log("result_input inner",t," new_hash[t] :",content);

                                                                                
                                                            if (!error && response.statusCode == 200) {
                                                                console.log(" tttt : ",t);
                                                                doc.push({type: doc_type ,body});

                                                                t++; 
                                                        }
                                                })
                                                    
                                                }

                                                  
                                                await delay(10000)

                                            })
                                        }
                            

                                        async function send_data(){

                                            console.log("doc length ",doc.length);
                                            console.log("receipt_array 2");
                                            

                                            res.render('front/myReflect/view_certified_ajax',{doc})

                                                        //  res.send(doc)
                                                
                                            
                                            
                                        } 
                                        console.log("before request ");

                                        await wait_ipfs_request();

                                        console.log("After request ");
                                        await delay(10000)

                                        console.log("before send ");
                                        await send_data();
                                        console.log("After send ");
                                    }
                        //         }
                        //     }
                    

                        // }
                    // })
                    
                }else{
                    console.log("error");
                }
            });
        
        }
})
}
// 
exports.search_client_at_receiver_side = async (req,res,next )=> {
   
    
    // var admin_id = req.query.admin_id;

     var query = req.body.query;
     var reflect_id = req.body.reflect_id;

    // await DocumentMasterModel.findAll({ where:{deleted:'0'} }).then(function(document_list_result) {
    //   console.log(plan_list)
    db.query("SELECT *,tbl_shared_certified_docs.createdAt as 'shared_created_id' FROM tbl_shared_certified_docs inner join tbl_wallet_reflectid_rels on tbl_shared_certified_docs.sender_my_reflect_id = tbl_wallet_reflectid_rels.reflect_id inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id WHERE receiver_my_reflect_id ="+reflect_id+" and tbl_shared_certified_docs.deleted='0'   and (reflectid_by LIKE '%"+query+"%' or  entity_company_name LIKE '%"+query+"%' or full_name LIKE '%"+query+"%' or rep_firstname LIKE '%"+query+"%' or reflect_code LIKE '%"+query+"%' or tbl_shared_certified_docs.createdAt LIKE '%"+query+"%') GROUP By sender_my_reflect_id order by shared_doc_id desc",{ type:db.QueryTypes.SELECT}).then(function(client_result){


        res.render('front/my_send_doc/ajax_all_receiver_client',{
            client_result,moment

        
    });
}); 
} 
exports.search_client_at_sender_side = async (req,res,next )=> {
   
    
    // var admin_id = req.query.admin_id;
    var reg_user_id =  req.session.user_id 

     var query = req.body.query;
     var reflect_id = req.body.reflect_id;

    // await DocumentMasterModel.findAll({ where:{deleted:'0'} }).then(function(document_list_result) {
    //   console.log(plan_list)
    db.query("SELECT * FROM tbl_shared_certified_docs inner join tbl_wallet_reflectid_rels on tbl_shared_certified_docs.receiver_my_reflect_id = tbl_wallet_reflectid_rels.reflect_id inner join tbl_user_registrations on tbl_user_registrations.reg_user_id=tbl_wallet_reflectid_rels.reg_user_id WHERE tbl_shared_certified_docs.sender_reg_user_id="+reg_user_id+" AND  tbl_shared_certified_docs.sender_my_reflect_id ="+reflect_id+" and tbl_shared_certified_docs.deleted='0'  AND (reflectid_by LIKE '%"+query+"%' or  entity_company_name LIKE '%"+query+"%' or full_name LIKE '%"+query+"%' or rep_firstname LIKE '%"+query+"%' or reflect_code LIKE '%"+query+"%' or tbl_shared_certified_docs.createdAt LIKE '%"+query+"%')  GROUP BY tbl_shared_certified_docs.receiver_my_reflect_id order by shared_doc_id desc",{ type:db.QueryTypes.SELECT}).then(function(client_result){


        res.render('front/my_send_doc/ajax_all_sender_client',{
            client_result,moment

        
    });
}); 
} 