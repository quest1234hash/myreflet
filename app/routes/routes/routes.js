const express = require('express');
const entry = require('./entry');
const exit = require('./exit');

const router = express.Router();

router.use('/entry',entry);
router.use('/exit',exit);

router.get('/',(req, res)=>{
    console.log("WelCome to the Parking System")

    res.render('pages/index.ejs')
})

module.exports = router;