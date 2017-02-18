// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

process.env.DEBUG = 'actions-on-google:*';
let Assistant = require('actions-on-google').ApiAiAssistant;
let express = require('express');
let bodyParser = require('body-parser');
let https = require('https');
let striptags = require('striptags');

let app = express();
app.use(bodyParser.json({type: 'application/json'}));

// API.AI actions
const WELCOME_INTENT = 'input_welcome';  // the action name from the API.AI intent
const PASSAGE_LOOKUP = 'passage_lookup';

// API.AI parameter names
const PASSAGE_BOOK = 'book';
const PASSAGE_CHAPTER = 'chapter';
const PASSAGE_VERSE = 'verse';
//const BIBLE_VERSION = 'version';

// API.AI Contexts/lifespans
/*const LOOKUP_CONTEXT = 'google-facts';
const CAT_CONTEXT = 'cat-facts';
const DEFAULT_LIFESPAN = 5;
const END_LIFESPAN = 0;
*/
// [START google_facts]
app.post('/', function (req, res) {
  const assistant = new Assistant({request: req, response: res});
  console.log('Request headers: ' + JSON.stringify(req.headers));
  console.log('Request body: ' + JSON.stringify(req.body));
  var verseOutput;
  var isChapter = false;
  function welcomeIntent (assistant) {
    //assistant.ask('Hi! Welcome to the Bible Reader! What passage would you like me to read?');
    assistant.ask('Hi!');
  }
  // Greet the user and direct them to next turn
  function passageLookup (assistant) {
    let passageBook = assistant.getArgument(PASSAGE_BOOK);
    let passageChapter = assistant.getArgument(PASSAGE_CHAPTER);
    let passageVerse = assistant.getArgument(PASSAGE_VERSE);
    //let verseOutput = '';
    //let bibleVersion = assistant.getArgument(BIBLE_VERSION);

    if (passageVerse !== undefined) {
      var httpPath = "/v2/verses/eng-ESV:" + passageBook + "." + passageChapter + "." + passageVerse + ".js";
      isChapter = false;
    } else {
      var httpPath = "/v2/chapters/eng-ESV:" + passageBook + "." + passageChapter + ".js";
      isChapter = true;
    }

    console.log('Path = ' + httpPath);
    var httpOptions = {
      hostname: 'bibles.org',
      port: 443,
      path: httpPath,
      method: 'GET',
      auth: 'Eb4Ocm9wyKrUaOuY1PHpcOu07LX07klTI6ebWxXN:X',
      agent: false
      /*headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }*/
    };

    function sayVerse(verseInput) {
      //let outputString = '';
      //console.log('VerseInput = ' + verseInput[0] + "\n\n");
      //.let i = 0;
      /*let j = 0;
      for (i; i < verseInput.length;) {
        for (j=0; i < verseInput.length && j < 3; j++ ) {
          outputString = outputString + ' ' + verseInput[i++];
        }
        assistant.tell('<speak>' + outputString + '</speak>');
        outputString = '';
      }*/
      assistant.tell(verseInput);
      //assistant.tell('<speak>' + verseInput.join(' ') + '</speak>');
      return ;

    }

    function parseVerse(isChapter, rawData) {
      console.log('isChapter = ' + isChapter + '\n\n');
      console.log('rawData = ' + rawData + '\n\n');
      let parsedData = JSON.parse(rawData);
      console.log('parsedData = ' + parsedData + '\n');
      let verseStripped = '';
      if (isChapter) {
        console.log('Here\n\n');
        verseStripped = parsedData.response.chapters[0].text;
      } else {
        console.log('Not Here\n\n');
        verseStripped = parsedData.response.verses[0].text;
      }
      //let verseOut = striptags(verseStripped, '<sup><h3>');
      //let verseString = JSON.stringify(verseStripped);
      let verseOut = striptags(verseStripped, '<sup><h3>');
      //let verseSplit = verseOut.replace(/<h3.*?>(.*?)<\/h3>/g, '<break time=\"1s\"/>$1<break time=\"2s\"/>').replace(/\n/g, ' ');
      //return verseSplit.split(/<sup.*?<\/sup>/g);
      return verseOut.replace(/<h3.*?>(.*?)<\/h3>/g, '').replace(/<sup.*?<\/sup>/g, '').replace(/\n/g, '');
      //console.log(verseOutput + '\n\n');
      //console.log(verseOut + '\n\n');
    }

    function httpOutput (isChapter, parseVerse, callback) {
      https.get (httpOptions, (httpRes) => {
        const statusCode = httpRes.statusCode;
        const contentType = httpRes.headers['content-type'];

        let error;
        if (statusCode !== 200) {
          error = new Error(`Request Failed.\n` +
                            `Status Code: ${statusCode}`);
        } else if (!/^application\/javascript/.test(contentType)) {
          error = new Error(`Invalid content-type.\n` +
                            `Expected application/javascript but received ${contentType}`);
        }
        if (error) {
          console.log(error.message);
          // consume response data to free up memory
          httpRes.resume();
          return;
        }

        httpRes.setEncoding('utf8');
        let rawData = '';

        httpRes.on('data', (chunk) => rawData += chunk);
        httpRes.on('end', () => {
          try {
            verseOutput = parseVerse(isChapter, rawData);
            callback(verseOutput);
          } catch (e) {
            console.log(e.message);
          }
        });
        }).on('error', (e) => {
          console.log(`Got error: ${e.message}`);
      });
    }

    httpOutput(isChapter, parseVerse, sayVerse);
    //verseOutput = verseObject.data;
    //console.log('This is the verse:\n' + verseOutput);



    //assistant.tell('You said ' + passageBook + ' ' + passageChapter + ':' + passageVerse);
    //assistant.tell('<audio src="http://www.esvapi.org/v2/rest/passageQuery?key=IP&passage=' + passageBook + passageChapter + ':' + passageVerse + '&output-format=mp3">' + 'You said ' + passageBook + ' ' + passageChapter + ':' + passageVerse + '</audio>');

  }

  let actionMap = new Map();
  actionMap.set(WELCOME_INTENT, welcomeIntent);
  actionMap.set(PASSAGE_LOOKUP, passageLookup);

  assistant.handleRequest(actionMap);
});
// [END google_facts]

if (module === require.main) {
  // [START server]
  // Start the server
  console.log(process.env.PORT);
  let server = app.listen(process.env.PORT || 8080, function () {
    let port = server.address().port;
    console.log('App listening on port %s', port);
  });
  // [END server]
}

module.exports = app;
