/*
    Slider Object 
    ref:https://jqueryui.com/slider/#default
    //目標1:當目標DOM寬度變大(與最初的設定相比),滑塊依據目標寬度比例跟者縮小
    //目標2:當滑塊左右移動時,目標DOM位置跟者左右移動
    //構想1:當目標DOM寬度變大時,滑塊跟者比例縮小
    //構想2:當滑塊位置變化時,傳出變化的範圍 ex:{ start: 0, end: 80 }  == +50 ==>  { start: 50, end: 130 }
*/
var Slider = function (obj) {
    /*
        variable
    */
    this.max;
    this.min;
    this.currentValue;

    /*
        DOM
    */
    //parent node
    this.parentNode = obj.parentNode;
    //main node
    this.mainNode;
    //slider
    this.sliderNode;
    //slider bar
    this.sliderBarNode;
    /*
        DOM inline CSS Style Object
    */
    this.style;
    this.slider.style = {};
    this.sliderBar.style = {};

    /*
        operate function
    */
    //initial
    this.init = function () {
        //1. create element and append to document
        this._createSlider();
        //2. bind event

    };
    //1.create main DOM and sliderBar Dom and slider DOM
    this._createSlider = function () {
        var main = this;
        main.mainNode = main.createElement("div", undefined, "Slider");

        main.sliderNode = main.createElement("span", "slider");

        main.sliderBarNode = main.createElement("div", "sliderBar");

        //appendChild
        main.sliderBarNode.appendChild(main.sliderNode);
        main.mainNode.appendChild(main.sliderBarNode);
        main.parentNode.appendChild(main.mainNode);
    };
    //
    this._bind_event_slider = function () {
        var main = this;
        
        main.sliderNode.onmousedown = function (event) {

        };
        main.sliderNode.onmousemove = function (event) {

        };
        main.sliderNode.onmouseup = function (event) {

        };
    }
    //
    this.set_maxValue = function (value) {
        if (isNaN(Number(value))) {
            console.log("parameter must be a number:" + value);
            return;
        }
        this.max = +value;
    };
    this.init();
};
/*
    Slider prototype (shared function and variable)
*/
Slider.prototype = {
    min: 0, max: 0,currentValue:0,
    slider:{
        style: {

        }
    },
    sliderBar:{
        style: {
            width: "100%",
            height: "13px",

        }
    },
    //create DOM
    createElement: function (tagName, className, idName) {
        var element = document.createElement(tagName);
        if (!!className) {
            element.classList.add(className);
        }
        if (!!idName) {
            element.setAttribute("id", idName);
        }
        return element;
    },
    //change DOM class
    changeDomClass: function (element, oldClassName, newClassName) {
        element.classList.remove(oldClassName);
        element.classList.add(newClassName);
    },
    //將css style資料物件的值複製到物件的同名屬性
    set_Obj_style: function (myObj, CssStyleObj) {
        if ((CssStyleObj.constructor !== Object) || (myObj.constructor !== Object)) {
            throw new Error("parameter is not Object");
        }
        for (var property in CssStyleObj) {
            myObj[property] = CssStyleObj[CssStyleObj];
        }
    },
    //依據輸入物件的屬性值來刷新DOM元素的Style屬性
    refresh_node_CssStyle: function (element, CssStyleObj) {
        //var cssText = "";
        for (var property in CssStyleObj) {
            if (element.style[property] === undefined) {
                console.log(property + "屬性不存在於style列表");
                continue;
            }
            element.style[property] = CssStyleObj[property];
            //cssText += property + ": " + CssStyleObj[property] + ";";//串字串就不能檢查,因為style後的不允許"-" ex: background-color: xxx;
        }
        //element.style["cssText"] = cssText;//一次把重排+重繪做完
    }
};

