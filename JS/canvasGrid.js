/*
    表格單元
*/
var Cell = function (name) {
    this.name = name;
    this.style;
    this.delegateList = [];//用來塞委派方法的指標
    //暫訂給事件委派的方法
    this.run_deleList = function () {
        var that = this;
        that.delegateList.forEach(function (current) {
            current();
        });
    }
}
//cell 的形狀設定
Cell.prototype.style = {
    border: 2,
    width: 0,
    height: 0,
    left: 0,
    top: 0,
    type:"rectangle"
};
Cell.prototype.style = new styleSetting();
//Cell.prototype

function styleSetting() {
    //設定基本外觀
    this.set = function (styleObj) {
        if (styleObj.constructor !== Object) {
            throw new TypeError(this.name + ":[set()] set style Error =>" + styleObj);
        }
        var obj = this.style;
        for (var property in styleObj) {
            //若原物件也有
            if (obj[property] !== undefined) {
                obj[property] = styleObj[property];
            }
            else {
                console.error("[set()] " + property + " 屬性不存在");
            }
        }
    };
    //輸入參數或無吐出Style物件數據 => {xxx:123,...}
    this.get = function () {
        var tmpObj = this.style;
        if (arguments.length === 0) {
            return tmpObj;
        }
        else if (arguments.length > 1) {
            var result = {};
            for (var index = 0; index < arguments.length; index++) {
                if (tmpObj[arguments[index]] !== undefined) {
                    result[arguments[index]] = tmpObj[arguments[index]];
                }
            }
            return result;
        }
        else {
            return tmpObj[arguments[0]];
        }
    };
    //
    
}