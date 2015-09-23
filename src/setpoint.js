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

// A library to display a setpoint window

var UI = require('ui');
var Vector2 = require('vector2');
var WindowMgr = require('windowmgr');
var Item = require('item');
var Util = require('util');
var exports = module.exports = {};

function createWindow(itemName, item, min, max, step, isDimmer, success) {
  var setpointWindow = new UI.Window({
    action: {
			up: 'images/action_icon_up.png',
			down: 'images/action_icon_down.png',
			backgroundColor: 'white'
	  }
  });
  
  if (isDimmer) {
    setpointWindow.action('select', 'images/action-icon-onoff.png');
  }
  
  var titleText = new UI.Text({
    position: new Vector2(0, 15),
    size: new Vector2(114, 84),
    font: 'gothic-28-bold',
		textOverflow: 'wrap',
    text: itemName,
  });
  
	var stateText = new UI.Text({
    position: new Vector2(0, 105),
    size: new Vector2(114, 84),
    font: 'bitham-42-medium-numbers',
    text: item.state
  });
  
  setpointWindow.add(titleText);
  setpointWindow.add(stateText);

  var deltaSetpoint = function (delta) {
    var newState = ~~item.state + delta;
    Util.log('newstate: ' + newState);
    if (newState > max) {
      newState = max;
    }
    if (newState < min) {
      newState = min;
    }
    Item.sendCommand(item, newState.toString(), function () {
      stateText.text(item.state);
    });    
  };
  
  setpointWindow.on('click', 'up', function (event) {
    deltaSetpoint(step);
  });
  
  setpointWindow.on('longClick', 'up', function (event) {
    deltaSetpoint(step * 10);
  });

  setpointWindow.on('click', 'down', function (event) {
    deltaSetpoint(-step);
  });

  setpointWindow.on('longClick', 'down', function (event) {
    deltaSetpoint(-step * 10);
  });
  
  if (isDimmer) {
    setpointWindow.on('click', 'select', function (event) {
      var newState = (~~item.state == min) ? max : min;
      Util.log('newstate: ' + newState);
      Item.sendCommand(item, newState.toString(), function() {
        stateText.text(item.state);
      });
    });
  }
  
	setpointWindow.on('click', 'back', function (event) {
    WindowMgr.pop();
    success();
  });
  
  return setpointWindow;
}

exports.number = function (numberName, numberItem, min, max, step, success) {
  if (min) {
    min = ~~min;
  } else {
    min = Number.MIN_VALUE;
  }
  if (max) {
    max = ~~max;
  } else {
    max = Number.MAX_VALUE;
  }
  if (step) {
    step = ~~step;
  } else {
    step = 1;
  }
  var window = createWindow(numberName, numberItem, min, max, step, false, success);
  WindowMgr.push(window);
};

exports.dimmer = function (dimmerName, dimmerItem, success) {
  var window = createWindow(dimmerName, dimmerItem, 0, 100, 1, true, success);
  WindowMgr.push(window);
};
