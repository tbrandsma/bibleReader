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

let app = express();
app.use(bodyParser.json({type: 'application/json'}));

// API.AI actions
const WELCOME_INTENT = 'input_welcome';  // the action name from the API.AI intent
const PASSAGE_LOOKUP = 'passage_lookup';

// API.AI parameter names
const PASSAGE_BOOK = 'book';
const PASSAGE_CHAPTER = 'chapter';
const PASSAGE_VERSE = 'verse';

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

  function welcomeIntent (assistant) {
    assistant.ask('Hi! Welcome to the Bible Reader! What passage would you like me to read?');
  }
  // Greet the user and direct them to next turn
  function passageLookup (assistant) {
    let passageBook = assistant.getArgument(PASSAGE_BOOK);
    let passageChapter = assistant.getArgument(PASSAGE_CHAPTER);
    let passageVerse = assistant.getArgument(PASSAGE_VERSE);
    //assistant.tell('You said ' + passageBook + ' ' + passageChapter + ':' + passageVerse);
    //assistant.tell('<audio src="http://www.esvapi.org/v2/rest/passageQuery?key=IP&passage=' + passageBook + passageChapter + ':' + passageVerse + '&output-format=mp3">' + 'You said ' + passageBook + ' ' + passageChapter + ':' + passageVerse + '</audio>');
    assistant.tell('<speak><audio src="https://a248.e.akamai.net/7/248/149646/2d/zondervanmp3.download.akamai.com/149653/bibles/32/nasb-mcconachie/1Cor.1.mp3">test' + '</audio></speak>');
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
