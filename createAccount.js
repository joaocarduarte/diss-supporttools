var express = require('express');
var app = express();

var StellarSdk = require('stellar-sdk');

// create a new pair of keys
var pair = StellarSdk.Keypair.random();

pair.secret();
pair.publicKey();


// The SDK does not have tools for creating test accounts, so you'll have to
// make your own HTTP request.
var request = require('request');
request.get({
  url: 'https://friendbot.stellar.org',
  qs: { addr: pair.publicKey() },
  json: true
}, function(error, response, body) {
  if (error || response.statusCode !== 200) {
    console.error('ERROR!', error || body);
  }
  else {
    console.log('SUCCESS! You have a new account :)\n', body);

    var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

    // the JS SDK uses promises for most actions, such as retrieving an account
    server.loadAccount(pair.publicKey()).then(function(account) {
      console.log('\nSecretKey: ' + pair.secret() + '\nPublicKey: ' + pair.publicKey());
      account.balances.forEach(function(balance) {
        console.log('\nType:', balance.asset_type, ', Balance:', balance.balance);
      });
    });
  }
});