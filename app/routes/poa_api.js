const express = require('express');
const session = require('express-session');
const request = require('request');
const bodyParser = require('body-parser');
const Web3 = require('web3');
var crypto = require('crypto');
const Tx = require('ethereumjs-tx');
const InputDataDecoder = require('ethereum-input-data-decoder');
// const {Transaction,UserWallet} = require('../model/transaction');
// const mailer = require('./mailer.js');

const router = require('express').Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.use(session({ 
  secret: 'admindetails',
  resave: false,
  saveUninitialized: true
}));

//const contractAddress = "0xf81F900EB4b36CEE20D743511d3074fE48aFCA84"
const contractAddress="0xB8bF5431D027f2Dbc58923E794d48e7bdE91c92E";
const tokenContractABI = [{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"documents","outputs":[{"name":"doc","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"doc","type":"string"},{"name":"verifier_email","type":"string"},{"name":"client_email","type":"string"},{"name":"doc_name","type":"string"},{"name":"verifier_myReflect_code","type":"string"},{"name":"client_myReflect_code","type":"string"},{"name":"request_status","type":"string"},{"name":"reason","type":"string"}],"name":"addDocument","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getDocumentsCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"index","type":"uint256"}],"name":"getDocument","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"}];
   

//var web3js = new Web3(new Web3.providers.HttpProvider("http://13.233.173.250:8501"));
var web3js = new Web3(new Web3.providers.HttpProvider("http://128.199.31.153:8501"));
router.get('/',(req,res)=>{
    console.log('Good');
    res.render('index');
})

router.get('/getTransaction',(req,res)=>{

    let hash = '0xb993241a298ec6ef31913208d885f1c6d4d786743c4f6ff4a7647ee75d9a0fd4';

    // var contractABI = tokenContractABI;

    web3js.eth.getTransaction(hash)
    .then(function(response) {
      
        console.log('----- response ------',response);
        const decoder = new InputDataDecoder(tokenContractABI);
        const result_input = decoder.decodeData(`${response.input}`);
        // console.log("data...",result_input.inputs[1].toNumber()/10000000000);

        // let amount = result_input.inputs[1].toNumber()/Math.pow(10,10);
        // let receiver = '0x'+result_input.inputs[0];
        // let sender = response.from;
        // let hash = response.hash;

        // console.log(amount,'-------------------',receiver,'/////////////////',sender,'!!!~~~~~~~~~~~~~',hash);
       
        console.log("result_input : ",result_input)
        if(response === null){

          Transaction.findOne({hash:hash},async (error, result)=>{

            if(result === null){
              res.send({
                status: false,
                message: 'No record found'
              })
            }
            else{
              res.send({
                status: true,
                sender: result.sender,
                receiver: result.receiver,
                amount: result.amount,
                hash: result.hash
              })
            }
            
          })
          
        }
        else if(response.blockNumber > 0){
          console.log('From blockchain - - - - - - - -')
            res.send({
                status: true,
                sender: sender,
                receiver: receiver,
                amount: amount,
                hash: hash
            })

        }
        else{
          res.send({
            status: false,
            message: 'No record found'
          })
        }
    })
    .catch(err =>{
        res.send({
            status: false,
            message: 'An error occured',
            err:err
        })
    })
})

router.post('/createTransaction',async (req,res)=>{

  var sender_address = req.body.sender.trim();
  var get_amount = req.body.amount.trim();
  var reciver_address = req.body.receiver.trim(); 
  var passphrase = req.body.passphrase.trim();

  var options = {  
  //  url: "http://13.233.173.250:8501",
    url:"http://128.199.31.153:8501",
    method: 'POST',
    headers:
    { 
    "content-type": "application/json"
    },
    body: JSON.stringify({"jsonrpc":"2.0","method":"personal_listWallets","params":[],"id":1})
  };

  await request(options, async function (error, response, body) {
    // console.log(body.result);
    // console.log(JSON.parse(body).result);
    let lastSegment;

    var c = JSON.parse(body).result;
    // console.log(c);
    c.forEach(function(element) {
      // console.log(element.accounts);
      var accounts_details = element.accounts;
      accounts_details.forEach(function(element1) {
        // console.log(element1.address);
        let address = sender_address.toLowerCase();
        if (element1.address === address) {
        // console.log(element1.url)
        var parts = element1.url.split('/');
        lastSegment = parts.pop() || parts.pop();  
        // console.log("lastSegment",lastSegment);
        }
      })
    })

    var options2 = {  
      url: ` http://34.194.223.110/devnetwork/node1/keystore/${lastSegment}`,
      method: 'GET',
      headers:
      { 
      "content-type": "application/json"
      }
    };

    await request(options2, async function (error, response, body) {
      console.log('-----------------------',options2.url)
      console.log(body);  
    // })

  // await request.get(` http://34.194.223.110/devnetwork/node1/keystore/${lastSegment}`,function (error, response, body) {
  
    var csv = JSON.parse(body);
    console.log(csv);  
    var c =  web3js.eth.accounts.decrypt(csv,passphrase);
    console.log(c.privateKey);
    var pk = c.privateKey.slice(2);
    var sender_private_key=pk;
    var privateKey = Buffer.from(sender_private_key, 'hex');
    // console.log("private key",privateKey);
  

  var user1=tokenContractABI;
  var tokenContract = new web3js.eth.Contract(user1,contractAddress);
  let count;

  tokenContract.methods.balanceOf(sender_address).call().then(function (result) {

      var weiAmout = get_amount * 1e10;
      console.log("wei amount :",weiAmout);
      var pre_amount_decimal=web3js.utils.toHex(weiAmout);
      // console.log(pre_amount_decimal,'============///////////');

  console.log("---------------------------------",result);
      var count_balance = parseInt(result);
      sam_bal=count_balance/Math.pow(10,10);
      console.log("total balance "+sam_bal);
      console.log("user enter amount "+get_amount)
      var gas_amount=parseFloat(get_amount)+parseFloat(get_amount/10000);
      console.log("add "+parseFloat(gas_amount));
      if(sam_bal >= gas_amount)
      { 
            web3js.eth.getTransactionCount(sender_address).then(function(v) {
            console.log("Count: " + v);
            count = v;
            var amount = gas_amount;
            console.log('------',amount * (Math.pow(10,10)))

            // var rawTransaction = {"from":myAddress, "gasPrice":web3.utils.toHex(2 * 1e9),"gasLimit":web3.utils.toHex(210000),"to":contractAddress,"value":"0x0","data":contract.methods.transfer(toAddress, amount).encodeABI(),"nonce":web3.utils.toHex(count)} 
              var array_donation= [];

            var rawTransaction = {
                "from": sender_address,
                "gasPrice": '0x0',
                "gasLimit": web3js.utils.toHex(4600000),
                "to": '0x132caBc8ed9f8F57c36d924576056b0080C77D52',
                "value": "0x0",
                "data": tokenContract.methods.transfer(reciver_address, pre_amount_decimal).encodeABI(),
                "nonce": web3js.utils.toHex(count)
            }
            // console.log(rawTransaction);
            var transaction = new Tx(rawTransaction);
            transaction.sign(privateKey);
            web3js.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'),async (err, hash) => {

                // console.log('Errororo',err);        
                // console.log('hashh - - -- - -',hash);     

                let txnobject = new Transaction({
                  sender: sender_address.toLowerCase(),
                  receiver: reciver_address.toLowerCase(),
                  amount: get_amount.toLowerCase(),
                  hash: hash.toLowerCase(),
                  created_at: Date.now()
                });

                await txnobject.save((success, err)=>{
                  if (err) {
                    console.log(err);
                  }else{
                    console.log('Success');
                  }
                })

                if(hash !== '' || hash.length < 0){
                  res.send({
                    status: true,
                    sender: sender_address,
                    receiver: reciver_address,
                    amount: get_amount,
                    hash: hash
                  })
                }   
                else if(err){
                  res.send({
                      status: false,
                      message: 'An error occured'
                  })
                }
                }).on('transactionHash');
          });
      }
      else
      {
          res.send({
              status: false,
              message: 'Insufficient funds In Your account'
          })
          console.log("Insufficient funds In Your account")
      }
  });
})
})
})

router.post('/getBlockTransaction', (req, res)=>{

  let block = req.body.block;
  // console.log('======------',block);
  var contractABI = tokenContractABI;

  web3js.eth.getBlock(parseInt(block),true)
  .then(function(response) {
    // console.log(response.transactions);
    let totaltxns = response.transactions.length;
    if(totaltxns === 0){
      res.send({
        status: false,
        message: 'No transactions found'
      })
    }
    else{
      for(let i = 0; i< totaltxns;i++){
        const decoder = new InputDataDecoder(contractABI);
        const result_input = decoder.decodeData(`${response.transactions[i].input}`);
        // console.log("data...",result_input.inputs[1].toNumber()/10000000000);
        let amount = result_input.inputs[1].toNumber()/Math.pow(10,10);
        let receiver = '0x'+result_input.inputs[0];
        let sender = response.transactions[i].from;
        let hash = response.transactions[i].hash;
        console.log(amount,'-------------------',receiver,'/////////////////',sender,'!!!~~~~~~~~~~~~~',hash);
        res.send({
          status: true,
          sender: sender,
          receiver: receiver,
          amount: amount,
          hash: hash
        })
      }
    }
  })
  .catch(err =>{
    res.send({
        status: false,
        message: 'An error occured'
    })
  })

})

router.post('/accountTransaction',async (req,res)=>{
  let account1 = req.body.account;
  let account = account1.toLowerCase();

  await Transaction.find({$or: [{sender:account}, {receiver:account}]}).sort({created_at:-1})
  .then(result =>{
    if(result.length === 0){
      res.send({
        status: true,
        transactions: 'No transactions available'
      })
    }
    else{
      res.send({
        status: true,
        transactions: result
      })
    }
  })
  .catch(err =>{
    res.send({
      status: false,
      message: 'An error occured'
    })
  })
})

router.get('/totalTransaction',async (req,res)=>{
  await Transaction.find({}).sort({created_at:-1})
  .then(result =>{
    if(result.length === 0){
      res.send({
        status: true,
        transactions: 'No transactions available'
      })
    }
    else{
      res.send({
        status: true,
        transactions: result
      })
    }
  })
  .catch(err =>{
    res.send({
      status: false,
      message: 'An error occured'
    })
  })
})

router.get('/getbalance',(req,res)=>{

  let address = '0xEe59F806f452BC8Ad9501D228eD8905cAa4eACB8';
  let sender_address = address.toLowerCase();

  var user1=tokenContractABI;
  console.log("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBalance:",user1);
  var tokenContract = new web3js.eth.Contract(user1,contractAddress);
  let count;

  tokenContract.methods.balanceOf(sender_address).call().then(function (result) {
    let balance = result/Math.pow(10,10);
    console.log('--------------',balance);
    res.send({
      address: address,
      balance: balance
    })
  })
  .catch((err)=>{
    res.send({
      status: false
    })
  })
})

router.get('/createwallet',async (req,res)=>{

  let passphrase = 'hkjggh';

  // let account1;

  // let user_passphrase = crypto.createHash('sha256').update(passphrase).digest('base64');

  // var options = {  
  //   url: "http://13.233.173.250:8501",
  //   method: 'POST',
  //   headers:
  //   { 
  //   "content-type": "application/json"
  //   },
  //   body: JSON.stringify({"jsonrpc":"2.0","method":"personal_newAccount","params":[passphrase],"id":1})
  // };

  // await request(options, async function (error, response, body) {
  //   console.log('response  : ',response);

  //   var JSONbody = JSON.parse(body);
  //   console.log('Account - - - - - -',JSONbody);
    
  //   account1 = JSONbody.result;
  //   console.log('Account - - - - - -',account1);

  //   // await mailer.run_mail(email,'SAM Account Details','Your account address - '+JSONbody.result+'\n<br>Passphrase for the corresponding account is - '+passphrase,'\n\nKeep it safe and sound');

  //   // let wallet_user = new UserWallet({
  //   //   email: email,
  //   //   account: account1.toLowerCase(),
  //   //   passphrase: user_passphrase,
  //   //   created_at: Date.now()
  //   // });

  //   // await wallet_user.save((err,doc)=>{
  //   //   if (err){
  //   //     console.log(err);
  //   //   }
  //   //   else{
  //   //     res.redirect('/');
  //   //   }
  //   // })
  
  let account1 = '0xc7f673d74208cb1af5864d0b85893ecb1aa8771d';

  console.log('---------------------Account',account1);

  var options = {  
   // url: "http://13.233.173.250:8501",
    url:"http://128.199.31.153:8501/",
    method: 'POST',
    headers:
    { 
    "content-type": "application/json"
    },
    body: JSON.stringify({"jsonrpc":"2.0","method":"personal_listWallets","params":[],"id":1})
  };

  await request(options, async function (error, response, body) {
    // console.log(body.result);
    // console.log(JSON.parse(body).result);
    let lastSegment;

    var c = JSON.parse(body).result;
    // console.log(c);
    c.forEach(function(element) {
      // console.log(element.accounts);
      var accounts_details = element.accounts;
      accounts_details.forEach(function(element1) {
        // console.log(element1.address);
        let address = account1.toLowerCase();
        if (element1.address === address) {
        // console.log(element1.url)
        var parts = element1.url.split('/');
        lastSegment = parts.pop() || parts.pop();  
        // console.log("lastSegment",lastSegment);
        }
      })
    })

    var options2 = {  
     // url: ` http://13.233.173.250/devnetwork/node1/keystore/${lastSegment}`,
      url: ` http://128.199.31.153/devnetwork/node1/keystore/${lastSegment}`,
      method: 'GET',
      headers:
      { 
      "content-type": "application/json"
      }
    };

    await request(options2, async function (error, response, body) {
      console.log('-----------------------',options2.url)
      console.log(body);  
    // })

  // await request.get(` http://34.194.223.110/devnetwork/node1/keystore/${lastSegment}`,function (error, response, body) {
  
    var csv = JSON.parse(body);
    console.log(csv);  
    var c =  web3js.eth.accounts.decrypt(csv,'hkjggh');
    console.log(c.privateKey);
    var pk = c.privateKey.slice(2);
    var sender_private_key=pk;
    var privateKey = Buffer.from(sender_private_key, 'hex');
    })
  })
// })
})

router.post('/login',(req,res)=>{
  let email = req.body.email;
  let passphrase = req.body.passphrase;

  let user_passphrase = crypto.createHash('sha256').update(passphrase).digest('base64');

  UserWallet.findOne({passphrase: user_passphrase,email: email},(err,result)=>{

    if(result !== undefined || result.length === 0 || result !== null){
      let account = result.account;
      req.session.account = account;
      req.session.email = email;
      res.send({
        "email": email,
        "passphrase": passphrase,
        "account": account
      })
    }
    else{
      res.send({
        message: 'Enter correct details'
      })
    }
  })
})

router.get('/getwallet',(req,res)=>{
  let account = req.session.account;
  console.log('....................',account);
  if(account === undefined){
    res.send({
      "error": "Please login first"
    })
  }
  else{
    res.send({
      account
    })
  }
})

router.get('/tokenholders',async (req,res)=>{

  let address;
  let count = 0;
  let addresses = 0;
  let counter = 0;

  var options = {  
 //   url: "http://13.233.173.250:8501",
     url:"http://128.199.31.153:8501/",
    method: 'POST',
    headers:
    { 
    "content-type": "application/json"
    },
    body: JSON.stringify({"jsonrpc":"2.0","method":"personal_listWallets","params":[],"id":1})
  };

  await request(options, async function (error, response, body) {

    var c = JSON.parse(body).result;
    addresses = c.length;

    await c.forEach(async function(element) {

      // console.log(element,'..............................');
      var accounts_details = element.accounts;
      await accounts_details.forEach(async function(element1) {

        address = element1.address;

        var user1=tokenContractABI;
        var tokenContract = new web3js.eth.Contract(user1,contractAddress);

        await tokenContract.methods.balanceOf(address).call().then(function (result) {
        
          counter++;

          let balance = result/Math.pow(10,10);
          if(balance > 0){
            count++;
          }

          if(counter === addresses){
            res.send({
              token_holders: count
            })
          }
        })
      })
    })
  })
})

router.get('/totalsupply',(req,res)=>{
  res.send({
    "total supply": "200000000"
  })
})

router.get('/circulatingsupply',(req,res)=>{
  var user1=tokenContractABI;
  var tokenContract = new web3js.eth.Contract(user1,contractAddress);
  let supply;

  tokenContract.methods.balanceOf('0x2170ebEbe19E5237D6397933433BC7D477a3CE24').call().then(function (result) {
    let balance = result/Math.pow(10,10);
    supply = 200000000 - balance

    console.log('--------------',supply);

    res.send({
      "circulating supply": supply
    })
  })
})

router.get('/session',(req,res)=>{
  let account = req.session.account;
  let email = req.session.email;
  res.send({
    "email": email,
    "account": account
  })
})

router.get('/getTransactionDetails',(req,res)=>{

  let hash = '0x9e9e2d5718a48a22774f382e5030ec8d9755c0438cf9ca53359093793feec207';

  console.log("receipt : ",hash)

  function waitForReceipt(hash) {
    web3js.eth.getTransaction(hash, function (err, receipt) {
      if (err) {
        error(err);
      }
    console.log("receipt : ",receipt)
    console.log("err : ",err)

      if (receipt !== null) {
        // Transaction went through
        if (cb) {
          cb(receipt);
        }
      } else {
        // Try again in 1 second
        window.setTimeout(function () {
          waitForReceipt(hash);
        }, 1000);
      }
    });
  }
  waitForReceipt(hash);

  
})
module.exports = router;
