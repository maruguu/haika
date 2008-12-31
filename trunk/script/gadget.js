var gadget = function() {
  return {
    pageLoad: function() {
      window.detachEvent('onload', gadget.pageLoad);
      
      $('next_content').onclick = haika.next;
      $('auto_content').onclick = haika.autoNext;
      haika.getTimeline();
      haika.autoNext();
    }
  };
}();

window.attachEvent('onload', gadget.pageLoad);
