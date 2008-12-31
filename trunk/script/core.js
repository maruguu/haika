var haika = function() {
  var status_queue = null;
  var status_counter = 0;
  var connecting = false;
  var refreshTimer = null;
  var auto_next = false;
  
  return {
    // render content
    render: function(status) {
      var http = /(s?https?:\/\/[-_.!~*'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)/g;  //'
      var img = /(s?https?:\/\/[-_.!~*'()a-zA-Z0-9;\/?:\@&=+\$,%#]+(jpg|jpeg|gif|png|bmp))/g;  //'
    
      $('keyword').innerHTML = status.keyword;
      var txt = status.text.replace(status.keyword + '=', '');
      if(txt.match(img)) {
        txt = txt.replace(img, '<img width="115px" src="$1" />');
      } else {
        txt = txt.replace(http, '<a href="$1">$1</a>');
      }
      $('content').innerHTML = txt;
      $('content').scrollTop = 0;
    },
    
    // タイムラインを取得する
    getTimeline: function() {
      if(connecting) return ;
      connecting = true;
      
      status_queue = null;
      var url = 'http://h.hatena.ne.jp/api/statuses/public_timeline.json';
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.setRequestHeader('If-Modified-Since', "Sat, 1 Jan 2000 00:00:00 GMT");
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
      xhr.onreadystatechange = function(istimeout) {
        if(xhr && xhr.readyState == 4 && xhr.status == 200) {
          
          var json = eval('{table: ' + xhr.responseText + '}');
          status_queue = json;
          status_counter = 0;
          haika.render(status_queue[status_counter]);
          connecting = false;
        } else if(xhr && xhr.readyState == 4) {
          console.output(xhr.status + ' : エラー');
          connecting = false;
        } else if(xhr && istimeout == 'timeout') {
          console.output('タイムアウト発生');
          connecting = false;
        } else if(xhr && xhr.readyState == 3) {
          console.output('取得中...');
        } else {
        }
      };
      console.output('タイムライン取得中');
      xhr.send('');
      return ;
    },
    
    // 次のアイテムに移動する
    next: function() {
      status_counter++;
      if(status_queue == null) {
        haika.getTimeline();
        return ;
      }
      if(status_queue.size() <= status_counter) {
        haika.getTimeline();
        return ;
      }
      haika.render(status_queue[status_counter]);
      return ;
    },
    
    enableAutoplay: function() {
      auto_next = true;
      haika.refresh();
      $('auto_content').innerHTML = '<img src="images/autoplay2.png" />';
    },
    
    disableAutoplay: function() {
      auto_next = false;
      if(refreshTimer) {
        clearTimeout(refreshTimer);
      }
      $('auto_content').innerHTML = '<img src="images/autoplay.png" />';
    },
    
    autoNext: function() {
      if(auto_next) {
        haika.disableAutoplay();
      } else {
        haika.enableAutoplay();
      }
    },
    
    refresh: function() {
      if(refreshTimer) {
        clearTimeout(refreshTimer);
      }
      haika.next();
      refreshTimer = setTimeout(function() { haika.refresh(); }, 30 * 1000);
    }
  };
}();

var console = function() {
  
  return {
    output: function(text) {
      $('keyword').innerHTML = text;
      $('content').innerHTML = '';
    }
  };
}();
