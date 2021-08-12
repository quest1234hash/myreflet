var { UserModel, LogDetailsModel } 				= require('../models/user');
var jwt 										= require('jsonwebtoken');
const {TOKEN_SECRET} 							= require("../config/config")


var userAuth = function (req, res, next) {
console.log("midddileware start...................................................................................................")
				// Gather the jwt access token from the request header
				// const authHeader = req.headers['authorization']
				// const token		 = authHeader && authHeader.split(' ')[1]
				// console.log("cookies for test cookies111111",req.session)
				let accessToken = req.session.token
				if (accessToken == null) return res.redirect("/login") // if there isn't any token
				jwt.verify(accessToken, TOKEN_SECRET, (err, user) => {
				console.log(err)
				if (err) return res.redirect("/login")
				console.log("auth start",user)
				req.user = user
				console.log("jwt end...................................................................................................")
				nextAuth()
				// next() // pass the execution off to whatever request the client intended
				})


      function nextAuth(){
						// var test = req.session.is_user_logged_in;
				var check_user = req.session.is_user_logged_in;
				// var check_user_id=req.session.re_us_id;
				console.log("auth start....................................................................")

				if (check_user != undefined && check_user != "" && check_user == true) {
					res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
					console.log("auth pass successfuly")
					next();
				} else {
					console.log("auth reject lofin fail")

					req.flash('err_msg', 'Please login first.');
					res.redirect('/');
				}

	   }


}



const authenticateToken =  (req, res, next) => {
    // Gather the jwt access token from the request header
    const authHeader = req.headers['authorization']
    console.log("authHeader",authHeader)
    const token = ( authHeader == undefined ? null :authHeader.split(' ')[1] )
    // const authHeader = req.body.token
    // const token = authHeader && authHeader.split(' ')[1]
    console.log(token)
   

    if (token == null) return   res.json({ status: 0, msg: "failed", data: { err_msg: 'Token is null or undefined' } });  //res.sendStatus(401) // if there isn't any token
  
    jwt.verify(token,TOKEN_SECRET, (err, user) => {
      console.log(err)
      if (err) return  res.json({ status: 0, msg: "failed", data: { err_msg: 'Token is not valid' } }); // res.sendStatus(403)
      req.user = user
      next() // pass the execution off to whatever request the client intended
    })
  }



module.exports = { userAuth,
	authenticateToken
 }