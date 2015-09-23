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

// A library to query the available sitemaps and display them in a menu

var UI = require('ui');
var Util = require('util');
var ajax = require('ajax');
var Config = require('config');
var Page = require('page');
var WindowMgr = require('windowmgr');
var exports = module.exports = {};

function resetSitemap() {
  Config.sitemap = '-no-such-sitemap-';
  WindowMgr.popAll();
  exports.load()
}

function createSitemapMenu(sitemaps) {
  var items = [];
  for (sitemap of sitemaps) {
    items.push({
      title: sitemap.label
    });
  }
  var menu = new UI.Menu({
    sections: [{
      title: 'Sitemaps',
      items: items
    }]
  });
  menu.on('select', function(e) {
    Util.log('item selected: ' + e.item.title + ", index: " + e.itemIndex);
    var sitemap = sitemaps[e.itemIndex];
    Page.load(sitemap.homepage.link, resetSitemap);
  });
  return menu;
}

exports.load = function () {
  ajax(
    {
      url: Config.server + '/rest/sitemaps',
      type: 'json',
      headers: {
        Accept: "application/json; charset=utf-8",
        Authorization: Config.auth
      }
    },
    
    function (data) {
      Util.log('Successfully fetched sitemaps: ' + JSON.stringify(data));
      var sitemaps = Util.arrayize(data.sitemap);
      var autoSelectedSitemap;
      if (Config.sitemap) {
        // user configured a particular sitemap
        for (sitemap of sitemaps) {
          if (sitemap.name == Config.sitemap) {
            autoSelectedSitemap = sitemap;
          }
        }
      } else if (sitemaps.length == 1) {
        // no config, but there's only one choice
        autoSelectedSitemap = sitemaps[0];
      }
      if (autoSelectedSitemap) {
        Page.load(autoSelectedSitemap.homepage.link, resetSitemap);
      } else {
        // failed to find config, or more than one choice
        var menu = createSitemapMenu(sitemaps);
        WindowMgr.push(menu);
      }
    },
    
    function (error) {
      Util.log('Failed to fetch sitemaps: ' + error);
      if (Config.server == Config.localUrl && Config.remoteUrl) {
        Util.log('Trying remote url');
        Config.server = Config.remoteUrl;
        exports.load();
      } else {
        Util.error('Comm Error', "Can't fetch sitemaps");
      }
    }
  );
};