var express = require('express');
var app = express();

var StellarSdk = require('stellar-sdk');


StellarSdk.Network.useTestNetwork();

// Initialize the Stellar SDK with the Horizon instance
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

//Sender source key
var sourceKeys = StellarSdk.Keypair
  .fromSecret('SATJDSWJCV2IHTOOOOKCDEZMW7LUECSMTQ4J3LFQGHOM4DT4FOPW5SLZ');

//Destination
var destinationId = 'GCCBAN6UI27YF7HLJZHLM47TJW2VD7KIBOKCICITA4577K4HZ4TY2HNZ';


// Transaction will hold a built transaction we can resubmit if the result is unknown.
var transaction;

// First, check to make sure that the destination account exists.
// You could skip this, but if the account does not exist, you will be charged
// the transaction fee when the transaction fails.
server.loadAccount(destinationId)
  // If the account is not found, surface a nicer error message for logging.
  .catch(StellarSdk.NotFoundError, function (error) {
    throw new Error('The destination account does not exist!');
  })
  // If there was no error, load up-to-date information on your account.
  .then(function() {
    return server.loadAccount(sourceKeys.publicKey());
  })
  .then(function(sourceAccount) {
    // Start building the transaction.
    transaction = new StellarSdk.TransactionBuilder(sourceAccount)
      .addOperation(StellarSdk.Operation.payment({
        destination: destinationId,
        asset: StellarSdk.Asset.native(),
        amount: "1"
      }))
      .addMemo(StellarSdk.Memo.text('s1'))
      .build();

    // Sign the transaction to prove you are actually the person sending it.
    transaction.sign(sourceKeys);

    // And finally, send it off to Stellar!
    return server.submitTransaction(transaction);
  })
  .then(function(result) {
    console.log('Success! Results:', result);
  })
  .catch(function(error) {
    console.error('Something went wrong!', error);
    // If the result is unknown (no response body, timeout etc.) we simply resubmit
    // already built transaction:
    // server.submitTransaction(transaction);
  });