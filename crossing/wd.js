Dwidth = parseInt(getQuery("Dwidth")) || 4;
Dheight = parseInt(getQuery("Dheight")) || 3;
AImode = parseInt(getQuery("AImode")) || 1;
LastDotWin = parseInt(getQuery("LastDotWin")) || 0;
nooftrials = parseInt(getQuery("nt")) || 0;
Initx = parseInt(getQuery("Initx")) || 0;


if (Initx==0) {
    var tempcookie = getCookie("Initx");
    if (tempcookie!="") {
        Initx = tempcookie;
        InitxDW =  Initx;
        Dheight = InitxDW % 10;
        InitxDW = (InitxDW - InitxDW%10)/10;
        Dwidth = InitxDW % 10;
        Initx = (InitxDW - InitxDW%10)/10;
        if (Dheight*Dwidth<6) {Dwidth=3; Dheight=3}; if (Dheight>4) Dheight=4; if (Dwidth>4) Dwidth=4;
//        alert("initx"+ Initx + "Dwidth"+ Dwidth + "Dheight"+ Dheight);
    }
}

if (Initx==1)  Initx = 15;
if (Initx<15)  Initx=15;
if (Initx>  Math.pow(2, Dwidth * Dheight) - 1)  Initx =  Math.pow(2, Dwidth * Dheight) - 1;

var curBoard = Initx;

var S = new Array(Math.pow(2, Dwidth * Dheight));
var boardCache = [];
var calculateCache = [];

function restoreS(Ix)
{
    hists = []; Drawer=1;
    curBoard=Ix;
    Initx = Ix;
    S = new Array(Math.pow(2, Dwidth * Dheight));
    boardCache = [];
    calculateCache = [];
    init();
}

function showBoard(array) {
    for (var i = 0; i <= array.length - 1; i++) {
        console.log(array[i].join("  "));
    }
}

function convertToBinary(x) { // change
    var y = "";

    for (; x >= 2;) {

        y = (x % 2) + y;
        x = (x - (x % 2)) / 2;
    }
    if (x == 0)
        y = y + "0";
    if (x == 1) {
        y = "1" + y;
    }

    return y; // changed
}

function countones(x) { // change
    var z=0;

    for (; x >= 2;) {
        z=z+ (x%2);
        x = (x - (x % 2)) / 2;

    }
    z=z+x;
    return z; // changed
}

function mapBoard(x, reset) {
    if(boardCache[x]){
        return boardCache[x];
    }
	var digits = [];
    var y = convertToBinary(x); // changed
    if (y.length < Dwidth * Dheight) {
        var j = y.length;
        for (var i = 0; i < Dwidth * Dheight - j; i++) {
            y = "0" + y;
        }
    }

    var z = 0;
    for (var i = 0; i < Dheight; i++) {
        digits[i] = [];
        for (var j = 0; j < Dwidth; j++) {
            digits[i][j] = parseInt(y.charAt(z));
            z++;

        }
    }
    boardCache[x] = digits;
    // if (reset){
    //     digits = [[1, 1, 1], [1, 0, 1]]
    //     boardCache[x] = digits
    // }
    
    return digits;
}

function calculate(row, column) {
    if(calculateCache[row]){
        if(calculateCache[row][column]){
            return calculateCache[row][column];
        }
    }else{
        calculateCache[row] = [];
    }
    var total = Math.pow(2, (Dwidth * Dheight - 1) - Dwidth * row - column);
    calculateCache[row][column] = total;
    return total;
}


function store() {
	var time = new Date();
    var ci; //点的个数
    if (LastDotWin==0) S[0].result=true; else S[0].result = false;

  //  if (Dwidth*Dheight==16) setTimeout(function(){ alert("please wait"); }, 300);
  
    S[0].key = 0;
    S[0].direction = 0;
    S[0].dots = 0;
    S[0].row = 0;
    S[0].column = 0;

    for (ci = 1; ci <= Dwidth * Dheight; ci++) {
        for (var x = 1; x < Math.pow(2, Dwidth * Dheight); x++) { //不同的状态
    
 
 {
    /* the following program is converting x to array and count */  
    var y= x;
    var r=0;
    var count=0;
    var array=[];
    for (var i = Dheight-1; i>=0; i--) {
        array[i] = [];
        for (var j = Dwidth-1; j>=0; j--) {
            r = y%2;
            count = count + r;
            y= (y - y%2)/2;
            array[i][j] = r;
        }
    }
}

x=x;

if (count==ci) {
                Outerloop:
                    for (var i = 0; i < Dheight; i++) { //行
                        for (var j = 0; j < Dwidth; j++) { //列，遍历各点算法
                            if (array[i][j] == 1) { //该点可以划
                                for (var direction = 0; direction <= 3; direction++) {
                                    Dotloop:
                                    for (var dots = 1; dots <= Math.max(Dwidth,	Dheight); dots++) { // change

 {                                 
    var x1 = x; // change
    if (dots == 1) {
        x1 = x - calculate(i, j);
    } else {
        x1 = x - calculate(i, j);
        switch (direction) {
            case 0:
                if ((j + dots - 1) < Dwidth) {
                    for (var q = 2; q <= dots; q++) {
                        if (array[i][j + q - 1] == 1) {
                            x1 = x1 - calculate(i, j + q - 1);
                        } // change //CHANGE THIS SO THAT ONE DOT CROSSED DOESNT
                        // CHANGE X1
                        else {
                            x1 = x;
                            break Dotloop;
                        } // change
                    }
                } else break Dotloop;
                break;
            case 1:
                if ((i + dots - 1) < Dheight && (j + dots - 1) < Dwidth) {
                    for (var q = 2; q <= dots; q++) {
                        if (array[i + q - 1][j + q - 1] == 1)
                            x1 = x1 - calculate(i + q - 1, j + q - 1); // change
                        else {
                            x1 = x;
                            break Dotloop;
                        } // change
                    }
                } else break Dotloop;
                break;
            case 2:
                if ((i + dots - 1) < Dheight) {
                    for (var q = 2; q <= dots; q++) {
                        if (array[i + q - 1][j] == 1)
                            x1 = x1 - calculate(i + q - 1, j); // change
                        else {
                            x1 = x;
                            break Dotloop;
                        } // change
                    }
                } else break Dotloop;
                break;
            case 3:
                if ((i + dots - 1) < Dheight && (j - dots + 1) >= 0) {
                    for (var q = 2; q <= dots; q++) {
                        if (array[i + q - 1][j - q + 1] == 1)
                            x1 = x1 - calculate(i + q - 1, j - q + 1); // change
                        else {
                            x1 = x;
                            break Dotloop;
                        } // change
                    }
                } else break Dotloop;
                break;
        }
    }

    temp= x1;
}
       



                                        if (temp == x){
                                            continue;
                                        }else if (!S[temp].result) {
                                            S[x].result = true;
                                            S[x].key = x - temp;
                                            S[x].direction = direction;
                                            S[x].dots = dots;
                                            S[x].row = i;
                                            S[x].column = j;

                                            // console.log("S[" + i + "].result = " + S[i].result + ", key = " + S[i].key + ", dots = " + S[i].dots + ", direction = " + S[i].direction + ", x = " + S[i].x + ", y = " + S[i].y);
                                            //showBoard(mapBoard(i));
                                            break Outerloop;
                                        }
                                    }
                                }



                            }
                        }
                    }
            }

        }
    }
  //   alert("费时：" + (new Date()-time) + "ms");
     var trueresults=0;
     for (var x = 0; x < Math.pow(2, Dwidth * Dheight); x++) {

        if (S[x].result) {
            //			console.log("S[" + i + "].result = " + S[i].result
            //					+ ", key = " + S[i].key + ", dots = " + S[i].dots
            //					+ ", direction = " + S[i].direction + ", x = " + S[i].x
            //					+ ", y = " + S[i].y);
            //			showBoard(mapBoard(i));
            trueresults= trueresults +1; 
        }
    }
   // alert("trueresults" + trueresults + " out of " + Math.pow(2, Dwidth * Dheight));
}


function getQuery(val) {
    var uri = window.location.search;
    var re = new RegExp("" + val + "=([^&?]*)", "ig");
    return ((uri.match(re)) ? (decodeURI(uri.match(re)[0].substr(val.length + 1))) : '');
}

function main() {
    for (var i = 0; i < S.length; i++) {
        S[i] = {};
    }
    store(S);
}

