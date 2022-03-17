const express = require('express');
const router = express.Router();
const userController = require('../controllers/apies/user');
const jwt = require("jsonwebtoken");

// const paymentController = require('../controllers/apies/payment');
// const myreflectVerifierController = require('../controllers/apies/myreflect_verifier');
// const myRequestController =require("../controllers/apies/myRequest")
// const boardingRequestController =require("../controllers/apies/boardingRequest")
// const verifierListController = require("../controllers/apies/verifier_list")
// const myreflectVerifierCategory= require("../controllers/apies/verifier_category")
// const marketPlace= require("../controllers/apies/market_place")
// const myReportController= require("../controllers/apies/my_reports")
// const verifierMyreflect= require("../controllers/apies/verfier_reflect")
// const SubverifierController = require("../controllers/apies/subVerifier.js")

// const DeshboardController = require("../controllers/apies/deshboard")
// const ManageClientMessage= require("../controllers/apies/manage_message")

// const walletController = require('../controllers/apies/wallet');
// const myReflectController = require('../controllers/apies/myReflectId');
// const notificationController = require('../controllers/apies/notification');
// const commentController = require('../controllers/apies/complaint');
// const addressBookController = require("../controllers/apies/address_book");
// const blockController = require('../controllers/apies/explorer');
// const DocumentController = require("../controllers/apies/my_document")
// const {userAuth} =require("../auth/user_auth")
// const multer = require('multer');
// var isUser =userAuth
// const validatoreController = require('../controllers/apies/validatore');
// const DigitalWallet = require("../controllers/apies/digital_wallet")


// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//     cb(null, './app/uploads/documents')
//     },
//     filename: function (req, file, cb) {
//     cb(null,file.fieldname + "_" + Date.now() + "_" + file.originalname)
//     }
// })
    
// const upload = multer({ storage: storage }) 

// router.get('/',userController.index);

// function authenticateToken(req, res, next) {
//     // Gather the jwt access token from the request header
//     const authHeader = req.headers['authorization']
//     const token = authHeader && authHeader.split(' ')[1]
//     if (token == null) return res.sendStatus(401) // if there isn't any token
  
//     jwt.verify(token, "mySecretKey" , (err, user) => {
//       console.log(err)
//       if (err) return res.sendStatus(403)
//       req.user = user
//       next() // pass the execution off to whatever request the client intended
//     })
//   }
  
router.get('/get-token',userController.get_token);
router.get('/get-doc-of-master',userController.get_doc_of_master);
router.get('/get-verifier-list/:id',userController.get_verifier_list);
router.get('/get-category-list/:id',userController.get_category_list);
router.get('/get-sub-category-list/:id',userController.get_sub_category_list);
router.get('/get-added-doc/:id',userController.get_added_doc);



router.post('/submit-registration',userController.submit_register);
router.post('/submit-documents',userController.submit_documents);
router.post('/request_doc',userController.request_doc);



module.exports = router; 
