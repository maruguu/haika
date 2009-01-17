/*
 *  settings.js
 */
var menu = new Array();
menu[0] = '<a class="tab" onClick="Settings.showTab(0)">通信</a>';
menu[1] = '<a class="tab" onClick="Settings.showTab(1)">バージョン</a>';

var pages = new Array();
pages[0] = '<p>自動再生時の更新間隔(秒):<br><input type="text" id="interval" value="" class="input-box" /></p>';

pages[1] = '<center><b>haika<div id="version"></div></b><a href="http://blog.tomatomax.net/haika" target="_blank">http://blog.tomatomax.net/haika</a><br /></center>';

var Settings = function(){
  var settings;
  var previous_page;

  /**
   * store settings in the page
   */
  var store = function(page) {
    if(page == 0) {
      settings.interval = $('interval').value;
    }
  };

  return {
    /**
     * init setting window
     */
    init: function() {
      window.detachEvent('onload', Settings.init);
      System.Gadget.onSettingsClosing = Settings.closing;
      
      settings = haika.userSettings;
      settings.read();
      previous_page = 0;
      Settings.showTab(0);
    },
    
    /**
     * event handler on closing settings window
     */
    closing: function(event) {
      if(event.closeAction == event.Action.commit) {
        store(previous_page);
        settings.write();
      }
    },
    
    /**
     * show each tab
     */
    showTab: function(page) {
      var content = (page < 0) ? "" : pages[page];
      
      // Save settings
      if(previous_page != page) {
        store(previous_page);
      }
      // render menu
      $('menu').innerHTML = "";
      for(var i = 0; i < menu.length; i++) {
        var m = menu[i];
        if(i == page) {
          m = m.replace("tab", "current_tab");
        }
        $('menu').innerHTML += m;
        if(i < menu.length - 1) {
          $('menu').innerHTML += " | ";
        }
      }
      
      // content
      $('content').innerHTML = content;
      
      if(page == 0) {
        $('interval').value = settings.interval;
      } else if(page == 1) {
        $('version').innerHTML = 'Version ' + System.Gadget.version;
      }
      previous_page = page;
    }
    
  };
}();

window.attachEvent('onload', Settings.init);
