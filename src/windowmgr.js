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

// A library to track the active windows in the app

var SplashWindow = require('splashwindow');
var exports = module.exports = {};
var windows = [];

// initially display the splash window
SplashWindow.show();

exports.push = function(window) {
  windows.push(window);
  window.show();
  if (windows.length == 1) {
    // hide the splash window if we've pushed our first window
    SplashWindow.hide();
  }
};

exports.pop = function() {
  var window = windows.pop();
  window.hide();
};

exports.popAll = function () {
  // show the splash window if popping all other windows
  SplashWindow.show();
  for (window of windows) {
    window.hide();
  }
  windows = [];
};
