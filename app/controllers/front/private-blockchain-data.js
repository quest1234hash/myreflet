var {UserModel,LogDetailsModel}                 = require('../../models/user');
var {SecurityMasterModel,UserSecurityModel}     = require('../../models/securityMaster');
var{ WalletModel,WalletModelImport }            = require('../../models/wallets');
var{ MyReflectIdModel,DocumentReflectIdModel }  = require('../../models/reflect');


const nodemailer          = require("nodemailer");
var db                    = require('../../services/database');
var sequelize             = require('sequelize');
var dateTime              = require('node-datetime')
var crypto                = require('crypto');
var text_func             = require('../../helpers/text');
var mail_func             = require('../../helpers/mail');
var qr_func               = require('../../helpers/qrcode');
var QRCode                = require('qrcode');
const Tx                  = require('ethereumjs-tx')
var bitcoin               = require("bitcoinjs-lib")
const util                = require('util');
const { base64encode, base64decode } = require('nodejs-base64');


const Web3                = require('web3');
var web3                  = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/eda1216d6a374b3b861bf65556944cdb"));
// var web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/f8a10cc5a2684f61b0de4bf632dd4f4b"));

/**create-wallet Get MEthod Start **/
exports.create_wallet = (req,res,next) =>{
    res.render('front/wallet/create-wallet',{session:req.session});
}
/** get-create-wallet Get MEthod End **/

/** get-create-wallet Get MEthod Start **/
exports.get_create_wallet = (req,res,next) =>{
    res.render('front/wallet/protact-your-wallet',{session:req.session});
}
/** get-create-wallet Get MEthod End **/

/**backup-private-key Get MEthod Start **/
exports.backup_private_key =async (req,res,next) =>{
     
     var user_id        = req.session.user_id;
     var account        = web3.eth.accounts.create();                                //creation  of account 
     var private_key    = account.privateKey                                        // private  key of account
     let buff           = new Buffer(private_key);
     let query          = buff.toString('base64');                                 //encoding private key by base64 buffer 

    await UserModel.findOne({where:{reg_user_id:user_id}})                        // finding the user in db
    .then(async user_data => {

                       var full_name = user_data.full_name;
  
                    res.render('front/wallet/backup-your-private-key',{           // rendring the date on browser
                        private_key,
                        query,
                        session:req.session,
                        full_name
                    });
   });
}
/** backup-private-key Get MEthod End **/


/**backup-eth-address Get MEthod Start **/
exports.backup_eth_address = (req,res,next) =>{
  
    var query         = req.query.key.trim();
    let buff1         = new Buffer(query, 'base64');
    let private_key   = buff1.toString('ascii');
    let account       = web3.eth.accounts.privateKeyToAccount(private_key)                 /*geting account adress by private key */
    const wallet_address = account.address;
    let buff2         = new Buffer(wallet_address);
    let address       = buff2.toString('base64');                                          /*converting buffer into buffer base64*/
 
        res.render('front/wallet/backup-etherium-address',{                                /**rendering the data */
            wallet_address,address,
            session:req.session
        })


}
/**backup-eth-address Get MEthod End **/

/**submit-create-wallet Post MEthod Start **/
exports.submit_create_wallet = (req,res,next) =>{

    var   user_id        = req.session.user_id;
    const query          = req.query.address.trim();
    let   buff1          = new Buffer(query, 'base64');
    let   wallet_address = buff1.toString('ascii');

    web3.eth.getBalance(wallet_address, async (err,wei) => {                                           /**gatin the balnce of wallet */

        var balance = web3.utils.fromWei(wei, 'ether')                                                   /**convert it into ether */

        await  UserModel.findOne({where:{reg_user_id:user_id}})                                            /**finding the user */
        .then(async user_data => {
                     
                 var full_name = user_data.full_name;
      
               WalletModel.create({wallet_address:wallet_address,reg_user_id:user_id,balance:balance})         /**create the entry of balance and address */
               .then(result=>{
                 
                  res.render('front/wallet/successfully-wallet-create',{ session:req.session,wallet_id:result.wallet_id,full_name })
                })

         })
         .catch(err =>{console.log(err)})
    })
}
/**submit-create-wallet Post MEthod End **/




/** get_qr Get MEthod Start **/
async function get_qr(text){
  try {
    return await QRCode.toDataURL(text);
  } catch (err) {
    console.error(err)
  }
}
/** get_qr Get MEthod End **/

/** my-wallets Get MEthod Start **/
exports.show_my_wallet=async(req,res,next) =>{

    var user_id=req.session.user_id;
    // var qr_url='data';
    if(user_id)
    {

        var user_type=req.session.user_type;
        // console.log("user type"+user_type);
        
       await db.query("select * from tbl_wallet_reflectid_rels inner join tbl_user_wallets ON tbl_wallet_reflectid_rels.wallet_id=tbl_user_wallets.wallet_id WHERE tbl_wallet_reflectid_rels.reflectid_by!='digitalWallet' AND  tbl_wallet_reflectid_rels.user_as='"+user_type+"' and tbl_wallet_reflectid_rels.reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(walletdetails){
          for(var i=0; i<walletdetails.length; i++){

           
            // var testbell ;
               await  web3.eth.getBalance(walletdetails[i].wallet_address).then((res_bal)=>{ 
                    //  console.log("js balcnce test" ,res_bal)
                    //  testbell=res_bal
                    // web3.fromWei(res_bal,"ether")
                    const etherValue = web3.utils.fromWei(res_bal, 'ether')
                    walletdetails[i].wal_balan =  etherValue    
                  });
                 
          }
          console.log("js balcnce test" ,walletdetails)

            res.render('front/wallet/my-wallets',{ web3,walletdetails,session:req.session,qr_func,base64encode })
        });

    }
    else
    {
        redirect('/login');
    }
}
/** my-wallets Get MEthod End **/

/**import-wallet Get MEthod Start **/
exports.import_wallet = (req,res,next) =>{
    res.render('front/wallet/import-wallet',{session:req.session});
}
/** import-wallet Get MEthod End **/

/**import-wallet-address Post MEthod Start **/
exports.import_wallet_address = (req,res,next) =>{
    var private_key = req.body.private_key.trim();
    let account = web3.eth.accounts.privateKeyToAccount(private_key)
    const wallet_address = account.address;
    var query = wallet_address;
    // let buff = new Buffer(wallet_address);
    // let query = buff.toString('base64');
    res.render('front/wallet/import-wallet-address',{session:req.session,wallet_address,query});
}
/**import-wallet-address Post MEthod End **/

/**submit-import-wallet Post MEthod Start **/
exports.submit_import_wallet = (req,res,next)=>{
    var user_id = req.session.user_id;
    var wallet_address = req.query.wallet_address.trim();
    // let buff1 = new Buffer(query, 'base64');
    // let wallet_address = buff1.toString('ascii');

    WalletModel.findOne({ where:{wallet_address:wallet_address}}).then(function(walletdetails){
        if(walletdetails){
            var wallet_user_id = walletdetails.reg_user_id
            var wallet_id = walletdetails.wallet_id;
            if(wallet_user_id == user_id){
                req.flash('success_msg',"Wallet already exist.");
                res.redirect('/my-wallets');
            }else{
                WalletModelImport.create({wallet_id:wallet_id,reg_user_id:user_id}).then(result=>{
                    // console.log("wallet",result);
                    res.redirect(`/create-my-refletid-code?address=${wallet_id}`);
                })
                .catch(err =>{console.log(err)})
            }
        }else{
            console.log("else----------------");
            web3.eth.getBalance(wallet_address, (err,wei) => {
                console.log("----------",err);
                var balance = web3.utils.fromWei(wei, 'ether')
                console.log("balance",balance);
                WalletModel.create({wallet_address:wallet_address,reg_user_id:user_id,balance:balance}).then(result=>{
                    // console.log("wallet",result);
                    res.redirect(`/create-my-refletid-code?address=${result.wallet_id}`);
                })
                .catch(err =>{console.log(err)})
            })
        }
        // res.render('front/wallet/my-wallets',{ walletdetails,session:req.session })
  });
    
}
/**submit-import-wallet Post MEthod End **/

/** send-ether Get MEthod Start **/
exports.send_ethers=(req,res,next)=>{

    success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    var wallet_id=base64decode(req.query.ied);
    console.log('wallet_id : **********************')

     console.log(wallet_id)
    if(wallet_id)
    {

        

        WalletModel.findOne({ where:{wallet_id:wallet_id}}).then(function(wallet_result){

            res.render('front/wallet/send-ether',{success_msg,err_msg,session:req.session,wallet_result});

        });

    }

   

}
/**send-ether Get MEthod End **/

/** send-ether-transfer post MEthod Start **/
exports.send_ethers_transfer= (req,res,next)=>{


    var reciever_wallet_address=req.body.receiver_address;
    var wallet_address=req.body.sender_address;
    var quantity=req.body.amount;
   var result;
    const copy_pk=req.body.private_key.trim();

    // console.log(senderPrivate);
    var user_id=req.session.user_id;
    // if(copy_pk==null){
    //   req.flash('error','Please enter valid private key.')
    //   res.redirect('/wallet_send')
    // }
    WalletModel.findOne({'reg_user_id':user_id})
   .then(user => {


    // if(pk!=wallet_address)
    // {
    //   console.log('failed')
    //   req.flash('error','Please enter valid private key.')
    //   res.redirect('/send-ether')
    // }
    // else
    // {
    //   var n = copy_pk.indexOf("0x");

    //   if (n==0) {
        var privateKey1 = copy_pk.slice(2);
    //     console.log(privateKey1)
    //     }else{
    //       var privateKey1 = copy_pk;
          console.log(privateKey1)
    //     }
      var senderPrivate = Buffer.from(privateKey1, 'hex')

      web3.eth.getTransactionCount(wallet_address, (err, txCount) => {
        // Build the transaction
        console.log("tx count -----------  : ",txCount)
        console.log("errrrrrrrrrrrrrrrrrrrrrrrv  : ",err)
        console.log('wallet_address : -------------',wallet_address)
        console.log('reciever_wallet_address : -------------',reciever_wallet_address)
        console.log('quantity : -------------',quantity)




      const txObject = {
      nonce: web3.utils.toHex(txCount),
      to: reciever_wallet_address,
      value: web3.utils.toHex(web3.utils.toWei(quantity, 'ether')),
      gasLimit: web3.utils.toHex(21000),
      gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei'))
      }

      console.log('txObject ******************* :',txObject)

      // Sign the transaction
      const tx = new Tx(txObject)
      tx.sign(senderPrivate)
      console.log('tx ******************* :', tx)

      const serializedTx = tx.serialize()
      const raw = '0x' + serializedTx.toString('hex')
      console.log('raw ******************* :', raw)

      // Broadcast the transaction
      web3.eth.sendSignedTransaction(raw, (err, txHash) => {
      console.log('txHash ******************* :', txHash)
      console.log('errrrrrrrrrrrrrrrrrrr :',err)
           res.send(result)

      // Now go check etherscan to see the transaction!
      })
      })
    // console.log('done ******************** DONE')
    result='done'
    // req.flash('success','Your transaction is done successfully')
    // res.redirect('/send-ether')
// }
  })
  .catch(err=>{
  })
//     web3.eth.signTransaction({
//     from: sender_address,
//     gasPrice: "20000000000",
//     gas: "21000",
//     to: receiver_address,
//     value: amount,
//     data: ""
// }).then(console.log);
//  {
//     raw: '0xf86c808504a817c800825208943535353535353535353535353535353535353535880de0b6b3a76400008025a04f4c17305743700648bc4f6cd3038ec6f6af0df73e31757007b7f59df7bee88da07e1941b264348e80c78c4027afc65a87b0a5e43e86742b8ca0823584c6788fd0',
//     tx: {
//         nonce: '0x0',
//         gasPrice: '0x4a817c800',
//         gas: '0x5208',
//         to: '0x3535353535353535353535353535353535353535',
//         value: '0xde0b6b3a7640000',
//         input: '0x',
//         v: '0x25',
//         r: '0x4f4c17305743700648bc4f6cd3038ec6f6af0df73e31757007b7f59df7bee88d',
//         s: '0x7e1941b264348e80c78c4027afc65a87b0a5e43e86742b8ca0823584c6788fd0',
//         hash: '0xda3be87732110de6c1354c83770aae630ede9ac308d9f7b399ecfba23d923384'
//     }
// }

  // res.redirect('front/wallet/send-ether',{session:req.session});

}
/** send-ether-transfer Post MEthod End **/

/**check-private-key Post MEthod Start **/
exports.check_private_key=(req,res,next)=>{
    console.log("console ------------------------")

    var privatekey=req.body.private_key;
    var send_address=req.body.send_address;
    console.log("primary key ------------------------",privatekey)
    console.log("send_address ----------------------------",send_address)
     var result;
     var account = web3.eth.accounts.privateKeyToAccount(privatekey);
             console.log("account ------------------------",account.address)
             console.log("send_address ----------------------------",send_address)

        if(!account){

            result='1'; 
            //for  invalid private key
            console.log('1')
          // req.flash('error','Please enter valid private key.')
          // res.redirect('/wallet_send')
        }
        else if(account.address!=send_address)
        {
            console.log('2')

            result='2'; 
            //for incorrect address
        }
        else
        {
            console.log('0')

            result='0'; 
            //for correct address 
        }
        res.send(result)
             
}
/**check-private-key Post MEthod End **/

/** wallet-balance Get MEthod Start **/
exports.wallet_balance=(req,res,next)=>{

  var wallet_address=req.query.walletadd;


  web3.eth.getBalance(wallet_address).then((res_bal,err)=>{ 

    if(err)
    {
      console.log("error",err);
    }
    else
    {
     res.send(res_bal); 
    }

  });
}
/**wallet-balance Get MEthod End **/

/** check_wallet_balance Get MEthod Start **/
exports.check_wallet_balance=(req,res,next)=>{

    var new_quantity=req.body.new_quantity;
    var wallet_address=req.body.send_address;

  web3.eth.getBalance(wallet_address).then((res_bal,err)=>{ 

    if(err)
    {
      console.log("error",err);
    }
    else
    {
         const etherValue = web3.utils.fromWei(res_bal, 'ether')
                    
     res.send(etherValue); 
    }

  });
}
/**check_wallet_balance Get MEthod End **/


/** check_wallet_balance_verifier Get MEthod Start **/
exports.check_wallet_balance_verifier=(req,res,next)=>{

    var new_quantity=req.body.new_quantity;
    var wallet = web3.eth.accounts.privateKeyToAccount(req.body.sender_pk);
    var wallet_address = wallet.address;

    console.log('wallet_address : ',wallet_address);

    web3.eth.getBalance(wallet_address).then((res_bal,err)=>{ 

    if(err)
    {
      console.log("error : ",err);
    }
    else
    {
         const etherValue = web3.utils.fromWei(res_bal, 'ether')
                         console.log('etherValue : ',etherValue);

              res.send(etherValue); 
    }

  });
}
/**check_wallet_balance_verifier Get MEthod End **/

/**BTC-wallet Get MEthod Start **/
exports.btc_wallet = async (req,res,next) =>{

  var user_id = req.session.user_id;

  await db.query("select * from tbl_wallet_imports inner join tbl_user_wallets on tbl_user_wallets.wallet_id=tbl_wallet_imports.wallet_id inner join tbl_wallet_reflectid_rels on tbl_wallet_reflectid_rels.btc_wallet_id = tbl_user_wallets.wallet_id where wallet_type='BTC' and tbl_wallet_imports.reg_user_id="+user_id,{ type:db.QueryTypes.SELECT}).then(async function(btcWallet){

  res.render('front/wallet/btc-wallet',{session:req.session,btcWallet,base64encode,qr_func});

  })
}
/** get-BTC-wallet Get MEthod End **/

/**import-btc-wallet Get MEthod Start **/
exports.import_btc_wallet = (req,res,next) =>{
     success_msg = req.flash('success_msg');
    err_msg = req.flash('err_msg');
    res.render('front/wallet/import-btc-wallet',{session:req.session,err_msg});

    
}
/** import-btc-wallet Get MEthod End **/

/**import-btc-wallet-address Get MEthod Start **/
exports.import_btc_wallet_address = (req,res,next) =>{
 
  var private_key = req.body.private_key.trim();
  console.log("private_key : ",private_key)

  const keyPair = bitcoin.ECPair.fromWIF(private_key);
  var user_id = req.session.user_id;


  const { address} = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
  const pubkey  = keyPair.publicKey.toString("hex");
  // var address = private_key.getAddress();
  // const { address } = bitcoin.payments.p2pkh({ pubkey: new Buffer(pubKey, 'hex') });

  console.log("address : ",address)
  console.log("pubkey : ",pubkey)

    
  db.query("SELECT * FROM `tbl_wallet_reflectid_rels` inner join tbl_user_registrations on tbl_user_registrations.reg_user_id = tbl_wallet_reflectid_rels.reg_user_id WHERE user_as = 'client' and  tbl_wallet_reflectid_rels.reg_user_id = "+user_id,{ type:db.QueryTypes.SELECT}).then(function(allClientReflet){

  WalletModel.findOne({where:{wallet_address:address,reg_user_id:user_id}}).then(async result => {
    console.log(result)
       if(!result){
        res.render('front/wallet/import-btc-wallet-address',{session:req.session,wallet_address:address,allClientReflet,pubkey});

       }else{
        req.flash('err_msg', 'This  Wallet address is already imported');
        res.redirect('/import-btc-wallet');    

       }
      })
  })
}
/** import-btc-wallet-address Get MEthod End **/


/**submit-create-btc-wallet Post MEthod Start **/
exports.submit_import_btc_wallet_address = (req,res,next) =>{

  var user_id = req.session.user_id;
  const wallet_address = req.body.wallet_address.trim();
  const {pubkey,reflect_id} = req.body

    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');

  console.log("wallet_address : ",wallet_address)

  console.log("reflect_id : ",reflect_id)
  console.log("pubkey : ",pubkey)

  WalletModel.create({wallet_address:wallet_address,reg_user_id:user_id,public_key:pubkey})
  .then(result=>{
    var updateValues=
    {
      btc_wallet_id:result.wallet_id,
      rep_btc_address:wallet_address
    }
    MyReflectIdModel.update(updateValues, { where: { reflect_id: reflect_id } }).then((resultwallet) => 
    {
        console.log("wallet reflect_id : ",result.reflect_id);

        WalletModelImport.create({wallet_id:result.wallet_id,reg_user_id:user_id,wallet_type:'BTC',createdAt:formatted})
        .then(result=>{
          console.log("wallet : ",result);
          res.render('front/wallet/successfully-wallet-msg',{ session:req.session,wallet_id:1})
            })
         })
   })
  .catch(err =>{console.log(err)})
}
/**submit-create-btc-wallet Post MEthod End **/


exports.create_btc_wallet = (req,res,next) =>{



//   var from=req.body.sender_address;
//   var to=req.body.receiver_address;
// var privateKey = new Buffer('L3d3Aanh7kuapj5zi2uWSN7jNxffyFgDjpK6wK936LpEsx8pvUMg','hex');
// // var privKeyWIF = wif.encode(239,privateKey,true);
// var privKeyWIF = wif.encode(128,privateKey,true);

//   const keyPair = bitcoin.ECPair.makeRandom();
//   const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
//   const publicKey = keyPair.publicKey.toString("hex");
//   const privateKey = keyPair.toWIF();


  const keyPair = bitcoin.ECPair.fromWIF(
    // 'KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn',
    'L3d3Aanh7kuapj5zi2uWSN7jNxffyFgDjpK6wK936LpEsx8pvUMg'

  );

  // bitcoin.ECPair.fromWIF(
    // 'KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn',
    // 'L3d3Aanh7kuapj5zi2uWSN7jNxffyFgDjpK6wK936LpEsx8pvUMg'

  // ).then(keyPair=>{
    
  //     const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });

  // console.log("address : ",address);
    
  // }).catch(err=>{
  //   console.log("err : ",err);
  // })

  // 


  // console.log("publicKey : ",publicKey);


}


