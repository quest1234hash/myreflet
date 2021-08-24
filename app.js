const path = require('path')
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const dotenv=require('dotenv');
dotenv.config();
var app=express();
var session = require('express-session');
var sequelize = require('sequelize');
var db = require('./app/services/database.js');
const flash = require('express-flash');
var https = require('https');
var fs = require('fs-extra');   
var http = require('http');
const crypto = require('crypto');
const router = require('./app/routes/routes/routes');
const PoaAPI = require('./app/routes/poa_api');

var cron_func=require('./app/helpers/cron');
var profile_func=require('./app/helpers/profile');

// var redirectToHTTPS = require('express-http-to-https').redirectToHTTPS

// app.use(redirectToHTTPS([/localhost:(\d{4})/]));

var {UserModel,LogDetailsModel}=require('./app/models/user');
var {SecurityMasterModel,UserSecurityModel}=require('./app/models/securityMaster');
var {WalletModel}=require('./app/models/wallets');
var {CountryModel,VerifierCategoryMasterModel,DocumentMasterModel}=require('./app/models/master');
var {MyReflectIdModel,DocumentReflectIdModel,FilesDocModel}=require('./app/models/reflect');
var {ReportMasterModel,ReportFilterModel,FilterColumnModel} = require('./app/models/my_reports');
var {ClientVerificationModel,RequestDocumentsModel,RequestFilesModel,verifierRequestModel,updatePrmRequestModel} = require('./app/models/request')

app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'ejs');

const userRoutes = require('./app/routes/userRoutes');
const adminRoutes = require('./app/routes/adminRoutes');
const { JSON } = require('sequelize');
const { stringify } = require('qs');

// app.use(express.json())
app.use(flash());

app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: false , parameterLimit:50000,keepExtensions: true}))
// app.use(express.json())


app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
// app.use(function(req,res,next){
// 	console.log("httttttt", )
// 	if (req.secure){
// 	  return next();
//    }else{
// 	res.redirect("https://" + req.headers.host + req.url);  
  
//    }
//   })

app.locals.decrypt = function(text) {
	var algorithm = 'aes256'; 
	var key = 'password';
	var decipher = crypto.createDecipher(algorithm, key);
	var decrypted = decipher.update(text, 'hex', 'utf8') + decipher.final('utf8');
	return decrypted.toString();
  }

  app.locals.encrypt =  {

	  decrypt(text){
		//   var new_text =text.toString()
		var algorithm = 'aes256'; 
		var key = 'password';
		var decipher = crypto.createDecipher(algorithm, key);
		var decrypted = decipher.update(text, 'hex', 'utf8') + decipher.final('utf8');
		return decrypted.toString();
	 },

	 encrypt1(text){
		var algorithm = 'aes256'; 
	   var key = 'password';
     	var cipher = crypto.createCipher(algorithm, key);  
	  var encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
	  return  encrypted.toString('hex');
	 }

  }

app.use(express.static(path.join(__dirname, 'app/public')));
app.use(express.static(path.join(__dirname, 'app/helpers')));
app.use(express.static(path.join(__dirname, 'app/record-rtc')));
app.use(express.static('app/uploads'))

app.use(session({
	secret : 'dsfdsf565456sdf87s5c4xvdsf5644',
	resave : false,
	saveUninitialized : true,
  }));

// app.use('/',(req,res)=>{
// 	res.render('front/beta');
// });

app.use(profile_func)
app.use("/api",require('./app/routes/userApiRoutes'));
app.use("/btc",require('./app/routes/btc_apies_router'));
app.use("/add-on",require('./app/routes/add_on_route'));

app.use(userRoutes); 


app.use(adminRoutes);
app.use('/video', router);
app.use("/poa",PoaAPI);


/**helper start**/
// app.locals.userName=async function(id) {

// 	return new Promise(function(resolve, reject) {

// 	   UserModel.findOne({ where:{reg_user_id:id} }).then(function(userdetails){

//             if(userdetails.profile_pic)
//             {
//             	console.log("yes");
//             	//return userdetails.profile_pic;
//                resolve('data');
//             }
//             else
//             {
//             	console.log("no");
//             	//return 0;
//                 reject();
//             }

//         });
// 	});


app.locals.userDetail=async function(id) {

	console.log("user id",id);
   // var template = fs.readFileSync('makeList.ejs', 'utf-8');
   return new Promise(async function(resolve,reject) {

     		 var user_name=await UserModel.findOne({'reg_user_id':id});

     		 if(user_name)
     		 {
     		 	// console.log('user_name');
     		 	// console.log(user_name);
     		 	resolve(user_name);
     		 }
     		 else
     		 {
     		 	reject('err');
     		 }


    });
};


//app.use(userDetail);

// var data_vvl=main();

// console.log('Testing data',data_vvl);

// profile_func.userDetail().then((dataval) => {
//     ejs.render('innerHeader',{username:dataval});

//     //console.log('innerHeader',rendered);
// });


// }

 // var new_data=await profile_func.userPIC(52);

 // console.log(new_data);

// new_data.then(function(result) {
//    console.log(new_data); // "Some User token"
// });


/**helper end**/

// const options = {
// 	key: fs.readFileSync('key.pem'),
// 	cert: fs.readFileSync('cert.pem')
//   };

//   http.createServer(app).listen(5050,function(){  
// 	   db.sync();
// 	   console.log("test 5050");

// 	});

//   https.createServer(options, app).listen(443);


//   https.createServer(app,function (req, res) {
// 	// res.writeHead(200, {'Content-Type': 'text/plain'});
// 	db.sync();
//   }).listen(5050);




// var options = {

// 	key: fs.readFileSync("/etc/ssl/private/private.key"),
  
// 	cert: fs.readFileSync("/etc/ssl/certificate.crt"),
  
// 	ca: fs.readFileSync('/etc/ssl/ca_bundle.crt')
	  
//   };

  //http.createServer(app).listen(5055,function(){db.sync();});
// http.createServer(app).listen(80,function(){db.sync();});
// Create an HTTPS service identical to the HTTP service.
//https.createServer(options, app).listen(443);



app.listen(5055,function(){


   db.sync();



 console.log("test 5055");
 console.log("....................................................................................")


});
 