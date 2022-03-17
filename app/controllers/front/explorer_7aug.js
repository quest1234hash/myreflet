var {UserModel,LogDetailsModel}=require('../../models/user');
var {SecurityMasterModel,UserSecurityModel}=require('../../models/securityMaster');
var{ WalletModel,WalletModelImport } = require('../../models/wallets');
var {MyReflectIdModel, DocumentReflectIdModel,FilesDocModel} = require('../../models/reflect');
var {CountryModel,VerifierCategoryMasterModel,DocumentMasterModel} = require('../../models/master');
var {ClientVerificationModel,RequestDocumentsModel,RequestFilesModel,verifierRequestModel,updatePrmRequestModel} = require('../../models/request');
var { ComplaintModel,CommentModel} = require('../../models/complaint');
var { tbl_verifier_plan_master,tbl_verifier_doc_list} = require('../../models/admin');
var { tbl_verfier_purchase_details } =require("../../models/purchase_detaile")
var { tbl_address_book } =require("../../models/address_book")
var {NotificationModel}=require('../../models/notification');
var {VerifierRequestCategoryModel,VerifierCategoryReflectidModel,ManageCategoryDocument,CategoryDocument} = require('../../models/verifier_category');

const Op = require('sequelize').Op

const Tx = require('ethereumjs-tx')
const Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/f8a10cc5a2684f61b0de4bf632dd4f4b"));

const nodemailer = require("nodemailer");
var db = require('../../services/database');
var sequelize = require('sequelize');
var dateTime = require('node-datetime');
const paginate   =  require("paginate-array");
var crypto = require('crypto');
var text_func=require('../../helpers/text');
var mail_func=require('../../helpers/mail');
const util = require('util');
const { base64encode, base64decode } = require('nodejs-base64');
const generateUniqueId = require('generate-unique-id');
var moment = require('moment');
var crypto = require('crypto'); 
var request = require('request');
var formidable = require('formidable');

//28-02-2020
const ipfsAPI = require('ipfs-api');
const fs = require('fs');
const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})

const InputDataDecoder = require('ethereum-input-data-decoder');
var contractABI =[{"constant":true,"inputs":[],"name":"getDocumentsCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"doc","type":"string"},{"name":"verifier_email","type":"string"},{"name":"client_email","type":"string"},{"name":"doc_name","type":"string"},{"name":"verifier_myReflect_code","type":"string"},{"name":"client_myReflect_code","type":"string"},{"name":"request_status","type":"string"},{"name":"reason","type":"string"}],"name":"addDocument","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"index","type":"uint256"}],"name":"getDocument","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"documents","outputs":[{"name":"doc","type":"string"}],"payable":false,"stateMutability":"view","type":"function"}];
        
const decoder = new InputDataDecoder(contractABI);

exports.global_explorer = async (req,res,next) =>{
    
    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[];
    const hash_data_new=[];
    // var receipt_new =[];
    await db.query('SELECT * FROM tbl_request_documents_files WHERE transaction_hash IS NOT NULL',{type:db.QueryTypes.SELECT}).then(async hash_data =>{
        if(hash_data.length>0){

                     console.log("&&&&&&&&&&&&&&&&&&&&&&&111111111111&&&&&&&&&&&&&&&&&&&&");

        console.log(hash_data);

            for(var i=0;i<hash_data.length;i++){

                var hash = hash_data[i].transaction_hash;
                var created_at = hash_data[i].createdAt;
                await waitForReceipt(hash_data[i].transaction_hash);
                async function waitForReceipt(hashes){
                await web3.eth.getTransactionReceipt(hashes, async function (err, receipt) {
                    if (err) {
                    error(err);
                    }
                        // console.log("receipt**** ",i);     
                        console.log("&&&&&&&&&&&&&&&&&&&&222222receiptreceiptreceipt2222222&&&&&&&&&&&&&&&&&&&&&&& ");

                        console.log(hash); 
                                     
                        if(receipt!=null){
                            console.log("receipt inside**** 1 ",i);
                            // receipt_new.push()
                            // async function rec_data(){
                            await request(`http://api-ropsten.etherscan.io/api?module=account&action=txlist&address=${receipt.from}&startblock=0&endblock=99999999&sort=asc&apikey=XMSYU3WSXHXSBNC81DCNJUZBZIVTBIN1HX`, async function (error, response, body) {
                                console.log("error ",error);
                            
                                if (!error && response.statusCode == 200) {
                                    console.log("receipt inside inside****2",i);
                                    const tx = JSON.parse(body)
                                    const result = tx.result;
                                    for(var j=0;j<result.length;j++){
                                        if(result[j].hash!=hashes){

                                        }else{
                                            console.log("result***** ",result[j].hash);
                                            console.log("result 123***** ",hashes);
                                            const result_input = decoder.decodeData(`${result[j].input}`);
                                            if(result_input.inputs.length>0){
                                            var obj ={
                                                receipt:receipt,
                                                created_at:created_at,
                                                doc_name:result_input.inputs[3],
                                                verifier_myReflect_code:result_input.inputs[4],
                                                client_myReflect_code:result_input.inputs[5],
                                                doc_status:result_input.inputs[6]
                                            }
                                            hash_data_new.push(obj);
                                            console.log("result_input ",i);
                                            // if(i==(hash_data.length-1)){
                                                page_data = hash_data_new;
                                                const receipt_array = paginate(page_data,page, perPage);
                                                console.log("receipt_array.data.length ************ ",hash_data_new.length);
                                                console.log("r(hash_data.length ************ ",hash_data.length);

                                                // res.send(receipt_array);  
                                                if(hash_data_new.length==(hash_data.length)){
                                                    console.log("&&&&&&&&&&&&&&&&&&&&innerif&&&&&&&&&&&&&&&&&&&&&&&");

                                                      console.log("FINALLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL");     
                                                res.render('front/global-explorer/explorer',{receipt_array,moment});
                                                    
                                                }
                                            }
                                        }
                                    }
                            

                                }
                            })

                            
                        // }
                        // setTimeout(rec_data,5000);
                    }
                    // }else{
                    //     console.log("error");
                    // }
                });
            }
            }
        }else{
                    console.log("DIRECT OUTTTTTTTTTTTTTTTT********* ");

            res.render('front/global-explorer/explorer',{receipt_array:[],moment});
        }
        // console.log("hash data********* ",hash_data);
        

        // function renderIt(){
           
        // }

        // setTimeout(renderIt(),10000);
    })
}

exports.search_global = async (req,res,next) => {
    var query = req.body.value;
    // console.log("value *********** ",query);
    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[];
    var hash_data=[];
    var temp=0;
    // const receipt_array=[];
    await db.query("SELECT * FROM tbl_request_documents_files WHERE transaction_hash LIKE '%"+query+"%'",{type:db.QueryTypes.SELECT}).then(async hash_data_old =>{
        if(hash_data_old.length==0){
            await db.query('SELECT * FROM tbl_request_documents_files WHERE transaction_hash IS NOT NULL',{type:db.QueryTypes.SELECT}).then(async hash_data_new =>{
                if(hash_data_new.length>0){
                    // hash_data=hash_data_new;
                    // console.log(hash_data_new);
                    for(var i=0;i<hash_data_new.length;i++){
                        // var hash = hash_data_new[i].transaction_hash;
                        // console.log("1");
                        var created_at = hash_data_new[i].createdAt;
                        await waitForReceipt(hash_data_new[i].transaction_hash);
                        async function waitForReceipt(hashes){
                        await web3.eth.getTransactionReceipt(hashes, async function (err, receipt) {
                            if (err) {
                            error(err);
                            }
                        
                            if (receipt !== null) {
                                if(receipt.blockNumber!=query){
                                    // console.log("2");
                                    
                                }else{
                                    temp=receipt.blockNumber;
                                    // console.log("3");
                                    await request(`http://api-ropsten.etherscan.io/api?module=account&action=txlist&address=${receipt.from}&startblock=0&endblock=99999999&sort=asc&apikey=XMSYU3WSXHXSBNC81DCNJUZBZIVTBIN1HX`, async function (error, response, body) {
                            console.log("error ",error);
                        
                            if (!error && response.statusCode == 200) {
                                const tx = JSON.parse(body)
                                const result = tx.result;
                                // console.log("4");
                                // const message = tx.message;
                                // console.log("tx ",result[0]);
                                // console.log("result ",result[82].input);
                                for(var j=0;j<result.length;j++){
                                    if(result[j].hash!=hashes){

                                    }else{
                                        const result_input = decoder.decodeData(`${result[j].input}`);
                                        if(result_input.inputs.length>0){
                                        // console.log("result_input ",i," ",result_input.inputs);
                                        // hash_data_new[i].doc_name = result_input.inputs[3];
                                        // hash_data_new[i].verifier_myReflect_code = result_input.inputs[4];
                                        // hash_data_new[i].client_myReflect_code = result_input.inputs[5];
                                        // hash_data_new[i].doc_status = result_input.inputs[6];
                                        var obj ={
                                            receipt:receipt,
                                            created_at:created_at,
                                            doc_name:result_input.inputs[3],
                                            verifier_myReflect_code:result_input.inputs[4],
                                            client_myReflect_code:result_input.inputs[5],
                                            doc_status:result_input.inputs[6]
                                        }
                                        hash_data.push(obj);
                                        // console.log("result_input ",i);
                                        // if(i==(hash_data.length-1)){
                                            page_data = hash_data;
                                            const receipt_array = paginate(page_data,page, perPage);
                                            // console.log("receipt_array ************ ",receipt_array);
                                            // res.send(receipt_array);  
                                            if(receipt_array.data.length==(hash_data.length)){
                                              
                                                    res.render('front/global-explorer/explorer',{receipt_array,moment});
                                                
                                                
                                            }
                                        }
                                    }
                                }
                        

                            }
                        })
                                }
                                
                                
                            }else{
                                console.log("error");
                            }
                        });
                    }
                    if(i == (hash_data_new.length - 1) && temp == 0){
                        res.render('front/global-explorer/explorer',{receipt_array:[],moment});
                    }
                    }
                }else{
                    hash_data=[];
                }
                
            })
        }else{
            // hash_data = hash_data_old;
            // console.log(hash_data_old);
            for(var i=0;i<hash_data_old.length;i++){
                // var hash = hash_data_old[i].transaction_hash;
                var created_at = hash_data_old[i].createdAt;
                await waitForReceipt_sec(hash_data_old[i].transaction_hash,i,hash_data_old.length);
            async function waitForReceipt_sec(hashes,no,length){
                await web3.eth.getTransactionReceipt(hashes, async function (err, receipt) {
                    if (err) {
                    error(err);
                    }
                    // console.log("result outside",hash_data_old[i]);
                
                    if (receipt !== null) {
                      
                        await request(`http://api-ropsten.etherscan.io/api?module=account&action=txlist&address=${receipt.from}&startblock=0&endblock=99999999&sort=asc&apikey=XMSYU3WSXHXSBNC81DCNJUZBZIVTBIN1HX`, async function (error, response, body) {
                            console.log("error ",error);
                        
                            if (!error && response.statusCode == 200) {
                                const tx = JSON.parse(body)
                                const result = tx.result;
                                // const message = tx.message;
                                // console.log("tx ",result);
                                // console.log("result ",hash);
                                for(var j=0;j<result.length;j++){
                                    if(result[j].hash!=hashes){

                                    }else{
                                        const result_input = decoder.decodeData(`${result[j].input}`);
                                        if(result_input.inputs.length>0){
                                        // console.log("result_input ",i," ",result_input.inputs);
                                        // hash_data_new[i].doc_name = result_input.inputs[3];
                                        // hash_data_new[i].verifier_myReflect_code = result_input.inputs[4];
                                        // hash_data_new[i].client_myReflect_code = result_input.inputs[5];
                                        // hash_data_new[i].doc_status = result_input.inputs[6];
                                        var obj ={
                                            receipt:receipt,
                                            created_at:created_at,
                                            doc_name:result_input.inputs[3],
                                            verifier_myReflect_code:result_input.inputs[4],
                                            client_myReflect_code:result_input.inputs[5],
                                            doc_status:result_input.inputs[6]
                                        }
                                        hash_data.push(obj);
                                        // console.log("i ",i);
                                        // if(i==(hash_data_old.length-1)){
                                            page_data = hash_data;
                                            const receipt_array = paginate(page_data,page, perPage);
                                            // console.log("receipt_array ************ ",receipt_array);
                                            // res.send(receipt_array);  
                                            // console.log("hash_data_old.length ",hash_data_old.length);
                                            if(no==(length - 1)){
                                               
                                            res.render('front/global-explorer/explorer',{receipt_array,moment});
                                                
                                        }
                                        }
                                    }
                                }
                        

                            }
                        })
                        
                    }else{
                        console.log("error");
                    }
                });
            }
            }
        }   
    })
    

}

exports.personal_explorer = async (req,res,next) =>{
    var user_reg_id =req.session.user_id
    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[];
    const hash_data_new=[];

    await db.query('SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents_files.transaction_hash IS NOT NULL AND tbl_client_verification_requests.client_id='+user_reg_id,{type:db.QueryTypes.SELECT}).then(async hash_data =>{
        // console.log("personal_data ",hash_data);
        if(hash_data.length>0){
            for(var i=0;i<hash_data.length;i++){
                // var hash = hash_data[i].transaction_hash;
                var created_at = hash_data[i].createdAt;
                await waitForReceipt(hash_data[i].transaction_hash);
                async function waitForReceipt(hashes){
                await web3.eth.getTransactionReceipt(hashes, async function (err, receipt) {
                    if (err) {
                    error(err);
                    }
                
                    if (receipt !== null) {
                        // console.log("receipt**** ",i);
                        // hash_data_new[i]=receipt;
                        // hash_data_new[i].created_at = created_at;
                        
                        if(receipt!=null){
                            // async function rec_data(){
                            await request(`http://api-ropsten.etherscan.io/api?module=account&action=txlist&address=${receipt.from}&startblock=0&endblock=99999999&sort=asc&apikey=XMSYU3WSXHXSBNC81DCNJUZBZIVTBIN1HX`, async function (error, response, body) {
                                console.log("error ",error);
                            
                                if (!error && response.statusCode == 200) {
                                    const tx = JSON.parse(body)
                                    const result = tx.result;
                                    // const message = tx.message;
                                    // console.log("tx ",result[0]);
                                    // console.log("result ",result[82].input);
                                    for(var j=0;j<result.length;j++){
                                        if(result[j].hash!=hashes){
                                          
                                        }else{
                                            const result_input = decoder.decodeData(`${result[j].input}`);
                                            if(result_input.inputs.length>0){
                                                // var doc = result_input.inputs[0];
                                                // async function getPic(uri){
                                                    await request(`https://ipfs.io/ipfs/${result_input.inputs[0]}`, async function (error, response, body) {
                                                        console.log("error ",error);
                                                                            
                                                        if (!error && response.statusCode == 200) {
                                                            // console.log(body);
                                                            var doc = body;
                                                           
                                                        // }
                                                    // })
                                                // }
                                                // var doc = await getPic(result_input.inputs[0]);
                                                // console.log(doc);
                                            // console.log("result_input ",i," ",result_input.inputs);
                                            // hash_data_new[i].doc_name = result_input.inputs[3];
                                            // hash_data_new[i].verifier_myReflect_code = result_input.inputs[4];
                                            // hash_data_new[i].client_myReflect_code = result_input.inputs[5];
                                            // hash_data_new[i].doc_status = result_input.inputs[6];
                                            var obj ={
                                                receipt:receipt,
                                                created_at:created_at,
                                                verifier_mail:result_input.inputs[1],
                                                client_mail:result_input.inputs[2],
                                                doc_name:result_input.inputs[3],
                                                verifier_myReflect_code:result_input.inputs[4],
                                                client_myReflect_code:result_input.inputs[5],
                                                doc_status:result_input.inputs[6],
                                                reason:result_input.inputs[7],
                                                document:doc
                                            }
                                            hash_data_new.push(obj);
                                            // console.log("result_input ",i);
                                            // if(i==(hash_data.length)){
                                                page_data = hash_data_new;
                                                const receipt_array = paginate(page_data,page, perPage);
                                                console.log("receipt_array ************ ",hash_data_new.length,hash_data.length);
                                                // res.send(receipt_array);  
                                                if(hash_data_new.length==(hash_data.length)){
                                                   
                                                res.render('front/personal-explorer/explorer',{receipt_array,moment});
                                                    
                                                }
                                            }
                                        })
                                        }
                                        }
                                    }
                            

                                }
                            })

                            
                        // }
                        // setTimeout(rec_data,5000);
                    }
                    }else{
                        console.log("error");
                    }
                });
                }
            }
       }else{
            res.render('front/personal-explorer/explorer',{receipt_array:[],moment})
        } 
    })
    // res.render('front/personal-explorer/explorer',{receipt_array,moment});
}

exports.search_personal = async (req,res,next) =>{

    
    if(req.body.value!=undefined&&req.body.value!=null){
        var query = req.body.value;
    }else{
        var query = req.query.tx_hash_ser.trim()
    }
    var user_reg_id =req.session.user_id
    // console.log("value *********** ",query);
    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[];
    var hash_data=[];
    var temp = 0;
    // const receipt_array=[];
    await db.query("SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents_files.transaction_hash LIKE '%"+query+"%' AND tbl_client_verification_requests.client_id="+user_reg_id,{type:db.QueryTypes.SELECT}).then(async hash_data_old =>{
        if(hash_data_old.length==0){
            console.log("hash_data_new null 1 1");
            await db.query('SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents_files.transaction_hash IS NOT NULL AND tbl_client_verification_requests.client_id='+user_reg_id,{type:db.QueryTypes.SELECT}).then(async hash_data_new =>{
                console.log("hash_data_new null 1 2");
                if(hash_data_new.length>0){
                    // console.log("1");
                    // hash_data=hash_data_new;
                    console.log("hash_data_new null 1");
                    // console.log(hash_data_new);
                    if(query.length != 4){

                        for(var i=0;i<hash_data_new.length;i++){
                            var hash = hash_data_new[i].transaction_hash;
                            var created_at = hash_data_new[i].createdAt;
                            await waitForReceipt(hash_data_new[i].transaction_hash);
                            async function waitForReceipt(hashes){
                            await web3.eth.getTransactionReceipt(hashes, async function (err, receipt) {
                                if (err) {
                                    console.log("hash_data_new null");
                                error(err);
                                }
                            
                                if (receipt !== null) {
                                    if(receipt.blockNumber!=query){
                                        console.log("2")
                                        
                                    }else{
                                        temp = receipt.blockNumber;
                                        console.log("3")
    
                                        await request(`http://api-ropsten.etherscan.io/api?module=account&action=txlist&address=${receipt.from}&startblock=0&endblock=99999999&sort=asc&apikey=XMSYU3WSXHXSBNC81DCNJUZBZIVTBIN1HX`, async function (error, response, body) {
                                console.log("error 1",error);
                            
                                if (!error && response.statusCode == 200) {
                                    const tx = JSON.parse(body)
                                    const result = tx.result;
                                    console.log("4")
    
                                    // const message = tx.message;
                                    // console.log("tx ",result[0]);
                                    // console.log("result ",result[82].input);
                                    for(var j=0;j<result.length;j++){
                                        if(result[j].hash!=hashes){
    
                                        }else{
                                            const result_input = decoder.decodeData(`${result[j].input}`);
                                            if(result_input.inputs.length>0){
                                                await request(`https://ipfs.io/ipfs/${result_input.inputs[0]}`, async function (error, response, body) {
                                                    console.log("error 2",error);
                                                                        
                                                    if (!error && response.statusCode == 200) {
                                                        // console.log(body);
                                                        var doc = body;
                                                        // console.log(doc);
    
                                            // console.log("result_input ",i," ",result_input.inputs);
                                            // hash_data_new[i].doc_name = result_input.inputs[3];
                                            // hash_data_new[i].verifier_myReflect_code = result_input.inputs[4];
                                            // hash_data_new[i].client_myReflect_code = result_input.inputs[5];
                                            // hash_data_new[i].doc_status = result_input.inputs[6];
                                            var obj ={
                                                receipt:receipt,
                                                    created_at:created_at,
                                                    verifier_mail:result_input.inputs[1],
                                                    client_mail:result_input.inputs[2],
                                                    doc_name:result_input.inputs[3],
                                                    verifier_myReflect_code:result_input.inputs[4],
                                                    client_myReflect_code:result_input.inputs[5],
                                                    doc_status:result_input.inputs[6],
                                                    reason:result_input.inputs[7],
                                                    document:doc
                                            }
                                            hash_data.push(obj);
                                         
                                            // if(i==(hash_data.length-1)){
                                                page_data = hash_data;
                                                const receipt_array = paginate(page_data,page, perPage);
                                                console.log("result_input ",i,hash_data.length,hash_data_new.length,receipt_array.data.length);
                                                // res.send(receipt_array);  
                                                
                                                if(receipt_array.data.length==(hash_data.length)){
                                                    // if(hash_data_new.length==(hash_data.length)){
    
                                                    console.log("receipt_array ************ ",receipt_array);
                                                    
                                                        res.render('front/personal-explorer/explorer',{receipt_array,moment});
                                                   
                                                
                                            }
                                            }
                                        })
                                    }
                                        }
                                    }
                            
    
                                }
                            })
                                    }
                                    
                                    
                                }else{
                                    console.log("error");
                                }
                            });
                        }
                        if(i == (hash_data_new.length - 1) && temp == 0){
                            console.log("5")
                            res.render('front/personal-explorer/explorer',{receipt_array:[],moment});
                        }
                        }

                    }  else    {
               console.log("*********************Code for reflectc code*************************************************************")
               
               const hash_data_new1=[];
               var g =0
                        await db.query('SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents_files.transaction_hash IS NOT NULL AND tbl_client_verification_requests.client_id='+user_reg_id,{type:db.QueryTypes.SELECT}).then(async hash_data =>{
                            // console.log("personal_data ",hash_data);
                            if(hash_data.length>0){
                                for(var i=0;i<hash_data.length;i++){
                                    // var hash = hash_data[i].transaction_hash;
                                    var created_at = hash_data[i].createdAt;
                                    await waitForReceipt(hash_data[i].transaction_hash);
                                    async function waitForReceipt(hashes){
                                    await web3.eth.getTransactionReceipt(hashes, async function (err, receipt) {
                                        if (err) {
                                        error(err);
                                        }
                                    
                                        if (receipt !== null) {
                                            // console.log("receipt**** ",i);
                                            // hash_data_new[i]=receipt;
                                            // hash_data_new[i].created_at = created_at;
                                            
                                            if(receipt!=null){
                                                // async function rec_data(){
                                                await request(`http://api-ropsten.etherscan.io/api?module=account&action=txlist&address=${receipt.from}&startblock=0&endblock=99999999&sort=asc&apikey=XMSYU3WSXHXSBNC81DCNJUZBZIVTBIN1HX`, async function (error, response, body) {
                                                    console.log("error ",error);
                                                
                                                    if (!error && response.statusCode == 200) {
                                                        const tx = JSON.parse(body)
                                                        const result = tx.result;
                                                        // const message = tx.message;
                                                        // console.log("tx ",result[0]);
                                                        // console.log("result ",result[82].input);
                                                        for(var j=0;j<result.length;j++){
                                                            if(result[j].hash!=hashes){
                                                              
                                                            }else{
                                                                const result_input = decoder.decodeData(`${result[j].input}`);
                                                                if(result_input.inputs.length>0){
                                                                    // var doc = result_input.inputs[0];
                                                                    // async function getPic(uri){
                                                                        await request(`https://ipfs.io/ipfs/${result_input.inputs[0]}`, async function (error, response, body) {
                                                                            console.log("error ",error);
                                                                                                
                                                                            if (!error && response.statusCode == 200) {
                                                                                // console.log(body);
                                                                                var doc = body;
                                                                               
                                                                            // }
                                                                        // })
                                                                    // }
                                                                    // var doc = await getPic(result_input.inputs[0]);
                                                                    // console.log(doc);
                                                                // console.log("result_input ",i," ",result_input.inputs);
                                                                // hash_data_new[i].doc_name = result_input.inputs[3];
                                                                // hash_data_new[i].verifier_myReflect_code = result_input.inputs[4];
                                                                // hash_data_new[i].client_myReflect_code = result_input.inputs[5];
                                                                // hash_data_new[i].doc_status = result_input.inputs[6];
                                                                console.log("receipt_array ************ ",result_input.inputs[5], query);
                                                                g = g+1
                                                                if(result_input.inputs[5] == query || result_input.inputs[4]==query){
                                                                        
                                                                    var obj ={
                                                                        receipt:receipt,
                                                                        created_at:created_at,
                                                                        verifier_mail:result_input.inputs[1],
                                                                        client_mail:result_input.inputs[2],
                                                                        doc_name:result_input.inputs[3],
                                                                        verifier_myReflect_code:result_input.inputs[4],
                                                                        client_myReflect_code:result_input.inputs[5],
                                                                        doc_status:result_input.inputs[6],
                                                                        reason:result_input.inputs[7],
                                                                        document:doc
                                                                    }
                                                                    hash_data_new1.push(obj);
                                                                    // console.log("result_input ",i);
                                                                    // if(i==(hash_data.length)){
                                                                    }
                                                                        page_data = hash_data_new1;
                                                                        const receipt_array = paginate(page_data,page, perPage);
                                                                        // console.log("receipt_array ************ ",receipt_array);
                                                                        // res.send(receipt_array);  
                                                                
                                                                console.log("hash_data.length************ ",hash_data_new1.length, hash_data.length);
                                                                console.log("hash_data.length************ ",hash_data_new1.length, hash_data.length,g);
                                                                if(g==(hash_data.length)){
                                                                        console.log("************ ");
                                                                    res.render('front/personal-explorer/explorer',{receipt_array,moment});
                                                                        
                                                                    }
                                                                }
                                                            })
                                                            }
                                                            }
                                                        }
                                                
                    
                                                    }
                                                })
                    
                                                
                                            // }
                                            // setTimeout(rec_data,5000);
                                        }
                                        }else{
                                            console.log("error");
                                        }
                                    });
                                    }
                                }
                           }else{
                                res.render('front/personal-explorer/explorer',{receipt_array:[],moment})
                            } 
                        })

                    }
                    

                }else{
                    // console.log("6");
                    res.render('front/personal-explorer/explorer',{receipt_array:[],moment});
                }
                
            })
        }else{
            // hash_data = hash_data_old;
            // console.log(hash_data_old);
            for(var i=0;i<hash_data_old.length;i++){
                var hash = hash_data_old[i].transaction_hash;
                var created_at = hash_data_old[i].createdAt;
                await waitForReceipt_sec(hash_data_old[i].transaction_hash,i,hash_data_old.length);
                async function waitForReceipt_sec(hashes,no,length){
                await web3.eth.getTransactionReceipt(hashes, async function (err, receipt) {
                    if (err) {
                    error(err);
                    }
                    // console.log("result outside",hash_data_old[i]);
                
                    if (receipt !== null) {
                      
                        await request(`http://api-ropsten.etherscan.io/api?module=account&action=txlist&address=${receipt.from}&startblock=0&endblock=99999999&sort=asc&apikey=XMSYU3WSXHXSBNC81DCNJUZBZIVTBIN1HX`, async function (error, response, body) {

                            console.log("error 1",error);
                        
                            if (!error && response.statusCode == 200) {
                                const tx = JSON.parse(body)
                                const result = tx.result;
                                // const message = tx.message;
                                // console.log("tx ",result);
                                // console.log("result ",hash);
                                for(var j=0;j<result.length;j++){
                                    if(result[j].hash!=hashes){
                                        console.log("error 2",error);
                                    }else{
                                        const result_input = decoder.decodeData(`${result[j].input}`);
                                        if(result_input.inputs.length>0){
                                            console.log("error 3",error);
                                            await request(`https://ipfs.io/ipfs/${result_input.inputs[0]}`, async function (error, response, body) {
                                                console.log("error 4",error);
                                                                    
                                                if (!error && response.statusCode == 200) {
                                                    console.log("error 5",error);
                                                    // console.log(body);
                                                    var doc = body;
                                                    // console.log(doc);
                                        // console.log("result_input ",i," ",result_input.inputs);
                                        // hash_data_new[i].doc_name = result_input.inputs[3];
                                        // hash_data_new[i].verifier_myReflect_code = result_input.inputs[4];
                                        // hash_data_new[i].client_myReflect_code = result_input.inputs[5];
                                        // hash_data_new[i].doc_status = result_input.inputs[6];
                                        var obj ={
                                            receipt:receipt,
                                            created_at:created_at,
                                            verifier_mail:result_input.inputs[1],
                                            client_mail:result_input.inputs[2],
                                            doc_name:result_input.inputs[3],
                                            verifier_myReflect_code:result_input.inputs[4],
                                            client_myReflect_code:result_input.inputs[5],
                                            doc_status:result_input.inputs[6],
                                            reason:result_input.inputs[7],
                                            document:doc
                                        }
                                        hash_data.push(obj);
                                        // console.log("result_input ",i);
                                        // if(i==(hash_data_old.length-1)){
                                            page_data = hash_data;
                                            const receipt_array = paginate(page_data,page, perPage);
                                            // console.log("receipt_array ************ ",receipt_array);
                                            // res.send(receipt_array);  
                                            if(no == (length - 1)){
                                                
                                                    res.render('front/personal-explorer/explorer',{receipt_array,moment});
                                               
                                            
                                        }
                                    }
                                })
                                        }
                                    }
                                }
                        

                            }
                        })
                        
                    }else{
                        console.log("error123");
                    }
                });
            }
            }
        }   
    })
}

exports.personal_explorer_ver = async (req,res,next) =>{
    var user_reg_id =req.session.user_id
    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[];
    const hash_data_new=[];

    await db.query('SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents_files.transaction_hash IS NOT NULL AND tbl_client_verification_requests.verifier_id='+user_reg_id,{type:db.QueryTypes.SELECT}).then(async hash_data =>{
        // console.log("personal_data ",hash_data);
        if(hash_data.length>0){
            for(var i=0;i<hash_data.length;i++){
                // var hash = hash_data[i].transaction_hash;
                var created_at = hash_data[i].createdAt;
                await waitForReceipt(hash_data[i].transaction_hash);
                async function waitForReceipt(hashes){
                await web3.eth.getTransactionReceipt(hashes, async function (err, receipt) {
                    if (err) {
                    error(err);
                    }
                
                    if (receipt !== null) {
                        // console.log("receipt**** ",i);
                        // hash_data_new[i]=receipt;
                        // hash_data_new[i].created_at = created_at;
                        
                        if(receipt!=null){
                            // async function rec_data(){
                            await request(`http://api-ropsten.etherscan.io/api?module=account&action=txlist&address=${receipt.from}&startblock=0&endblock=99999999&sort=asc&apikey=XMSYU3WSXHXSBNC81DCNJUZBZIVTBIN1HX`, async function (error, response, body) {
                                console.log("error ",error);
                            
                                if (!error && response.statusCode == 200) {
                                    const tx = JSON.parse(body)
                                    const result = tx.result;
                                    // const message = tx.message;
                                    // console.log("tx ",result[0]);
                                    // console.log("result ",result[82].input);
                                    for(var j=0;j<result.length;j++){
                                        if(result[j].hash!=hashes){
                                          
                                        }else{
                                            const result_input = decoder.decodeData(`${result[j].input}`);
                                            if(result_input.inputs.length>0){
                                                // var doc = result_input.inputs[0];
                                                // async function getPic(uri){
                                                    await request(`https://ipfs.io/ipfs/${result_input.inputs[0]}`, async function (error, response, body) {
                                                        console.log("error ",error);
                                                                            
                                                        if (!error && response.statusCode == 200) {
                                                            // console.log(body);
                                                            var doc = body;
                                                           
                                                        // }
                                                    // })
                                                // }
                                                // var doc = await getPic(result_input.inputs[0]);
                                                // console.log(doc);
                                            // console.log("result_input ",i," ",result_input.inputs);
                                            // hash_data_new[i].doc_name = result_input.inputs[3];
                                            // hash_data_new[i].verifier_myReflect_code = result_input.inputs[4];
                                            // hash_data_new[i].client_myReflect_code = result_input.inputs[5];
                                            // hash_data_new[i].doc_status = result_input.inputs[6];
                                            var obj ={
                                                receipt:receipt,
                                                created_at:created_at,
                                                verifier_mail:result_input.inputs[1],
                                                client_mail:result_input.inputs[2],
                                                doc_name:result_input.inputs[3],
                                                verifier_myReflect_code:result_input.inputs[4],
                                                client_myReflect_code:result_input.inputs[5],
                                                doc_status:result_input.inputs[6],
                                                reason:result_input.inputs[7],
                                                document:doc
                                            }
                                            hash_data_new.push(obj);
                                            // console.log("result_input ",i);
                                            // if(i==(hash_data.length)){
                                                page_data = hash_data_new;
                                                const receipt_array = paginate(page_data,page, perPage);
                                                // console.log("receipt_array ************ ",receipt_array);
                                                // res.send(receipt_array);  
                                                
                                                if(hash_data_new.length==(hash_data.length)){
                                                    
                                                        res.render('front/personal-explorer/explorer_ver',{receipt_array,moment});
                                                   
                                                
                                                }
                                            }
                                        })
                                        }
                                        }
                                    }
                            

                                }
                            })

                            
                        // }
                        // setTimeout(rec_data,5000);
                    }
                    }else{
                        console.log("error");
                    }
                });
                }
            }
       }else{
            res.render('front/personal-explorer/explorer_ver',{receipt_array:[],moment})
        } 
    })
    // res.render('front/personal-explorer/explorer',{receipt_array,moment});
}

exports.search_personal_ver = async (req,res,next) =>{
    var query = req.body.value;
    var user_reg_id =req.session.user_id
    console.log("value *********** ",query);
    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[];
    var hash_data=[];
    var temp = 0;
    // const receipt_array=[];
    await db.query("SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents_files.transaction_hash LIKE '%"+query+"%' AND tbl_client_verification_requests.verifier_id="+user_reg_id,{type:db.QueryTypes.SELECT}).then(async hash_data_old =>{
        if(hash_data_old.length==0){
            // console.log("tx hash length 0");
            await db.query('SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents_files.transaction_hash IS NOT NULL AND tbl_client_verification_requests.verifier_id='+user_reg_id,{type:db.QueryTypes.SELECT}).then(async hash_data_new =>{
                if(hash_data_new.length>0){
                    // hash_data=hash_data_new;
                    console.log(hash_data_new);
                    for(var i=0;i<hash_data_new.length;i++){
                        var hash = hash_data_new[i].transaction_hash;
                        var created_at = hash_data_new[i].createdAt;
                        await waitForReceipt(hash_data_new[i].transaction_hash);
                        async function waitForReceipt(hashes){
                        await web3.eth.getTransactionReceipt(hashes, async function (err, receipt) {
                            if (err) {
                            error(err);
                            }
                        
                            if (receipt !== null) {
                                if(receipt.blockNumber!=query){
                                    
                                }else{
                                    temp = receipt.blockNumber;
                                    await request(`http://api-ropsten.etherscan.io/api?module=account&action=txlist&address=${receipt.from}&startblock=0&endblock=99999999&sort=asc&apikey=XMSYU3WSXHXSBNC81DCNJUZBZIVTBIN1HX`, async function (error, response, body) {
                            console.log("error ",error);
                        
                            if (!error && response.statusCode == 200) {
                                const tx = JSON.parse(body)
                                const result = tx.result;
                                // const message = tx.message;
                                // console.log("tx ",result[0]);
                                // console.log("result ",result[82].input);
                                for(var j=0;j<result.length;j++){
                                    if(result[j].hash!=hashes){

                                    }else{
                                        const result_input = decoder.decodeData(`${result[j].input}`);
                                        if(result_input.inputs.length>0){
                                            await request(`https://ipfs.io/ipfs/${result_input.inputs[0]}`, async function (error, response, body) {
                                                console.log("error ",error);
                                                                    
                                                if (!error && response.statusCode == 200) {
                                                    // console.log(body);
                                                    var doc = body;
                                                    // console.log(doc);

                                        // console.log("result_input ",i," ",result_input.inputs);
                                        // hash_data_new[i].doc_name = result_input.inputs[3];
                                        // hash_data_new[i].verifier_myReflect_code = result_input.inputs[4];
                                        // hash_data_new[i].client_myReflect_code = result_input.inputs[5];
                                        // hash_data_new[i].doc_status = result_input.inputs[6];
                                        var obj ={
                                            receipt:receipt,
                                                created_at:created_at,
                                                verifier_mail:result_input.inputs[1],
                                                client_mail:result_input.inputs[2],
                                                doc_name:result_input.inputs[3],
                                                verifier_myReflect_code:result_input.inputs[4],
                                                client_myReflect_code:result_input.inputs[5],
                                                doc_status:result_input.inputs[6],
                                                reason:result_input.inputs[7],
                                                document:doc
                                        }
                                        hash_data.push(obj);
                                        // console.log("result_input ",i);
                                        // if(i==(hash_data.length-1)){
                                            page_data = hash_data;
                                            const receipt_array = paginate(page_data,page, perPage);
                                            // console.log("receipt_array ************ ",receipt_array);
                                            // res.send(receipt_array);  
                                            if(receipt_array.data.length==(hash_data.length)){
                                                // console.log("receipt_array ************ ",receipt_array);
                                               
                                                    res.render('front/personal-explorer/explorer_ver',{receipt_array,moment});
                                                

                                            
                                        }
                                        }
                                    })
                                }
                                    }
                                }
                        

                            }
                        })
                                }
                                
                                
                            }else{
                                console.log("error");
                            }
                        });
                    }
                    if(i == (hash_data_new.length - 1) && temp == 0){
                        res.render('front/personal-explorer/explorer_ver',{receipt_array:[],moment});
                    }
                    }
                }else{
                    res.render('front/personal-explorer/explorer_ver',{receipt_array:[],moment});
                }
                
            })
        }else{
            console.log("tx hash length not 0");

            // hash_data = hash_data_old;
            // console.log(hash_data_old);
            for(var i=0;i<hash_data_old.length;i++){
                var hash = hash_data_old[i].transaction_hash;
                var created_at = hash_data_old[i].createdAt;
                await waitForReceipt_sec(hash_data_old[i].transaction_hash,i,hash_data_old.length);
                async function waitForReceipt_sec(hashes,no,length){
                await web3.eth.getTransactionReceipt(hashes, async function (err, receipt) {
                    if (err) {
                    error(err);
                    }
                    // console.log("result outside",hash_data_old[i]);
                
                    if (receipt !== null) {
                      
                        await request(`http://api-ropsten.etherscan.io/api?module=account&action=txlist&address=${receipt.from}&startblock=0&endblock=99999999&sort=asc&apikey=XMSYU3WSXHXSBNC81DCNJUZBZIVTBIN1HX`, async function (error, response, body) {
                            console.log("error ",error);
                        
                            if (!error && response.statusCode == 200) {
                                const tx = JSON.parse(body)
                                const result = tx.result;
                                // const message = tx.message;
                                // console.log("tx ",result);
                                // console.log("result ",hash);
                                for(var j=0;j<result.length;j++){
                                    if(result[j].hash!=hashes){

                                    }else{
                                        const result_input = decoder.decodeData(`${result[j].input}`);
                                        if(result_input.inputs.length>0){
                                            await request(`https://ipfs.io/ipfs/${result_input.inputs[0]}`, async function (error, response, body) {
                                                console.log("error ",error);
                                                                    
                                                if (!error && response.statusCode == 200) {
                                                    // console.log(body);
                                                    var doc = body;
                                                    // console.log(doc);
                                        // console.log("result_input ",i," ",result_input.inputs);
                                        // hash_data_new[i].doc_name = result_input.inputs[3];
                                        // hash_data_new[i].verifier_myReflect_code = result_input.inputs[4];
                                        // hash_data_new[i].client_myReflect_code = result_input.inputs[5];
                                        // hash_data_new[i].doc_status = result_input.inputs[6];
                                        var obj ={
                                            receipt:receipt,
                                            created_at:created_at,
                                            verifier_mail:result_input.inputs[1],
                                            client_mail:result_input.inputs[2],
                                            doc_name:result_input.inputs[3],
                                            verifier_myReflect_code:result_input.inputs[4],
                                            client_myReflect_code:result_input.inputs[5],
                                            doc_status:result_input.inputs[6],
                                            reason:result_input.inputs[7],
                                            document:doc
                                        }
                                        hash_data.push(obj);
                                        // console.log("result_input ",i);
                                        // if(i==(hash_data_old.length-1)){
                                            page_data = hash_data;
                                            const receipt_array = paginate(page_data,page, perPage);
                                            // console.log("receipt_array ************ ",receipt_array);
                                            // res.send(receipt_array);  
                                            if(no == (length - 1)){
                                               
                                                    res.render('front/personal-explorer/explorer_ver',{receipt_array,moment});
                                               
                                            
                                        }
                                    }
                                })
                                        }
                                    }
                                }
                        

                            }
                        })
                        
                    }else{
                        console.log("error");
                    }
                });
            }
            }
        }   
    })
}

exports.search_personal_from_wallet = async (req,res,next) =>{

    
   
        var query = req.query.tx_hash_ser.trim()
    
    var user_reg_id =req.session.user_id
    // console.log("value *********** ",query);
    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[];
    var hash_data=[];
    var temp = 0;
    // const receipt_array=[];
    await db.query("SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents_files.transaction_hash LIKE '%"+query+"%' AND tbl_client_verification_requests.client_id="+user_reg_id,{type:db.QueryTypes.SELECT}).then(async hash_data_old =>{
        if(hash_data_old.length==0){
            await db.query('SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents_files.transaction_hash IS NOT NULL AND tbl_client_verification_requests.client_id='+user_reg_id,{type:db.QueryTypes.SELECT}).then(async hash_data_new =>{
                if(hash_data_new.length>0){
                    // console.log("1");
                    // hash_data=hash_data_new;
                    console.log(hash_data_new);
                    for(var i=0;i<hash_data_new.length;i++){
                        var hash = hash_data_new[i].transaction_hash;
                        var created_at = hash_data_new[i].createdAt;
                        await waitForReceipt(hash_data_new[i].transaction_hash);
                        async function waitForReceipt(hashes){
                        await web3.eth.getTransactionReceipt(hashes, async function (err, receipt) {
                            if (err) {
                            error(err);
                            console.log(err)
                            }
                        
                            if (receipt !== null) {
                                if(receipt.blockNumber!=query){
                                    // console.log("2")
                                    
                                }else{
                                    temp = receipt.blockNumber;
                                    // console.log("3")

                                    await request(`http://api-ropsten.etherscan.io/api?module=account&action=txlist&address=${receipt.from}&startblock=0&endblock=99999999&sort=asc&apikey=XMSYU3WSXHXSBNC81DCNJUZBZIVTBIN1HX`, async function (error, response, body) {
                            console.log("error ",error);
                        
                            if (!error && response.statusCode == 200) {
                                const tx = JSON.parse(body)
                                const result = tx.result;
                                // console.log("4")

                                // const message = tx.message;
                                // console.log("tx ",result[0]);
                                // console.log("result ",result[82].input);
                                for(var j=0;j<result.length;j++){
                                    if(result[j].hash!=hashes){

                                    }else{
                                        const result_input = decoder.decodeData(`${result[j].input}`);
                                        if(result_input.inputs.length>0){
                                            await request(`https://ipfs.io/ipfs/${result_input.inputs[0]}`, async function (error, response, body) {
                                                console.log("error ",error);
                                                                    
                                                if (!error && response.statusCode == 200) {
                                                    // console.log(body);
                                                    var doc = body;
                                                    // console.log(doc);

                                        // console.log("result_input ",i," ",result_input.inputs);
                                        // hash_data_new[i].doc_name = result_input.inputs[3];
                                        // hash_data_new[i].verifier_myReflect_code = result_input.inputs[4];
                                        // hash_data_new[i].client_myReflect_code = result_input.inputs[5];
                                        // hash_data_new[i].doc_status = result_input.inputs[6];
                                        var obj ={
                                            receipt:receipt,
                                                created_at:created_at,
                                                verifier_mail:result_input.inputs[1],
                                                client_mail:result_input.inputs[2],
                                                doc_name:result_input.inputs[3],
                                                verifier_myReflect_code:result_input.inputs[4],
                                                client_myReflect_code:result_input.inputs[5],
                                                doc_status:result_input.inputs[6],
                                                reason:result_input.inputs[7],
                                                document:doc
                                        }
                                        hash_data.push(obj);
                                        // console.log("result_input ",i);
                                        // if(i==(hash_data.length-1)){
                                            page_data = hash_data;
                                            const receipt_array = paginate(page_data,page, perPage);
                                           
                                            // res.send(receipt_array);  
                                            if(receipt_array.data.length==(hash_data.length)){
                                                // console.log("receipt_array ************ ",receipt_array);
                                                
                                                    res.render('front/personal-explorer/explorer',{receipt_array,moment});
                                               
                                            
                                        }
                                        }
                                    })
                                }
                                    }
                                }
                        

                            }
                        })
                                }
                                
                                
                            }else{
                                console.log("error");
                            }
                        });
                    }
                    if(i == (hash_data_new.length - 1) && temp == 0){
                        console.log("5")
                        res.render('front/personal-explorer/explorer',{receipt_array:[],moment});
                    }
                    }
                }else{
                    // console.log("6");
                    res.render('front/personal-explorer/explorer',{receipt_array:[],moment});
                }
                
            })
        }else{
            // hash_data = hash_data_old;
            // console.log(hash_data_old);
            for(var i=0;i<hash_data_old.length;i++){
                var hash = hash_data_old[i].transaction_hash;
                var created_at = hash_data_old[i].createdAt;
                await waitForReceipt_sec(hash_data_old[i].transaction_hash,i,hash_data_old.length);
                async function waitForReceipt_sec(hashes,no,length){
                await web3.eth.getTransactionReceipt(hashes, async function (err, receipt) {
                    if (err) {
                    error(err);
                    }
                    // console.log("result outside",hash_data_old[i]);
                
                    if (receipt !== null) {
                      
                        await request(`http://api-ropsten.etherscan.io/api?module=account&action=txlist&address=${receipt.from}&startblock=0&endblock=99999999&sort=asc&apikey=XMSYU3WSXHXSBNC81DCNJUZBZIVTBIN1HX`, async function (error, response, body) {
                            console.log("error ",error);
                        
                            if (!error && response.statusCode == 200) {
                                const tx = JSON.parse(body)
                                const result = tx.result;
                                // const message = tx.message;
                                // console.log("tx ",result);
                                // console.log("result ",hash);
                                for(var j=0;j<result.length;j++){
                                    if(result[j].hash!=hashes){

                                    }else{
                                        const result_input = decoder.decodeData(`${result[j].input}`);
                                        if(result_input.inputs.length>0){
                                            await request(`https://ipfs.io/ipfs/${result_input.inputs[0]}`, async function (error, response, body) {
                                                console.log("error ",error);
                                                                    
                                                if (!error && response.statusCode == 200) {
                                                    // console.log(body);
                                                    var doc = body;
                                                    // console.log(doc);
                                        // console.log("result_input ",i," ",result_input.inputs);
                                        // hash_data_new[i].doc_name = result_input.inputs[3];
                                        // hash_data_new[i].verifier_myReflect_code = result_input.inputs[4];
                                        // hash_data_new[i].client_myReflect_code = result_input.inputs[5];
                                        // hash_data_new[i].doc_status = result_input.inputs[6];
                                        var obj ={
                                            receipt:receipt,
                                            created_at:created_at,
                                            verifier_mail:result_input.inputs[1],
                                            client_mail:result_input.inputs[2],
                                            doc_name:result_input.inputs[3],
                                            verifier_myReflect_code:result_input.inputs[4],
                                            client_myReflect_code:result_input.inputs[5],
                                            doc_status:result_input.inputs[6],
                                            reason:result_input.inputs[7],
                                            document:doc
                                        }
                                        hash_data.push(obj);
                                        // console.log("result_input ",i);
                                        // if(i==(hash_data_old.length-1)){
                                            page_data = hash_data;
                                            const receipt_array = paginate(page_data,page, perPage);
                                            // console.log("receipt_array ************ ",receipt_array);
                                            // res.send(receipt_array);  
                                            if(no == (length - 1)){
                                                
                                                    res.render('front/personal-explorer/explorer',{receipt_array,moment});
                                               
                                            
                                        }
                                    }
                                })
                                        }
                                    }
                                }
                        

                            }
                        })
                        
                    }else{
                        console.log("error");
                    }
                });
            }
            }
        }   
    })
}

exports.search_transactions_for_download = async (req,res,next) =>{
   
        var query = req.body.tx_value;
    
    var user_reg_id =req.session.user_id
    console.log("value *********** ",query);
    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[];
    var hash_data=[];
    var temp = 0;
    // const receipt_array=[];
    await db.query("SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents_files.transaction_hash LIKE '%"+query+"%' AND tbl_client_verification_requests.client_id="+user_reg_id,{type:db.QueryTypes.SELECT}).then(async hash_data_old =>{
        if(hash_data_old.length==0){
            await db.query('SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents_files.transaction_hash IS NOT NULL AND tbl_client_verification_requests.client_id='+user_reg_id,{type:db.QueryTypes.SELECT}).then(async hash_data_new =>{
                if(hash_data_new.length>0){
                    // console.log("1");
                    // hash_data=hash_data_new;
                    console.log(hash_data_new);
                    for(var i=0;i<hash_data_new.length;i++){
                        var hash = hash_data_new[i].transaction_hash;
                        var created_at = hash_data_new[i].createdAt;
                        await waitForReceipt(hash_data_new[i].transaction_hash);
                        async function waitForReceipt(hashes){
                        await web3.eth.getTransactionReceipt(hashes, async function (err, receipt) {
                            if (err) {
                            error(err);
                            }
                        
                            if (receipt !== null) {
                                if(receipt.blockNumber!=query){
                                    // console.log("2")
                                    
                                }else{
                                    temp = receipt.blockNumber;
                                    // console.log("3")

                                    await request(`http://api-ropsten.etherscan.io/api?module=account&action=txlist&address=${receipt.from}&startblock=0&endblock=99999999&sort=asc&apikey=XMSYU3WSXHXSBNC81DCNJUZBZIVTBIN1HX`, async function (error, response, body) {
                            console.log("error ",error);
                        
                            if (!error && response.statusCode == 200) {
                                const tx = JSON.parse(body)
                                const result = tx.result;
                                // console.log("4")

                                // const message = tx.message;
                                // console.log("tx ",result[0]);
                                // console.log("result ",result[82].input);
                                for(var j=0;j<result.length;j++){
                                    if(result[j].hash!=hashes){

                                    }else{
                                        const result_input = decoder.decodeData(`${result[j].input}`);
                                        if(result_input.inputs.length>0){
                                            await request(`https://ipfs.io/ipfs/${result_input.inputs[0]}`, async function (error, response, body) {
                                                console.log("error ",error);
                                                                    
                                                if (!error && response.statusCode == 200) {
                                                    // console.log(body);
                                                    var doc = body;
                                                    // console.log(doc);

                                        // console.log("result_input ",i," ",result_input.inputs);
                                        // hash_data_new[i].doc_name = result_input.inputs[3];
                                        // hash_data_new[i].verifier_myReflect_code = result_input.inputs[4];
                                        // hash_data_new[i].client_myReflect_code = result_input.inputs[5];
                                        // hash_data_new[i].doc_status = result_input.inputs[6];
                                        var obj ={
                                            receipt:receipt,
                                                created_at:created_at,
                                                verifier_mail:result_input.inputs[1],
                                                client_mail:result_input.inputs[2],
                                                doc_name:result_input.inputs[3],
                                                verifier_myReflect_code:result_input.inputs[4],
                                                client_myReflect_code:result_input.inputs[5],
                                                doc_status:result_input.inputs[6],
                                                reason:result_input.inputs[7],
                                                document:doc
                                        }
                                        hash_data.push(obj);
                                        // console.log("result_input ",i);
                                        // if(i==(hash_data.length-1)){
                                            page_data = hash_data;
                                            const receipt_array = paginate(page_data,page, perPage);
                                           
                                            // res.send(receipt_array);  
                                            if(receipt_array.data.length==(hash_data.length)){
                                                console.log("receipt_array ************ ",receipt_array);
                                                
                                                  res.send(receipt_array)
                                               
                                            
                                        }
                                        }
                                    })
                                }
                                    }
                                }
                        

                            }
                        })
                                }
                                
                                
                            }else{
                                console.log("error");
                            }
                        });
                    }
                    if(i == (hash_data_new.length - 1) && temp == 0){
                        console.log("5")
                        var receipt_array_1 = [];
                         res.send(receipt_array_1)
                    }
                    }
                }else{
                    // console.log("6");
                   console.log("receipt_array 2"+receipt_array);
                 

                  var receipt_array_1 = [];
                      res.send(receipt_array_1)
                }
                
            })
        }else{
            // hash_data = hash_data_old;
            // console.log(hash_data_old);
            for(var i=0;i<hash_data_old.length;i++){
                var hash = hash_data_old[i].transaction_hash;
                var created_at = hash_data_old[i].createdAt;
                await waitForReceipt_sec(hash_data_old[i].transaction_hash,i,hash_data_old.length);
                async function waitForReceipt_sec(hashes,no,length){
                await web3.eth.getTransactionReceipt(hashes, async function (err, receipt) {
                    if (err) {
                    error(err);
                    }
                    // console.log("result outside",hash_data_old[i]);
                
                    if (receipt !== null) {
                      
                        await request(`http://api-ropsten.etherscan.io/api?module=account&action=txlist&address=${receipt.from}&startblock=0&endblock=99999999&sort=asc&apikey=XMSYU3WSXHXSBNC81DCNJUZBZIVTBIN1HX`, async function (error, response, body) {
                            console.log("error ",error);
                        
                            if (!error && response.statusCode == 200) {
                                const tx = JSON.parse(body)
                                const result = tx.result;
                                // const message = tx.message;
                                // console.log("tx ",result);
                                // console.log("result ",hash);
                                for(var j=0;j<result.length;j++){
                                    if(result[j].hash!=hashes){

                                    }else{
                                        const result_input = decoder.decodeData(`${result[j].input}`);
                                        if(result_input.inputs.length>0){
                                            await request(`https://ipfs.io/ipfs/${result_input.inputs[0]}`, async function (error, response, body) {
                                                console.log("error ",error);
                                                                    
                                                if (!error && response.statusCode == 200) {
                                                    // console.log(body);
                                                    var doc = body;
                                                    // console.log(doc);
                                        // console.log("result_input ",i," ",result_input.inputs);
                                        // hash_data_new[i].doc_name = result_input.inputs[3];
                                        // hash_data_new[i].verifier_myReflect_code = result_input.inputs[4];
                                        // hash_data_new[i].client_myReflect_code = result_input.inputs[5];
                                        // hash_data_new[i].doc_status = result_input.inputs[6];
                                        var obj ={
                                            receipt:receipt,
                                            created_at:created_at,
                                            verifier_mail:result_input.inputs[1],
                                            client_mail:result_input.inputs[2],
                                            doc_name:result_input.inputs[3],
                                            verifier_myReflect_code:result_input.inputs[4],
                                            client_myReflect_code:result_input.inputs[5],
                                            doc_status:result_input.inputs[6],
                                            reason:result_input.inputs[7],
                                            document:doc
                                        }
                                        hash_data.push(obj);
                                        // console.log("result_input ",i);
                                        // if(i==(hash_data_old.length-1)){
                                            page_data = hash_data;
                                            const receipt_array = paginate(page_data,page, perPage);
                                            // console.log("receipt_array ************ ",receipt_array);
                                            // res.send(receipt_array);  
                                            if(no == (length - 1)){
                                                
                                                    console.log("receipt_array 2"+receipt_array);

                                                     res.send(receipt_array)
                                            
                                        }
                                    }
                                })
                                        }
                                    }
                                }
                        

                            }
                        })
                        
                    }else{
                        console.log("error");
                    }
                });
            }
            }
        }   
    })
}
