var canvas_s = document.getElementById("solid"); //canvas contents
var caption = document.getElementById("caption"); //header
var context_s = canvas_s.getContext("2d"); //2d context of canvas

var availWidth; //available width px
var availHeight; //available heightpx
var capHeight; //头部高
var circleLen; //radius of circle
var marginWidth; //horizontal margin (width)
var marginHeight; //vertical margin (height)

var points = []; //二维数组，所有点的集合，元素属性：x-横坐标，y-纵坐标，row-行，column-列
var hists = []; //history, records everything
var startPoint, endPoint; //每步骤起始点和终止点
var isMouseDown = false; //鼠标是否按下，按下才触发mousemvoe
var isTouchMode = false; //是否触屏，触屏中mouse事件也会触发，需要屏蔽
var tmpBoard = curBoard; //临时储存当前board状态，会随mousemove/touchmove改变
var Drawer = 1;

init();
resetCanvas(true);

//初始化
function init() {
  main(); //计算当前阵列
  //    initUIParams(); //根据当前屏幕尺寸自动调整元素尺寸
  if (Drawer < 0 && AImode == 1) {
    aiRun();
  }
}

//屏幕尺寸改变
function resizeHandler() {
  initUIParams();
  repaintCanvas();
}

//根据当前屏幕尺寸自动调整元素尺寸
function initUIParams() {
  availWidth = document.documentElement.clientWidth;
  availHeight = document.documentElement.clientHeight - 200;
  capHeight = $("#text").height();
  circleLen = Math.min(
    availWidth / (1 + Dwidth * 3),
    (availHeight - capHeight) / (1 + Dheight * 3)
  );
  marginWidth = (availWidth - circleLen * 2 * Dwidth) / (Dwidth + 3);
  marginHeight =
    (availHeight - capHeight - circleLen * 2 * Dheight) / (Dheight + 3);
  canvas_s.setAttribute("height", availHeight - capHeight);
  canvas_s.setAttribute("width", availWidth);
  context_s.strokeStyle = "black";
  context_s.font = "20px sans-serif";
  canvas_s.addEventListener("mousedown", doMouseDown, false);
  canvas_s.addEventListener("mousemove", doMouseMove, false);
  canvas_s.addEventListener("mouseup", doMouseUp, false);
  canvas_s.addEventListener("touchstart", doMouseDown, false);
  canvas_s.addEventListener("touchmove", doMouseMove, false);
  canvas_s.addEventListener("touchend", doMouseUp, false);
  window.addEventListener("resize", resizeHandler);
}

//根据hists重绘当前canvas，每下完一步后会调用
function resetCanvas() {
  initUIParams();
  context_s.strokeStyle = "#333333";
  context_s.lineWidth = 2;
  //清除当前canvas
  context_s.clearRect(0, 0, canvas_s.width, canvas_s.height);

  repaintCanvas(true);
}

function rerunCanvas() {
  resetCanvas();
  //根据历史步骤绘制双方点阵
  if (hists && hists.length) {
    if (!checkVictory(hists[hists.length - 1].drawer) /*&& hist.drawer > 0*/) {
      if (Drawer < 0 && AImode == 1) {
        aiRun();

        if (hists && hists.length) checkVictory(hists[hists.length - 1].drawer);
      }
    }
  }
}

//根据hists重绘当前canvas，每下完一步后会调用
function repaintCanvas(reset) {
  initUIParams();
  curBoard = Initx || Math.pow(2, Dwidth * Dheight) - 1;
  //   curBoard = Initx || Math.pow(2, Dwidth * Dheight) - 1;

  var tmpboard = mapBoard(curBoard, reset);

  // alert("Initx, curBoardX"+ Initx + curBoard +Dwidth +Dheight);
  context_s.strokeStyle = "#333333";
  //清除当前canvas
  context_s.clearRect(0, 0, canvas_s.width, canvas_s.height);
  level = countones(Initx) - 3;
  texttitle = "第" + level + "关";

  context_s.strokeText(texttitle, 20, 20);
  InitxDW = Initx * 100 + Dwidth * 10 + Dheight;

  // setCookie('Initx', InitxDW, 100);
  //   if(reset){
  //     tmpboard = [[1,0, 0], [0,0,1]]
  //   }
  //重绘底部圆圈
  for (var i = 0; i < Dheight; i++) {
    points[i] = [];
    for (var j = 0; j < Dwidth; j++) {
      var point = getPointByDot(i, j);
      point.row = i;
      point.column = j;
      points[i][j] = point;

      context_s.beginPath();
      if (tmpboard[i][j] == 1) {
        context_s.beginPath();

        context_s.lineWidth = 3;
        context_s.strokeStyle = "Black";

        context_s.arc(point.x, point.y, circleLen, 0, 2 * Math.PI);
        context_s.stroke();
      } else if (Initx != 15 && Initx != 63 && Initx != 511 && Initx != 4095) {
        var tempPoint = getPointByDot(i, j);

        context_s.lineWidth = 1;
        context_s.strokeStyle = "Gray";
        // alert("gray circle");

        context_s.moveTo(
          tempPoint.x - circleLen * 0.7,
          tempPoint.y - circleLen * 0.7
        );
        context_s.lineTo(
          tempPoint.x + circleLen * 0.7,
          tempPoint.y + circleLen * 0.7
        );
        context_s.moveTo(
          tempPoint.x + circleLen * 0.7,
          tempPoint.y - circleLen * 0.7
        );
        context_s.lineTo(
          tempPoint.x - circleLen * 0.7,
          tempPoint.y + circleLen * 0.7
        );
        context_s.stroke();
        context_s.stroke();
      }
    }
  }
  //根据历史步骤绘制双方点阵
  if (hists && hists.length) {
    var len = hists.length;

    for (var i = 0; i < len; i++) {
      var hist = hists[i];
      crossLine(hist.drawer, hist.dots);
    }
  }
}

//记录历史步骤
// drawer: 画图者，-1电脑，1用户
// dots：当前步骤画的所有点的集合
function recordHist(drawer, dots) {
  if (dots && dots.length) {
    hists.push({
      drawer: Drawer,
      dots: dots,
    });
    Drawer = -Drawer;
  }
}
// 检查是否胜利
// drawer: 画图者，-1电脑，1用户
function checkVictory(drawer) {
  var alertmessage = "empty";
  var playerwin = 0;
  var randommap = 0;
  var iq = 0;

  //showBoard(mapBoard(curBoard));
  if (curBoard == 0) {
    // repaintCanvas();
    if (AImode != 1) {
      if ((drawer < 0 && LastDotWin == 0) || (drawer > 0 && LastDotWin == 1))
        alertmessage = "红色玩家赢了 Player Red Won";
      else alertmessage = "蓝色玩家赢了 Player Blue Won";
      if (Initx != 0) Initx = getRandomX(Initx, 0);
    } else {
      if ((drawer < 0 && LastDotWin == 0) || (drawer > 0 && LastDotWin == 1))
        playerwin = 1;
      else playerwin = 0;
      if (playerwin == 0) {
        alertmessage = "不要灰心，再试试！You can do better, try Again ";
        nooftrials = nooftrials + 1;
      } else {
        level = Dwidth * Dheight;
        //   beating = Math.pow((level -3)/13, 0.5);
        nooftrials = nooftrials + 1;
        beating = 0.99 - nooftrials / (level - 2) / (level - 2);
        beating = Math.max(beating, 0.1);
        beating = Math.round(beating * 99);
        level = countones(Initx) - 3;
        iq = (level + 3) * 10 + 50 - nooftrials + 1;

        alertmessage =
          "你用了" +
          nooftrials +
          "次过了第" +
          level +
          "关！ 你的智商至少是" +
          iq +
          "   试试下一关";

        // alertmessage = ale, 50, 1lertmessage + "You Won, 你赢了这关用了" +nooftrials + "次尝试, 好于 " + beating +"% 的玩家 ." ;

        doctitle =
          "划点游戏，我用了" +
          nooftrials +
          "次过了第" +
          level +
          "关！ 智商》" +
          iq;

        document.title = doctitle;

        lastnooftrials = nooftrials;
        nooftrials = 0;

        if (Initx != 0) {
          Initx = getRandomX(Initx, 1);
        }

        if (
          Initx == Math.pow(2, Dwidth * Dheight) - 1 &&
          Dwidth == Dheight &&
          Dwidth == 4
        ) {
          alertmessage =
            alertmessage + "你已过了最难一关，好伟大！You are Master !! ";
        }

        if (
          Initx == Math.pow(2, Dwidth * Dheight) - 1 &&
          Dwidth * Dheight < 16
        ) {
          if (Dheight < 4) Dheight = Dheight + 1;
          else if (Dwidth < 4) Dwidth = Dwidth + 1;
          // alert("太棒了， 等待到下一关，大师不远了！") ;
          if (0) {
            origin = location.origin || "";
            pathname = location.pathname;
            location.href =
              pathname +
              "?Dwidth=" +
              Dwidth +
              "&Dheight=" +
              Dheight +
              "nt=" +
              nooftrials +
              "&AImode=" +
              AImode +
              "&LastDotWin=" +
              LastDotWin +
              "&Initx=" +
              Initx;
          }
          restoreS(Initx);
          //                  location.href =  pathname;
        }
      }
    }
    setTimeout(function () {
      //   alert(alertmessage);
      curBoard = Initx || Math.pow(2, Dwidth * Dheight) - 1;
      hists = [];
      Drawer = 1;
      startPoint = null;
      endPoint = null;
      //   if (iq>100) alert("如果你愿意把你的辉煌战绩分享给朋友，请点击右上角");
      resetCanvas();
    }, 300);

    return true;
  }
  return false;
}

function Shareweixin() {
  var shareData = {
    sharetag: "铁友疯狂找图",
    shareUrl: "http://m.tieyou.com/index.php?param=/imgGame.html",
    weixinContent: "铁友找图～日赚300打码小游戏风靡网络",
    weiboContent:
      "铁友找图～日赚300打码小游戏风靡网络 http://m.tieyou.com/index.php?param=/imgGame.html",
    title: "铁友找图～日赚300打码小游戏风靡网络",
    picUrl: "http://img3.tieyou.com/huodong/imggame/img/icon.png",
  };

  var timestamp = "",
    nonceStr = "",
    signature = "";
  wx.config({
    debug: false,
    appId: "wx952ba137b4533dff",
    timestamp: timestamp,
    nonceStr: nonceStr,
    signature: signature,
    jsApiList: [
      "onMenuShareTimeline",
      "onMenuShareAppMessage",
      "onMenuShareQQ",
      "onMenuShareWeibo",
    ],
  });

  var html =
    "<div><script src='http://img3.tieyou.com/wx/js/wxbase.js'/></div>";
  $("body").after(html);

  wx.onMenuShareAppMessage(shareData);
  wx.onMenuShareTimeline(shareData);
  wx.onMenuShareQQ(shareData);
  wx.onMenuShareWeibo(shareData);
}

// 电脑根据main计算结果计算起始和终止点
function aiRun() {
  if (curBoard > 0) {
    //result: true, key: 32768, direction: 0, dots: 1, x: 0, y: 0
    var s = S[curBoard];
    console.log('===curBoard', curBoard, s)
    if (s.result) {
      //找到最佳路径
      startPoint = getPointByDot(s.row, s.column);
      switch (s.direction) {
        case 0:
          endPoint = getPointByDot(s.row, s.column + s.dots - 1);
          break;
        case 1:
          endPoint = getPointByDot(s.row + s.dots - 1, s.column + s.dots - 1);
          break;
        case 2:
          endPoint = getPointByDot(s.row + s.dots - 1, s.column);
          break;
        case 3:
          endPoint = getPointByDot(s.row + s.dots - 1, s.column - s.dots + 1);
          break;
      }
      console.log("get result: ", endPoint, startPoint, s);
    } else {
      //没有找到最佳路径，寻找第一个可画的点
      // alert("keep it up!");
      var i = Dwidth * Dheight - 1;
      var board = mapBoard(curBoard);
      do {
        var row = Math.floor(i / Dwidth);
        var column = i % Dwidth;
        if (board[row][column] === 1) {
          startPoint = getPointByDot(row, column);
          endPoint = getPointByDot(row, column);
          break;
        }
      } while (i--);
      console.log("no result: ", endPoint, startPoint);
    }
    recordHist(-1, getDrawableDots());
    resetCanvas();
  }
}

// 绘制某一步，dots包括此步骤所有点的集合
// drawer: 画图者，-1电脑，1用户
// dots：步骤画的所有点的集合
function crossLine(drawer, dots) {
  if (dots && dots.length) {
    context_s.strokeStyle = drawer > 0 ? "#ED7C31" : "#42AD9E";
    var tempPoint;
    var color = drawer > 0 ? "#ED7C31" : "#42AD9E";
    for (var i = 0; i < dots.length; i++) {
      var dot = dots[i];
      var point = getPointByDot(dot.row, dot.column);
      curBoard = curBoard - calculate(dot.row, dot.column);

      if (point) {
        //绘制中心圆
        context_s.beginPath();
        context_s.fillStyle = color;
        context_s.arc(point.x, point.y, circleLen / 2, 0, 2 * Math.PI);
        context_s.fill();

        //绘制外环
        context_s.beginPath();
        context_s.strokeStyle = color;
        context_s.lineWidth = 3;
        context_s.arc(point.x, point.y, circleLen, 0, 2 * Math.PI);
        context_s.stroke();

        //如果当前点不是第一点，则绘制和上一点间的连接线

        if (!!tempPoint) {
          context_s.beginPath();
          context_s.moveTo(
            tempPoint.x -
              (circleLen * (tempPoint.x - point.x)) /
                getDistance(tempPoint.x, tempPoint.y, point.x, point.y),
            tempPoint.y -
              (circleLen * (tempPoint.y - point.y)) /
                getDistance(tempPoint.x, tempPoint.y, point.x, point.y)
          );
          context_s.lineTo(
            point.x -
              (circleLen * (point.x - tempPoint.x)) /
                getDistance(point.x, point.y, tempPoint.x, tempPoint.y),
            point.y -
              (circleLen * (point.y - tempPoint.y)) /
                getDistance(point.x, point.y, tempPoint.x, tempPoint.y)
          );
          context_s.stroke();
        }

        tempPoint = point;
      }
    }
  }
  return true;
}

// 检测startPoint和endPoint间所有点是否可画，如果可画返回所有点的集合，如果不可画，返回空数组
function getDrawableDots() {
  var drawableDots = [];
  if (startPoint && endPoint) {
    var offset_row = endPoint.row - startPoint.row;
    var offset_column = endPoint.column - startPoint.column;
    if (
      offset_row === 0 ||
      offset_column === 0 ||
      Math.abs(offset_row) === Math.abs(offset_column)
    ) {
      //两点属于同行/列或者斜45度
      var dot_num = 0;
      var board = mapBoard(curBoard);
      var offset = Math.max(Math.abs(offset_row), Math.abs(offset_column));
      if (offset === 0) {
        //startPoint和endPoint为同一个点
        if (board[startPoint.row][startPoint.column] === 1) {
          drawableDots = [
            {
              row: startPoint.row,
              column: startPoint.column,
            },
          ];
        }
      } else {
        //startPoint和endPoint不是同一个点，则汇集两点间所有点
        while (dot_num <= offset) {
          if (
            board[startPoint.row + (dot_num * offset_row) / offset][
              startPoint.column + (dot_num * offset_column) / offset
            ] === 1
          ) {
            drawableDots.push({
              row: startPoint.row + (dot_num * offset_row) / offset,
              column: startPoint.column + (dot_num * offset_column) / offset,
            });
            dot_num++;
          } else {
            //碰到某个点已被画，则返回空数组
            return [];
          }
        }
      }
    }
  }
  return drawableDots;
}

// 根据鼠标位置获取在canvas中的位置
function getPointOnCanvas(canvas, x, y) {
  var bbox = canvas.getBoundingClientRect();
  return {
    x: x - bbox.left * (canvas.width / bbox.width),
    y: y - bbox.top * (canvas.height / bbox.height),
  };
}

// 侦听鼠标按下/触屏按下的动作
function doMouseDown(event) {
  event.preventDefault();
  //如果是触屏模式，则不检测鼠标事件
  if (isTouchMode && event.type === "mousedown") {
    return;
  }
  isMouseDown = true;
  if (event.type === "touchstart") {
    isTouchMode = true;
  }
  var x = event.pageX || event.changedTouches[0].pageX;
  var y = event.pageY || event.changedTouches[0].pageY;
  var canvas = event.target;
  var loc = getPointOnCanvas(canvas, x, y);
  startPoint = getClosestPoint(loc);
  endPoint = null;
  //    alert("endPoint"+endPoint);
}

// 侦听鼠标/触屏移动的动作
function doMouseMove(event) {
  event.preventDefault();
  if (isMouseDown) {
    isMouseDown = isMouseDown;
  } else {
    isMouseDown = isMouseDown;
  }
  if (!isMouseDown || (isTouchMode && event.type === "mousemove")) {
    return;
  }
  var x = event.pageX || event.changedTouches[0].pageX;
  var y = event.pageY || event.changedTouches[0].pageY;
  var canvas = event.target;
  var loc = getPointOnCanvas(canvas, x, y);
  endPoint = getClosestPoint(loc) || startPoint;
  resetCanvas();
  tmpBoard = curBoard; //鼠标移动未弹起前不会改变curBoard，curBoard临时存放在tmpBoard中
  crossLine(Drawer, getDrawableDots());
  curBoard = tmpBoard;
  endPoint = null;
}

// 侦听鼠标弹起/触屏离开的动作
function doMouseUp(event) {
  event.preventDefault();
  if (isTouchMode && event.type === "mouseup") {
    return;
  }
  isMouseDown = false;
  var x = event.pageX || event.changedTouches[0].pageX;
  var y = event.pageY || event.changedTouches[0].pageY;
  var canvas = event.target;
  var loc = getPointOnCanvas(canvas, x, y);
  endPoint = getClosestPoint(loc);
  recordHist(Drawer, getDrawableDots());

  //   if (startPoint) alert("mouseup"+startPoint+endPoint);
  rerunCanvas();
  startPoint = null;
  endPoint = null;
}

// 根据行列返回对应点的x, y坐标
function getPointByDot(row, column) {
  var x = 2 * marginWidth + column * (circleLen * 2 + marginWidth) + circleLen;
  var y = 2 * marginHeight + row * (circleLen * 2 + marginHeight) + circleLen;
  return {
    x: x,
    y: y,
    row: row,
    column: column,
  };
}

// 根据鼠标位置返回最近的点的坐标
function getClosestPoint(loc) {
  for (var i = 0; i < Dheight; i++) {
    for (var j = 0; j < Dwidth; j++) {
      var point = points[i][j];
      if (getDistance(point.x, point.y, loc.x, loc.y) < circleLen) {
        //鼠标位置位于圆半径内
        return point;
      }
    }
  }
  return null;
}

// 返回两点间的距离
function getDistance(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}
