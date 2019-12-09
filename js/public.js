var webUrl = 'http://book.02.t1m.cn/';
(function ($, app) {
  app.getAjax = function (path, callback, dataitem, method, mask) {
    // path地址 callback回调 dataitem（data参数） method请求方式 mask加载中
    // console.log(app.PostData(dataitem))
    $.ajax({
      type: method || 'get',
      url: webUrl + path,
      timeout: 10000,
      responseType: 'json',
      data: app.PostData(dataitem),
      success: function (res) {
        return callback(res)
      },
      error: function (err) {
        console.log(err)
      }
    })
  }
  app.PostData = function (oldData) {
    var post = {};
    post.token = app.getuserinfo().token || '';
    post.loginMark = app.getuserinfo().loginMark || app.MathRand(8);
    if (app.isJsonFormat(oldData)) {
      post.data = JSON.stringify(oldData || {});
    } else {
      post.data = oldData;
    }
    return post;
  }
  // 获取用户信息
  app.getuserinfo = function () {
    var stateText = localStorage.getItem('$vl_user') || "{}";
    return JSON.parse(stateText);
  }
  // 缓存用户信息
  app.setuserinfo = function (state) {
    state = state || {};
    localStorage.setItem('$vl_user', JSON.stringify(state));
  }
  app.isJsonFormat = function (str) {
    var obj = str;
    var xy = Object.prototype.toString.call(obj);
    if (xy == "[object Object]" || xy == "[object Array]") {
      return true;
    } else {
      return false;
    }
  }
  app.MathRand = function (len) {
    var Num = "";
    for (var i = 0; i < len; i++) {
      Num += Math.floor(Math.random() * 10);
    }
    Num += " "
    for (var i = 0; i < len; i++) {
      Num += Math.floor(Math.random() * 10);
    }
    return Num;
  }
  // 获取音频时长
  app.getTimes = function (url, id) {
    url = url || '';
    var _audio = new Audio(url);
    var duration;
    _audio.load();
    _audio.addEventListener("loadedmetadata", function (_event) {
      duration = parseInt(_audio.duration);
      $("#autoTime_" + id).text(app.s_to_hs(duration))
    });

    return ''
  }
  app.s_to_hs = function (s) {
    var h;
    h = Math.floor(s / 60);
    s = s % 60;
    h += '';
    s += '';
    // h = (h.length == 1) ? '0' + h : h;
    s = (s.length == 1) ? '0' + s : s;
    return h + ':' + s;
  }
  // 获取地址栏的参数
  app.getSearchString = function (key, Url) {
    var str = Url || window.location.search;
    str = str.substring(1, str.length); // 获取URL中?之后的字符（去掉第一位的问号）
    // 以&分隔字符串，获得类似name=xiaoli这样的元素数组
    var arr = str.split("&");
    var obj = new Object();
    // 将每一个数组元素以=分隔并赋给obj对象
    for (var i = 0; i < arr.length; i++) {
      var tmp_arr = arr[i].split("=");
      obj[decodeURIComponent(tmp_arr[0])] = decodeURIComponent(tmp_arr[1]);
    }
    // console.log(obj)
    return obj[key];
  }
  app.getUrlString = function (key, Url) {
    var str = Url || "";
    var arr = str.split("?");
    var obj = new Object();
    // 将每一个数组元素以=分隔并赋给obj对象
    for (var i = 0; i < arr.length; i++) {
      var tmp_arr = arr[i].split("=");
      obj[decodeURIComponent(tmp_arr[0])] = decodeURIComponent(tmp_arr[1]);
    }
    return obj[key];
  }

}($, window.app = {}))