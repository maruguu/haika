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
      var anchor = /(<a href=").+(">.+<\/a>)/g;
      var youtube = /(s?https?:\/\/[-_.!~*'()a-zA-Z0-9;\/?:\@&=+\$,%#]+\.youtube\.com\/[-_.!~*'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)/g; //'
      
      $('keyword').innerHTML = status.keyword;
      var txt = status.text.replace(status.keyword + '=', '');
      
      var atag = txt.match(anchor);
      if(atag) {
        for(i = 0; i < atag.length; i++) {
          txt = txt.replace(atag[i], '<ATAG ' + i + ' />');
        }
      }
      var youtubetag = txt.match(youtube);
      if(youtubetag) {
        for(i = 0; i < youtubetag.length; i++) {
          txt = txt.replace(youtubetag[i], '<YOUTUBETAG ' + i + ' />');
        }
      }
      var imgtag = txt.match(img);
      if(imgtag) {
        for(i = 0; i < imgtag.length; i++) {
          txt = txt.replace(imgtag[i], '<IMGTAG ' + i + ' />');
        }
      }
      
      var urltag = txt.match(http);
      if(urltag) {
        for(i = 0; i < urltag.length; i++) {
          txt = txt.replace(urltag[i], '<URLTAG ' + i + ' />');
        }
      }
      
      // Replace
      if(urltag) {
        for(i = 0; i < urltag.length; i++) {
          txt = txt.replace('<URLTAG ' + i + ' />', '<a href="' + urltag[i] + '">' + urltag[i] + '</a>');
        }
      }
      if(youtubetag) {
        var template = '<object width="115" type="application/x-shockwave-flash"><param name="movie" value="<URL>"></param><param name="wmode" value="transparent"></param></object>';
        for(i = 0; i < youtubetag.length; i++) {
          var youtubeobj = template.replace('<URL>', youtubetag[i]);
          txt = txt.replace('<YOUTUBETAG ' + i + ' />', youtubeobj);
        }
      }
      if(imgtag) {
        for(i = 0; i < imgtag.length; i++) {
          txt = txt.replace('<IMGTAG ' + i + ' />', '<img width="115px" src="' + imgtag[i] + '" />');
        }
      }
      if(atag) {
        for(i = 0; i < atag.length; i++) {
          txt = txt.replace('<ATAG ' + i + ' />', atag[i]);
        }
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
