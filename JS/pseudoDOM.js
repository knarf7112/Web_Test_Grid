/*
    虛擬DOM
*/
//模擬DOM紀錄DOM相關屬性値
var pseudoDOM = function (name, x, y, width, height, backgroundColor) {
    if (arguments.length !== 5) {
        throw new Error("parameter must have 5");
    }
    this.name = name || "";
    //CSS Style
    this.style = new function () {
        //都轉數字格式
        this.left = +x;
        this.top = +y;
        this.width = +width;
        this.height = +height;
        //背景顏色
        this.backgroundColor = backgroundColor || "#bbb";
        //鼠標符號
        this.cursor = "default";
    };
    //文字內容
    this.textContent = "這是測試超過長度是否切除,超過長度的會被切掉";//"teste國234567890";
    //default font style
    this.font = new function () {
        this.color = "black",
        this.size = 16,
        this.unit = "px",
        this.typeface = "Calibri",
        this.textBaseline = "middle",
        this.textAlign = "left";
    };
    /*
        function
    */
    
}

pseudoDOM.prototype = {
    /*
        default prototype value
    */
    //pseudo dom name
    name: "",
    //
    style: {
        //寬度
        width: 0,
        //高度
        height: 0,
        //X axis
        left: 0,
        //Y axis
        top: 0,
        //background color
        backgroundColor: "yellow",
        //cursor style
        cursor: "default"
    },
    //
    font: {
        color: "black",
        size: 15,
        unit: "px",
        typeface: "Calibri",
        textBaseline: "middle",
        textAlign: "left"
    },
    //text
    textContent: undefined,
    /*
      draw function
    */
    //畫外框
    draw_rect: function (ctx) {
        //console.log('draw rectangle:' + this.name);
        ctx.fillStyle = this.style.backgroundColor;
        ctx.fillRect(this.style.left + 1, this.style.top + 1, this.style.width - 1, this.style.height - 1);
    },
    //刷新矩型內的文字內容
    refresh_textContent:function(text, ctx){
        this.textContent = "" + text;
        this.save_restore(ctx, this.draw_rect);//重畫矩形
        this.save_restore(ctx, this.draw_text);//重畫文字內容
    },
    //畫文字內容
    draw_text: function (ctx) {
        //console.log("draw text:" + this.name);
        var text = "";
        ctx.fillStyle = this.font.color;
        ctx.font = "" + this.font.size + this.font.unit + " " + this.font.typeface;//(字串)大小 + 單位 + 字體
        //檢查字串長度是否超出矩形寬度
        var String_Width = ctx.measureText(this.textContent).width;//Calculate string width
        //console.log("str:", String_Width, "width:", this.style.width);
        if (String_Width > this.style.width) {
            var minus = this.textContent.length;//origin length
            var cutStr = "";//string temp
            //一直遞減一個字元,直到字串寬度小於矩形寬度
            while (String_Width >= this.style.width) {
                minus--;//減少一個字元長度
                cutStr = this.textContent.slice(0, minus);//取得減少後的字串
                String_Width = ctx.measureText(cutStr).width;//計算字串寬度(會依據font的size來算)
            }
            text = cutStr;
        }
        else {
            text = this.textContent;
        }
        ctx.textAlign = this.font.textAlign;//對齊左右
        ctx.textBaseline = this.font.textBaseline;//基準線設定
        ctx.fillText(text, (this.style.left + 5), (this.style.top + (this.style.height / 2)));
    },
    //隔離畫布狀態並執行操作方法
    save_restore: function (ctx, func) {
        ctx.save();//產生新的stack隔離上次的Style設定
        func.call(this, ctx);//因為再呼叫function時的this指到window了,所以這邊帶入當前的物件
        ctx.restore();
    },
    //設定位置與大小資訊
    set_Style: function (x, y, width, height) {
        this.style.left = +x || this.style.left;
        this.style.top = +y || this.style.top;
        this.style.width = +width || this.style.width;
        this.style.height = +height || this.style.height;
    },
    //設定文字風格
    set_fontStyle: function (color, size, unit, typeface, textBaseline, textAlign) {
        this.font.color = color || this.font.color;
        this.font.size = +size || this.font.size; //number(自動轉10進位)
        this.font.unit = unit || this.font.unit;
        this.font.typeface = typeface || this.font.typeface;
        this.font.textBaseline = textBaseline || this.font.textBaseline;
        this.font.textAlign = textAlign || this.font.textAlign;
    }
}