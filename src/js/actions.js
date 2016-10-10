// Copyright 2015 Richard Lee
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// A library to display an actions window

var UI = require('ui');
var WindowMgr = require('windowmgr');
var Util = require('util');
var Config = require('config');
var ajax = require('ajax');
var Voice = require('ui/voice');
var Base64 = require('base64');
/* global module */
var exports = module.exports = {};

function createActionsMenu(resetSitemap) {
  var actions = [
    {
      title: 'Voice command',
      subtitle: 'Send voice command'
    },
    {
      title: 'Reset sitemap',
      subtitle: 'Reloads sitemap'
    },
  ];
  
  var actionMenu = new UI.Menu({
    status: {
      color: Config.statusTextColor,
      backgroundColor: Config.statusBackgroundColor
    },
    textColor: Config.menuTextColor,
    backgroundColor: Config.menuBackgroundColor,
    highlightTextColor: Config.menuHighlightTextColor,
    highlightBackgroundColor: Config.menuHighlightBackgroundColor,
    sections: [{
      textColor: Config.menuSectionTextColor,
      backgroundColor: Config.menuSectionBackgroundColor,
      title: 'Action List',
      items: actions
    }]
  });
  
  actionMenu.on('select', function (e) {
    if (e.item.title == 'Voice command') {
      startDictate();
    } else if (e.item.title == 'Reset sitemap') {
      resetSitemap();
    }
  });

  return actionMenu;
}

function startDictate() {
  Voice.dictate('start', Config.confirmVoice, function(e) {
    if (e.err) {
      Util.log('Dictate error: ' + e.err);
      return;
    }
    
    var decodedTranscription = Base64.decode(e.transcription);
    Util.log('Dictate transcription: ' + decodedTranscription);

    ajax(
      {
        url: Config.server + '/rest/items/VoiceCommand',
        method: 'post',
        type: 'text',
        data: decodedTranscription,
        headers: {
          'Content-Type': 'text/plain',
          Authorization: Config.auth
        }
      },

      function (data) {
        Util.log('Successfully sent voice command: ' + data);
      },

      function (error) {
        Util.log('Failed to send voice command: ' + error);
        Util.error('Comm Error', "Can't set state");
      }
    );
  });
}

exports.load = function (resetSitemap) {
  var menu = createActionsMenu(resetSitemap);
  WindowMgr.push(menu);
};
