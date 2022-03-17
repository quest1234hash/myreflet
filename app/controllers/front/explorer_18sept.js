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
let fetch = require('node-fetch')

const Op = require('sequelize').Op

const Tx = require('ethereumjs-tx')
const Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/f8a10cc5a2684f61b0de4bf632dd4f4b"));
// var web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/f8a10cc5a2684f61b0de4bf632dd4f4b"));

var async = require('async');

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
const { Console } = require('console');
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

    console.log("...................................................................................personal_explorer........................................................")
    var user_reg_id =req.session.user_id
    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[];
    const hash_data_new=[];



    await db.query('SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents_files.transaction_hash IS NOT NULL AND tbl_client_verification_requests.client_id='+user_reg_id+' Group by tbl_request_documents_files.request_doc_id',{type:db.QueryTypes.SELECT}).then(async hash_data =>{
        console.log("personal_data ",hash_data);
        if(hash_data.length>0){
            for(var i=0;i<hash_data.length;i++){
                // var hash = hash_data[i].transaction_hash;
                var created_at = hash_data[i].createdAt;
                await waitForReceipt(hash_data[i].transaction_hash);
                async function waitForReceipt(hashes){
                await web3.eth.getTransactionReceipt(hashes, async function (err, receipt) {
                    if (err) {
                    error(err);
                    console.log("getTransactionReceipt error")
                    }
                
                    if (receipt !== null) {
                        console.log("receipt**** ",i);
                        // hash_data_new[i]=receipt;
                        // hash_data_new[i].created_at = created_at;
                        
                        if(receipt!=null){
                            // async function rec_data(){
                            await request(`http://api-ropsten.etherscan.io/api?module=account&action=txlist&address=${receipt.from}&startblock=0&endblock=99999999&sort=asc&apikey=XMSYU3WSXHXSBNC81DCNJUZBZIVTBIN1HX`, async function (error, response, body) {
                                console.log("error 1",error);
                            
                                if (!error && response.statusCode == 200) {
                                    const tx = JSON.parse(body)
                                    const result = tx.result;
                                    // const message = tx.message;
                                    // console.log("tx ",result[0]);
                                    console.log("tx ");
                                    // console.log("result ",result[82].input);
                                    for(var j=0;j<result.length;j++){
                                        if(result[j].hash!=hashes){
                                            console.log("hase not equle")
                                          
                                        }else{
                                            const result_input = decoder.decodeData(`${result[j].input}`);
                                            if(result_input.inputs.length>0){
                                                // var doc = result_input.inputs[0];
                                                console.log("hase not equle",result_input.inputs[0])
                                                // async function getPic(uri){
                                                    var doc_for_show_ejs = []
                                                    var doc_hash_file  = result_input.inputs[0].split(",")
                                                       
                                                    for(var m=0 ; m<doc_hash_file.length; m++){
                                                                    await request(`https://ipfs.io/ipfs/${doc_hash_file[m]}`, async function (error, response, body) {
                                                                        console.log("error 2",error);
                                                                                            
                                                                        if (!error && response.statusCode == 200) {
                                                                            // console.log(body);
                                                                            var doc = body;
                                                                            doc_for_show_ejs.push(body)
                                                                        if(doc_hash_file.length==doc_for_show_ejs.length){

                                                                            await getBlockchainData()

                                                                        }
                                                                             

                                                                        }
                                                                    })
                                                        }

                                                            async function getBlockchainData(){
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
                                                                                                            // document:doc
                                                                                                            document:doc_for_show_ejs
                                                                                                        }
                                                                                                        hash_data_new.push(obj);
                                                                                                        // console.log("result_input ",i);
                                                                                                        // if(i==(hash_data.length)){
                                                                                                            page_data = hash_data_new;
                                                                                                            const receipt_array = paginate(page_data,page, perPage);
                                                                                                            console.log("receipt_array ************ ",hash_data_new.length,hash_data.length);
                                                                                                            // res.send(receipt_array);  
                                                                                                            if(hash_data_new.length==(hash_data.length)){
                                                                                                                // console.log("final ************ ",hash_data_new);
                                                                                                                console.log("receipt_array ************ ",receipt_array);
                                                                                                            res.render('front/personal-explorer/explorer',{receipt_array,moment});
                                                                                                                
                                                                                                            }

                                                             }
                                                   
                                          


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
            res.render('front/personal-explorer/explorer',{receipt_array:[],moment,})
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
   
    await db.query('SELECT * FROM tbl_user_wallets INNER JOIN tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.wallet_id=tbl_user_wallets.wallet_id INNER JOIN tbl_child_wallets on tbl_child_wallets.parent_reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE tbl_user_wallets.wallet_address="'+query+'" AND tbl_user_wallets.reg_user_id='+user_reg_id,{type:db.QueryTypes.SELECT}).then(async childWalletData=>{

    

        await db.query("SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents_files.transaction_hash LIKE '%"+query+"%' AND tbl_client_verification_requests.client_id="+user_reg_id,{type:db.QueryTypes.SELECT}).then(async hash_data_old =>{
            if(hash_data_old.length==0){
                console.log("hash_data_new null 1 1");
                await db.query('SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents_files.transaction_hash IS NOT NULL AND tbl_client_verification_requests.client_id='+user_reg_id,{type:db.QueryTypes.SELECT}).then(async hash_data_new =>{
                    console.log("hash_data_new null 1 2");
                    if(hash_data_new.length>0){
                        // console.log("1");
                        // hash_data=hash_data_new;
                        console.log("hash_data_new null 1",query.length);
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
                                                            var doc_for_show_ejs = []
                                                            var doc_hash_file  = result_input.inputs[0].split(",")
                                                               
                                                            for(var m=0 ; m<doc_hash_file.length; m++){
                                                                            await request(`https://ipfs.io/ipfs/${doc_hash_file[m]}`, async function (error, response, body) {
                                                                                console.log("error 2",error);
                                                                                                    
                                                                                if (!error && response.statusCode == 200) {
                                                                                    // console.log(body);
                                                                                    var doc = body;
                                                                                    doc_for_show_ejs.push(body)
                                                                                if(doc_hash_file.length==doc_for_show_ejs.length){
        
                                                                                    await getBlockchainData()
        
                                                                                }
                                                                                     
        
                                                                                }
                                                                            })
                                                                }
                                                            }
                                                // console.log("result_input ",i," ",result_input.inputs);
                                                // hash_data_new[i].doc_name = result_input.inputs[3];
                                                // hash_data_new[i].verifier_myReflect_code = result_input.inputs[4];
                                                // hash_data_new[i].client_myReflect_code = result_input.inputs[5];
                                                // hash_data_new[i].doc_status = result_input.inputs[6];
                                                function getBlockchainData(){

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
                                                            document:doc_for_show_ejs
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
                                                            
                                                                res.render('front/personal-explorer/explorer',{receipt_array,moment,childWalletData,query});
                                                        
                                                        
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
                                res.render('front/personal-explorer/explorer',{receipt_array:[],moment,childWalletData,query});
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
                                                                                    var doc_for_show_ejs = []
                                                                                    var doc_hash_file  = result_input.inputs[0].split(",")
                                                                                       
                                                                                    for(var m=0 ; m<doc_hash_file.length; m++){
                                                                                                    await request(`https://ipfs.io/ipfs/${doc_hash_file[m]}`, async function (error, response, body) {
                                                                                                        console.log("error 2",error);
                                                                                                                            
                                                                                                        if (!error && response.statusCode == 200) {
                                                                                                            // console.log(body);
                                                                                                            var doc = body;
                                                                                                            doc_for_show_ejs.push(body)
                                                                                                        if(doc_hash_file.length==doc_for_show_ejs.length){
                                
                                                                                                            await getBlockchainData()
                                
                                                                                                        }
                                                                                                             
                                
                                                                                                        }
                                                                                                    })
                                                                                        }
                                                                                }
                                                                                
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
                                                                    g = g+1
                                                                    console.log("receipt_array ************ ",result_input.inputs[5], query);
                                                                    function getBlockchainData(){

                                                                       
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
                                                                                document:doc_for_show_ejs
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
                                                                            res.render('front/personal-explorer/explorer',{receipt_array,moment,childWalletData,query});
                                                                                
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
                                    res.render('front/personal-explorer/explorer',{receipt_array:[],moment,childWalletData,query})
                                } 
                            })

                        }
                        

                    }else{
                        // console.log("6");
                        res.render('front/personal-explorer/explorer',{receipt_array:[],moment,childWalletData,query});
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
                                                        var doc_for_show_ejs = []
                                                        var doc_hash_file  = result_input.inputs[0].split(",")
                                                           
                                                        for(var m=0 ; m<doc_hash_file.length; m++){
                                                                        await request(`https://ipfs.io/ipfs/${doc_hash_file[m]}`, async function (error, response, body) {
                                                                            console.log("error 2",error);
                                                                                                
                                                                            if (!error && response.statusCode == 200) {
                                                                                // console.log(body);
                                                                                var doc = body;
                                                                                doc_for_show_ejs.push(body)
                                                                            if(doc_hash_file.length==doc_for_show_ejs.length){
    
                                                                                await getBlockchainData()
    
                                                                            }
                                                                                 
    
                                                                            }
                                                                        })
                                                            }

                                                    }
                                                        // console.log(doc);
                                            // console.log("result_input ",i," ",result_input.inputs);
                                            // hash_data_new[i].doc_name = result_input.inputs[3];
                                            // hash_data_new[i].verifier_myReflect_code = result_input.inputs[4];
                                            // hash_data_new[i].client_myReflect_code = result_input.inputs[5];
                                            // hash_data_new[i].doc_status = result_input.inputs[6];
                                            function getBlockchainData(){
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
                                                document:doc_for_show_ejs
                                            }
                                            hash_data.push(obj);
                                            // console.log("result_input ",i);
                                            // if(i==(hash_data_old.length-1)){
                                                page_data = hash_data;
                                                const receipt_array = paginate(page_data,page, perPage);
                                                // console.log("receipt_array ************ ",receipt_array);
                                                // res.send(receipt_array);  
                                                if(no == (length - 1)){
                                                    
                                                        res.render('front/personal-explorer/explorer',{receipt_array,moment,childWalletData,query});
                                                
                                                
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

    }).catch(err=>console.log(err))
}

exports.personal_explorer_ver = async (req,res,next) =>{
    var user_reg_id =req.session.user_id
    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[];
    const hash_data_new=[];

    await db.query('SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents_files.transaction_hash IS NOT NULL AND tbl_client_verification_requests.verifier_id='+user_reg_id+' Group by tbl_request_documents_files.request_doc_id',{type:db.QueryTypes.SELECT}).then(async hash_data =>{
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
                                          // var doc = result_input.inputs[0];
                                          console.log("hase not equle",result_input.inputs[0])
                                          // async function getPic(uri){
                                              var doc_for_show_ejs = []
                                              var doc_hash_file  = result_input.inputs[0].split(",")
                                                 
                                              for(var m=0 ; m<doc_hash_file.length; m++){
                                                              await request(`https://ipfs.io/ipfs/${doc_hash_file[m]}`, async function (error, response, body) {
                                                                  console.log("error 2",error);
                                                                                      
                                                                  if (!error && response.statusCode == 200) {
                                                                      // console.log(body);
                                                                      var doc = body;
                                                                      doc_for_show_ejs.push(body)
                                                                  if(doc_hash_file.length==doc_for_show_ejs.length){

                                                                      await getBlockchainData()

                                                                  }
                                                                       

                                                                  }
                                                              })
                                                  }

                                                  async function getBlockchainData(){


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
                                                document:doc_for_show_ejs
                                            }
                                            hash_data_new.push(obj);
                                            // console.log("result_input ",i);
                                            // if(i==(hash_data.length)){
                                                page_data = hash_data_new;
                                                const receipt_array = paginate(page_data,page, perPage);
                                                // console.log("receipt_array ************ ",receipt_array);
                                                // res.send(receipt_array);  
                                                  console.log("hash_data.length ************ ",hash_data_new.length, hash_data.length);

                                                if(hash_data_new.length==(hash_data.length)){
                                                    console.log("receipt_array ************ in side if",receipt_array);

                                                    
                                                        res.render('front/personal-explorer/explorer_ver',{receipt_array,moment});
                                                   
                                                
                                                }
                                        //     }
                                        // })
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

// exports.personal_explorer_ver = async (req,res,next) =>{
//     var user_reg_id =req.session.user_id
//     var page = req.query.page || 1
//     var perPage = 10;
//     var page_data=[];
//     const hash_data_new=[];
//     const doc = [];
//     const delay = (duration) => new Promise(resolve => setTimeout(resolve, duration))


//     await db.query('SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents_files.transaction_hash IS NOT NULL AND tbl_client_verification_requests.verifier_id='+user_reg_id+" GROUP BY `transaction_hash`",{type:db.QueryTypes.SELECT}).then(async hash_data =>{

        
//         if(hash_data.length>0){

//             // for(var i=0;i<hash_data.length;i++){
              
//             var i = 0;
//               await  async.each(hash_data,async function (hash_data_content, cb) {

//                 console.log(' hash_data_content : ',i)
//                 // var hash = hash_data[i].transaction_hash;
//                 var created_at = hash_data_content.createdAt;

//                 await waitForReceipt(hash_data_content.transaction_hash);

//                 async function waitForReceipt(hashes){
//                 await web3.eth.getTransactionReceipt(hashes, async function (err, receipt) {
//                     if (err) {
//                     error(err);
//                     }
                
//                     if (receipt !== null) {
//                         // console.log("receipt**** ",i);
//                         // hash_data_new[i]=receipt;
//                         // hash_data_new[i].created_at = created_at;
                        
//                         if(receipt!=null){
//                             // async function rec_data(){
//                             await request(`http://api-ropsten.etherscan.io/api?module=account&action=txlist&address=${receipt.from}&startblock=0&endblock=99999999&sort=asc&apikey=XMSYU3WSXHXSBNC81DCNJUZBZIVTBIN1HX`, async function (error, response, body) {
//                                 console.log("error ",error);
                            
//                                 if (!error && response.statusCode == 200) {
//                                     const tx = JSON.parse(body)
//                                     const result = tx.result;
//                                     // const message = tx.message;
//                                     // console.log("tx ",result[0]);
//                                     // console.log("result ",result[82].input);
//                                     // for(var j=0;j<result.length;j++){
//                                      await  async.each(result,async function (result_content, cb) {

//                                         if(result_content.hash!=hashes){
                                          
//                                         }else{
//                                             const result_input = decoder.decodeData(`${result_content.input}`);
//                                             if(result_input.inputs.length>0){
                                             
//                                                 var new_hash = [];
                                       
//                                             new_hash = (result_input.inputs[0]).split(",")



//                                             var  t_length = new_hash.length;
//                                             var  t = 0;

//                                             console.log('content : ',new_hash)
                                            
//                                             // async function wait_ipfs_request(){

//                                             //  await async.each(new_hash,async function (content, cb) {

//                                                 console.log('inner async..................... : ')

//                                             //  var abc =   await  fetch(`https://ipfs.io/ipfs/${content}`)
//                                             //  var abcd =  await response.json();
//                                             //  console.log('inner async..................... :abcd ',abcd)
//                                                     //   await  fetch(`https://ipfs.io/ipfs/${content}`, async function (error, response, body) {
                                                            
//                                                                 // console.log("result_input inner",t," new_hash[t] :",content," i val = ",i);

                                                                                    
//                                                                 // if (!error && response.statusCode == 200) {
//                                                                                         // console.log(" tttt : ",t);
//                                                                                         // doc[i] = body;

//                                                                                         // t++; 

//                                                                                         // if(new_hash.length==doc.length){
//                                                                                             console.log('first..................... : ')

//                                                                                             // await send_data();
//                                                                                             console.log("doc length ",doc.length);
//                                                                                             console.log("receipt_array 2");
                                                                                            
//                                                                                             var obj = {
//                                                                                                 receipt:receipt,
//                                                                                                 created_at:created_at,
//                                                                                                 verifier_mail:result_input.inputs[1],
//                                                                                                 client_mail:result_input.inputs[2],
//                                                                                                 doc_name:result_input.inputs[3],
//                                                                                                 verifier_myReflect_code:result_input.inputs[4],
//                                                                                                 client_myReflect_code:result_input.inputs[5],
//                                                                                                 doc_status:result_input.inputs[6],
//                                                                                                 reason:result_input.inputs[7],
//                                                                                                 document:new_hash
//                                                                                             }
//                                                                                             hash_data.push(obj);
//                                                                                             // console.log("result_input ",i);
//                                                                                             // if(i==(hash_data_old.length-1)){
//                                                                                                 page_data = hash_data;
//                                                                                                 const receipt_array =await paginate(page_data,page, perPage);
//                                                                                                 console.log("hash_data_new ************ ",hash_data_new.length);
//                                                                                                 console.log("hash_data.length ************ ",hash_data.length);
//                                                                                                 console.log("receipt_array i length ************ ",i);
                                            
//                                                                                                 // res.send(receipt_array);  
//                                                                                                 if(hash_data_new.length==(hash_data.length)){
                                            
//                                                                                                     console.log('inner')
                                                                                                                                            
//                                                                                                     res.render('front/personal-explorer/explorer_ver',{receipt_array,moment});
                                                                                            
                                                                                            
//                                                                                             }
//                                                                                                         //  res.send(doc)
//                                                                                              i++;   

//                                                                                         // }
//                                                                                 // }
//                                                                         // })
//                                                                         // await delay(20000)

//                                                                     // })
                                                                    
//                                                 //    i++;
//                                             // }
                                           

//                                             // async function send_data(){

//                                             //     console.log("doc length ",doc.length);
//                                             //     console.log("receipt_array 2");
                                                
//                                             //     var obj ={
//                                             //         receipt:receipt,
//                                             //         created_at:created_at,
//                                             //         verifier_mail:result_input.inputs[1],
//                                             //         client_mail:result_input.inputs[2],
//                                             //         doc_name:result_input.inputs[3],
//                                             //         verifier_myReflect_code:result_input.inputs[4],
//                                             //         client_myReflect_code:result_input.inputs[5],
//                                             //         doc_status:result_input.inputs[6],
//                                             //         reason:result_input.inputs[7],
//                                             //         document:doc
//                                             //     }
//                                             //     hash_data.push(obj);
//                                             //     // console.log("result_input ",i);
//                                             //     // if(i==(hash_data_old.length-1)){
//                                             //         page_data = hash_data;
//                                             //         const receipt_array = paginate(page_data,page, perPage);
//                                             //         console.log("hash_data_new ************ ");
//                                             //         console.log("hash_data.length ************ ",hash_data.length);
//                                             //         console.log("receipt_array i length ************ ",i);

//                                             //         // res.send(receipt_array);  
//                                             //         if(hash_data_new.length==(hash_data.length)){

//                                             //             console.log('inner')
                                                                                                
//                                             //             res.render('front/personal-explorer/explorer_ver',{receipt_array,moment});
                                                
                                                
//                                             //     }
//                                             //                 //  res.send(doc)
//                                             //      i++;   
                                                
                                                
//                                             // } 



//                                             // console.log("before request ");

//                                             // // await wait_ipfs_request();

//                                             // console.log("After request ");
//                                             await delay(10000)

//                                             // console.log("before send ");
//                                             // // await send_data();
//                                             // console.log("After send ");

//                                                                 }
//                                                                 }



//                                                             // }
//                                                             })

                            

//                                 }
//                             })

                            
//                         // }
//                         // setTimeout(rec_data,5000);
//                     }
//                     }else{
//                         console.log("error");
//                     }
//                 });
//                 }
//                 console.log(' hash_data_content i last : '.i)

//             })
//        }else{
//             res.render('front/personal-explorer/explorer_ver',{receipt_array:[],moment})
//         } 
//     })
//     // res.render('front/personal-explorer/explorer',{receipt_array,moment});
// }

//****************************************20/08/20****************************************** */

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
    await db.query("SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents_files.transaction_hash LIKE '%"+query+"%' AND tbl_client_verification_requests.verifier_id="+user_reg_id+" GROUP BY `transaction_hash`",{type:db.QueryTypes.SELECT}).then(async hash_data_old =>{
        if(hash_data_old.length==0){
            // console.log("tx hash length 0");
            await db.query('SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents_files.transaction_hash IS NOT NULL AND tbl_client_verification_requests.verifier_id='+user_reg_id,{type:db.QueryTypes.SELECT}).then(async hash_data_new =>{
                if(hash_data_new.length>0){
                    // hash_data=hash_data_new;
                    console.log(hash_data_new);
                    if(query.length != 4){
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
                                console.log("tx ",result[0]);
                                // console.log("result ",result[82].input);
                                for(var j=0;j<result.length;j++){
                                    if(result[j].hash!=hashes){

                                    }else{
                                       

                                            const result_input = decoder.decodeData(`${result[j].input}`);
                                            // var doc = result_input.inputs[0];
                                            console.log("hase not equle",result_input.inputs[0])
                                            // async function getPic(uri){
                                                var doc_for_show_ejs = []
                                                var doc_hash_file  = result_input.inputs[0].split(",")
                                                   
                                                for(var m=0 ; m<doc_hash_file.length; m++){
                                                                await request(`https://ipfs.io/ipfs/${doc_hash_file[m]}`, async function (error, response, body) {
                                                                    console.log("error 2",error);
                                                                                        
                                                                    if (!error && response.statusCode == 200) {
                                                                        // console.log(body);
                                                                        var doc = body;
                                                                        doc_for_show_ejs.push(body)
                                                                    if(doc_hash_file.length==doc_for_show_ejs.length){
  
                                                                        await getBlockchainData()
  
                                                                    }
                                                                         
  
                                                                    }
                                                                })
                                                    }
  
                                                    async function getBlockchainData(){
  
  
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
                                                  document:doc_for_show_ejs
                                              }
                                              hash_data.push(obj);
                                              // console.log("result_input ",i);
                                              // if(i==(hash_data.length)){
                                                  page_data = hash_data;
                                                  const receipt_array = paginate(page_data,page, perPage);
                                                  console.log("receipt_array ************ ",receipt_array);
                                                  // res.send(receipt_array);  
                                                    console.log("hash_data.length ************ ",hash_data_new.length, hash_data.length,receipt_array.data.length);
  
                                                  if(receipt_array.data.length==(hash_data.length)){
                                                      console.log("receipt_array ************ in side if");
  
                                                      
                                                      res.render('front/personal-explorer/explorer_ver',{receipt_array,moment});

                                                     
                                                  
                                                  }
                                          //     }
                                          // })
                                          
                                      
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
                }   else    {

                    const hash_data_new1=[];
                    var g=0
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
                                            // var doc = result_input.inputs[0];
                                            console.log("hase not equle",result_input.inputs[0])
                                            // async function getPic(uri){
                                                var doc_for_show_ejs = []
                                                var doc_hash_file  = result_input.inputs[0].split(",")
                                                   
                                                for(var m=0 ; m<doc_hash_file.length; m++){
                                                                await request(`https://ipfs.io/ipfs/${doc_hash_file[m]}`, async function (error, response, body) {
                                                                    console.log("error 2",error);
                                                                                        
                                                                    if (!error && response.statusCode == 200) {
                                                                        // console.log(body);
                                                                        var doc = body;
                                                                        doc_for_show_ejs.push(body)
                                                                    if(doc_hash_file.length==doc_for_show_ejs.length){
  
                                                                        await getBlockchainData()
  
                                                                    }
                                                                         
  
                                                                    }
                                                                })
                                                    }
                                                    g = g+1
                                                    async function getBlockchainData(){
  
  
                                                       
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
                                                            document:doc_for_show_ejs
                                                        }
                                                        hash_data_new1.push(obj);
                                                        // console.log("result_input ",i);
                                                        // if(i==(hash_data.length)){
                                                    }
                                                            page_data = hash_data_new1;
                                                            const receipt_array = paginate(page_data,page, perPage);
                                                             
                                                            console.log("hash_data.length************ ",hash_data_new1.length, hash_data.length);
                                                            console.log("hash_data.length************ ",hash_data_new1.length, hash_data.length,g);
                                                            if(g==(hash_data.length)){
                                                      console.log("receipt_array ************ in side if",receipt_array);
  
                                                      
                                                      res.render('front/personal-explorer/explorer_ver',{receipt_array,moment});

                                                     
                                                  
                                                  }
                                          //     }
                                          // })
                                          
                                      
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
                                            // var doc = result_input.inputs[0];
                                            console.log("hase not equle",result_input.inputs[0])
                                            // async function getPic(uri){
                                                var doc_for_show_ejs = []
                                                var doc_hash_file  = result_input.inputs[0].split(",")
                                                   
                                                for(var m=0 ; m<doc_hash_file.length; m++){
                                                                await request(`https://ipfs.io/ipfs/${doc_hash_file[m]}`, async function (error, response, body) {
                                                                    console.log("error 2",error);
                                                                                        
                                                                    if (!error && response.statusCode == 200) {
                                                                        // console.log(body);
                                                                        var doc = body;
                                                                        doc_for_show_ejs.push(body)
                                                                    if(doc_hash_file.length==doc_for_show_ejs.length){
  
                                                                        await getBlockchainData()
  
                                                                    }
                                                                         
  
                                                                    }
                                                                })
                                                    }
  
                                                    async function getBlockchainData(){
  
  
                                                                                                
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
                                                document:doc_for_show_ejs
                                            }
                                            hash_data.push(obj);
                                            // console.log("result_input ",i);
                                            // if(i==(hash_data_old.length-1)){
                                                page_data = hash_data;
                                                const receipt_array = paginate(page_data,page, perPage);
                                                if(no == (length - 1)){
       
                                                    res.render('front/personal-explorer/explorer_ver',{receipt_array,moment});
                                               
                                            
                                        }
                                          //     }
                                          // })
                                          
                                      
                                        // }

                                               
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

// exports.search_personal_ver = async (req,res,next) =>{

    
//     if(req.body.value!=undefined&&req.body.value!=null){
//         var query = req.body.value.trim()
//     }else{
//         var query = req.query.tx_hash_ser.trim()
//     }
//     var user_reg_id =req.session.user_id
//     // console.log("value *********** ",query);
//     var page = req.query.page || 1
//     var perPage = 10;
//     var page_data=[];
//     var hash_data=[];
//     var temp = 0;
//     // const receipt_array=[];
   
//     await db.query('SELECT * FROM tbl_user_wallets INNER JOIN tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.wallet_id=tbl_user_wallets.wallet_id INNER JOIN tbl_child_wallets on tbl_child_wallets.parent_reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE tbl_user_wallets.wallet_address="'+query+'" AND tbl_user_wallets.reg_user_id='+user_reg_id,{type:db.QueryTypes.SELECT}).then(async childWalletData=>{

    

//         await db.query("SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents_files.transaction_hash LIKE '%"+query+"%' AND tbl_client_verification_requests.client_id="+user_reg_id,{type:db.QueryTypes.SELECT}).then(async hash_data_old =>{
//             if(hash_data_old.length==0){
//                 console.log("hash_data_new null 1 1");
//                 await db.query('SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents_files.transaction_hash IS NOT NULL AND tbl_client_verification_requests.client_id='+user_reg_id,{type:db.QueryTypes.SELECT}).then(async hash_data_new =>{
//                     console.log("hash_data_new null 1 2");
//                     if(hash_data_new.length>0){
//                         // console.log("1");
//                         // hash_data=hash_data_new;
//                         console.log("hash_data_new null 1",query.length);
//                         // console.log(hash_data_new);
//                         if(query.length != 4){

//                             for(var i=0;i<hash_data_new.length;i++){
//                                 var hash = hash_data_new[i].transaction_hash;
//                                 var created_at = hash_data_new[i].createdAt;
//                                 await waitForReceipt(hash_data_new[i].transaction_hash);
//                                 async function waitForReceipt(hashes){
//                                 await web3.eth.getTransactionReceipt(hashes, async function (err, receipt) {
//                                     if (err) {
//                                         console.log("hash_data_new null");
//                                     error(err);
//                                     }
                                
//                                     if (receipt !== null) {
//                                         if(receipt.blockNumber!=query){
//                                             console.log("2")
                                            
//                                         }else{
//                                             temp = receipt.blockNumber;
//                                             console.log("3")
        
//                                             await request(`http://api-ropsten.etherscan.io/api?module=account&action=txlist&address=${receipt.from}&startblock=0&endblock=99999999&sort=asc&apikey=XMSYU3WSXHXSBNC81DCNJUZBZIVTBIN1HX`, async function (error, response, body) {
//                                     console.log("error 1",error);
                                
//                                     if (!error && response.statusCode == 200) {
//                                         const tx = JSON.parse(body)
//                                         const result = tx.result;
//                                         console.log("4")
        
//                                         // const message = tx.message;
//                                         // console.log("tx ",result[0]);
//                                         // console.log("result ",result[82].input);
//                                         for(var j=0;j<result.length;j++){
//                                             if(result[j].hash!=hashes){
        
//                                             }else{
//                                                 const result_input = decoder.decodeData(`${result[j].input}`);
//                                                 if(result_input.inputs.length>0){
//                                                     await request(`https://ipfs.io/ipfs/${result_input.inputs[0]}`, async function (error, response, body) {
//                                                         console.log("error 2",error);
                                                                            
//                                                         if (!error && response.statusCode == 200) {
//                                                             // console.log(body);
//                                                             var doc = body;
//                                                             // console.log(doc);
//                                                             var doc_for_show_ejs = []
//                                                             var doc_hash_file  = result_input.inputs[0].split(",")
                                                               
//                                                             for(var m=0 ; m<doc_hash_file.length; m++){
//                                                                             await request(`https://ipfs.io/ipfs/${doc_hash_file[m]}`, async function (error, response, body) {
//                                                                                 console.log("error 2",error);
                                                                                                    
//                                                                                 if (!error && response.statusCode == 200) {
//                                                                                     // console.log(body);
//                                                                                     var doc = body;
//                                                                                     doc_for_show_ejs.push(body)
//                                                                                 if(doc_hash_file.length==doc_for_show_ejs.length){
        
//                                                                                     await getBlockchainData()
        
//                                                                                 }
                                                                                     
        
//                                                                                 }
//                                                                             })
//                                                                 }
//                                                             }
//                                                 // console.log("result_input ",i," ",result_input.inputs);
//                                                 // hash_data_new[i].doc_name = result_input.inputs[3];
//                                                 // hash_data_new[i].verifier_myReflect_code = result_input.inputs[4];
//                                                 // hash_data_new[i].client_myReflect_code = result_input.inputs[5];
//                                                 // hash_data_new[i].doc_status = result_input.inputs[6];
//                                                 function getBlockchainData(){

//                                                     var obj ={
//                                                         receipt:receipt,
//                                                             created_at:created_at,
//                                                             verifier_mail:result_input.inputs[1],
//                                                             client_mail:result_input.inputs[2],
//                                                             doc_name:result_input.inputs[3],
//                                                             verifier_myReflect_code:result_input.inputs[4],
//                                                             client_myReflect_code:result_input.inputs[5],
//                                                             doc_status:result_input.inputs[6],
//                                                             reason:result_input.inputs[7],
//                                                             document:doc_for_show_ejs
//                                                     }
//                                                     hash_data.push(obj);
                                                
//                                                     // if(i==(hash_data.length-1)){
//                                                         page_data = hash_data;
//                                                         const receipt_array = paginate(page_data,page, perPage);
//                                                         console.log("result_input ",i,hash_data.length,hash_data_new.length,receipt_array.data.length);
//                                                         // res.send(receipt_array);  
                                                        
//                                                         if(receipt_array.data.length==(hash_data.length)){
//                                                             // if(hash_data_new.length==(hash_data.length)){
            
//                                                             console.log("receipt_array ************ ",receipt_array);
                                                            
//                                                                 res.render('front/personal-explorer/explorer_ver',{receipt_array,moment,childWalletData,query});
                                                        
                                                        
//                                                     }

//                                                 }
                                           
                                             





//                                             })
//                                         }
//                                             }
//                                         }
                                
        
//                                     }
//                                 })
//                                         }
                                        
                                        
//                                     }else{
//                                         console.log("error");
//                                     }
//                                 });
//                             }
//                             if(i == (hash_data_new.length - 1) && temp == 0){
//                                 console.log("5")
//                                 res.render('front/personal-explorer/explorer_ver',{receipt_array:[],moment,childWalletData,query});
//                             }
//                             }

//                         }  else    {
//                 console.log("*********************Code for reflectc code*************************************************************")
                
//                 const hash_data_new1=[];
//                 var g =0
//                             await db.query('SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents_files.transaction_hash IS NOT NULL AND tbl_client_verification_requests.client_id='+user_reg_id,{type:db.QueryTypes.SELECT}).then(async hash_data =>{
//                                 // console.log("personal_data ",hash_data);
//                                 if(hash_data.length>0){
//                                     for(var i=0;i<hash_data.length;i++){
//                                         // var hash = hash_data[i].transaction_hash;
//                                         var created_at = hash_data[i].createdAt;
//                                         await waitForReceipt(hash_data[i].transaction_hash);
//                                         async function waitForReceipt(hashes){
//                                         await web3.eth.getTransactionReceipt(hashes, async function (err, receipt) {
//                                             if (err) {
//                                             error(err);
//                                             }
                                        
//                                             if (receipt !== null) {
//                                                 // console.log("receipt**** ",i);
//                                                 // hash_data_new[i]=receipt;
//                                                 // hash_data_new[i].created_at = created_at;
                                                
//                                                 if(receipt!=null){
//                                                     // async function rec_data(){
//                                                     await request(`http://api-ropsten.etherscan.io/api?module=account&action=txlist&address=${receipt.from}&startblock=0&endblock=99999999&sort=asc&apikey=XMSYU3WSXHXSBNC81DCNJUZBZIVTBIN1HX`, async function (error, response, body) {
//                                                         console.log("error ",error);
                                                    
//                                                         if (!error && response.statusCode == 200) {
//                                                             const tx = JSON.parse(body)
//                                                             const result = tx.result;
//                                                             // const message = tx.message;
//                                                             // console.log("tx ",result[0]);
//                                                             // console.log("result ",result[82].input);
//                                                             for(var j=0;j<result.length;j++){
//                                                                 if(result[j].hash!=hashes){
                                                                
//                                                                 }else{
//                                                                     const result_input = decoder.decodeData(`${result[j].input}`);
//                                                                     if(result_input.inputs.length>0){
//                                                                         // var doc = result_input.inputs[0];
//                                                                         // async function getPic(uri){
//                                                                             await request(`https://ipfs.io/ipfs/${result_input.inputs[0]}`, async function (error, response, body) {
//                                                                                 console.log("error ",error);
                                                                                                    
//                                                                                 if (!error && response.statusCode == 200) {
//                                                                                     // console.log(body);
//                                                                                     var doc = body;
//                                                                                     var doc_for_show_ejs = []
//                                                                                     var doc_hash_file  = result_input.inputs[0].split(",")
                                                                                       
//                                                                                     for(var m=0 ; m<doc_hash_file.length; m++){
//                                                                                                     await request(`https://ipfs.io/ipfs/${doc_hash_file[m]}`, async function (error, response, body) {
//                                                                                                         console.log("error 2",error);
                                                                                                                            
//                                                                                                         if (!error && response.statusCode == 200) {
//                                                                                                             // console.log(body);
//                                                                                                             var doc = body;
//                                                                                                             doc_for_show_ejs.push(body)
//                                                                                                         if(doc_hash_file.length==doc_for_show_ejs.length){
                                
//                                                                                                             await getBlockchainData()
                                
//                                                                                                         }
                                                                                                             
                                
//                                                                                                         }
//                                                                                                     })
//                                                                                         }
//                                                                                 }
                                                                                
//                                                                                 // }
//                                                                             // })
//                                                                         // }
//                                                                         // var doc = await getPic(result_input.inputs[0]);
//                                                                         // console.log(doc);
//                                                                     // console.log("result_input ",i," ",result_input.inputs);
//                                                                     // hash_data_new[i].doc_name = result_input.inputs[3];
//                                                                     // hash_data_new[i].verifier_myReflect_code = result_input.inputs[4];
//                                                                     // hash_data_new[i].client_myReflect_code = result_input.inputs[5];
//                                                                     // hash_data_new[i].doc_status = result_input.inputs[6];
//                                                                     g = g+1
//                                                                     console.log("receipt_array ************ ",result_input.inputs[5], query);
//                                                                     function getBlockchainData(){

                                                                       
//                                                                         if(result_input.inputs[5] == query || result_input.inputs[4]==query){
                                                                                
//                                                                             var obj ={
//                                                                                 receipt:receipt,
//                                                                                 created_at:created_at,
//                                                                                 verifier_mail:result_input.inputs[1],
//                                                                                 client_mail:result_input.inputs[2],
//                                                                                 doc_name:result_input.inputs[3],
//                                                                                 verifier_myReflect_code:result_input.inputs[4],
//                                                                                 client_myReflect_code:result_input.inputs[5],
//                                                                                 doc_status:result_input.inputs[6],
//                                                                                 reason:result_input.inputs[7],
//                                                                                 document:doc_for_show_ejs
//                                                                             }
//                                                                             hash_data_new1.push(obj);
//                                                                             // console.log("result_input ",i);
//                                                                             // if(i==(hash_data.length)){
//                                                                             }
//                                                                                 page_data = hash_data_new1;
//                                                                                 const receipt_array = paginate(page_data,page, perPage);
//                                                                                 // console.log("receipt_array ************ ",receipt_array);
//                                                                                 // res.send(receipt_array);  
                                                                        
//                                                                         console.log("hash_data.length************ ",hash_data_new1.length, hash_data.length);
//                                                                         console.log("hash_data.length************ ",hash_data_new1.length, hash_data.length,g);
//                                                                         if(g==(hash_data.length)){
//                                                                                 console.log("************ ");
//                                                                             res.render('front/personal-explorer/explorer_ver',{receipt_array,moment,childWalletData,query});
                                                                                
//                                                                             }

//                                                                     }
                                                                 
                                                                 
//                                                                 })
//                                                                 }
//                                                                 }
//                                                             }
                                                    
                        
//                                                         }
//                                                     })
                        
                                                    
//                                                 // }
//                                                 // setTimeout(rec_data,5000);
//                                             }
//                                             }else{
//                                                 console.log("error");
//                                             }
//                                         });
//                                         }
//                                     }
//                             }else{
//                                     res.render('front/personal-explorer/explorer_ver',{receipt_array:[],moment,childWalletData,query})
//                                 } 
//                             })

//                         }
                        

//                     }else{
//                         // console.log("6");
//                         res.render('front/personal-explorer/explorer_ver',{receipt_array:[],moment,childWalletData,query});
//                     }
                    
//                 })
//             }else{
//                 // hash_data = hash_data_old;
//                 // console.log(hash_data_old);
//                 for(var i=0;i<hash_data_old.length;i++){
//                     var hash = hash_data_old[i].transaction_hash;
//                     var created_at = hash_data_old[i].createdAt;
//                     await waitForReceipt_sec(hash_data_old[i].transaction_hash,i,hash_data_old.length);
//                     async function waitForReceipt_sec(hashes,no,length){
//                     await web3.eth.getTransactionReceipt(hashes, async function (err, receipt) {
//                         if (err) {
//                         error(err);
//                         }
//                         // console.log("result outside",hash_data_old[i]);
                    
//                         if (receipt !== null) {
                        
//                             await request(`http://api-ropsten.etherscan.io/api?module=account&action=txlist&address=${receipt.from}&startblock=0&endblock=99999999&sort=asc&apikey=XMSYU3WSXHXSBNC81DCNJUZBZIVTBIN1HX`, async function (error, response, body) {

//                                 console.log("error 1",error);
                            
//                                 if (!error && response.statusCode == 200) {
//                                     const tx = JSON.parse(body)
//                                     const result = tx.result;
//                                     // const message = tx.message;
//                                     // console.log("tx ",result);
//                                     // console.log("result ",hash);
//                                     for(var j=0;j<result.length;j++){
//                                         if(result[j].hash!=hashes){
//                                             console.log("error 2",error);
//                                         }else{
//                                             const result_input = decoder.decodeData(`${result[j].input}`);
//                                             if(result_input.inputs.length>0){
//                                                 console.log("error 3",error);
//                                                 await request(`https://ipfs.io/ipfs/${result_input.inputs[0]}`, async function (error, response, body) {
//                                                     console.log("error 4",error);
                                                                        
//                                                     if (!error && response.statusCode == 200) {
//                                                         console.log("error 5",error);
//                                                         // console.log(body);
//                                                         var doc = body;
//                                                         var doc_for_show_ejs = []
//                                                         var doc_hash_file  = result_input.inputs[0].split(",")
                                                           
//                                                         for(var m=0 ; m<doc_hash_file.length; m++){
//                                                                         await request(`https://ipfs.io/ipfs/${doc_hash_file[m]}`, async function (error, response, body) {
//                                                                             console.log("error 2",error);
                                                                                                
//                                                                             if (!error && response.statusCode == 200) {
//                                                                                 // console.log(body);
//                                                                                 var doc = body;
//                                                                                 doc_for_show_ejs.push(body)
//                                                                             if(doc_hash_file.length==doc_for_show_ejs.length){
    
//                                                                                 await getBlockchainData()
    
//                                                                             }
                                                                                 
    
//                                                                             }
//                                                                         })
//                                                             }

//                                                     }
//                                                         // console.log(doc);
//                                             // console.log("result_input ",i," ",result_input.inputs);
//                                             // hash_data_new[i].doc_name = result_input.inputs[3];
//                                             // hash_data_new[i].verifier_myReflect_code = result_input.inputs[4];
//                                             // hash_data_new[i].client_myReflect_code = result_input.inputs[5];
//                                             // hash_data_new[i].doc_status = result_input.inputs[6];
//                                             function getBlockchainData(){
//                                             var obj ={
//                                                 receipt:receipt,
//                                                 created_at:created_at,
//                                                 verifier_mail:result_input.inputs[1],
//                                                 client_mail:result_input.inputs[2],
//                                                 doc_name:result_input.inputs[3],
//                                                 verifier_myReflect_code:result_input.inputs[4],
//                                                 client_myReflect_code:result_input.inputs[5],
//                                                 doc_status:result_input.inputs[6],
//                                                 reason:result_input.inputs[7],
//                                                 document:doc_for_show_ejs
//                                             }
//                                             hash_data.push(obj);
//                                             // console.log("result_input ",i);
//                                             // if(i==(hash_data_old.length-1)){
//                                                 page_data = hash_data;
//                                                 const receipt_array = paginate(page_data,page, perPage);
//                                                 // console.log("receipt_array ************ ",receipt_array);
//                                                 // res.send(receipt_array);  
//                                                 if(no == (length - 1)){
                                                    
//                                                         res.render('front/personal-explorer/explorer_ver',{receipt_array,moment,childWalletData,query});
                                                
                                                
//                                             }

//                                         }
                                       
//                                     })
//                                             }
//                                         }
//                                     }
                            

//                                 }
//                             })
                            
//                         }else{
//                             console.log("error123");
//                         }
//                     });
//                 }
//                 }
//             }   
//         })

//     }).catch(err=>console.log(err))
// }




exports.search_transactions_for_download = async (req,res,next) =>{
   
        var query = req.body.tx_value;
    
    var user_reg_id =req.session.user_id
    console.log("value **** 123 ***** ",query);
    var page = req.query.page || 1
    var perPage = 10;
    var page_data=[];
    var hash_data=[];
    var temp = 0;
    var doc = [];

    // const receipt_array=[];
    await db.query("SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents_files.transaction_hash LIKE '%"+query+"%' AND tbl_client_verification_requests.client_id="+user_reg_id+" LIMIT 1",{type:db.QueryTypes.SELECT}).then(async hash_data_old =>{

        // console.log('hash_data_old : ',hash_data_old);

            // hash_data = hash_data_old;
            // console.log(hash_data_old);

            const delay = (duration) => new Promise(resolve => setTimeout(resolve, duration))

                
                var hash = hash_data_old[0].transaction_hash;
                var created_at = hash_data_old[0].createdAt;

                await waitForReceipt_sec(hash);

                async function waitForReceipt_sec(hashes){

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
                                // console.log("result inside api ",hash);

                                console.log("result inside length ",result.length);

                                for(var j=0;j<result.length;j++){
                                    if(result[j].hash!=hashes){

                                    }else{
                                        
                                        

                                        const result_input = decoder.decodeData(`${result[j].input}`);

                                        if(result_input.inputs.length>0){

                                            console.log("result result_input.inputs[0] api ",result_input.inputs[0]);
                                            
                                            var new_hash = [];
                                           
                                            new_hash = (result_input.inputs[0]).split(",")

                            
                                    
                                            var  t_length = new_hash.length;
                                            var  t = 0;

                                            async function wait_ipfs_request(){
         
                                                async.each(new_hash,async function (content, cb) {
                                                      
                                                        await request(`https://ipfs.io/ipfs/${content}`, async function (error, response, body) {
                                                            
                                                                console.log("result_input inner",t," new_hash[t] :",content);

                                                                                    
                                                                if (!error && response.statusCode == 200) {
                                                                    console.log(" tttt : ",t);
                                                                    doc.push(body);

                                                                    t++; 
                                                            }
                                                    })
                                                    await delay(10000)
                                                })
                                            }
                                

                                            async function send_data(){

                                                console.log("doc length ",doc.length);
                                                console.log("receipt_array 2");
                                                

                                                res.render('front/myReflect/download_certified_ajax',{doc})

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
                                    }
                                }
                        

                            }
                        })
                        
                    }else{
                        console.log("error");
                    }
                });
            
            }
    })
}


exports.expoler_child_wallet = async (req,res,next) =>{
  
        var query        =  req.query.query.trim()
        var user_reg_id  =  req.session.user_id

    await db
    
    .query('SELECT * FROM tbl_user_wallets INNER JOIN tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.wallet_id=tbl_user_wallets.wallet_id INNER JOIN tbl_child_wallets on tbl_child_wallets.parent_reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE tbl_user_wallets.wallet_address="'+query+'" AND tbl_user_wallets.reg_user_id='+user_reg_id,{type:db.QueryTypes.SELECT})
    
    .then(async childWalletData=>{ 

        res.render('front/personal-explorer/explorer-child-wallet',{childWalletData});


     })
     
     .catch(err=>console.log(err))

}

// Bhavna
exports.search_personal_from_wallet = async (req,res,next) =>{
   
    // var query = req.body.tx_value;

    var query = req.query.tx_hash_ser.trim()


var user_reg_id =req.session.user_id
console.log("value **** 123 ***** ",query);
var page = req.query.page || 1
var perPage = 10;
var page_data=[];
var hash_data=[];
var temp = 0;
var doc = [];

// const receipt_array=[];
await db.query("SELECT request_file_hash,doc_type FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents_files.transaction_hash LIKE '%"+query+"%' AND tbl_client_verification_requests.client_id="+user_reg_id,{type:db.QueryTypes.SELECT}).then(async doc_type_hash_data =>{

await db.query("SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents_files.transaction_hash LIKE '%"+query+"%' AND tbl_client_verification_requests.client_id="+user_reg_id+" LIMIT 1",{type:db.QueryTypes.SELECT}).then(async hash_data_old =>{

    // console.log('hash_data_old : ',hash_data_old);

        // hash_data = hash_data_old;
        console.log(hash_data_old);

        const delay = (duration) => new Promise(resolve => setTimeout(resolve, duration))

            
            var hash = hash_data_old[0].transaction_hash;
            var created_at = hash_data_old[0].createdAt;

            await waitForReceipt_sec(hash);

            async function waitForReceipt_sec(hashes){

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
                            // console.log("result inside api ",hash);

                            console.log("result inside length ",result.length);

                            for(var j=0;j<result.length;j++){
                                if(result[j].hash!=hashes){

                                }else{
                                    
                                    

                                    const result_input = decoder.decodeData(`${result[j].input}`);

                                    if(result_input.inputs.length>0){

                                        console.log("result result_input.inputs[0] api ",result_input.inputs[0]);
                                        
                                        var new_hash = [];
                                       
                                        new_hash = (result_input.inputs[0]).split(",")

                        
                                
                                        var  t_length = new_hash.length;
                                        var  t = 0;

                                        async function wait_ipfs_request(){
     
                                            async.each(new_hash,async function (content, cb) {

                                                for(var r=0;r<doc_type_hash_data.length;r++){
                                                    
                                                 console.log("doc_type_hash_data[r] : ",doc_type_hash_data[r],"R value : ",r)

                                                   var doc_type = doc_type_hash_data[r].doc_type
                                                   var doc_type_hash = doc_type_hash_data[r].request_file_hash
                                                   console.log("OUTERRRRRRRRR doc_type_hash: ",doc_type_hash," content : ",content," doc_type: ",doc_type)

                                                    if(doc_type_hash === content){
                                                    
                                                        console.log("INNNER doc_type_hash: ",doc_type_hash," content : ",content," doc_type: ",doc_type)
                                                         
                                                            doc.push({file_hash:doc_type_hash,doc_type:'video'});
                                                        
                                                        
                                                    }else{
                                                        await request(`https://ipfs.io/ipfs/${content}`, async function (error, response, body) {
                                                                                
                                                            console.log("result_input inner",t," new_hash[t] :",content);

                                                                                
                                                            if (!error && response.statusCode == 200) {
                                                                console.log(" tttt : ",t);
                                                                doc.push({file_hash:body,doc_type:'image'});

                                                                t++; 
                                                        }
                                                })
                                                
                                                await delay(10000)
                                                    }
                                                }
                                              })
                                            // }
                                        //   }
                                        }
                            

                                        async function send_data(){

                                            console.log("doc length ",doc.length);
                                            console.log("receipt_array 2");
                                            
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
                                                console.log("receipt_array ************ ");
                                                // res.send(receipt_array);  
                                                // if(no == (length - 1)){
                                                   
                                                        res.render('front/personal-explorer/explorer_ver',{receipt_array,moment});
                                                   
                                                
                                            // }
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
                                }
                            }
                    

                        }
                    })
                    
                }else{
                    console.log("error");
                }
            });
        
        }
})
})

}
