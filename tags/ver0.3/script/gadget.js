var gadget = function() {
  return {
    settingsClosed: function(p_event) {
      if (p_event.closeAction == p_event.Action.commit) {
        var settings = haika.userSettings;
        settings.read();
        
        haika.autoNext();
        haika.autoNext();
      }
    },
    
    pageLoad: function() {
      window.detachEvent('onload', gadget.pageLoad);
      System.Gadget.settingsUI = 'settings.html';
      System.Gadget.onSettingsClosed = gadget.settingsClosed;
      
      $('next_content').onclick = haika.nextContent;
      $('auto_content').onclick = haika.autoNext;
      var settings = haika.userSettings;
      settings.read();
      haika.getTimeline();
      haika.autoNext();
      haika.autoNext();
    }
  };
}();

window.attachEvent('onload', gadget.pageLoad);
