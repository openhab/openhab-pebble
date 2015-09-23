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

// A library to display a mapping menu

var UI = require('ui');
var WindowMgr = require('windowmgr');
var Item = require('item');
var Util = require('util');
var exports = module.exports = {};

function createMappingMenu(itemName, item, mappings, success) {
  var items = [];
  for (mapping of mappings) {
    items.push({
      title: mapping.label
    });
  }
  var menu = new UI.Menu({
    sections: [{
      title: itemName,
      items: items
    }]
  });
  menu.on('select', function(e) {
    Util.log('item selected: ' + e.item.title + ", index: " + e.itemIndex);
    var mapping = mappings[e.itemIndex];
    Item.sendCommand(item, mapping.command, function () {
      WindowMgr.pop();
      success();
    });
  });
  return menu;
}

exports.change = function (itemName, item, mappings, success) {
  var menu = createMappingMenu(itemName, item, mappings, success);
  WindowMgr.push(menu);
};