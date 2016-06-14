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

// A library to display an OpenHAB sitemap page

var UI = require('ui');
var Util = require('util');
var Config = require('config');
var WindowMgr = require('windowmgr');
var Setpoint = require('setpoint');
var Mapping = require('mapping');
var Item = require('item');
var ajax = require('ajax');
var Voice = require('ui/voice');
var Base64 = require('base64');
/* global module */
var exports = module.exports = {};
var labelRE = new RegExp('(.*?) \\[(.*?)\\]');

function splitLabel(label) {
  if (labelRE.test(label)) {
    var match = labelRE.exec(label);
    return {
      title: match[1],
      subtitle: match[2]
    };
  } else {
    return {
      title: label
    };
  }
}

function createItem(widget) {
  // most items just use the split label
  var item = splitLabel(widget.label);
  switch (widget.type) {
    case 'Group':
    case 'Text':
      // use split label
      break;
    case 'Slider':
    case 'Setpoint':
      // if they provided a split label, use it.  Otherwise...
      if ( !('subtitle' in item)) {
        // fall back on the item state
        item.subtitle = widget.item.state;
      }
      break;
    case 'Switch':
    case 'Selection':
      // if they provided a split label, use it.  Otherwise...
      item.icon = 'IMAGES_ACTION_ICON_ONOFF_PNG';
      if ( !('subtitle' in item)) {
        var state = widget.item.state;
        // fall back on the item state, but...
        item.subtitle = state;
        if ('mapping' in widget) {
          // if there's a mapping, look up the item value label in it
          var mappings = Util.arrayize(widget.mapping);
          for (var idx in mappings) {
            var mapping = mappings[idx];
            if (mapping.command == state) {
              item.subtitle = mapping.label;
              break;
            }
          }
        }
      }
      break;
    case 'ColorPicker':
      // not currently handled, but maybe someday? put it in with its type
      item = {
        title: widget.label,
        subtitle: widget.type
      };
      break;
    case 'Frame':
      // Weird... shouldn't this be a linked page?  not supported.
      item = undefined;
      break;
    case 'List':
      // not sure what this one does
      item = undefined;
      break;
    case 'Chart':
    case 'Image':
    case 'Video':
    case 'Webview':
      // LOL! not handled!
      item = undefined;
      break;
    default:
      Util.log('Unknown widget: label: ' + widget.label + ', type!: ' + widget.type);
      item = undefined;
  }
  return item;
}

function toggleSwitch(item, success) {
  var command;
  if (!item.state || item.state == 'OFF' || item.state == 'Uninitialized' || item.state == 'Undefined') {
    command = 'ON';
  } else if (item.state == 'ON') {
    command = 'OFF';
  }
  if (command) {
    Item.sendCommand(item, command, success);
  }
}

function createPageMenu(data, resetSitemap) {
  var sections = [];
  var widgets = Util.arrayize(data.widget ? data.widget : data.widgets);
  for (var idx in widgets) {
    var widget = widgets[idx];
    switch (widget.type) {
      case 'Frame':
        var items = [];
        var subwidgets = Util.arrayize(widget.widget ? widget.widget : widget.widgets);
        // add all the subwidgets of the frame to an item list
        for (var idx2 in subwidgets) {
          var subwidget = subwidgets[idx2];
          items.push(createItem(subwidget));
        }
        // push the frame section
        sections.push({
          title: widget.label,
          items: items
        });
        break;
      default:
        // not a frame, just a regular item
        var item = createItem(widget);
        if (item) {
          sections.push({
            items: [ item ]
          });
        }
    }
  }
  var menu = new UI.Menu({
    sections: sections,
    highlightBackgroundColor: Util.menuColor()
  });
  menu.on('select', function(e) {
    Util.log('item selected: ' + e.item.title + ', section: ' + e.sectionIndex + ', index: ' + e.itemIndex);
    var widget = widgets[e.sectionIndex];
    Util.log('widget: ' + JSON.stringify(widget));
    if (widget.type == 'Frame') {
      var subwidgets = Util.arrayize(widget.widget ? widget.widget : widget.widgets);
      widget = subwidgets[e.itemIndex];
      Util.log('subwidget: ' + JSON.stringify(widget));
    }
    if ('linkedPage' in widget) {
      // go to the subpage for this widget
      exports.load(widget.linkedPage.link, resetSitemap);
    } else {
      var regenerateItem = function() {
        // regenerate the item
        var newItem = createItem(widget);
        if (newItem) {
          menu.item(e.sectionIndex, e.itemIndex, newItem);
        }
      };
      switch (widget.type) {
        case 'Switch':
          if (widget.item.type == 'SwitchItem' || widget.item.type == 'GroupItem') {
            toggleSwitch(widget.item, regenerateItem);
          } else if ('mapping' in widget || 'mappings' in widget) {
            var mappings = Util.arrayize(widget.mapping ? widget.mapping : widget.mappings );
            Mapping.change(e.item.title, widget.item, mappings, regenerateItem);
          } else {
            Util.log('Unsupported switch type: ' + widget.item.type);
          }
          break;
        case 'Selection':
          if ('mapping' in widget || 'mappings' in widget) {
            var mappings2 = Util.arrayize(widget.mapping ? widget.mapping : widget.mappings);
            Mapping.change(e.item.title, widget.item, mappings2, regenerateItem);
          } else {
            // unclear how to support selection without a mapping
            Util.log('Mapping-less Selection unsupported');
          }
          break;
        case 'Slider':
        case 'Setpoint':
          if (widget.item.type == 'DimmerItem' || (widget.item.type == 'GroupItem' && !isNumeric(widget.item.state))) {
            Setpoint.dimmer(e.item.title, widget.item, regenerateItem);
          } else if (widget.item.type == 'NumberItem' || (widget.item.type == 'GroupItem' && isNumeric(widget.item.state))) {
            Setpoint.number(e.item.title, widget.item, widget.min, widget.max, widget.step, regenerateItem);
          } else {
            Util.log('Unsupported setpoint/slider type: ' + widget.item.type);
          }
          break;
        default:
          Util.log('Unsupported widget type:' + widget.type);
      }
    }
  });
  menu.on('longSelect', function (e) {
    Util.log('Show action menu');
    showActionMenu(resetSitemap);
  });
  return menu;
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function showActionMenu(resetSitemap) {
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
    sections: [{
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

  actionMenu.show();
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

exports.load = function (url, resetSitemap) {
  Util.log('loading: ' + url);
  ajax(
    {
      url: url,
      type: 'json',
      headers: {
        Accept: 'application/json; charset=utf-8',
        Authorization: Config.auth
      }
    },

    function (data) {
      Util.log('Successfully fetched page: ' + JSON.stringify(data));
      var menu = createPageMenu(data, resetSitemap);
      WindowMgr.push(menu);
    },

    function (error) {
      Util.log('Failed to fetch page: ' + error);
      Util.error('Comm Error', "Can't fetch page");
    }
  );
};
