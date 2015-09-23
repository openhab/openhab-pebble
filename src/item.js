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

// A library to communicate with items

var Util = require('util');
var Config = require('config');
var ajax = require('ajax');
var exports = module.exports = {};

exports.sendCommand = function (item, command, success) {
  Util.log('sending command: ' + command + ' to ' + item.name + ', url: ' + item.link);
  ajax(
    {
      url: item.link,
      method: 'post',
      type: 'text',
      data: command,
      headers: {
        'Content-Type': 'text/plain',
        Authorization: Config.auth
      }
    },
    
    function (data) {
      Util.log('Successfully sent command: ' + data);
      // refresh local item state
      // XXX really, this should be done through http long polling
      item.state = command;
      success();
    },
    
    function (error) {
      Util.log('Failed to send command: ' + error);
      Util.error('Comm Error', "Can't set state");
    }
  );
};
