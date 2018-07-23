'use strict';

const {dialogflow} = require('actions-on-google');
const admin = require('firebase-admin');
const functions = require('firebase-functions');
const maxBots = 3;
var async = require('asyncawait/async');
var await = require('asyncawait/await');

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

const app = dialogflow({
    debug: true
});

app.intent('MoveTray', (conv, {start, end}) => {
    //var endString = end.location + " " + end.number;
    //var startString = start[0].location + " " + start[0].number + " ";
    //var botNum = 0;

    reqRunner()
    //findFreeBot();
    //moveRequest(start, end, botNum);
    //incrementCounter(botNum);
    //conv.close("Ok, I have assigned bot " + botNum + " to move " + startString + "to " + endString);
    conv.close("Ight we done");
});


var reqRunner = async (() => {
    let freeBot = await (findFreeBot());
    return;
});


function moveRequest(start, end, botNum) {
    const moveData = {
        start: start,
        end: end,
        bot: botNum
    };
    console.log("about to write to database");

    return db.collection('moveRequests').add(moveData);
}

function findFreeBot() {
    console.log("FREEBOTCALLED");
    //var activeRef = db.collection('activeRequests');
    //var freeBotRef = activeRef.where('botNum', '==', 0);
    var freeBotRef = db.collection('activeRequests').orderBy('count').limit(1);

    return new Promise((resolve, reject) =>{
        var freeBot = freeBotRef.get().then(snapshot => {
            snapshot.forEach(doc => {
              //console.log(doc.id, '=>', doc.data())
              console.log(doc.data().botNum);
              resolve(doc.data().botNum);
            });
            return;
          })
          .catch(err => {
            console.log("No doc found");
            reject(err);
          });
    });

    
}


function incrementCounter(botNum) {
    var counterRef = db.collection('activeRequests').doc('bot' + botNum.toString());
    var transaction = db.runTransaction(t => {
        return t.get(counterRef)
            .then(doc => {
                // Add one person to the city population
                var newCount = doc.data().count + 1;
                t.update(counterRef, {
                    count: newCount
                });
                return;
            });
    }).then(result => {
        console.log('Transaction success!');
        return;
    }).catch(err => {
        console.log('Transaction failure:', err);
    });
}

/*
function saveToDb(numberToSave) {
    const options = {
        url: 'https://newagent-f4967.firebaseio.com/crates.json',
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body : JSON.stringify({
            "unsorted" : numberToSave
        })
    };
    requestNode(options, function(error, requestInternal, body){
        console.log(body);
 });
}
*/

/*
app.intent('GetCrate', (conv, {number}) => {
    //console.log("Here are the " + crate.length + " crates you asked for: ");
    //var i;
    var crates = "";
    var i;
    for(i = 0; i < number.length; i++) {
        if (i == number.length - 1 && number.length != 1)
            crates += "and ";
        crates += number[i];
        if(number.length > 2 && i != number.length - 1)
            crates += ",";
        crates += " ";
        
    }
    
    if (number.length == 1)
        conv.close("Ok, retrieving crate " + crates);
    else
        conv.close("Ok, retrieving crates " + crates);
        
    saveToDb(number);
});
*/
// Set the DialogflowApp object to handle the HTTPS POST request.
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);