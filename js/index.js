$(function () {
  var audio = new Audio();
  var falg = true;
  var timer;
  var sch = true;
  // 获取列表数据
  var baseinfo = {},
    alist = [],
    src = '',
    len = 0,
    qcId = "";
  // qcId = "C69B3F34-D274-4967-A12B-6A2C76B09A34"
  // getlist()
  // 获取地址后面的id 
  if (app.getSearchString('QCId')) {
    qcId = app.getSearchString('QCId')
    getlist()
  } else {
    window.location.replace("./404.html")
  }

  // 获取数据列表
  function getlist() {
    app.getAjax("getpage", function (res) {
      console.log(res)
      // console.log(res.data)
      if (res.code == 200) {
        baseinfo = res.data.baseinfo;
        alist = res.data.alist;
        len = alist.length;
        document.title = baseinfo.Name || "小新星英语教育"
        for (var i = 0; i < len; i++) {
          src += `<li>
            <div class="sm-top" style="display: ${alist[i].Head == '' ? "none": "block"}">
              <img src="${alist[i].Head}" alt="" class="sm-title-img">
              <span class="sm-title-text" style="display: ${alist[i].Type == 1 ? "none": "block"}">${alist[i].Name}</span>
            </div>
            <div class="sm-mian" style="display: ${alist[i].Url == '' ? "none": "block"}">
              <div class="bar">
                <span id="touch_${i}" data-index="${i}" data-src="${alist[i].Url}" style="background: ${baseinfo.SuspendStyle}">
                  <i class="cloud" style="background: ${baseinfo.TitleStyle}"></i>
                </span>
              </div>
              <div class="time">
                <span id="initTime_${i}" class="time_on">0:00</span>
                <span id="autoTime_${i}">0:00</span>
              </div>
            </div>
            <!-- 播放，暂停按键 -->
            <div class="sm-i" style="display: ${alist[i].Url == '' ? "none": "flex"}">
              <div class="sm sm-kp" style="background: ${baseinfo.PlayStyle}">
                <span class="sm-bf" id="bf_${i}" data-src="${alist[i].Url}" data-index="${i}"></span>
                <span class="sm-zt" id="zt_${i}" data-src="${alist[i].Url}"></span>
              </div>
              <div class="sm sm-cb" style="background: ${baseinfo.TitleStyle}">
                <span class="sm-cx" id="cx_${i}" data-src="${alist[i].Url}" data-index="${i}"></span>
              </div>
            </div>
          </li>`
        }
        $("#list").html(src)
        $(".content").css("background-image", "url(" + baseinfo.MainStyle + ")")
        $('.tp-top').html('<img src="' + baseinfo.BgImg + '" alt="">')
        $('.tp-bottom').html('<img src="' + baseinfo.BottomImgLeft + '" alt=""><img src="' + baseinfo.BottomImg + '" alt="">')
        if (len > 0) init()
      } else {
        window.location.replace("./404.html")
      }
    }, {
      QCId: qcId
    }, "post")
  }

  // 绑定事件
  function init() {
    var bar = document.getElementsByClassName("bar")[0],
      left = bar.offsetLeft,
      wid = bar.clientWidth,
      per;
    // console.log(left, wid)
    for (var k = 0; k < len; k++) {
      // 添加每段音频的时长
      // app.getTimes(alist[k].Url, k)

      // 拖动事件
      $("body>*").on("touchmove", "#touch_" + k, function (e) {
        var index = $(this).attr("data-index");
        var page = e.originalEvent.targetTouches[0];
        per = (page.clientX - left) * 100 / wid;
        per = per >= 100 ? 100 : per;
        if (per >= 100) {
          per = 100
        } else if (per <= 0) {
          per = 0
        }
        // console.log(per)
        $(this).css("width", per + "%")
        var _audio = new Audio($(this).attr("data-src"));
        var duration;
        _audio.addEventListener("loadedmetadata", function (_event) {
          duration = _audio.duration;
          $("#initTime_" + index).text(app.s_to_hs(parseInt(duration * per / 100)))
        });
        // if (audio.play) audio.pause()
        falg = false;
      })
      // 拖动后抬起事件
      $("body>*").on("touchend", "#touch_" + k, function () {
        var index = $(this).attr("data-index");
        if (audio.src != $(this).attr("data-src")) {
          audio.src = $(this).attr("data-src")
        }
        audioInfo(index, per, true)
        setTimeout(function () {
          falg = true;
        }, 100)
      })

      // 点击播放
      $('body>*').on("click", "#bf_" + k, function () {
        var index = $(this).attr("data-index");
        if (audio.src != $(this).attr("data-src")) {
          audio.src = $(this).attr("data-src")
          sch = false
        } else {
          sch = true
        }
        audioInfo(index, '', sch)
      })

      // 点击暂停
      $('body>*').on("click", "#zt_" + k, function () {
        $(this).hide();
        $(this).siblings().show()
        $(this).parent().css("background", baseinfo.PlayStyle)
        audio.pause()
      })

      // 重新播放
      $('body>*').on("click", "#cx_" + k, function () {
        var index = $(this).attr("data-index");
        audio.src = $(this).attr("data-src")
        audioInfo(index, '', true)
      })
    }
  }

  // 实时改变进度条
  function audioInfo(index, t, s) {
    // 清除其他进度条的进度
    if(s) {
      for (var j = 0; j < len; j++) {
        if(j != +index) {
          console.log(j, +index)
          $("#touch_" + index).css("width", "0%")
        }
      }      
    }
    // 播放控件显示隐藏
    timer = t
    $(".sm-zt").hide();
    $(".sm-zt").siblings().show();
    $(".sm-zt").parent().css("background", baseinfo.PlayStyle)
    $("#bf_" + index).hide();
    $("#bf_" + index).siblings().show()
    $("#bf_" + index).parent().css("background", baseinfo.SuspendStyle)
    // 实时改变进度条
    audio.addEventListener("loadedmetadata", function () {
      var audioTime = audio.duration;
      audio.ontimeupdate = function () {
        if (!!timer) {
          // 拖动改变播放时间
          audio.currentTime = timer * audioTime / 100;
          timer = null
        }
        var speed = audio.currentTime * 100 / audioTime;
        if (falg) {
          falg = false;
          // console.log(speed)
          $("#initTime_" + index).text(app.s_to_hs(parseInt(audio.currentTime)))
          $("#touch_" + index).css("width", speed + "%")
          // console.log("#touch_" + index)
          falg = true;
          // 播放完处理事件
          if (speed >= 99 && index <= len) {
            $(".sm-zt").hide();
            $(".sm-zt").siblings().show();
            $(".sm-zt").parent().css("background", baseinfo.PlayStyle)
            $("#initTime_" + index).text("0:00")
            $("#touch_" + index).css("width", "0%")
            // 播放完切换下一段音频
            // var newIndex = +index + 1
            // setTimeout(function () {
            //   // console.log(newIndex)
            //   audio.src = $("#bf_" + newIndex).attr("data-src")
            //   audioInfo(newIndex)
            // }, 500)
          }
        }
        if ($("#autoTime_" + index).text() == "0:00") {
          $("#autoTime_" + index).text(app.s_to_hs(parseInt(audioTime)))
        }
      }
    })
    audio.play()
  }

})