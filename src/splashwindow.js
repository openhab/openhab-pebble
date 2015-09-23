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

// A library to display a splash screen

var UI = require('ui');
var Vector2 = require('vector2');
var splashWindow = exports = module.exports = new UI.Window();

var splash_icon = new UI.Image({
  image: 'IMAGES_OPENHAB_SPLASH_PNG',
  position: new Vector2(0, 0),
  size: new Vector2(144, 144)
});

splashWindow.add(splash_icon);
