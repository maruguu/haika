var haika = function() {
  var status_queue = null;
  var status_counter = 0;
  var connecting = false;
  var refreshTimer = null;
  
  var item_status = null;
  
  var haikaSettings = function () {
    this.auto_next = false;
    this.interval = 30;
  };
  
  haikaSettings.prototype.read = function() {
    this.auto_next = System.Gadget.Settings.read('auto_next');
    this.interval = System.Gadget.Settings.read('interval');
    if (!this.interval || this.interval <= 0) this.interval = 30;
  };
  
  haikaSettings.prototype.write = function() {
    System.Gadget.Settings.write('auto_next', this.auto_next);
    this.writeInt('interval', this.interval, 30, 1, 3600);
  };
  
  haikaSettings.prototype.writeInt = function(key, value, def, min, max) {
    var v = parseInt(value);
    if(isNaN(v) || v < min || v > max) v = def;
    System.Gadget.Settings.write(key, v);
  };
  
  var settings = new haikaSettings();
  
  var dateFormat = function(date_string) {
    var t = date_string.split(/\D/);
    var d = new Date(Date.UTC(t[0], t[1], t[2], t[3], t[4], t[5]));
    var year = d.getFullYear();
    var month = addZero(d.getMonth());
    var date = addZero(d.getDate());
    var hours = addZero(d.getHours());
    var minutes = addZero(d.getMinutes());
    var seconds = addZero(d.getSeconds());
    return year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + seconds;
  };
  
  var addZero = function(value) {
    return (parseInt(value) < 10) ? "0" + value : value;
  };
  
  return {
    userSettings: settings,
    
    // render content
    render: function(status) {
      var http = /(s?https?:\/\/[-_.!~*'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)/g;  //'
      var img = /(s?https?:\/\/[-_.!~*'()a-zA-Z0-9;\/?:\@&=+\$,%#]+(jpg|jpeg|gif|png|bmp))/g;  //'
      var anchor = /(<a href=").+(">.+<\/a>)/g;
      var youtube = /(s?https?:\/\/[-_.!~*'()a-zA-Z0-9;\/?:\@&=+\$,%#]+\.youtube\.com\/[-_.!~*'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)/g; //'
      
      var txt = status.text.replace(status.keyword + '=', '');
      
      var atag = txt.match(anchor);
      if(atag) {
        for(i = 0; i < atag.length; i++) {
          txt = txt.replace(atag[i], '<ATAG ' + i + ' />');
        }
      }
      /*
      // サムネイル表示にしたい
      var youtubetag = txt.match(youtube);
      if(youtubetag) {
        for(i = 0; i < youtubetag.length; i++) {
          txt = txt.replace(youtubetag[i], '<YOUTUBETAG ' + i + ' />');
        }
      }
      */
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
      /*
      if(youtubetag) {
        var template = '<object width="300" height="250"><param name="movie" value="<URL>"></param><param name="wmode" value="transparent"></param><embed src="<URL>" type="application/x-shockwave-flash" wmode="transparent" width="300" height="250"></embed></object>';
        for(i = 0; i < youtubetag.length; i++) {
          var youtubeobj = template.replace('<URL>', youtubetag[i]);
          txt = txt.replace('<YOUTUBETAG ' + i + ' />', youtubeobj);
        }
      }
      */
      if(imgtag) {
        for(i = 0; i < imgtag.length; i++) {
          txt = txt.replace('<IMGTAG ' + i + ' />', '<p><img width="115px" src="' + imgtag[i] + '" /></p>');
        }
      }
      if(atag) {
        for(i = 0; i < atag.length; i++) {
          txt = txt.replace('<ATAG ' + i + ' />', atag[i]);
        }
      }
      txt = txt.replace(/\r\n/g, '<br />');
      $('keyword').onclick = haika.showItem;
      $('keyword').innerHTML = status.keyword;
      $('content').innerHTML = txt;
      $('content').scrollTop = 0;
      item_status = status;
      item_status.text = txt.replace('width="115px"', '');
    },
    
    // タイムラインを取得する
    getTimeline: function() {
      if(connecting) return ;
      connecting = true;
      
      status_queue = null;
      //var url = 'http://h.hatena.ne.jp/api/statuses/public_timeline.json';
      var url = 'http://h.hatena.ne.jp/api/statuses/keyword_timeline/haika.json';
      url = encodeURI(url);
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
      item_status = null;
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
      settings.auto_next = true;
      System.Gadget.Settings.write('auto_next', settings.auto_next);
      if(refreshTimer) {
        clearTimeout(refreshTimer);
      }
      refreshTimer = setTimeout(function() { haika.refresh(); }, settings.interval * 1000);
      $('auto_content').innerHTML = '<img src="images/autoplay2.png" />';
    },
    
    disableAutoplay: function() {
      settings.auto_next = false;
      System.Gadget.Settings.write('auto_next', settings.auto_next);
      if(refreshTimer) {
        clearTimeout(refreshTimer);
      }
      $('auto_content').innerHTML = '<img src="images/autoplay.png" />';
    },
    
    autoNext: function() {
      if(settings.auto_next) {
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
      refreshTimer = setTimeout(function() { haika.refresh(); }, settings.interval * 1000);
    },
    
    // nextクリック時
    nextContent: function() {
      if(settings.auto_next) {
        haika.refresh();
      } else {
        haika.next();
      }
    },
    
    showItem: function() {
      if(System.Gadget.Flyout.show) {
        System.Gadget.Flyout.show = false;
        return ;
      }
      if(item_status == null) {
        return;
      }
      System.Gadget.Flyout.file = 'item.html';
      System.Gadget.Flyout.onShow = function() { 
        var doc = System.Gadget.Flyout.document;
        var image = doc.getElementById('profile-image');
        image.innerHTML = '<img width="32px" height="32px" src="' + item_status.user.profile_image_url + '"/>';
        var keyword = doc.getElementById('keyword');
        keyword.innerHTML = item_status.keyword;
        if(item_status.favorited < 10) {
          for(var i = 0; i < item_status.favorited; i++) {
            keyword.innerHTML += '<img src="images/star.png" />';
          }
        } else {
          keyword.innerHTML += '<img src="images/star.png" /><font color="#f4b128">' + item_status.favorited + '</font><img src="images/star.png" />';
        }
        var content = doc.getElementById('content');
        content.innerHTML = item_status.text;
        var screen_name = doc.getElementById('screen_name');
        screen_name.innerHTML = '<a href="http://h.hatena.ne.jp/' + item_status.user.screen_name + '/">' + item_status.user.screen_name + '</a>';
        var created_at = doc.getElementById('created_at');
        created_at.innerHTML = '<a href="http://h.hatena.ne.jp/' + item_status.user.screen_name + '/' + item_status.id + '">' + dateFormat(item_status.created_at) + '</a>';
        var source = doc.getElementById('source');
        source.innerHTML = '<a href="http://h.hatena.ne.jp/keyword/' + item_status.source + '">' + item_status.source + '</a>';
        
        for(var i = 0; i < doc.images.length; i++) {
          if(doc.images[i].width > 300) {
            doc.images[i].width = 300;
          }
        }
        doc.body.style.height = keyword.scrollHeight + content.scrollHeight + 30;
        doc.focus();
      };
      System.Gadget.Flyout.show = true;
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
