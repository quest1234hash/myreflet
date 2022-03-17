var bitcoinTransaction = require('bitcoin-transaction');
var wif = require('wif');
var { decrypt, encrypt, encrypt1, decrypt1 } = require('../../helpers/encrypt-decrypt')
var { CryptoWalletModel}=require('../../models/crypto_wallet');
let priceOfCrypto = require('crypto-price');
var crypto = require('crypto');