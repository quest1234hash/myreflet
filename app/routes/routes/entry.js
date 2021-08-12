const express = require('express');
const record_rtc = require('recordrtc');
const path = require('path');
const fs = require('fs');
const web3 = require('web3');
var request = require('request');
const { invokeSaveAsDialog } = require('recordrtc');
// const webcam = require('webcam-easy');

const router = express.Router();


router.post('/',(req, res) =>{

    console.log(req.body.photo);
    var blob = req.body.photo;
    // console.log(typeof(blob));
    var videoURLstring = JSON.stringify(req.body.photo);
    // console.log(typeof(videoURLstring));
    var videoURL = JSON.parse(videoURLstring);    
    // console.log(typeof(videoURL));

    res.render('pages/playvideo.ejs',{
        videoURL: videoURL
    })
    
    // console.log(req.body);
    // fs.writeFileSync('photo.png',req.body.photo);
    // fs.writeFileSync('photo.txt',req.body.photo);
    // console.log(req.body.photo)

    // var buffer = new Buffer(req.body.photo,"binary");
    // console.log(buffer);

    // fs.writeFileSync('Cat.mp4', (err, buffer) => {
    //     if (err) throw err;
    //     console.log('do we have a buffer?', buffer instanceof Buffer)
    // });

    // var buffer = Buffer.from(req.body.photo);

    // console.log("BUFFER:" + JSON.stringify(buffer))

    // console.log(JSON.parse(JSON.stringify(req.body.photo)));
    // fs.writeFile('test.jpeg', buffer, {encoding: 'base64'}, function(err,written){
    //    if(err) console.log(err);
    //     else {
    //     console.log("Successfully written");
    // }
// });
    // res.send(req.body.photo);

})

router.get('/',(req, res) =>{
    res.render('pages/video.ejs')
})

router.post('/load',(req, res) =>{
    console.log(req.body.blob);
    var videoURL = req.body.blob;
    res.render('pages/playvideo.ejs',{
        videoURL: videoURL
    })
})

module.exports = router;