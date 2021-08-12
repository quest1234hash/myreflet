var { UserModel, LogDetailsModel } = require('../../models/user');
var { SecurityMasterModel, UserSecurityModel } = require('../../models/securityMaster');
var { WalletModel, WalletModelImport } = require('../../models/wallets');
var { MyReflectIdModel, DocumentReflectIdModel, FilesDocModel } = require('../../models/reflect');
var { CountryModel, VerifierCategoryMasterModel, DocumentMasterModel } = require('../../models/master');
var { ClientVerificationModel, RequestDocumentsModel, RequestFilesModel, verifierRequestModel, updatePrmRequestModel } = require('../../models/request');
var { ComplaintModel, CommentModel } = require('../../models/complaint');
var { tbl_verifier_plan_master, tbl_verifier_doc_list } = require('../../models/admin');
var { tbl_verfier_purchase_details } = require("../../models/purchase_detaile")
var { tbl_address_book } = require("../../models/address_book")
var { NotificationModel } = require('../../models/notification');
var { VerifierRequestCategoryModel, VerifierCategoryReflectidModel, ManageCategoryDocument, CategoryDocument } = require('../../models/verifier_category');
let fetch = require('node-fetch')

const Op = require('sequelize').Op

const Tx = require('ethereumjs-tx')
const Web3 = require('web3');
// var web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/f8a10cc5a2684f61b0de4bf632dd4f4b"));
// var web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/f8a10cc5a2684f61b0de4bf632dd4f4b"));
var web3 = new Web3(new Web3.providers.HttpProvider("http://13.233.173.250:8501"));
var async = require('async');

const nodemailer = require("nodemailer");
var db = require('../../services/database');
var sequelize = require('sequelize');
var dateTime = require('node-datetime');
const paginate = require("paginate-array");
var crypto = require('crypto');
var text_func = require('../../helpers/text');
var mail_func = require('../../helpers/mail');
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
const ipfs = ipfsAPI('ipfs.infura.io', '5001', { protocol: 'https' })

const InputDataDecoder = require('ethereum-input-data-decoder');
const { Console } = require('console');
const { json } = require('sequelize');

var contractABI = [{ "constant": true, "inputs": [{ "name": "", "type": "uint256" }], "name": "documents", "outputs": [{ "name": "doc", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "doc", "type": "string" }, { "name": "verifier_email", "type": "string" }, { "name": "client_email", "type": "string" }, { "name": "doc_name", "type": "string" }, { "name": "verifier_myReflect_code", "type": "string" }, { "name": "client_myReflect_code", "type": "string" }, { "name": "request_status", "type": "string" }, { "name": "reason", "type": "string" }], "name": "addDocument", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getDocumentsCount", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "index", "type": "uint256" }], "name": "getDocument", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }]

const decoder = new InputDataDecoder(contractABI);

exports.global_explorer = async (req, res, next) => {

    var page = req.query.page || 1
    var perPage = 10;
    var page_data = [];
    const hash_data_new = [];
    // var receipt_new =[];
    await db.query('SELECT * FROM tbl_request_documents_files WHERE transaction_hash IS NOT NULL', { type: db.QueryTypes.SELECT }).then(async hash_data => {
        if (hash_data.length > 0) {

            console.log("&&&&&&&&&&&&&&&&&&&&&&&111111111111&&&&&&&&&&&&&&&&&&&&");

            console.log(hash_data);

            for (var i = 0; i < hash_data.length; i++) {

                var hash = hash_data[i].transaction_hash;
                var created_at = hash_data[i].createdAt;
                await waitForReceipt(hash_data[i].transaction_hash);
                async function waitForReceipt(hashes) {
                    await web3.eth.getTransactionReceipt(hashes, async function (err, receipt) {
                        if (err) {
                            error(err);
                        }
                        // console.log("receipt**** ",i);     
                        console.log("&&&&&&&&&&&&&&&&&&&&222222receiptreceiptreceipt2222222&&&&&&&&&&&&&&&&&&&&&&& ");

                        console.log(hash);

                        if (receipt != null) {
                            console.log("receipt inside**** 1 ", i);
                            // receipt_new.push()
                            // async function rec_data(){
                            await request(`http://api-ropsten.etherscan.io/api?module=account&action=txlist&address=${receipt.from}&startblock=0&endblock=99999999&sort=asc&apikey=XMSYU3WSXHXSBNC81DCNJUZBZIVTBIN1HX`, async function (error, response, body) {
                                console.log("error ", error);

                                if (!error && response.statusCode == 200) {
                                    console.log("receipt inside inside****2", i);
                                    const tx = JSON.parse(body)
                                    const result = tx.result;
                                    for (var j = 0; j < result.length; j++) {
                                        if (result[j].hash != hashes) {

                                        } else {
                                            console.log("result***** ", result[j].hash);
                                            console.log("result 123***** ", hashes);
                                            const result_input = decoder.decodeData(`${result[j].input}`);
                                            if (result_input.inputs.length > 0) {
                                                var obj = {
                                                    receipt: receipt,
                                                    created_at: created_at,
                                                    doc_name: result_input.inputs[3],
                                                    verifier_myReflect_code: result_input.inputs[4],
                                                    client_myReflect_code: result_input.inputs[5],
                                                    doc_status: result_input.inputs[6]
                                                }
                                                hash_data_new.push(obj);
                                                console.log("result_input ", i);
                                                // if(i==(hash_data.length-1)){
                                                page_data = hash_data_new;
                                                const receipt_array = paginate(page_data, page, perPage);
                                                console.log("receipt_array.data.length ************ ", hash_data_new.length);
                                                console.log("r(hash_data.length ************ ", hash_data.length);

                                                // res.send(receipt_array);  
                                                if (hash_data_new.length == (hash_data.length)) {
                                                    console.log("&&&&&&&&&&&&&&&&&&&&innerif&&&&&&&&&&&&&&&&&&&&&&&");

                                                    console.log("FINALLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL");
                                                    res.render('front/global-explorer/explorer', { receipt_array, moment });

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
        } else {
            console.log("DIRECT OUTTTTTTTTTTTTTTTT********* ");

            res.render('front/global-explorer/explorer', { receipt_array: [], moment });
        }
        // console.log("hash data********* ",hash_data);


        // function renderIt(){

        // }

        // setTimeout(renderIt(),10000);
    })
}

exports.search_global = async (req, res, next) => {
    var query = req.body.value;
    // console.log("value *********** ",query);
    var page = req.query.page || 1
    var perPage = 10;
    var page_data = [];
    var hash_data = [];
    var temp = 0;
    // const receipt_array=[];
    await db.query("SELECT * FROM tbl_request_documents_files WHERE transaction_hash LIKE '%" + query + "%'", { type: db.QueryTypes.SELECT }).then(async hash_data_old => {
        if (hash_data_old.length == 0) {
            await db.query('SELECT * FROM tbl_request_documents_files WHERE transaction_hash IS NOT NULL', { type: db.QueryTypes.SELECT }).then(async hash_data_new => {
                if (hash_data_new.length > 0) {
                    // hash_data=hash_data_new;
                    // console.log(hash_data_new);
                    for (var i = 0; i < hash_data_new.length; i++) {
                        // var hash = hash_data_new[i].transaction_hash;
                        // console.log("1");
                        var created_at = hash_data_new[i].createdAt;
                        await waitForReceipt(hash_data_new[i].transaction_hash);
                        async function waitForReceipt(hashes) {
                            await web3.eth.getTransactionReceipt(hashes, async function (err, receipt) {
                                if (err) {
                                    error(err);
                                }

                                if (receipt !== null) {
                                    if (receipt.blockNumber != query) {
                                        // console.log("2");

                                    } else {
                                        temp = receipt.blockNumber;
                                        // console.log("3");
                                        await request(`http://api-ropsten.etherscan.io/api?module=account&action=txlist&address=${receipt.from}&startblock=0&endblock=99999999&sort=asc&apikey=XMSYU3WSXHXSBNC81DCNJUZBZIVTBIN1HX`, async function (error, response, body) {
                                            console.log("error ", error);

                                            if (!error && response.statusCode == 200) {
                                                const tx = JSON.parse(body)
                                                const result = tx.result;
                                                // console.log("4");
                                                // const message = tx.message;
                                                // console.log("tx ",result[0]);
                                                // console.log("result ",result[82].input);
                                                for (var j = 0; j < result.length; j++) {
                                                    if (result[j].hash != hashes) {

                                                    } else {
                                                        const result_input = decoder.decodeData(`${result[j].input}`);
                                                        if (result_input.inputs.length > 0) {
                                                            // console.log("result_input ",i," ",result_input.inputs);
                                                            // hash_data_new[i].doc_name = result_input.inputs[3];
                                                            // hash_data_new[i].verifier_myReflect_code = result_input.inputs[4];
                                                            // hash_data_new[i].client_myReflect_code = result_input.inputs[5];
                                                            // hash_data_new[i].doc_status = result_input.inputs[6];
                                                            var obj = {
                                                                receipt: receipt,
                                                                created_at: created_at,
                                                                doc_name: result_input.inputs[3],
                                                                verifier_myReflect_code: result_input.inputs[4],
                                                                client_myReflect_code: result_input.inputs[5],
                                                                doc_status: result_input.inputs[6]
                                                            }
                                                            hash_data.push(obj);
                                                            // console.log("result_input ",i);
                                                            // if(i==(hash_data.length-1)){
                                                            page_data = hash_data;
                                                            const receipt_array = paginate(page_data, page, perPage);
                                                            // console.log("receipt_array ************ ",receipt_array);
                                                            // res.send(receipt_array);  
                                                            if (receipt_array.data.length == (hash_data.length)) {

                                                                res.render('front/global-explorer/explorer', { receipt_array, moment });


                                                            }
                                                        }
                                                    }
                                                }


                                            }
                                        })
                                    }


                                } else {
                                    console.log("error");
                                }
                            });
                        }
                        if (i == (hash_data_new.length - 1) && temp == 0) {
                            res.render('front/global-explorer/explorer', { receipt_array: [], moment });
                        }
                    }
                } else {
                    hash_data = [];
                }

            })
        } else {
            // hash_data = hash_data_old;
            // console.log(hash_data_old);
            for (var i = 0; i < hash_data_old.length; i++) {
                // var hash = hash_data_old[i].transaction_hash;
                var created_at = hash_data_old[i].createdAt;
                await waitForReceipt_sec(hash_data_old[i].transaction_hash, i, hash_data_old.length);
                async function waitForReceipt_sec(hashes, no, length) {
                    await web3.eth.getTransactionReceipt(hashes, async function (err, receipt) {
                        if (err) {
                            error(err);
                        }
                        // console.log("result outside",hash_data_old[i]);

                        if (receipt !== null) {

                            await request(`http://api-ropsten.etherscan.io/api?module=account&action=txlist&address=${receipt.from}&startblock=0&endblock=99999999&sort=asc&apikey=XMSYU3WSXHXSBNC81DCNJUZBZIVTBIN1HX`, async function (error, response, body) {
                                console.log("error ", error);

                                if (!error && response.statusCode == 200) {
                                    const tx = JSON.parse(body)
                                    const result = tx.result;
                                    // const message = tx.message;
                                    // console.log("tx ",result);
                                    // console.log("result ",hash);
                                    for (var j = 0; j < result.length; j++) {
                                        if (result[j].hash != hashes) {

                                        } else {
                                            const result_input = decoder.decodeData(`${result[j].input}`);
                                            if (result_input.inputs.length > 0) {
                                                // console.log("result_input ",i," ",result_input.inputs);
                                                // hash_data_new[i].doc_name = result_input.inputs[3];
                                                // hash_data_new[i].verifier_myReflect_code = result_input.inputs[4];
                                                // hash_data_new[i].client_myReflect_code = result_input.inputs[5];
                                                // hash_data_new[i].doc_status = result_input.inputs[6];
                                                var obj = {
                                                    receipt: receipt,
                                                    created_at: created_at,
                                                    doc_name: result_input.inputs[3],
                                                    verifier_myReflect_code: result_input.inputs[4],
                                                    client_myReflect_code: result_input.inputs[5],
                                                    doc_status: result_input.inputs[6]
                                                }
                                                hash_data.push(obj);
                                                // console.log("i ",i);
                                                // if(i==(hash_data_old.length-1)){
                                                page_data = hash_data;
                                                const receipt_array = paginate(page_data, page, perPage);
                                                // console.log("receipt_array ************ ",receipt_array);
                                                // res.send(receipt_array);  
                                                // console.log("hash_data_old.length ",hash_data_old.length);
                                                if (no == (length - 1)) {

                                                    res.render('front/global-explorer/explorer', { receipt_array, moment });

                                                }
                                            }
                                        }
                                    }


                                }
                            })

                        } else {
                            console.log("error");
                        }
                    });
                }
            }
        }
    })


}

exports.personal_explorer = async (req, res, next) => {

    console.log("...................................................................................personal_explorer........................................................")
    var user_reg_id = req.session.user_id
    var page = req.query.page || 1
    var perPage = 10;
    var page_data = [];
    const hash_data_new = [];



    await db.query('SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents_files.transaction_hash IS NOT NULL AND tbl_client_verification_requests.client_id=' + user_reg_id + ' Group by tbl_request_documents_files.request_doc_id', { type: db.QueryTypes.SELECT }).then(async hash_data => {
        console.log("personal_data ", hash_data);

        if (hash_data.length > 0) {

            for (var i = 0; i < hash_data.length; i++) {
                // var hash = hash_data[i].transaction_hash;
                var created_at = hash_data[i].createdAt;
                await waitForReceipt(hash_data[i].transaction_hash);
                async function waitForReceipt(hashes) {
                    await web3.eth.getTransaction(hashes, async function (err, receipt) {
                        if (err) {
                            error(err);
                            console.log("getTransactionReceipt error")
                        }

                        if (receipt !== null) {
                            console.log("receipt**** ", i);

                            const result_input = decoder.decodeData(`${receipt.input}`);
                            console.log("hase length", result_input.inputs.length)

                            console.log("hase result_input", result_input.inputs.length)

                            if (result_input.inputs.length > 0) {
                                // var doc = result_input.inputs[0];
                                console.log("hase not equle", result_input.inputs[0])
                                // async function getPic(uri){
                                var doc_for_show_ejs = []

                                var doc_hash_file = result_input.inputs[0].split(",")

                                for (var m = 0; m < doc_hash_file.length; m++) {
                                    let temp = doc_hash_file[m].split('-')
                                    let doc = temp[1]
                                    let doc_type
                                    if (temp[0] == "image") {

                                        doc_type = temp[0]
                                        console.log("type check console", doc_type);
                                        await request(`https://ipfs.io/ipfs/${doc}`, async function (error, response, body) {
                                            console.log("error 2", error);

                                            if (!error && response.statusCode == 200) {
                                                // console.log(body);
                                                var doc = body;
                                                doc_for_show_ejs.push({ type: doc_type, body })
                                                if (doc_hash_file.length == doc_for_show_ejs.length) {

                                                    await getBlockchainData()

                                                }


                                            }
                                        })

                                    } else if (temp[0] == "video") {

                                        doc_type = temp[0]
                                        console.log("type check console", doc_type);



                                        // console.log(body);

                                        doc_for_show_ejs.push({ type: doc_type, body: temp[1] })
                                        if (doc_hash_file.length == doc_for_show_ejs.length) {

                                            await getBlockchainData()

                                        }



                                    } else {

                                        doc_type = "image"
                                        console.log("type check console", doc_type);

                                        await request(`https://ipfs.io/ipfs/${doc}`, async function (error, response, body) {
                                            console.log("error 2", error);

                                            if (!error && response.statusCode == 200) {
                                                // console.log(body);
                                                var doc = body;
                                                doc_for_show_ejs.push({ type: doc_type, body })
                                                if (doc_hash_file.length == doc_for_show_ejs.length) {

                                                    await getBlockchainData()

                                                }


                                            }
                                        })

                                    }

                                }

                                async function getBlockchainData() {
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
                                    var obj = {
                                        receipt: receipt,
                                        created_at: created_at,
                                        verifier_mail: result_input.inputs[1],
                                        client_mail: result_input.inputs[2],
                                        doc_name: result_input.inputs[3],
                                        verifier_myReflect_code: result_input.inputs[4],
                                        client_myReflect_code: result_input.inputs[5],
                                        doc_status: result_input.inputs[6],
                                        reason: result_input.inputs[7],
                                        // document:doc
                                        document: doc_for_show_ejs
                                    }
                                    hash_data_new.push(obj);
                                    // console.log("result_input ",i);
                                    // if(i==(hash_data.length)){
                                    page_data = hash_data_new;
                                    const receipt_array = paginate(page_data, page, perPage);
                                    console.log("receipt_array ************ ", hash_data_new.length, hash_data.length);
                                    // res.send(receipt_array);  
                                    if (hash_data_new.length == (hash_data.length)) {
                                        // console.log("final ************ ",hash_data_new);
                                        console.log("receipt_array ************ ", receipt_array);
                                        res.render('front/personal-explorer/explorer', { receipt_array, moment });

                                    }

                                }




                            }

                        } else {
                            console.log("error");
                        }
                    });
                }
            }
        } else {
            res.render('front/personal-explorer/explorer', { receipt_array: [], moment, })
        }
    })
    // res.render('front/personal-explorer/explorer',{receipt_array,moment});

}

exports.search_personal = async (req, res, next) => {

    console.log("*****************************************personal search strat****************************")
    if (req.body.value != undefined && req.body.value != null) {
        var query = req.body.value.trim()
    } else {
        var query = req.query.tx_hash_ser.trim()
    }
    var user_reg_id = req.session.user_id
    // console.log("value *********** ",query);
    var page = req.query.page || 1
    var perPage = 10;
    var page_data = [];
    var hash_data = [];
    var temp = 0;
    // const receipt_array=[];

    await db.query('SELECT * FROM tbl_user_wallets INNER JOIN tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.wallet_id=tbl_user_wallets.wallet_id INNER JOIN tbl_child_wallets on tbl_child_wallets.parent_reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE tbl_user_wallets.wallet_address="' + query + '" AND tbl_user_wallets.reg_user_id=' + user_reg_id, { type: db.QueryTypes.SELECT }).then(async childWalletData => {



        // await db.query("SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents_files.transaction_hash LIKE '%" + query + "%' AND tbl_client_verification_requests.client_id=" + user_reg_id, { type: db.QueryTypes.SELECT }).then(async hash_data_old => {
        await db.query("SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents_files.transaction_hash LIKE '%" + query + "%' AND tbl_request_documents_files.transaction_hash IS NOT NULL AND tbl_client_verification_requests.client_id=" + user_reg_id + " Group by tbl_request_documents_files.request_doc_id", { type: db.QueryTypes.SELECT }).then(async hash_data_old => {
            if (hash_data_old.length == 0) {
                console.log("inside 1st if***********************************************************")
                console.log("hash_data_new null 1 1");
                await db.query('SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents_files.transaction_hash IS NOT NULL AND tbl_client_verification_requests.client_id=' + user_reg_id + '  Group by tbl_request_documents_files.request_doc_id', { type: db.QueryTypes.SELECT }).then(async hash_data_new => {
                    console.log("search fromthe block number.....................................................................");
                    if (hash_data_new.length > 0) {
                        // console.log("1");
                        // hash_data=hash_data_new;
                        console.log("hash_data_new null 1", query.length);
                        // console.log(hash_data_new);
                        if (query.length != 4) {

                            const hash_data_new1 = [];

                            console.log("*********************inside query Code for block number************************************************************")
                            // console.log("personal_data ",hash_data);
                            if (hash_data_new.length > 0) {
                                console.log("*********************inside if condition *Code for block number*************************************************************")
                                let i = 1;
                                let g = 0;
                                await async.each(hash_data_new, async function (hash_data, cb) {

                                    console.log("*********************inside loop Code for block number************************************************************")
                                    // for (var i = 0; i < hash_data.length; i++) {
                                    // var hash = hash_data[i].transaction_hash;
                                    var created_at = hash_data.createdAt;

                                    await waitForReceipt(hash_data.transaction_hash);

                                    async function waitForReceipt(hashes) {

                                        await web3.eth.getTransaction(hashes, async function (err, receipt) {

                                            if (err) { error(err); res.send({ msg: "error from getTransaction", err }) }

                                            if (receipt !== null) {

                                                if (receipt.blockNumber != query) {

                                                    g++;
                                                    console.log("*********************block not match*************************************************************", g)

                                                } else {


                                                    await findDataFun()

                                                    async function findDataFun() {
                                                        console.log("********************findDataFun *Code for block number*************************************************************")

                                                        const result_input = decoder.decodeData(`${receipt.input}`);
                                                        if (result_input.inputs.length > 0) {

                                                            var doc_for_show_ejs = []
                                                            var doc_hash_file_array = result_input.inputs[0].split(",")

                                                            await async.each(doc_hash_file_array, async function (doc_hash_file, cb) {


                                                                let promise_for_ipfs_doc_wait = new Promise(async (resolve, reject) => {

                                                                    console.log("********************promise_for_ipfs_doc_wait1 Code for block number*************************************************************")

                                                                    let temp = doc_hash_file.split('-')
                                                                    let doc = temp[1]
                                                                    let doc_type

                                                                    if (temp[0] == "image") {

                                                                        doc_type = temp[0]
                                                                        await request(`https://ipfs.io/ipfs/${doc}`, async function (error, response, body) {
                                                                            console.log("********************https://ipfs.io/ipfs Code for block number*************************************************************")
    
                                                                            if (!error && response.statusCode == 200) {
    
                                                                                console.log("inside request if ____________________________")
    
                                                                                doc_for_show_ejs.push({ type: doc_type, body })
    
                                                                                if (doc_hash_file_array.length == doc_for_show_ejs.length) {
    
                                                                                    console.log("inside inside request if ____________________________")
    
                                                                                    await resolve()
    
    
                                                                                }
    
    
                                                                            } else {
                                                                                reject()
                                                                            }
                                                                        })

                                                                    } else if (temp[0] == "video") {
                                                                        doc_type = temp[0]
                                                                        // await request(`https://ipfs.io/ipfs/${doc}`, async function (error, response, body) {
                                                                        //     console.log("********************https://ipfs.io/ipfs Code for block number*************************************************************")
    
                                                                            // if (!error && response.statusCode == 200) {
    
                                                                                console.log("inside request if ____________________________")
    
                                                                                doc_for_show_ejs.push({ type: doc_type, body:doc })
                                                                                
    
                                                                                // if (doc_hash_file_array.length == doc_for_show_ejs.length) {
    
                                                                                //     console.log("inside inside request if ____________________________")
    
                                                                                await resolve()
    
    
                                                                                // }
    
    
                                                                            // } else {
                                                                            //     reject()
                                                                            // }
                                                                        // })

                                                                    } 
                                                                    // else {

                                                                    //     doc_type = "image"

                                                                    // }
                                                          


                                                                })

                                                                promise_for_ipfs_doc_wait.then(async data => {

                                                                    console.log("********************promise_for_ipfs_doc_wait2 Code for block number*************************************************************")
                                                                    await getBlockchainData()

                                                                })
                                                                    .catch(err => res.send(err))

                                                                async function getBlockchainData() {
                                                                    console.log("********************getBlockchainDatagetBlockchainDataCode for block number*************************************************************")



                                                                    var obj = {
                                                                        receipt: receipt,
                                                                        created_at: created_at,
                                                                        verifier_mail: result_input.inputs[1],
                                                                        client_mail: result_input.inputs[2],
                                                                        doc_name: result_input.inputs[3],
                                                                        verifier_myReflect_code: result_input.inputs[4],
                                                                        client_myReflect_code: result_input.inputs[5],
                                                                        doc_status: result_input.inputs[6],
                                                                        reason: result_input.inputs[7],
                                                                        document: doc_for_show_ejs
                                                                    }
                                                                    hash_data_new1.push(obj);

                                                                    page_data = hash_data_new1;
                                                                    const receipt_array = paginate(page_data, page, perPage);

                                                                    g++;
                                                                    console.log("hash_data.length************ ", i, hash_data_new.length, g);
                                                                    if (g == (hash_data_new.length)) {
                                                                        console.log("************ ");
                                                                        res.render('front/personal-explorer/explorer', { receipt_array, moment, childWalletData, query });

                                                                    }

                                                                    i++;

                                                                }


                                                            })

                                                        }
                                                        // }

                                                        // })

                                                    }
                                                }

                                            } else {
                                                console.log("error");
                                            }
                                        });
                                    }
                                    // }

                                })

                            } else {
                                console.log("*********************inside else condition *Code for reflectc code*************************************************************")
                                res.render('front/personal-explorer/explorer', { receipt_array: [], moment, childWalletData, query })
                            }



                        } else {
                            console.log("*********************Code for reflectc code123*************************************************************")

                            const hash_data_new1 = [];
                            let g = 0
                            await db.query('SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents_files.transaction_hash IS NOT NULL AND tbl_client_verification_requests.client_id=' + user_reg_id + '  Group by tbl_request_documents_files.request_doc_id', { type: db.QueryTypes.SELECT }).then(async hash_datas => {
                                console.log("*********************inside query *Code for reflectc code*************************************************************")
                                // console.log("personal_data ",hash_data);
                                if (hash_datas.length > 0) {
                                    console.log("*********************inside if condition *Code for reflectc code*************************************************************")
                                    let i = 1;
                                    await async.each(hash_datas, async function (hash_data, cb) {

                                        console.log("*********************inside loop *Code for reflectc code*************************************************************")
                                        // for (var i = 0; i < hash_data.length; i++) {
                                        // var hash = hash_data[i].transaction_hash;
                                        var created_at = hash_data.createdAt;

                                        await waitForReceipt(hash_data.transaction_hash);

                                        async function waitForReceipt(hashes) {

                                            await web3.eth.getTransaction(hashes, async function (err, receipt) {

                                                if (err) { error(err); res.send({ msg: "error from getTransactionReceipt", err }) }

                                                if (receipt !== null) {



                                                    await findDataFun()



                                                    async function findDataFun() {
                                                        console.log("********************findDataFun *Code for reflectc code*************************************************************")

                                                        const result_input = decoder.decodeData(`${receipt.input}`);

                                                        if (result_input.inputs.length > 0) {

                                                            var doc_for_show_ejs = []
                                                            var doc_hash_file_array = result_input.inputs[0].split(",")

                                                            await async.each(doc_hash_file_array, async function (doc_hash_file, cb) {




                                                                let promise_for_ipfs_doc_wait = new Promise(async (resolve, reject) => {

                                                                    console.log("********************promise_for_ipfs_doc_wait1 *Code for reflectc code*************************************************************")

                                                                    let temp = doc_hash_file.split('-')
                                                                    let doc = temp[1]
                                                                    let doc_type

                                                                    if (temp[0] == "image") {

                                                                        doc_type = temp[0]
                                                                        await request(`https://ipfs.io/ipfs/${doc}`, async function (error, response, body) {
                                                                            console.log("********************https://ipfs.io/ipfs Code for block number*************************************************************")
    
                                                                            if (!error && response.statusCode == 200) {
    
                                                                                console.log("inside request if ____________________________")
    
                                                                                doc_for_show_ejs.push({ type: doc_type, body })
    
                                                                                if (doc_hash_file_array.length == doc_for_show_ejs.length) {
    
                                                                                    console.log("inside inside request if ____________________________")
    
                                                                                    await resolve()
    
    
                                                                                }
    
    
                                                                            } else {
                                                                                reject()
                                                                            }
                                                                        })

                                                                    } else if (temp[0] == "video") {
                                                                        doc_type = temp[0]
                                                                        // await request(`https://ipfs.io/ipfs/${doc}`, async function (error, response, body) {
                                                                        //     console.log("********************https://ipfs.io/ipfs Code for block number*************************************************************")
    
                                                                            // if (!error && response.statusCode == 200) {
    
                                                                                console.log("inside request if ____________________________")
    
                                                                                doc_for_show_ejs.push({ type: doc_type, body:doc })
                                                                                
    
                                                                                // if (doc_hash_file_array.length == doc_for_show_ejs.length) {
    
                                                                                //     console.log("inside inside request if ____________________________")
    
                                                                                await resolve()
    
    
                                                                                // }
    
    
                                                                            // } else {
                                                                            //     reject()
                                                                            // }
                                                                        // })

                                                                    } 


                                                                })

                                                                promise_for_ipfs_doc_wait.then(async data => {

                                                                    console.log("********************promise_for_ipfs_doc_wait2 *Code for reflectc code*************************************************************")
                                                                    await getBlockchainData()

                                                                })
                                                                    .catch(err => res.send(err))

                                                                async function getBlockchainData() {
                                                                    console.log("********************getBlockchainDatagetBlockchainData *Code for reflectc code*************************************************************")


                                                                    if (result_input.inputs[5] == query || result_input.inputs[4] == query) {

                                                                        var obj = {
                                                                            receipt: receipt,
                                                                            created_at: created_at,
                                                                            verifier_mail: result_input.inputs[1],
                                                                            client_mail: result_input.inputs[2],
                                                                            doc_name: result_input.inputs[3],
                                                                            verifier_myReflect_code: result_input.inputs[4],
                                                                            client_myReflect_code: result_input.inputs[5],
                                                                            doc_status: result_input.inputs[6],
                                                                            reason: result_input.inputs[7],
                                                                            document: doc_for_show_ejs
                                                                        }
                                                                        hash_data_new1.push(obj);
                                                                        // console.log("result_input ",i);
                                                                        // if(i==(hash_data.length)){
                                                                    }
                                                                    page_data = hash_data_new1;
                                                                    const receipt_array = paginate(page_data, page, perPage);
                                                                    // console.log("receipt_array ************ ",receipt_array);
                                                                    // res.send(receipt_array);  

                                                                    // console.log("hash_data.length************ ", hash_data_new1.length, hash_data.length);
                                                                    // console.log("hash_data.length************ ", hash_data_new1.length, hash_data.length, g);
                                                                    console.log("hash_data.length************ ", i, hash_datas.length);
                                                                    if (i == (hash_datas.length)) {
                                                                        console.log("************ ");
                                                                        res.render('front/personal-explorer/explorer', { receipt_array, moment, childWalletData, query });

                                                                    }

                                                                    i++;
                                                                }


                                                            })

                                                        }
                                                        // }

                                                        // })

                                                    }


                                                } else {
                                                    console.log("error");
                                                }
                                            });
                                        }
                                        // }

                                    })

                                } else {
                                    console.log("*********************inside else condition *Code for reflectc code*************************************************************")
                                    res.render('front/personal-explorer/explorer', { receipt_array: [], moment, childWalletData, query })
                                }
                            })

                        }


                    } else {
                        // console.log("6");
                        res.render('front/personal-explorer/explorer', { receipt_array: [], moment, childWalletData, query });
                    }

                })
            } else {
                console.log("Search by hase start***********************************************************")

                for (var i = 0; i < hash_data_old.length; i++) {
                    var hash = hash_data_old[i].transaction_hash;
                    var created_at = hash_data_old[i].createdAt;
                    await waitForReceipt_sec(hash_data_old[i].transaction_hash, i, hash_data_old.length);
                    async function waitForReceipt_sec(hashes, no, length) {
                        await web3.eth.getTransaction(hashes, async function (err, receipt) {
                            if (err) {
                                error(err);
                            }
                            // console.log("result outside",hash_data_old[i]);

                            if (receipt !== null) {

                                const result_input = decoder.decodeData(`${receipt.input}`);
                                console.log("hase length>>>>>>>>>>>>", result_input.inputs.length)

                                console.log("hase result_input>>>>>>>>>>>", result_input.inputs)
                                console.log("only receipt>>>>>>>>>>>", receipt)

                                if (result_input.inputs.length > 0) {

                                    console.log("hase not equle", result_input.inputs[0])

                                    var doc_for_show_ejs = []

                                    var doc_hash_file = result_input.inputs[0].split(",")



                                    for (var m = 0; m < doc_hash_file.length; m++) {

                                        let temp = doc_hash_file[m].split('-')
                                        let doc = temp[1]
                                        let doc_type
                                        if (temp[0] == "image") {

                                            doc_type = temp[0]
                                            console.log("type check console", doc_type);
                                            await request(`https://ipfs.io/ipfs/${doc}`, async function (error, response, body) {
                                                console.log("error 2", error);

                                                if (!error && response.statusCode == 200) {
                                                    // console.log(body);
                                                    // var doc = body;
                                                    doc_for_show_ejs.push({ type: doc_type, body })
                                                    if (doc_hash_file.length == doc_for_show_ejs.length) {

                                                        await getBlockchainData()

                                                    }


                                                }
                                            })

                                        } else if (temp[0] == "video") {

                                            doc_type = temp[0]
                                            console.log("type check console", doc_type);



                                            // console.log(body);

                                            doc_for_show_ejs.push({ type: doc_type, body: temp[1] })
                                            if (doc_hash_file.length == doc_for_show_ejs.length) {

                                                await getBlockchainData()

                                            }



                                        } else {

                                            doc_type = "image"
                                            console.log("type check console", doc_type);

                                            await request(`https://ipfs.io/ipfs/${doc}`, async function (error, response, body) {
                                                console.log("error 2", error);

                                                if (!error && response.statusCode == 200) {
                                                    // console.log(body);
                                                    // var doc = body;
                                                    doc_for_show_ejs.push({ type: doc_type, body })
                                                    if (doc_hash_file.length == doc_for_show_ejs.length) {

                                                        await getBlockchainData()

                                                    }


                                                }
                                            })

                                        }

                                    }


                                    function getBlockchainData() {
                                        var obj = {
                                            receipt: receipt,
                                            created_at: created_at,
                                            verifier_mail: result_input.inputs[1],
                                            client_mail: result_input.inputs[2],
                                            doc_name: result_input.inputs[3],
                                            verifier_myReflect_code: result_input.inputs[4],
                                            client_myReflect_code: result_input.inputs[5],
                                            doc_status: result_input.inputs[6],
                                            reason: result_input.inputs[7],
                                            document: doc_for_show_ejs
                                        }
                                        hash_data.push(obj);

                                        page_data = hash_data;
                                        const receipt_array = paginate(page_data, page, perPage);

                                        if (no == (length - 1)) {

                                            res.render('front/personal-explorer/explorer', { receipt_array, moment, childWalletData, query });


                                        }

                                    }



                                }

                            } else {
                                console.log("error123");
                            }
                        });
                    }
                }
            }
        })

    }).catch(err => console.log(err))
}

// exports.personal_explorer_ver = async (req, res, next) => {
//     var user_reg_id = req.session.user_id
//     var page = req.query.page || 1
//     var perPage = 10;
//     var page_data = [];
//     const hash_data_new = [];

//     await db.query('SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents_files.transaction_hash IS NOT NULL AND tbl_client_verification_requests.verifier_id=' + user_reg_id + ' Group by tbl_request_documents_files.request_doc_id', { type: db.QueryTypes.SELECT }).then(async hash_data => {
//         // console.log("personal_data ",hash_data);
//         if (hash_data.length > 0) {
//             for (var i = 0; i < hash_data.length; i++) {
//                 // var hash = hash_data[i].transaction_hash;
//                 var created_at = hash_data[i].createdAt;
//                 await waitForReceipt(hash_data[i].transaction_hash);
//                 async function waitForReceipt(hashes) {
//                     await web3.eth.getTransactionReceipt(hashes, async function (err, receipt) {
//                         if (err) {
//                             error(err);
//                         }

//                         if (receipt !== null) {
//                             // console.log("receipt**** ",i);
//                             // hash_data_new[i]=receipt;
//                             // hash_data_new[i].created_at = created_at;

//                             if (receipt != null) {
//                                 // async function rec_data(){
//                                 await request(`http://api-ropsten.etherscan.io/api?module=account&action=txlist&address=${receipt.from}&startblock=0&endblock=99999999&sort=asc&apikey=XMSYU3WSXHXSBNC81DCNJUZBZIVTBIN1HX`, async function (error, response, body) {
//                                     console.log("error ", error);

//                                     if (!error && response.statusCode == 200) {
//                                         const tx = JSON.parse(body)
//                                         const result = tx.result;
//                                         // const message = tx.message;
//                                         // console.log("tx ",result[0]);
//                                         // console.log("result ",result[82].input);

//                                         for (var j = 0; j < result.length; j++) {
//                                             if (result[j].hash != hashes) {

//                                             } else {
//                                                 const result_input = decoder.decodeData(`${result[j].input}`);
//                                                 // var doc = result_input.inputs[0];
//                                                 console.log("hase not equle", result_input.inputs[0])
//                                                 // async function getPic(uri){
//                                                 var doc_for_show_ejs = []
//                                                 var doc_hash_file1 = result_input.inputs[0]
//                                                 console.log("data from block chain..............")
//                                                 console.log(doc_hash_file1)
//                                                 console.log("data from block chain..............")
//                                                 var doc_hash_file = result_input.inputs[0].split(",")

//                                                 for (var m = 0; m < doc_hash_file.length; m++) {

//                                                     let temp = doc_hash_file[m].split('-')
//                                                     let doc_type;
//                                                     let doc = temp[1]
//                                                     if (temp[0] == "image") {

//                                                         doc_type = temp[0]
//                                                         console.log("type check console", doc_type);
//                                                         await request(`https://ipfs.io/ipfs/${doc}`, async function (error, response, body) {
//                                                             console.log("error 2", error);

//                                                             if (!error && response.statusCode == 200) {
//                                                                 // console.log(body);
//                                                                 // var doc = body;
//                                                                 doc_for_show_ejs.push({ type: doc_type, body })
//                                                                 if (doc_hash_file.length == doc_for_show_ejs.length) {

//                                                                     await getBlockchainData()

//                                                                 }


//                                                             }
//                                                         })

//                                                     } else if (temp[0] == "video") {

//                                                         doc_type = temp[0]
//                                                         console.log("type check console", doc_type);


//                                                         doc_for_show_ejs.push({ type: doc_type, body: temp[1] })
//                                                         if (doc_hash_file.length == doc_for_show_ejs.length) {

//                                                             await getBlockchainData()

//                                                         }




//                                                     } else {

//                                                         doc_type = "image"
//                                                         console.log("type check console", doc_type);

//                                                         await request(`https://ipfs.io/ipfs/${doc}`, async function (error, response, body) {
//                                                             console.log("error 2", error);

//                                                             if (!error && response.statusCode == 200) {
//                                                                 // console.log(body);
//                                                                 var doc = body;
//                                                                 doc_for_show_ejs.push({ type: doc_type, body })
//                                                                 if (doc_hash_file.length == doc_for_show_ejs.length) {

//                                                                     await getBlockchainData()

//                                                                 }


//                                                             }
//                                                         })

//                                                     }

//                                                 }

//                                                 async function getBlockchainData() {


//                                                     var obj = {
//                                                         receipt: receipt,
//                                                         created_at: created_at,
//                                                         verifier_mail: result_input.inputs[1],
//                                                         client_mail: result_input.inputs[2],
//                                                         doc_name: result_input.inputs[3],
//                                                         verifier_myReflect_code: result_input.inputs[4],
//                                                         client_myReflect_code: result_input.inputs[5],
//                                                         doc_status: result_input.inputs[6],
//                                                         reason: result_input.inputs[7],
//                                                         document: doc_for_show_ejs
//                                                     }
//                                                     hash_data_new.push(obj);
//                                                     // console.log("result_input ",i);
//                                                     // if(i==(hash_data.length)){
//                                                     page_data = hash_data_new;
//                                                     const receipt_array = paginate(page_data, page, perPage);
//                                                     // console.log("receipt_array ************ ",receipt_array);
//                                                     // res.send(receipt_array);  
//                                                     console.log("hash_data.length ************ ", hash_data_new.length, hash_data.length);

//                                                     if (hash_data_new.length == (hash_data.length)) {
//                                                         console.log("receipt_array ************ in side if", receipt_array);


//                                                         res.render('front/personal-explorer/explorer_ver', { receipt_array, moment });


//                                                     }
//                                                     //     }
//                                                     // })
//                                                 }
//                                             }
//                                         }


//                                     }
//                                 })


//                                 // }
//                                 // setTimeout(rec_data,5000);
//                             }
//                         } else {
//                             console.log("error");
//                         }
//                     });
//                 }
//             }
//         } else {
//             res.render('front/personal-explorer/explorer_ver', { receipt_array: [], moment })
//         }
//     })
//     // res.render('front/personal-explorer/explorer',{receipt_array,moment});
// }

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

exports.personal_explorer_ver = async (req, res, next) => {
    var user_reg_id = req.session.user_id
    var page = req.query.page || 1
    var perPage = 10;
    var page_data = [];
    const hash_data_new = [];

    await db.query('SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents_files.transaction_hash IS NOT NULL AND tbl_client_verification_requests.verifier_id=' + user_reg_id + ' Group by tbl_request_documents_files.request_doc_id', { type: db.QueryTypes.SELECT }).then(async hash_data => {
        // console.log("personal_data ",hash_data);
        if (hash_data.length > 0) {
            for (var i = 0; i < hash_data.length; i++) {
                var hash = hash_data[i].transaction_hash;
                var created_at = hash_data[i].createdAt;
                await waitForReceipt(hash_data[i].transaction_hash);
                async function waitForReceipt(hashes) {
                    await web3.eth.getTransaction(hashes, async function (err, receipt) {
                        if (err) {
                            error(err);
                        }

                        if (receipt !== null) {
                            // console.log("receipt**** ",i);
                            // hash_data_new[i]=receipt;
                            // hash_data_new[i].created_at = created_at;

                            //  var receipt =    
                            // const message = tx.message;
                            // console.log("tx ",result[0]);
                            // console.log("result ",result[82].input);


                            const result_input = decoder.decodeData(`${receipt.input}`);
                            // var doc = result_input.inputs[0];
                            console.log("hase not equle", result_input.inputs[0])
                            // async function getPic(uri){
                            var doc_for_show_ejs = []
                            var doc_hash_file1 = result_input.inputs[0]
                            console.log("data from block chain..............")
                            console.log(doc_hash_file1)
                            console.log("data from block chain..............")
                            var doc_hash_file = result_input.inputs[0].split(",")

                            for (var m = 0; m < doc_hash_file.length; m++) {

                                let temp = doc_hash_file[m].split('-')
                                let doc_type;
                                let doc = temp[1]
                                if (temp[0] == "image") {

                                    doc_type = temp[0]
                                    console.log("type check console", doc_type);
                                    await request(`https://ipfs.io/ipfs/${doc}`, async function (error, response, body) {
                                        console.log("error 2", error);

                                        if (!error && response.statusCode == 200) {
                                            // console.log(body);
                                            // var doc = body;
                                            doc_for_show_ejs.push({ type: doc_type, body })
                                            if (doc_hash_file.length == doc_for_show_ejs.length) {

                                                await getBlockchainData()

                                            }


                                        }
                                    })

                                } else if (temp[0] == "video") {

                                    doc_type = temp[0]
                                    console.log("type check console", doc_type);


                                    doc_for_show_ejs.push({ type: doc_type, body: temp[1] })
                                    if (doc_hash_file.length == doc_for_show_ejs.length) {

                                        await getBlockchainData()

                                    }




                                } else {

                                    doc_type = "image"
                                    console.log("type check console", doc_type);

                                    await request(`https://ipfs.io/ipfs/${doc}`, async function (error, response, body) {
                                        console.log("error 2", error);

                                        if (!error && response.statusCode == 200) {
                                            // console.log(body);
                                            var doc = body;
                                            doc_for_show_ejs.push({ type: doc_type, body })
                                            if (doc_hash_file.length == doc_for_show_ejs.length) {

                                                await getBlockchainData()

                                            }


                                        }
                                    })

                                }

                            }

                            async function getBlockchainData() {


                                var obj = {
                                    receipt: receipt,
                                    created_at: created_at,
                                    verifier_mail: result_input.inputs[1],
                                    client_mail: result_input.inputs[2],
                                    doc_name: result_input.inputs[3],
                                    verifier_myReflect_code: result_input.inputs[4],
                                    client_myReflect_code: result_input.inputs[5],
                                    doc_status: result_input.inputs[6],
                                    reason: result_input.inputs[7],
                                    document: doc_for_show_ejs
                                }
                                hash_data_new.push(obj);
                                // console.log("result_input ",i);
                                // if(i==(hash_data.length)){
                                page_data = hash_data_new;
                                const receipt_array = paginate(page_data, page, perPage);
                                // console.log("receipt_array ************ ",receipt_array);
                                // res.send(receipt_array);  
                                console.log("hash_data.length ************ ", hash_data_new.length, hash_data.length);

                                if (hash_data_new.length == (hash_data.length)) {
                                    console.log("receipt_array ************ in side if", receipt_array);


                                    res.render('front/personal-explorer/explorer_ver', { receipt_array, moment });


                                }
                                //     }
                                // })
                            }



                        } else {
                            console.log("error");
                        }
                    });
                }
            }
        } else {
            res.render('front/personal-explorer/explorer_ver', { receipt_array: [], moment })
        }
    })
}


exports.search_personal_ver = async (req, res, next) => {


    if (req.body.value != undefined && req.body.value != null) {
        var query = req.body.value.trim()
    } else {
        var query = req.query.tx_hash_ser.trim()
    }
    var user_reg_id = req.session.user_id
    // console.log("value *********** ",query);
    var page = req.query.page || 1
    var perPage = 10;
    var page_data = [];
    var hash_data = [];
    var temp = 0;
    // const receipt_array=[];

    await db.query('SELECT * FROM tbl_user_wallets INNER JOIN tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.wallet_id=tbl_user_wallets.wallet_id INNER JOIN tbl_child_wallets on tbl_child_wallets.parent_reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE tbl_user_wallets.wallet_address="' + query + '" AND tbl_user_wallets.reg_user_id=' + user_reg_id, { type: db.QueryTypes.SELECT }).then(async childWalletData => {



        await db.query("SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents_files.transaction_hash LIKE '%" + query + "%' AND tbl_client_verification_requests.client_id=" + user_reg_id, { type: db.QueryTypes.SELECT }).then(async hash_data_old => {
            if (hash_data_old.length == 0) {
                console.log("hash_data_new null 1 1");
                await db.query('SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents_files.transaction_hash IS NOT NULL AND tbl_client_verification_requests.client_id=' + user_reg_id, { type: db.QueryTypes.SELECT }).then(async hash_data_new => {
                    console.log("hash_data_new null 1 2");
                    if (hash_data_new.length > 0) {

                        if (query.length != 4) {

                            const hash_data_new1 = [];

                            console.log("*********************inside query Code for block number************************************************************")
                            // console.log("personal_data ",hash_data);
                            if (hash_data_new.length > 0) {
                                console.log("*********************inside if condition *Code for block number*************************************************************")
                                let i = 1;
                                let g = 0;
                                await async.each(hash_data_new, async function (hash_data, cb) {

                                    console.log("*********************inside loop Code for block number************************************************************")
                                    // for (var i = 0; i < hash_data.length; i++) {
                                    // var hash = hash_data[i].transaction_hash;
                                    var created_at = hash_data.createdAt;

                                    await waitForReceipt(hash_data.transaction_hash);

                                    async function waitForReceipt(hashes) {

                                        await web3.eth.getTransaction(hashes, async function (err, receipt) {

                                            if (err) { error(err); res.send({ msg: "error from getTransaction", err }) }

                                            if (receipt !== null) {

                                                if (receipt.blockNumber != query) {

                                                    g++;
                                                    console.log("*********************block not match*************************************************************", g)

                                                } else {


                                                    await findDataFun()

                                                    async function findDataFun() {
                                                        console.log("********************findDataFun *Code for block number*************************************************************")

                                                        const result_input = decoder.decodeData(`${receipt.input}`);
                                                        if (result_input.inputs.length > 0) {

                                                            var doc_for_show_ejs = []
                                                            var doc_hash_file_array = result_input.inputs[0].split(",")

                                                            await async.each(doc_hash_file_array, async function (doc_hash_file, cb) {


                                                                let promise_for_ipfs_doc_wait = new Promise(async (resolve, reject) => {

                                                                    console.log("********************promise_for_ipfs_doc_wait1 Code for block number*************************************************************")

                                                                    let temp = doc_hash_file.split('-')
                                                                    let doc = temp[1]
                                                                    let doc_type

                                                                    if (temp[0] == "image") {

                                                                        doc_type = temp[0]
                                                                        await request(`https://ipfs.io/ipfs/${doc}`, async function (error, response, body) {
                                                                            console.log("********************https://ipfs.io/ipfs Code for block number*************************************************************")
    
                                                                            if (!error && response.statusCode == 200) {
    
                                                                                console.log("inside request if ____________________________")
    
                                                                                doc_for_show_ejs.push({ type: doc_type, body })
    
                                                                                if (doc_hash_file_array.length == doc_for_show_ejs.length) {
    
                                                                                    console.log("inside inside request if ____________________________")
    
                                                                                    await resolve()
    
    
                                                                                }
    
    
                                                                            } else {
                                                                                reject()
                                                                            }
                                                                        })

                                                                    } else if (temp[0] == "video") {
                                                                        doc_type = temp[0]
                                                                        // await request(`https://ipfs.io/ipfs/${doc}`, async function (error, response, body) {
                                                                        //     console.log("********************https://ipfs.io/ipfs Code for block number*************************************************************")
    
                                                                            // if (!error && response.statusCode == 200) {
    
                                                                                console.log("inside request if ____________________________")
    
                                                                                doc_for_show_ejs.push({ type: doc_type, body:doc })
                                                                                
    
                                                                                // if (doc_hash_file_array.length == doc_for_show_ejs.length) {
    
                                                                                //     console.log("inside inside request if ____________________________")
    
                                                                                await resolve()
    
    
                                                                                // }
    
    
                                                                            // } else {
                                                                            //     reject()
                                                                            // }
                                                                        // })

                                                                    } 


                                                                })

                                                                promise_for_ipfs_doc_wait.then(async data => {

                                                                    console.log("********************promise_for_ipfs_doc_wait2 Code for block number*************************************************************")
                                                                    await getBlockchainData()

                                                                })
                                                                    .catch(err => res.send(err))

                                                                async function getBlockchainData() {
                                                                    console.log("********************getBlockchainDatagetBlockchainDataCode for block number*************************************************************")



                                                                    var obj = {
                                                                        receipt: receipt,
                                                                        created_at: created_at,
                                                                        verifier_mail: result_input.inputs[1],
                                                                        client_mail: result_input.inputs[2],
                                                                        doc_name: result_input.inputs[3],
                                                                        verifier_myReflect_code: result_input.inputs[4],
                                                                        client_myReflect_code: result_input.inputs[5],
                                                                        doc_status: result_input.inputs[6],
                                                                        reason: result_input.inputs[7],
                                                                        document: doc_for_show_ejs
                                                                    }
                                                                    hash_data_new1.push(obj);

                                                                    page_data = hash_data_new1;
                                                                    const receipt_array = paginate(page_data, page, perPage);

                                                                    g++;
                                                                    console.log("hash_data.length************ ", i, hash_data_new.length, g);
                                                                    if (g == (hash_data_new.length)) {
                                                                        console.log("************ ");
                                                                        res.render('front/personal-explorer/explorer_ver', { receipt_array, moment, childWalletData, query });

                                                                    }

                                                                    i++;

                                                                }


                                                            })

                                                        }
                                                        // }

                                                        // })

                                                    }
                                                }

                                            } else {
                                                console.log("error");
                                            }
                                        });
                                    }
                                    // }

                                })

                            } else {
                                console.log("*********************inside else condition *Code for reflectc code*************************************************************")
                                res.render('front/personal-explorer/explorer_ver', { receipt_array: [], moment, childWalletData, query })
                            }

                        } else {
                            console.log("*********************Code for reflectc code123*************************************************************")

                            const hash_data_new1 = [];
                            let g = 0
                            await db.query('SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents_files.transaction_hash IS NOT NULL AND tbl_client_verification_requests.client_id=' + user_reg_id + '  Group by tbl_request_documents_files.request_doc_id', { type: db.QueryTypes.SELECT }).then(async hash_datas => {

                                console.log("*********************inside query *Code for reflectc code*************************************************************")
                                // console.log("personal_data ",hash_data);
                                if (hash_datas.length > 0) {
                                    console.log("*********************inside if condition *Code for reflectc code*************************************************************")
                                    let i = 1;
                                    await async.each(hash_datas, async function (hash_data, cb) {

                                        console.log("*********************inside loop *Code for reflectc code*************************************************************")
                                        // for (var i = 0; i < hash_data.length; i++) {
                                        // var hash = hash_data[i].transaction_hash;
                                        var created_at = hash_data.createdAt;

                                        await waitForReceipt(hash_data.transaction_hash);

                                        async function waitForReceipt(hashes) {

                                            await web3.eth.getTransaction(hashes, async function (err, receipt) {

                                                if (err) { error(err); res.send({ msg: "error from getTransactionReceipt", err }) }

                                                if (receipt !== null) {



                                                    await findDataFun()



                                                    async function findDataFun() {
                                                        console.log("********************findDataFun *Code for reflectc code*************************************************************")

                                                        const result_input = decoder.decodeData(`${receipt.input}`);

                                                        if (result_input.inputs.length > 0) {

                                                            var doc_for_show_ejs = []
                                                            var doc_hash_file_array = result_input.inputs[0].split(",")

                                                            await async.each(doc_hash_file_array, async function (doc_hash_file, cb) {




                                                                let promise_for_ipfs_doc_wait = new Promise(async (resolve, reject) => {

                                                                    console.log("********************promise_for_ipfs_doc_wait1 *Code for reflectc code*************************************************************")

                                                                    let temp = doc_hash_file.split('-')
                                                                    let doc = temp[1]
                                                                    let doc_type

                                                                    if (temp[0] == "image") {

                                                                        doc_type = temp[0]
                                                                        await request(`https://ipfs.io/ipfs/${doc}`, async function (error, response, body) {
                                                                            console.log("********************https://ipfs.io/ipfs Code for block number*************************************************************")
    
                                                                            if (!error && response.statusCode == 200) {
    
                                                                                console.log("inside request if ____________________________")
    
                                                                                doc_for_show_ejs.push({ type: doc_type, body })
    
                                                                                if (doc_hash_file_array.length == doc_for_show_ejs.length) {
    
                                                                                    console.log("inside inside request if ____________________________")
    
                                                                                    await resolve()
    
    
                                                                                }
    
    
                                                                            } else {
                                                                                reject()
                                                                            }
                                                                        })

                                                                    } else if (temp[0] == "video") {
                                                                        doc_type = temp[0]
                                                                        // await request(`https://ipfs.io/ipfs/${doc}`, async function (error, response, body) {
                                                                        //     console.log("********************https://ipfs.io/ipfs Code for block number*************************************************************")
    
                                                                            // if (!error && response.statusCode == 200) {
    
                                                                                console.log("inside request if ____________________________")
    
                                                                                doc_for_show_ejs.push({ type: doc_type, body:doc })
                                                                                
    
                                                                                // if (doc_hash_file_array.length == doc_for_show_ejs.length) {
    
                                                                                //     console.log("inside inside request if ____________________________")
    
                                                                                await resolve()
    
    
                                                                                // }
    
    
                                                                            // } else {
                                                                            //     reject()
                                                                            // }
                                                                        // })

                                                                    } 


                                                                })

                                                                promise_for_ipfs_doc_wait.then(async data => {

                                                                    console.log("********************promise_for_ipfs_doc_wait2 *Code for reflectc code*************************************************************")
                                                                    await getBlockchainData()

                                                                })
                                                                    .catch(err => res.send(err))

                                                                async function getBlockchainData() {
                                                                    console.log("********************getBlockchainDatagetBlockchainData *Code for reflectc code*************************************************************")


                                                                    if (result_input.inputs[5] == query || result_input.inputs[4] == query) {

                                                                        var obj = {
                                                                            receipt: receipt,
                                                                            created_at: created_at,
                                                                            verifier_mail: result_input.inputs[1],
                                                                            client_mail: result_input.inputs[2],
                                                                            doc_name: result_input.inputs[3],
                                                                            verifier_myReflect_code: result_input.inputs[4],
                                                                            client_myReflect_code: result_input.inputs[5],
                                                                            doc_status: result_input.inputs[6],
                                                                            reason: result_input.inputs[7],
                                                                            document: doc_for_show_ejs
                                                                        }
                                                                        hash_data_new1.push(obj);
                                                                        // console.log("result_input ",i);
                                                                        // if(i==(hash_data.length)){
                                                                    }
                                                                    page_data = hash_data_new1;
                                                                    const receipt_array = paginate(page_data, page, perPage);
                                                                    // console.log("receipt_array ************ ",receipt_array);
                                                                    // res.send(receipt_array);  

                                                                    // console.log("hash_data.length************ ", hash_data_new1.length, hash_data.length);
                                                                    // console.log("hash_data.length************ ", hash_data_new1.length, hash_data.length, g);
                                                                    console.log("hash_data.length************ ", i, hash_datas.length);
                                                                    if (i == (hash_datas.length)) {
                                                                        console.log("************ ");
                                                                        res.render('front/personal-explorer/explorer_ver', { receipt_array, moment, childWalletData, query });

                                                                    }

                                                                    i++;
                                                                }


                                                            })

                                                        }
                                                        // }

                                                        // })

                                                    }


                                                } else {
                                                    console.log("error");
                                                }
                                            });
                                        }
                                        // }

                                    })

                                } else {
                                    console.log("*********************inside else condition *Code for reflectc code*************************************************************")
                                    res.render('front/personal-explorer/explorer_ver', { receipt_array: [], moment, childWalletData, query })
                                }


                            })

                        }

                    } else {
                        // console.log("6");
                        res.render('front/personal-explorer/explorer_ver', { receipt_array: [], moment, childWalletData, query });
                    }

                })
            } else {
                console.log("Search by hase start***********************************************************")

                for (var i = 0; i < hash_data_old.length; i++) {
                    var hash = hash_data_old[i].transaction_hash;
                    var created_at = hash_data_old[i].createdAt;
                    await waitForReceipt_sec(hash_data_old[i].transaction_hash, i, hash_data_old.length);
                    async function waitForReceipt_sec(hashes, no, length) {
                        await web3.eth.getTransaction(hashes, async function (err, receipt) {
                            if (err) {
                                error(err);
                            }
                            // console.log("result outside",hash_data_old[i]);

                            if (receipt !== null) {

                                const result_input = decoder.decodeData(`${receipt.input}`);
                                console.log("hase length>>>>>>>>>>>>", result_input.inputs.length)

                                console.log("hase result_input>>>>>>>>>>>", result_input.inputs)
                                console.log("only receipt>>>>>>>>>>>", receipt)

                                if (result_input.inputs.length > 0) {

                                    console.log("hase not equle", result_input.inputs[0])

                                    var doc_for_show_ejs = []

                                    var doc_hash_file = result_input.inputs[0].split(",")



                                    for (var m = 0; m < doc_hash_file.length; m++) {

                                        let temp = doc_hash_file[m].split('-')
                                        let doc = temp[1]
                                        let doc_type
                                        if (temp[0] == "image") {

                                            doc_type = temp[0]
                                            console.log("type check console", doc_type);
                                            await request(`https://ipfs.io/ipfs/${doc}`, async function (error, response, body) {
                                                console.log("error 2", error);

                                                if (!error && response.statusCode == 200) {
                                                    // console.log(body);
                                                    // var doc = body;
                                                    doc_for_show_ejs.push({ type: doc_type, body })
                                                    if (doc_hash_file.length == doc_for_show_ejs.length) {

                                                        await getBlockchainData()

                                                    }


                                                }
                                            })

                                        } else if (temp[0] == "video") {

                                            doc_type = temp[0]
                                            console.log("type check console", doc_type);



                                            // console.log(body);

                                            doc_for_show_ejs.push({ type: doc_type, body: temp[1] })
                                            if (doc_hash_file.length == doc_for_show_ejs.length) {

                                                await getBlockchainData()

                                            }



                                        } else {

                                            doc_type = "image"
                                            console.log("type check console", doc_type);

                                            await request(`https://ipfs.io/ipfs/${doc}`, async function (error, response, body) {
                                                console.log("error 2", error);

                                                if (!error && response.statusCode == 200) {
                                                    // console.log(body);
                                                    // var doc = body;
                                                    doc_for_show_ejs.push({ type: doc_type, body })
                                                    if (doc_hash_file.length == doc_for_show_ejs.length) {

                                                        await getBlockchainData()

                                                    }


                                                }
                                            })

                                        }

                                    }


                                    function getBlockchainData() {
                                        var obj = {
                                            receipt: receipt,
                                            created_at: created_at,
                                            verifier_mail: result_input.inputs[1],
                                            client_mail: result_input.inputs[2],
                                            doc_name: result_input.inputs[3],
                                            verifier_myReflect_code: result_input.inputs[4],
                                            client_myReflect_code: result_input.inputs[5],
                                            doc_status: result_input.inputs[6],
                                            reason: result_input.inputs[7],
                                            document: doc_for_show_ejs
                                        }
                                        hash_data.push(obj);

                                        page_data = hash_data;
                                        const receipt_array = paginate(page_data, page, perPage);

                                        if (no == (length - 1)) {

                                            res.render('front/personal-explorer/explorer_ver', { receipt_array, moment, childWalletData, query });


                                        }

                                    }



                                }

                            } else {
                                console.log("error123");
                            }
                        });
                    }
                }
                // for (var i = 0; i < hash_data_old.length; i++) {
                //     var hash = hash_data_old[i].transaction_hash;
                //     var created_at = hash_data_old[i].createdAt;
                //     await waitForReceipt_sec(hash_data_old[i].transaction_hash, i, hash_data_old.length);
                //     async function waitForReceipt_sec(hashes, no, length) {
                //         await web3.eth.getTransactionReceipt(hashes, async function (err, receipt) {
                //             if (err) {
                //                 error(err);
                //             }

                //             if (receipt !== null) {


                //                 const result_input = decoder.decodeData(`${receipt.input}`);
                //                 if (result_input.inputs.length > 0) {
                //                     console.log("error 3", error);
                //                     await request(`https://ipfs.io/ipfs/${result_input.inputs[0]}`, async function (error, response, body) {
                //                         console.log("error 4", error);

                //                         if (!error && response.statusCode == 200) {
                //                             console.log("error 5", error);
                //                             // console.log(body);
                //                             var doc = body;
                //                             var doc_for_show_ejs = []
                //                             var doc_hash_file = result_input.inputs[0].split(",")

                //                             for (var m = 0; m < doc_hash_file.length; m++) {
                //                                 await request(`https://ipfs.io/ipfs/${doc_hash_file[m]}`, async function (error, response, body) {
                //                                     console.log("error 2", error);

                //                                     if (!error && response.statusCode == 200) {
                //                                         // console.log(body);
                //                                         var doc = body;
                //                                         doc_for_show_ejs.push(body)
                //                                         if (doc_hash_file.length == doc_for_show_ejs.length) {

                //                                             await getBlockchainData()

                //                                         }


                //                                     }
                //                                 })
                //                             }

                //                         }

                //                         function getBlockchainData() {
                //                             var obj = {
                //                                 receipt: receipt,
                //                                 created_at: created_at,
                //                                 verifier_mail: result_input.inputs[1],
                //                                 client_mail: result_input.inputs[2],
                //                                 doc_name: result_input.inputs[3],
                //                                 verifier_myReflect_code: result_input.inputs[4],
                //                                 client_myReflect_code: result_input.inputs[5],
                //                                 doc_status: result_input.inputs[6],
                //                                 reason: result_input.inputs[7],
                //                                 document: doc_for_show_ejs
                //                             }
                //                             hash_data.push(obj);

                //                             page_data = hash_data;
                //                             const receipt_array = paginate(page_data, page, perPage);

                //                             if (no == (length - 1)) {

                //                                 res.render('front/personal-explorer/explorer_ver', { receipt_array, moment, childWalletData, query });


                //                             }

                //                         }

                //                     })
                //                 }


                //             } else {
                //                 console.log("error123");
                //             }
                //         });
                //     }
                // }
            }
        })

    }).catch(err => console.log(err))
}

exports.search_transactions_for_download = async (req, res, next) => {

    var query = req.body.tx_value;
    var type = req.body.type;

    var user_reg_id = req.session.user_id
    console.log("value **** 123 ***** ", query);
    var page = req.query.page || 1
    var perPage = 10;
    var page_data = [];
    var hash_data = [];
    var temp = 0;
    var doc_array = [];

    await db.query("SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents_files.transaction_hash LIKE '%" + query + "%' AND tbl_client_verification_requests.client_id=" + user_reg_id + " LIMIT 1", { type: db.QueryTypes.SELECT }).then(async hash_data_old => {


        const delay = (duration) => new Promise(resolve => setTimeout(resolve, duration))


        var hash = hash_data_old[0].transaction_hash;
        var created_at = hash_data_old[0].createdAt;

        await waitForReceipt_sec(hash);

        async function waitForReceipt_sec(hashes) {

            await web3.eth.getTransaction(hashes, async function (err, body) {

                if (err) {
                    error(err);
                }

                if (body !== null) {


                    const result_input = decoder.decodeData(`${body.input}`);
                    console.log("result result_input api ", result_input);

                    if (result_input.inputs.length > 0) {

                        console.log("result result_input.inputs[0] api ", result_input.inputs[0]);

                        var new_hash = [];

                        new_hash = (result_input.inputs[0]).split(",")



                        var t_length = new_hash.length;
                        var t = 0;

                        async function wait_ipfs_request() {

                            async.each(new_hash, async function (content, cb) {
                                let temp = content.split('-')
                                let doc = temp[1]
                                let doc_type

                                if (temp[0] == "image") {

                                    doc_type = "image"
                                    await request(`https://ipfs.io/ipfs/${doc}`, async function (error, response, body) {

                                        console.log("result_input inner", t, " new_hash[t] :", content);


                                        if (!error && response.statusCode == 200) {
                                            console.log(" tttt : ", t);
                                            doc_array.push({ type: doc_type, body });

                                            t++;
                                        }
                                    })

                                } else if (temp[0] == "video") {

                                    doc_type = "video"

                                    console.log(" tttt : ", t);
                                    doc_array.push({ type: doc_type, body: doc });
                                    t++;


                                } else {

                                    doc_type = "image"
                                    await request(`https://ipfs.io/ipfs/${doc}`, async function (error, response, body) {

                                        console.log("result_input inner", t, " new_hash[t] :", content);


                                        if (!error && response.statusCode == 200) {
                                            console.log(" tttt : ", t);
                                            doc_array.push({ type: doc_type, body });

                                            t++;
                                        }
                                    })

                                }


                                await delay(10000)
                            })
                        }




                        async function send_data() {

                            console.log("doc length ", doc_array.length);
                            console.log("receipt_array 2");
                            
                            if(type=='entity'){
                                console.log("type : ",type);

                                res.render('front/myReflect/entity_download_certified_ajax', { doc_array })

                            }else{
                                console.log("type : ",type);

                                res.render('front/myReflect/download_certified_ajax', { doc_array })

                            }


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


                } else {
                    console.log("error");
                }
            });

        }
    })
}

exports.expoler_child_wallet = async (req, res, next) => {

    var query = req.query.query.trim()
    var user_reg_id = req.session.user_id

    await db

        .query('SELECT * FROM tbl_user_wallets INNER JOIN tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.wallet_id=tbl_user_wallets.wallet_id INNER JOIN tbl_child_wallets on tbl_child_wallets.parent_reflect_id=tbl_wallet_reflectid_rels.reflect_id WHERE tbl_user_wallets.wallet_address="' + query + '" AND tbl_user_wallets.reg_user_id=' + user_reg_id, { type: db.QueryTypes.SELECT })

        .then(async childWalletData => {

            res.render('front/personal-explorer/explorer-child-wallet', { childWalletData });


        })

        .catch(err => console.log(err))

}

// Bhavna
exports.search_personal_from_wallet = async (req, res, next) => {


    console.log("************ search_personal_from_wallet start******************************* ")

    // var query = req.body.tx_value;

    var query = req.query.tx_hash_ser.trim()


    var user_reg_id = req.session.user_id
    console.log("query========== ***** ", query);
    var page = req.query.page || 1
    var perPage = 10;
    var page_data = [];
    var hash_data = [];
    var temp = 0;
    var doc = [];

    // const receipt_array=[];
    await db.query("SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents_files.transaction_hash LIKE '%" + query + "%' AND tbl_client_verification_requests.client_id=" + user_reg_id + " LIMIT 1", { type: db.QueryTypes.SELECT }).then(async hash_data_old => {

        // console.log('hash_data_old : ',hash_data_old);

        // hash_data = hash_data_old;
        // console.log(hash_data_old);

        // const delay = (duration) => new Promise(resolve => setTimeout(resolve, duration))


        var hash = hash_data_old[0].transaction_hash;
        var created_at = hash_data_old[0].createdAt;

        await waitForReceipt_sec(hash);

        async function waitForReceipt_sec(hashes) {

            await web3.eth.getTransaction(hashes, async function (err, receipt) {
                if (err) {
                    console.log("error");
                    error(err);
                    res.send(err)
                }
                // console.log("result outside",hash_data_old[i]);

                if (receipt !== null) {

                    const result_input = decoder.decodeData(`${receipt.input}`);

                    if (result_input.inputs.length > 0) {

                        console.log("result result_input.inputs[0] api ", result_input.inputs[0]);

                        let new_hash = [];
                        let doc_for_show_ejs = []
                        new_hash = (result_input.inputs[0]).split(",")



                        var t_length = new_hash.length;
                        let i = 0;



                        async.each(new_hash, async function (content, cb) {

                            let promise_for_ipfs_doc_wait = new Promise(async (resolve, reject) => {

                                // console.log("********************promise_for_ipfs_doc_wait1 *Code for reflectc code*************************************************************")
                                

                                let temp = content.split('-')
                                let doc = temp[1]
                                let doc_type

                                if (temp[0] == "image") {

                                    doc_type = temp[0]
                                    await request(`https://ipfs.io/ipfs/${doc}`, async function (error, response, body) {
                                        console.log("********************https://ipfs.io/ipfs Code for block number*************************************************************")

                                        if (!error && response.statusCode == 200) {

                                            console.log("inside request if ____________________________")

                                            doc_for_show_ejs.push({ type: doc_type, body })

                                            // if (doc_hash_file_array.length == doc_for_show_ejs.length) {

                                                console.log("inside inside request if ____________________________")

                                                await resolve()


                                            // }


                                        } else {
                                            reject()
                                        }
                                    })

                                } else if (temp[0] == "video") {
                                    doc_type = temp[0]
                                    // await request(`https://ipfs.io/ipfs/${doc}`, async function (error, response, body) {
                                    //     console.log("********************https://ipfs.io/ipfs Code for block number*************************************************************")

                                        // if (!error && response.statusCode == 200) {

                                            console.log("inside request if ____________________________")

                                            doc_for_show_ejs.push({ type: doc_type, body:doc })
                                            

                                            // if (doc_hash_file_array.length == doc_for_show_ejs.length) {

                                            //     console.log("inside inside request if ____________________________")

                                            await resolve()


                                            // }


                                        // } else {
                                        //     reject()
                                        // }
                                    // })

                                } 


                            })

                            promise_for_ipfs_doc_wait.then(async data => {

                                // console.log("********************promise_for_ipfs_doc_wait2 *Code for reflectc code*************************************************************")
                                console.log("before if  ",i,new_hash.length)
                                if (new_hash.length-1 == i) {
                                    console.log("final value of i ",i)
                                    await send_data()
                                }
                                i++;

                            }).catch(err => res.send(err))




                            async function send_data() {

                                // console.log("doc length ", doc.length);
                                // console.log("receipt_array 2");

                                var obj = {
                                    receipt: receipt,
                                    created_at: created_at,
                                    verifier_mail: result_input.inputs[1],
                                    client_mail: result_input.inputs[2],
                                    doc_name: result_input.inputs[3],
                                    verifier_myReflect_code: result_input.inputs[4],
                                    client_myReflect_code: result_input.inputs[5],
                                    doc_status: result_input.inputs[6],
                                    reason: result_input.inputs[7],
                                    document: doc_for_show_ejs
                                }
                                hash_data.push(obj);
                               
                                page_data = hash_data;
                                const receipt_array = paginate(page_data, page, perPage);
                                // console.log("receipt_array ************befor render1 ",hash_data[0]);
                                // console.log("receipt_array ************befor render ",hash_data[0].document);
                              
                                res.render('front/personal-explorer/explorer_ver', { receipt_array, moment });

                            }

                        })

                    }


                }

            });

        }
    })
}
