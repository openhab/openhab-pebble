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

// A library to fetch settings from a phone HTML page

var Settings = require('settings');
var Util = require('util');
var Base64 = require('base64');
var configURL = 'http://llamahunter.github.io/openhab.pebble/';

var exports = module.exports = {};

// a callback for consumers to learn about config changes
exports.onConfigChanged = function() {
  Util.log('onConfigChanged not set!');
  Util.error('Internal Error', 'Config.onConfigChanged not set!');
};

// populate exports and initialize Settings
function getConfig() {
  var localUrl = 'http://demo.openhab.org:8080';
  if (Settings.option('localUrl')) {
    localUrl = Settings.option('localUrl');
  } else {
    Settings.option('localUrl', localUrl);
  }

  var remoteUrl = '';
  if (Settings.option('remoteUrl')) {
    remoteUrl = Settings.option('remoteUrl');
  } else {
    Settings.option('remoteUrl', remoteUrl);
  }
  
  exports.localUrl = localUrl;
  exports.remoteUrl = remoteUrl;
  exports.server = localUrl;
  
  var user = '';
  if (Settings.option('username')) {
    user = Settings.option('username');
  } else {
    Settings.option('username', user);
  }
  
  var password = '';
  if (Settings.option('password')) {
    password = Settings.option('password');
  } else {
    Settings.option('password', password);
  }
  
  exports.auth = "Basic " + Base64.encode(user + ':' + password);
  
  exports.sitemap = '';
  if (Settings.option('sitemap')) {
    exports.sitemap = Settings.option('sitemap');
  } else {
    Settings.option('sitemap', exports.sitemap);
  }
}

// initialize things from local storage, if it exists
getConfig();

// configure phone setup url
Settings.config(
  { url: configURL },
  function(e) {
    Util.log('Configuration window returned: ' + e.response);
    if (e.response) {
      // re-initialize exports from Settings
      getConfig();
      exports.onConfigChanged();
    }
  }
);
