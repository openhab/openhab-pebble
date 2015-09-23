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

// A library containing some useful utilities

var UI = require('ui');
var WindowMgr = require('windowmgr');
var exports = module.exports = {};

exports.now = function () {
  return new Date().toLocaleString();
};

exports.arrayize = function (maybeArray) {
  if ( ! (maybeArray instanceof Array)) {
    maybeArray = [ maybeArray ];
  }
  return maybeArray;
};

exports.log = function (msg) {
  console.log(exports.now() + ": " + msg);
};

exports.error = function (title, subtitle) {
  var card = new UI.Card({
    title: title,
    subtitle: subtitle
  });

  // Display the Card
  WindowMgr.popAll();
  WindowMgr.push(card);
};
