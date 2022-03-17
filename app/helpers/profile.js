var {UserModel,LogDetailsModel}=require('../models/user');


// async function userPIC(id) {

//      return new Promise(function(resolve, reject) {

//         UserModel.findOne({'reg_user_id':id}).then(function(userdetails){

//             if(userdetails.profile_pic)
//             {

//               resolve(userdetails.profile_pic);
//             }
//             else
//             {
//                 reject(0);
//             }

//         });

//      });
//         //return text.charAt(0).toUpperCase()+text.slice(1).toLowerCase();
// }
module.exports = function(req, res, next){
	res.locals.session = req.session;
	var userID=req.session.user_id
	// console.log("user data",req.session.universitiesId)
	//  console.log("user data12222222222",userID)
	UserModel.findOne({where:{reg_user_id: userID}}).then(result=>
	{
	
	res.locals.Userprofile = function(){
	//  console.log("user data12222222222",result)
	if(result!=null && result!=undefined){
  // return result.logo;
   return result
	}else{
	return null;
	}
	}
	res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	next();
	
}).catch(err=>{

		// console.log("ggggggggggggggggggggggg")
		res.locals.Userprofile = function(){
											  return null;
											}	
											res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	next();
			})
	}
