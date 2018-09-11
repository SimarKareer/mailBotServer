'use strict';

const {
    dialogflow
} = require('actions-on-google');
const admin = require('firebase-admin');
const functions = require('firebase-functions');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

const app = dialogflow({
    debug: true
});

app.intent('MoveTray', (conv, {start, end}) => {
    end = (end === "me") ? {"location": "me"}: end;

    reqRunner(start, end);

    var startStr = startFormat(start);

    var endStr = endFormat(end);
    

    conv.ask("Ok, I have assigned a bot to move mail from " + startStr + " to " + endStr);
});



var reqRunner = async ((start, end) => {
    let freeBot = await (findFreeBot());
    Promise.all([moveRequest(start, end, freeBot), incrementCounter(freeBot)]).catch(err => {
        error(err);
    });
});

function startFormat(start) {
    var startStr = "";
    for (var i = 0; i < start.length; i++) {
        if (i !== 0)
            startStr += " and "
        startStr += start[i].location + " " + start[i].number;
    }
    return startStr;
}

function endFormat(end){
    if (end.location === ("me"))
        return "you";
    else
        return end.location + " " + end.number;
}

function moveRequest(start, end, botNum) {
    const moveData = {
        start: start,
        end: end,
        bot: botNum
    };
    //console.log("about to write to database");
    return new Promise((resolve, reject) => {
        try {
            resolve(db.collection('moveRequests').add(moveData));
        } catch (err) {
            reject(err);
        }
    });
}

function findFreeBot() {
    //console.log("FREEBOTCALLED");
    var freeBotRef = db.collection('activeRequests').orderBy('count').limit(1);

    return new Promise((resolve, reject) => {
        var freeBot = freeBotRef.get().then(snapshot => {
                snapshot.forEach(doc => {
                    //console.log(doc.data().botNum);
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

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);