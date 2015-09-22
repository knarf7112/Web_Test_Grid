//目標功能
//1.建立table框架(即空殼DOM in memory)
//2.使用框架(DOM插入或替換DOM內的資料)
//var TableManager = {
//    'Version': '00'
//}
//
//**********************************************
/*
    Grid參考(台北資料開放平台預覽資料用的JS)
    slickgrid:https://github.com/mleibman/SlickGrid/blob/gh-pages/slick.grid.js
*/
//建立 table 框架 rows=>tr count, columns=>td count
var TableManager = function (obj) {
    this.data = [];                                 //原始資料的集合
    this.refinedData = [];                          //重新定義的資料
    this.mainElement = obj.mainElement;             //指定注入的外部DOM父元素
    //紀錄寬度(含border,padding,不含scrollBar)
    this.width = obj.width || obj.mainElement.offsetWidth;
    //紀錄高度(含border,padding,不含scrollBar)
    this.height = obj.height || obj.mainElement.offsetHeight;
    //紀錄欄數
    this.column = obj.column || 5;
    this.row = obj.row || 20;
    //主Grid DOM元素
    this.gridElement;                               
    //資料展示元件
    this.refineNodeTable = [];                      
    //縮放元件主Node
    this.flexiBarRootNode;                          
    //縮放元件
    this.flexiBarNodeList = [];                     
    //縮放元件寬度
    this.flexiBarCount = this.column;               
    //紀錄每次滑鼠移動時的間距差
    this.flexiBar_X_rangeList = [];                 
    //mousedown start position
    this.X_start;                                   
    //mousemove end position
    this.X_end;                                     
    //Grid欄位的平均寬度
    this.columnWidth;                               
    //Grid列的平均高度
    this.rowHeight;                                 
    //flexi bar元件的寬度値
    this.flexiBarWidth = 10;
    //page control root node
    this.pageControlRootNode;
    //page control array
    this.pageControlNodeList = [];
    //
    this.multiPageControlNodeList = [];
    //current click page
    this.currentPage = 0;
    //Grid額外的寬度
    this.GridExtraWidth = 50;                       
    //初始化
    this.init = function () {
        //1.建立展示資料元素
        this.createDisplayNode();
        //2.重新定義元素結構
        this.redefineGridNodesStruct();
        //3.設定主grid元素外框CSS style
        this.set_gridRootNodeStyle();
        //4.刷新Grid的所有元素style
        this.refresh_allDisplayElementCssStyle();
        //5.建立flexi bar
        this.createFlexiBar();
        //6.refresh flexi bar css style 
        this.refresh_flexiBarCssStyle();
        //7.flexi bar bind mouse evnt and calculate X range(Closure)
        this.bind_flexiBar_event();
        //8.建立切頁元件
        this.createPageControl();
        //9.設定切頁CSS
        this.set_page_CSS();
        //10.切頁事件綁定
        this.bind_page_event();
        //4.物件載入資料
        //5.資料顯示
    };
    //1.建立展示資料元素
    this.createDisplayNode = function () {
        //建立展示資料元素
        this.gridElement = this.new.create("div", this.column * this.row, 'data_Display');
        this.mainElement.appendChild(this.gridElement);
    };
    //2.設定自定義的node結構
    this.redefineGridNodesStruct = function () {
        var main = this,
            container = [],
            innerContainer = [],
            allChilds = this.gridElement.children;
            
        //set every column width and height(設定欄位平均寬度和厚度)
        main.columnWidth = (main.width / main.column);
        main.rowHeight = (main.height / main.row);

        for (var elementIndex = 0; elementIndex < allChilds.length; elementIndex++) {
            var rowIndex = (elementIndex % main.row),
                columnIndex = Math.floor(elementIndex / this.row),
                isHeader = (elementIndex % main.row == 0),
                //defined data content(自訂的資料物件)
                data = {
                    row: rowIndex,//column導向                    //Math.floor(elementIndex / this.column),  //row導向
                    column: columnIndex,  //column導向            //(elementIndex % this.column),//列導向
                    default_Width: main.columnWidth,              //預設寬度:平均值
                    default_Left: (columnIndex * main.columnWidth),//預設X軸位置:固定寬度的間距
                    nodeCSS: {                                    //CSS Style 
                        position: "absolute",
                        width: (main.columnWidth) + "px",
                        height: (main.rowHeight) + "px",
                        top: (rowIndex * main.rowHeight) + "px",//因以欄位為基準,所以剛好相反
                        left: (columnIndex * main.columnWidth) + "px",
                        border: "1px solid red",
                        overflow: "hidden"
                    },
                    node: allChilds[elementIndex],
                    nodeAttributes: isHeader ? {
                        draggable: true
                    } : {},
                    value: "",
                    type: isHeader ? "header" : "body"////column導向       //(Math.floor(elementIndex / this.column) == 0) ? "header" : "body"//row導向
                };
            
            //[[{}]] => column( row( data Object ) )
            //若不存在建立新的陣列容器
            if (!container[data.column]) {
                container.push([]);
            }
            //直接指定
            container[data.column][data.row] = data;
        }
        console.log('refine result',container);
        //結果輸出
        this.refineNodeTable = container;
    };
    //3.設定主grid元素外框CSS style
    this.set_gridRootNodeStyle = function () {
        var main = this;
        main.gridElement.style.position = "relative";
        //main.gridElement.style.border = "1px solid red";
        main.gridElement.style.width = main.width + main.GridExtraWidth + "px";//加上擴展的寬度(使最右邊的flexi bar可以向右拖曳不卡住)
        main.gridElement.style.height = main.height + "px";
        main.gridElement.style.overflowY = "hidden";
        main.gridElement.style.overflowX = "visable";//
    }
    //4.刷新Grid內所有display元素的CSS Style屬性或指定的CSS屬性
    this.refresh_allDisplayElementCssStyle = function (mainObj, columnIndex, propertyName) {
        var main = mainObj || this;
        //object css set into element css style 刷新所有展
        for (var column_Index = columnIndex || 0; column_Index < main.column; column_Index++) {
            for (var rowIndex = 0; rowIndex < main.row; rowIndex++) {
                //若無指定CSS屬性名稱
                if (!propertyName) {
                    //全部刷新
                    for (var property in main.refineNodeTable[column_Index][rowIndex].nodeCSS) {
                        main.refineNodeTable[column_Index][rowIndex].node.style[property] = main.refineNodeTable[column_Index][rowIndex].nodeCSS[property];
                    }
                    //若為header 設定可拖曳屬性
                    if (main.refineNodeTable[column_Index][rowIndex].type === "header") {
                        for (var attribute in main.refineNodeTable[column_Index][rowIndex].nodeAttributes) {
                            main.refineNodeTable[column_Index][rowIndex].node.setAttribute(attribute, main.refineNodeTable[column_Index][rowIndex].nodeAttributes[attribute]);
                        }
                    }
                }
                else {
                    //指定刷新
                    main.refineNodeTable[column_Index][rowIndex].node.style[propertyName] = main.refineNodeTable[column_Index][rowIndex].nodeCSS[propertyName];
                }
            }
        }
    };
    //5.create flexi bar and initial property (flexi bar:控制Grid上每個欄位的寬度與位置)
    this.createFlexiBar = function () {
        var main = this,
            tmpNodes;
        //建立 flexi bar 元素
        main.flexiBarRootNode = main.new.create('div', main.flexiBarCount, 'flexiBar');
        //casting to array
        tmpNodes = Array.prototype.slice.call(main.flexiBarRootNode.children);//轉成陣列元素
        
        //set property into main object //iterator
        tmpNodes.forEach(function (currentElement, index, array) {
            var default_left = ((main.columnWidth * (index + 1)));// - main.flexiBarWidth),//每個flexi bar的預設 X axis 位置
                //建立縮放元素(flexi bar)的資料結構
                data = {
                    index: index,               //第幾條
                    default_left: default_left, //初始位置
                    X_deviation: 0,//滑鼠事件的移動變化值(原始值的遞增或遞減)
                    forward_width: default_left - ((!!main.flexiBarNodeList[index - 1]) ? main.flexiBarNodeList[index - 1].default_left : 0),//與前一個元素的間距寬度
                    node: currentElement,       //DOM元素
                    nodeCSS: {                  //設定用CSS
                        position: "absolute",
                        //border: "1px solid yellow", //只是用來看元件位置
                        backgroundColor: "",
                        width: main.flexiBarWidth + "px",
                        height: main.height + "px",
                        left: default_left + "px",
                        top: "0px"
                    },
                    type: "flexiBar"            //物件種類
                };
            //console.log(currentElement);
            main.flexiBarNodeList.push(data);//加入主物件
        });
        //console.log('init flexi bar', main.flexiBarNodeList.map(function (current, index, array) { return current.forward_width; }))
        //輸出到Grid元素上
        main.gridElement.appendChild(main.flexiBarRootNode);
    };
    //6.refresh flexi bar css style 
    this.refresh_flexiBarCssStyle = function (mainObj, columnIndex, propertyName) {
        var main = mainObj || this;
        //flexiNodes = main.flexiBarRootNode.children;
        //設定所有縮放元素,若有指定起始index則取指定値當起始値
        for (var index = columnIndex || 0; index < main.flexiBarNodeList.length; index++) {
            //若有指定設定名稱
            if (!!propertyName) {
                main.flexiBarNodeList[index].node.style[propertyName] = main.flexiBarNodeList[index].nodeCSS[propertyName];
            }
            else {
                //設定所有Css Style
                for (var property in main.flexiBarNodeList[index].nodeCSS) {
                    main.flexiBarNodeList[index].node.style[property] = main.flexiBarNodeList[index].nodeCSS[property];
                }
            }
        }
    };
    //7.flexi bar bind mouse evnt and calculate X range(Closure)
    this.bind_flexiBar_event = function () {
        var main = this,
            moveFlag = false,
            flexiBarIndex = 0;//紀錄當前觸發flexi bar 的索引值,當作column index
        //對所有的flexi bar 做事件綁定//currentElement為自訂義物件
        main.flexiBarNodeList.forEach(function (currentElement, index, array) {
            //console.log("CurrentElement", currentElement);
            
            currentElement.node.addEventListener("mousedown", function (e) {
                e.stopPropagation();//事件不再上升
                e.preventDefault();//停用DOM的drag功能,避免拖曳DOM
                //ref:http://stackoverflow.com/questions/69430/is-there-a-way-to-make-text-unselectable-on-an-html-page
                console.log("Down", e.target.className, index);
                flexiBarIndex = index;
                moveFlag = true;
                main.X_start = document.body.scrollLeft + main.gridElement.scrollLeft + e.pageX;
                console.log("Down:pageX ", main.X_start);
            }, false);
        });
        //
        document.addEventListener("mousemove", function (e) {
            if (moveFlag) {
                //console.log("Move", e);
                main.X_end = e.pageX;//X axis end position
                //console.log("srcollLeft", document.body.scrollLeft, "main.X_end", main.X_end, "main.X_start", main.X_start);
                //取得移動間距差(設定目前指定索引的間距)
                main.flexiBar_X_rangeList[flexiBarIndex] = (document.body.scrollLeft + main.gridElement.scrollLeft + main.X_end - main.X_start);//取得間距
                //console.log("Range", main.flexiBar_X_rangeList[flexiBarIndex], "Index", flexiBarIndex);

                //更新flexi bar並累計最後的X軸偏移量
                main._update_nodeCSS_CssStyle(main, flexiBarIndex, main.flexiBar_X_rangeList[flexiBarIndex], 'left');
            }
        });
        //mouse up event (設定最終的X axis偏移量)
        document.addEventListener("mouseup", function (e) {
            if (moveFlag) {
                moveFlag = false;//關閉mousemove
                //設定最終的X axis偏移量(flexiBarNodeList陣列內所有的X_deviation)
                main._update_flexiBar_last_Xdeviation(main, flexiBarIndex, main.flexiBar_X_rangeList[flexiBarIndex]);
                //只看X偏移量,所以其它屬性濾掉了
                console.log("Up:X軸變化量", main.flexiBarNodeList.map(function (current, index, array) { return current.X_deviation; }));
                //只看寬度變化量
                console.log("Up:寬度變化量", main.flexiBarNodeList.map(function (current, index, array) { return current.forward_width; }));
            }
        });
    };
    //7-1.更新指定與其相關的dispaly物件和flexi bar物件的width值與left值(update specified column width and others left, update specified flexi bar width and others left )
    this._update_nodeCSS_CssStyle = function ( mainObj, columnIndex, x_range, propertyName) {
        for (var index = columnIndex ; index < mainObj.flexiBarNodeList.length; index++) {
            /**********************************************************/
            /*******更新flexi bar條*******/
            //更新flexi bar的nodeCSS內指定的屬性值
            mainObj.flexiBarNodeList[index].nodeCSS[propertyName] = (mainObj.flexiBarNodeList[index].default_left + x_range + mainObj.flexiBarNodeList[index].X_deviation) + "px";
            //更新flexi bar元素的指定CSS style
            mainObj.flexiBarNodeList[index].node.style[propertyName] = mainObj.flexiBarNodeList[index].nodeCSS[propertyName];
            //debugger;
            /**********************************************************/
            /*******更新Grid元素*******/
            //若為拖曳元素的索引値
            if (index === columnIndex){ 
                //變更目前寬度
                mainObj.refineNodeTable[index].forEach(function (currentElement, innerIndex, array) {
                    //更新display元素的nodeCSS內指定的屬性值
                    currentElement.nodeCSS['width'] = (mainObj.flexiBarNodeList[index].forward_width + x_range) + "px";//前一次的寬度値 + 變化量
                    //更新display元素的指定CSS style
                    currentElement.node.style['width'] = currentElement.nodeCSS['width'];
                });
            }
            else {
                //為拖曳元素後面所有的元素(left位置重新定位)
                mainObj.refineNodeTable[index].forEach(function (currentElement, innerIndex, array) {
                    //
                    currentElement.nodeCSS[propertyName] = (mainObj.flexiBarNodeList[index - 1].default_left + mainObj.flexiBarNodeList[index-1].X_deviation + x_range) + 'px';//
                    currentElement.node.style[propertyName] = currentElement.nodeCSS[propertyName];
                });
            }
            /**********************************************************/
        }
        //console.log('Move refinedNodeList', mainObj.refineNodeTable);
    };
    //7-2.依據指定索引更新flexi bar指定的間距値並累加指定索引後面的X軸變化量(依據指定的索引變更並累計flexiBarNodeList陣列內所有的X_deviation)
    this._update_flexiBar_last_Xdeviation = function (mainObj, columnIndex, x_range) {
        for (var index = columnIndex ; index < mainObj.flexiBarNodeList.length; index++) {
            mainObj.flexiBarNodeList[index].X_deviation += x_range;//累加X axis 變化量
        }
        mainObj.flexiBarNodeList[columnIndex].forward_width += x_range;//依據指定索引更新寬度變化量
    };
    //8.建立切頁元件
    this.createPageControl = function () {
        var main = this,
            tmpNodes;
        //建立控制元件
        main.pageControlRootNode = main.new.create('div', 9, 'page_control');
        //Control DOM Collection cast to Array 
        tmpNodes = Array.prototype.slice.call(main.pageControlRootNode.children);//
        //console.log('Control Node', tmpNodes);
        //initial control property
        tmpNodes.forEach(function (current, index, array) {
             
            var data = {
                index: index,
                node: current,
                nodeCSS: {
                    "position": "absolute",
                    "background-color": "pink",
                    //"border": "2px solid black",
                    "border-radius":"10px",
                    "width": "50px",
                    "height": "50px",
                    "left": (index * (main.width / tmpNodes.length) + 5) + "px",
                    "top": main.height + 10 + "px",
                    "text-align": "center",
                    //padding:"20px",
                    "line-height": "50px",  //下移
                    "display": "inline"
                },
                value: index,
                type:"page_control"
            }
            main.pageControlNodeList.push(data);
        });
        console.log('page Control',main.pageControlNodeList);
        main.mainElement.appendChild(main.pageControlRootNode);
    };
    //9.設定切頁元件CSS
    this.set_page_CSS = function () {
        var main = this;
        for (var index = 0; index < main.pageControlNodeList.length; index++) {
            var cssText = "";
            for (var propertyName in main.pageControlNodeList[index].nodeCSS) {
                cssText += propertyName + ":" + main.pageControlNodeList[index].nodeCSS[propertyName] + "; ";
            }
            main.pageControlNodeList[index].node.style.cssText = cssText;
            main.pageControlNodeList[index].node.textContent = main.pageControlNodeList[index].value;
        }
    };
    //10.綁定切頁事件
    this.bind_page_event = function () {
        var main = this,
            currentIndex = -1;
        main.pageControlNodeList.forEach(function (current,index,array) {
            current.node.onclick = function (e) {
                currentIndex = index + 1;
                console.log("page click: " + currentIndex);
                main.display_data(currentIndex);
            }
        });
    };
    //
    this.createMultiplePageControl = function () {
        var main = this,
            tmpNodes;
        //建立控制元件
        main.pageControlRootNode = main.new.create('div', 4, 'multiple_page_control');
        //Control DOM Collection cast to Array 
        tmpNodes = Array.prototype.slice.call(main.pageControlRootNode.children);//
        //console.log('Control Node', tmpNodes);
        //initial control property
        tmpNodes.forEach(function (current, index, array) {

            var data = {
                index: index,
                node: current,
                nodeCSS: {
                    "position": "absolute",
                    "background-color": "red",
                    "border": "2px solid black",
                    "width": "50px",
                    "height": "50px",
                    "left": (index * (main.width / tmpNodes.length) + 5) + "px",
                    "top": main.height + "px",
                    "text-align": "center",
                    //padding:"20px",
                    "line-height": "50px",  //下移
                    "display": "inline"
                },
                value: index,
                type: "page_control"
            }
            main.pageControlNodeList.push(data);
        });
        console.log('page Control', main.pageControlNodeList);
        main.mainElement.appendChild(main.pageControlRootNode);
    };
    //json data load and refine data for table format
    this.JsonDataLoad = function (JsonData) {
        if (!!JsonData) {
            this.data.push(JsonData);
            this.refine_JsonData(JsonData);
            this.display_data(1);
        }
    };
    //重新定義輸入的數據轉成自訂格式 => [頁][欄][列] => 數據
    this.refine_JsonData = function (jsonData) {
        if (jsonData instanceof Array) {

            var everyRowCount = this.row - 1;//every page include header in row 0 so minus 1
            var currentPage,
                columnIndex,
                currentRowIndex,
                refinedData = this.refinedData;//給個指標,否則下面的func會指回Winodw

            jsonData.forEach(function (currentObj, index, array) {
                currentPage = Math.floor(index / everyRowCount) + 1;//page start is 1 [page 0 is undefined]
                columnIndex = 0;
                currentRowIndex = index % everyRowCount;//當前的列索引 = 當前索引除以列總數的餘數
                //從json物件列舉所有資料並做設定
                for (var propertyName in currentObj) {
                    //若為每一頁的第一個資料物件
                    if (currentRowIndex === 0) {
                        refinedData[currentPage] = refinedData[currentPage] || [];//若沒設定過給column設定一個陣列,若有設定過則用當前的
                        var rowArray = [propertyName];//插入一個新的row陣列
                        refinedData[currentPage].push(rowArray);//將每個column都插上一個新row
                        //console.log(refinedData[currentPage][columnIndex]);
                    }
                    refinedData[currentPage][columnIndex].push(currentObj[propertyName]);
                    columnIndex++;
                }
            });
            console.log('refined array', this.refinedData);//[page][column][row] => page:[column:[row:[]]]
        }
    };
    //數據寫入顯示元素
    this.display_data = function(pageIndex){
        var main = this;
        for(var columnIndex = 0; columnIndex < main.refineNodeTable.length;columnIndex++){
            for(var rowIndex = 0; rowIndex < main.refineNodeTable[columnIndex].length;rowIndex++){
                main.refineNodeTable[columnIndex][rowIndex].value = main.refinedData[pageIndex][columnIndex][rowIndex] || "";
                main.refineNodeTable[columnIndex][rowIndex].node.textContent = main.refineNodeTable[columnIndex][rowIndex].value;
            }
        }
    }
};
//shared method
TableManager.prototype.new = {
    //建立元素集合的節點 tagName=建立的元素名稱, amount=子元素的數量, className=元素類別名稱
    create: function (tagName, amount, className) {
        var parser = new DOMParser();
        var childString = "";//temp
        var classAttribute = className ? (' class="' + className + '"') : "";
        var rootElement, docHtml;
        //串子元素字串
        for (var count = 0; count < amount; count++) {
            childString += "<" + tagName + classAttribute + ">" + "</" + tagName + ">";
        }
        //加上一個root元素
        childString = "<" + tagName + classAttribute + ">" + childString + "</" + tagName + ">";
        //console.log(childString);
        docHtml = parser.parseFromString(childString, "text/html");
        rootElement = docHtml.getElementsByTagName(tagName)[0];
        console.log('create new DOM',rootElement);
        return rootElement;
    },
    //元素增加某個class
    addClass: function (element, className) {
        if (!(element instanceof HTMLElement)) {
            throw new Error("注入元素非HTML物件");
        }

        if (this.isClassExist(className) && !element.classList.contains(className)) {
            element.classList.add(className);
        }
    },
    //若class存在於document內則回傳true,否則回傳false
    isClassExist: function (className) {
        var allStyleSheets = window.document.styleSheets;//get all style sheet include extent or intern at document load
        //search all styleSheet
        for (var styleSheetIndex = 0; styleSheetIndex < allStyleSheets.length; styleSheetIndex++) {
            var rules = allStyleSheets[styleSheetIndex].cssRules || allStyleSheets[styleSheetIndex].rules;
            //search all rules or cssRules
            for (var ruleIndex = 0; ruleIndex < rules.length; ruleIndex++) {
                if (className === rules[ruleIndex].selectorText) {
                    return true;
                }
            }
        }
        return false;
    },
    //元素移除某個class
    removeClass: function (element, className) {
        if (!(element instanceof HTMLElement)) {
            throw new Error("注入元素非HTML物件");
        }
        if (element.classList.contains(className)) {
            element.classList.remove(className);
        }
    },
};
//Old Version(棄用)
TableManager.prototype.old = {
    //建立並回傳新table DOM元素,使用DOMParser
    //rows=表格列數量,column=表格欄數量,tableId=設定table的id屬性名稱,tbClassName=所有欄位的class屬性名稱,flexibleBar=表示是否加入可拉縮的元素
    createTable: function (rowCount, columnCount, tableAttributeString, cellAttributeString, hasFlexibleBar) {
        
        //elements
        var tableAttr = !!tableAttributeString ? (" " + tableAttributeString.trim() + " ") : "";
        var cellAttr = !!cellAttributeString ? (" " + cellAttributeString.trim() + " ") : "";
        var rows = rowCount || 0;
        var columns = columnCount || 0;
        var td = "";
        var th = "";
        var tr = "";
        var thead = "";
        var tbody = "";
        var table = "";
        var docHtml;
        var element;
        var parser = new DOMParser();

        //td collection
        for (var j = 0; j < columns; j++) {
            th += '<th' + cellAttr + '>' + (!!hasFlexibleBar ? '<span style="margin-right: 0px;' +
                                                             'padding:0px 0px;' +
                                                             'height: 30px;' +
                                                             'border:1px solid rgba(0,0,0,0);' +
                                                             'float:right;' +
                                                             'cursor:col-resize;" class="vertical' + j + '"></span>'
                                                             :
                                                             '') + '</th>';
            td += '<td' + cellAttr + '>' + (!!hasFlexibleBar ? '<span style="margin-right: -5px;' +
                                                             'padding:0px 0px;' +
                                                             'height: 30px;' +
                                                             'border:3px solid red;' +
                                                             'float:right;' +
                                                             'cursor:col-resize;" class="vertical' + j + '"></span>' : '') + '</td>';
        }

        //tr + td collection
        for (var i = 0; i < rows; i++) {
            tr += "<tr>" + td + "</tr>" +
            (!!hasFlexibleBar ? '<tr><td colspan="' + columns + '" style="margin:0px 0px;' +
                                                                'width:0px;' +
                                                                'height:0px;' +
                                                                'padding:0px 0px;' + 
                                                                'border:1px solid rgba(0,0,0,0);' +
                                                                'cursor:row-resize;' +
                                                                'class="horizontal' + (i + 1) + '"></td></tr>'
                           : '');
        }

        thead = "<thead><tr>" + th + "</tr>" + (!!hasFlexibleBar ? '<tr><td colspan="' + columns + '" style="margin:0px 0px;' +
                                                                'width:0px;' +
                                                                'height:0px;' +
                                                                'padding:0px 0px;' +
                                                                'border:1px solid rgba(0,0,0,0);' +
                                                                'cursor:row-resize;' +
                                                                'class="horizontal0"></td></tr>'
                                                : '') + "</thead>";
        tbody = '<tbody>' + tr + '</tbody>';
        table = '<table' + tableAttr + '>' + thead + tbody + '</table>';
        console.log('table字串=>',table);
        docHtml = parser.parseFromString(table, 'text/html');
        element = docHtml.getElementsByTagName('table')[0];

        //release
        parser = null;
        docHtml = null;

        return element;
    },

    //元素增加某個class
    addClass: function(element,className){
        if (!(element instanceof HTMLElement)) {
            throw new Error("注入元素非HTML物件");
        }

        if (this.isClassExist(className) && !element.classList.contains(className)) {
            element.classList.add(className);
        }
    },
    //若class存在於document內則回傳true,否則回傳false
    isClassExist: function(className){
        var allStyleSheets = window.document.styleSheets;//get all style sheet include extent or intern at document load
        //search all styleSheet
        for (var styleSheetIndex = 0; styleSheetIndex < allStyleSheets.length; styleSheetIndex++) {
            var rules = allStyleSheets[styleSheetIndex].cssRules || allStyleSheets[styleSheetIndex].rules;
            //search all rules or cssRules
            for (var ruleIndex = 0; ruleIndex < rules.length; ruleIndex++) {
                if (className === rules[ruleIndex].selectorText) {
                    return true;
                }
            }
        }
        return false;
    },
    //元素移除某個class
    removeClass: function(element,className){
        if (!(element instanceof HTMLElement)) {
            throw new Error("注入元素非HTML物件");
        }
        if (element.classList.contains(className)) {
            element.classList.remove(className);
        }
    },
    //插入資料到表格元素
    //dataObj=資料陣列(裡面元素為{xxx:'xx'}),dataStartIndex=設定讀取的資料起始位置,tableElement=要改變資料的table元素
    insertData: function (dataAry, dataStartIndex, tableElement) {
        var startIndex = dataStartIndex || 0;
        var keys;
        var trElements;

        if (!(dataAry instanceof Array)) {
            console.error('插入資料非陣列元素!');
            return;
        }

        keys = Object.getOwnPropertyNames(dataAry[0]);
        //tableElement.querySelectorAll('td[class^=vertical]');
        trElements = tableElement.querySelectorAll('tr');//td:not([class^=horizontal])');//不包含列縮放的元素
        console.dir(trElements);
        //clear table cell value
        for (var i = 0; i < trElements.length; i++) { //tr
            for (var j = 0; j < trElements[i].children.length; j++) { //td or th
                //th
                if (trElements[i].children[j].nodeName.toUpperCase() == 'TH') {
                    trElements[i].children[j].textContent = keys[j];//setting th[i]'s value
                }
                    //tr
                else {
                    //check data length if not overflow 
                    if ((i + startIndex - 1) < dataAry.length) {
                        console.log(('dataObj[' + (i + startIndex - 1) + '][' + keys[j] + ']'), dataAry[i + startIndex - 1][keys[j]]);
                        trElements[i].children[j].textContent = dataAry[i + startIndex - 1][keys[j]];
                    }
                    else {
                        trElements[i].children[j].textContent = '';
                    }
                }
            }
        }
    },
    //展現資料
    //element=要插入的DOM元素, parentElement=要展示資料的父元素, insertBefore=插入在父元素裡面的前面(true)或後面(false)
    display: function (element, parentElement, insertBefore) {
        if (!(parentElement instanceof HTMLElement) || !(element instanceof HTMLElement)) {
            console.log('parameter is not a HTMLElement!!!', element, parentElement);
            return;
        };
        if (!insertBefore) {
                parentElement.appendChild(element);
        }
        else {
            parentElement.insertBefore(element, parentElement.firstChild); 
        }
    },
};
var testOnconsole;
//**********************************************
var Grid = function (obj) {
    //紀錄寬度(含border,padding,不含scrollBar)
    this.width = obj.width || obj.displayNode.offsetWidth;
    //紀錄高度(含border,padding,不含scrollBar)
    this.height = obj.height || obj.displayNode.offsetHeight;
    //紀錄欄數
    this.column = obj.column || 5;
    this.row = obj.row || 20;
    //文字大小
    this.font_size = obj.font_size || Math.sqrt(20);
    this.pading_size = obj.pading_size || 2;
    this.border_size = obj.border_size || 2;
    this.scroll_x_size = obj.scroll_x_size || 20;
    this.min_column_width = obj.min_column_width || 30;
    this.resize_Sensitivity = obj.resize_Sensitivity || 3;
    this.buffer_column_width = obj.buffer_column_width || 1.1;
    //json data
    this.data = obj.data || [];
    this.column_width = obj.column_width || [];
    this.column_order = obj.column_order || [];
    //total cell
    this.amount = this.column * (this.row + 1);
    this.node_height = (this.height - this.border_size * (this.row + 2) - this.pading_size * 2 - this.scroll_x_size) / (this.row + 1);
    this.displayNode = obj.displayNode;
    this.gridNode;
    this.contentNode;
    this.controlNode;
    this.package_num = 0;
    this.row_st = 0;
    this.page_package = {
        page: 0,
        limit_page: 0
    }
    //展現資料的元素陣列
    this.display_nodes = [];
    this.control_nodes = [];
    this.control_package = {
        re_size_mousedown: false,
        re_size_target: "",
        scroll_display_move: 0
    };
    this.Initial = function () {
        if (this.displayNode) {
            //this.gridNode = document.createElement("div");
            //this.gridNode.classList.add("grid");
            var firstChildNode;
            this._refine_data();
            this._create_TableFrame('s1');
            this.contentNode = document.createElement("div");
            this.contentNode.classList.add("content");
            firstChildNode = this.gridNode.firstChild;
            this.gridNode.insertBefore(this.contentNode, firstChildNode);
            this.displayNode.appendChild(this.gridNode);
            this.header_css_setting('title');
            this._location_refresh();
            this._control_bind();
            this._interface_create();
        }
        else {
            console.error("Initial failed !!!");
        }
    }

    this._refine_data = function () {
        // refresh width
        if (!this.buffer_column_width.length) {
            //default width
            var tmp = (this.width - this.border_size * (this.column + 1) - this.pading_size * 2) / this.column;
            if (tmp < this.min_column_width) {
                tmp = this.min_column_width;
            }
            //set default width
            for (var count = 0; count < this.column; count++) {
                this.column_width.push(tmp);
            }
        }
        if (!this.column_order.length) {
            //set default order
            for (var count = 0; count < this.column; count++) {
                this.column_order.push(count);
            }
        }
    };
    //create table frame and set  
    this._create_TableFrame = function (cellClassName) {
        if (!!this.displayNode) {
            var tmp = "";
            var domparser = new DOMParser();
            var main = this;
            var classAttr = !!cellClassName ? (' class="' + cellClassName + '"') : "";

            for (var columnCount = 0; columnCount < this.amount; columnCount++) {
                tmp += "<div" + classAttr + "></div>";
            }
            tmp = '<div class="grid">' + tmp + '</div>';
            var htmlDom = domparser.parseFromString(tmp, 'text/html');
            this.gridNode = htmlDom.getElementsByClassName('grid')[0];
            this.displayNode.appendChild(this.gridNode);
            //domparser.parseFromString(tmp,'text/html');
            //select all cell and set attributes in main object
            var divs = Array.prototype.slice.call( this.displayNode.querySelectorAll('.' + cellClassName));//node List convert Array

            divs.forEach(function (element, index) {
                var columnIndex = Math.floor(index / (main.row + 1)),
                    rowIndex = index % (main.row + 1);

                //header
                if (rowIndex === 0) {
                    //push header
                    main.display_nodes.push([{
                        node: element,
                        data: {
                            width: main.column_width[columnIndex],  //header cell width
                            height: main.node_height,                       //header cell height
                            top: main.border_size + main.pading_size,       //header cell Y axis
                            left: main._compute_nodeLeft(columnIndex),
                            type: 'title',
                            value: ''
                        }
                    }]);
                }
                else {
                    //body
                    main.display_nodes[columnIndex].push({
                        node: element,
                        data: {
                            width: main.display_nodes[columnIndex][0].data.width,
                            height: main.node_height,
                            top: ((main.node_height + main.border_size) * rowIndex) + main.border_size + main.pading_size,
                            left: main.display_nodes[columnIndex][0].data.left,
                            type: 'node',
                            value: ''
                        }
                    });
                }
                //set node attribute
                main.display_nodes[columnIndex][rowIndex].node.setAttribute('data-column', columnIndex);
                main.display_nodes[columnIndex][rowIndex].node.setAttribute('data-row', rowIndex);
                main.display_nodes[columnIndex][rowIndex].node.setAttribute('data-type', main.display_nodes[columnIndex][rowIndex].data.type);
            });
        } else {
            console.error('Init Error');
        }
    };
    //header css setting
    this.header_css_setting = function (className) {
        //testOnconsole = this.display_nodes;
        for (var columnCount = 0; columnCount < this.column; columnCount++) {
            this.display_nodes[columnCount][0].node.classList.add(className);
        }
    }
    //setting position
    this._location_refresh = function () {
        var main = this;
        for (var columnIndex = 0; columnIndex < this.display_nodes.length; columnIndex++) {
            for (var rowIndex = 0; rowIndex < this.display_nodes[columnIndex].length; rowIndex++) {
                this.display_nodes[columnIndex][rowIndex].node.style.width = this.display_nodes[columnIndex][rowIndex].data.width + 'px';
                this.display_nodes[columnIndex][rowIndex].node.style.height = this.display_nodes[columnIndex][rowIndex].data.height + 'px';
                this.display_nodes[columnIndex][rowIndex].node.style.top = this.display_nodes[columnIndex][rowIndex].data.top + 'px';
                this.display_nodes[columnIndex][rowIndex].node.style.left = this.display_nodes[columnIndex][rowIndex].data.left + 'px';
            }
        }
    };
    //event事件綁定
    this._control_bind = function () {
        var main = this;
        this.gridNode.addEventListener('scroll', function (event) {
            var scrollLeft = main.gridNode.scrollLeft;
            main.control_package.scroll_display_move = scrollLeft;
        });
        //綁定滑鼠移動時,檢查re_size_mousedown屬性並計算移動間距
        this.gridNode.addEventListener('mousemove', function (event) {
            //console.dir(main);
            if (!!main.control_package.re_size_mousedown) {

                var moveRange = event.pageX + (main.gridNode.getBoundingClientRect().left + document.body.scrollLeft) + main.control_package.scroll_display_move - main._compute_nodeLeft(main.control_package.re_size_target);
                main._change_column_size(main.control_package.re_size_target, moveRange);
            }
            else {
                var x = event.pageX - (main.gridNode.getBoundingClientRect().left + document.body.scrollLeft);
                if (!!main.control_package.scroll_display_move) {
                    x += main.control_package.scroll_display_move;
                }
                var tmp,
                    flag = false;
                //從第一個column開始
                for (var columnIndex = 1; columnIndex <= main.column_width.length; columnIndex++) {
                    tmp = main._compute_nodeLeft(columnIndex) - (main.border_size / 2);
                    if (Math.abs(x - tmp) < main.resize_Sensitivity) {
                        main.control_package.re_size_target = columnIndex - 1;
                        if (main.gridNode.style.cursor !== "e-resize") {
                            main.gridNode.style.cursor = "e-resize";
                        }
                        flag = true;
                        //
                        columnIndex = main.column_width + 1;
                    }
                }
                if (!flag) {
                    main.control_package.re_size_target = "";
                    if (main.gridNode.style.cursor === "e-resize") {
                        main.gridNode.style.cursor = "auto";
                    }
                }
            }
        });
        //綁定滑鼠按下時,設定屬性re_size_mousedown為false
        this.gridNode.addEventListener('mousedown', function (event) {
            //若沒設定過re_size_mousedown
            if (!main.control_package.re_size_mousedown) {
                //且grid內的鼠標樣式為e-resize
                if (main.gridNode.style.cursor === "e-resize") {
                    main.control_package.re_size_mousedown = true;
                }
            }
        });
        //綁定滑鼠移出grid時,計算移動座標超過grid邊界,則設定屬性re_size_mousedown為false
        this.gridNode.addEventListener('mouseout', function (event) {
            var offsetLeft = (main.gridNode.getBoundingClientRect().left + document.body.scrollLeft);
            var offsetTop = (main.gridNode.getBoundingClientRect().top + document.body.scrollTop);
            if(event.pageX <= offsetLeft || 
                event.pageX >= (offsetLeft + parseInt(main.gridNode.style.width.split("px")[0],10)) ||
                event.pageY <= offsetTop ||
                event.pageY >= (offsetTop + parseInt(main.gridNode.style.height.split("px")[0], 10))) {
                main.control_package.re_size_mousedown = false;
            }
        });
        //綁定滑鼠放開時,設定屬性re_size_mousedown為false
        this.gridNode.addEventListener('mouseup', function (event) {
            if (main.control_package.re_size_mousedown) {
                main.control_package.re_size_mousedown = false;
            }
        });
    };
    //頁籤介面建立
    this._interface_create = function () {
        this.controlNode = document.createElement('div');
        this.controlNode.classList.add("control");
        this.displayNode.appendChild(this.controlNode);
        var elementStr = "";
        for (var count = 0; count < 16; count++) {
            elementStr += "<div class=\"control_data\"></div>";
        }
        this.controlNode.innerHTML = ("<div class=\"display_control_data\"></div><div class=\"display_control_status\"></div>" + elementStr);
        this.display_control_data = this.controlNode.getElementsByClassName('display_control_data')[0];
        this.display_control_status = this.controlNode.getElementsByClassName('display_control_status')[0];
        var main = this,
            count = 0,
            width = (parseInt(this.controlNode.clientWidth, 10) / 16),
            height = (parseInt(this.controlNode.clientHeight, 10)) * 50 / 100,
            top = height;
        //設定控制格style
        this.display_control_data.style.width = (width * 8) + 'px';
        this.display_control_data.style.height = height + 'px';
        this.display_control_data.style.top = '0px';
        this.display_control_data.style.left = '0px';

        //設定控制格狀態列style
        this.display_control_status.style.width = (width * 8) + 'px';
        this.display_control_status.style.height = height + 'px';
        this.display_control_status.style.top = '0px';
        this.display_control_status.style.left = '0px';

        var control_dataNodes = Array.prototype.slice.call(this.controlNode.getElementsByClassName('control_data'));
        //新增物件的頁籤控制屬性數據
        control_dataNodes.forEach(function (element, index) {
            main.control_nodes.push({
                node: element,
                data: {
                    width: width,
                    height: height,
                    top: top,
                    left: width * index,
                    type: "",
                    value: ""
                }
            });
        });
        //設定控制元素的style依據物件的控制元素數據
        for (var count = 0; count < this.control_nodes.length; count++) {
            this.control_nodes[count].node.style.width = main.control_nodes[count].data.width + "px";
            this.control_nodes[count].node.style.height = main.control_nodes[count].data.height + "px";
            this.control_nodes[count].node.style.top = main.control_nodes[count].data.top + "px";
            this.control_nodes[count].node.style.left = main.control_nodes[count].data.left + "px";
        }

        //設定頁籤內容 -- 前三後三
        this.control_nodes[0].data.value = "-100";
        this.control_nodes[0].data.type = "control";
        this.control_nodes[1].data.value = "-10";
        this.control_nodes[1].data.type = "control";
        this.control_nodes[2].data.value = "-1";
        this.control_nodes[2].data.type = "control";
        this.control_nodes[15].data.value = "+100";
        this.control_nodes[15].data.type = "control";
        this.control_nodes[14].data.value = "+10";
        this.control_nodes[14].data.type = "control";
        this.control_nodes[13].data.value = "+1";
        this.control_nodes[13].data.type = "control";

        //控制元素部分
        this._compute_limit_page();
        this._control_actionSet();
        this._control_update();
        this._control_refresh();
    };
    //數據載入並更新元件
    this.JsonLoader = function (data) {
        switch (data.type.toLowerCase()) {
            case "init":
                //refined data
                if (!!data.content) {
                    //data
                    this.data.push(data.content);
                    this._title_update();
                    this._title_refresh();
                    this._change_data(0);
                    this._compute_limit_page();
                    this._refresh();
                    //control
                    this._compute_limit_page();
                    this._control_update();
                    this._control_refresh();
                }
                break;
            case "update":
                //更新資料(add)
                this.data.push(data.content);
                break;
        }
    };
    //
    this._change_data = function (row_st) {
        if (row_st) {
            for (var index = 0; index < this.data.length; index++) {
                //超過範圍
                if (this.data[index].length >= row_st) {
                    this.package_num = index;
                    this.row_st = row_st;
                    //break;
                    index = this.data.length;
                }
                else {
                    row_st -= this.data[index].length;
                }
            }
        }
        else {
            //歸零
            this.package_num = 0;
            this.row_st = 0;
        }
        this._update();
    };
    //更新屬性text的數據
    this._update = function () {
        for (var columnIndex = 0; columnIndex < this.column; columnIndex++) {
            for (var rowIndex = 0; rowIndex < this.row; rowIndex++) {
                try{
                    this.display_nodes[columnIndex][rowIndex + 1].data.value = this.data[this.package_num][this.row_st + rowIndex + 1][this.column_order[columnIndex]];
                }
                catch (ex) {
                    this.display_nodes[columnIndex][rowIndex + 1].data.value = "";//ex;
                }
            }
        }
    };
    //更新元素textContent值
    this._title_refresh = function () {
        for (var columnIndex = 0; columnIndex < this.column; columnIndex++) {
            //抬頭text刷新
            this.display_nodes[columnIndex][0].node.textContent = this.display_nodes[columnIndex][0].data.value;
        }
    };
    //更新物件title屬性
    this._title_update = function () {
        for (var columnIndex = 0; columnIndex < this.column; columnIndex++) {
            //更新物件內容抬頭內容
            this.display_nodes[columnIndex][0].data.value = this.data[0][0][this.column_order[columnIndex]];
        }
    };
    //切頁元素事件綁定
    this._control_actionSet = function () {
        var main = this;
        Array.prototype.forEach.call(this.controlNode.getElementsByClassName("control_data"), function (element, index) {
            //元素綁定切頁事件
            element.onclick = function (event) {
                if (event.target.getAttribute("data-type") === "control") {
                    //使用隱藏的value屬性
                    var target_page = event.target.value,
                        tmp;
                    switch (target_page) {
                        case "-100":
                        case "-10":
                        case "-1":
                        case "+100":
                        case "+10":
                        case "+1":
                            tmp = parseInt(main.page_package.page, 10) + parseInt(target_page, 10);
                            if(tmp > main.page_package.limit_page){
                                tmp = main.page_package.page;
                            }
                            if (tmp < 0) {
                                tmp = 0;
                            }
                            main.change_page(tmp);
                            break;
                        default:
                            if (target_page < 0) {
                                target_page = 0;
                            }
                            if (target_page > main.page_package.limit_page) {
                                target_page = main.page_package.limit_page;
                            }
                            main.change_page(target_page);
                            break;
                    }
                }
            };
        });
    };
    //頁面變更
    this.change_page = function (num) {
        this._change_data(num * this.row);
        this.page_package.page = num;
        this._control_update();
        this._control_refresh();
        this._refresh();
    };
    //切頁元素內容刷新
    this._control_refresh = function () {
        for (var index = 0; index < this.control_nodes.length; index++) {
            this.control_nodes[index].node.value = this.control_nodes[index].data.value;
            this.control_nodes[index].node.setAttribute('data-type', this.control_nodes[index].data.type);
            //若元素非+xxx或-xxx的
            if (index >= 3 && index < 13) {
                //not empty string
                if (!(this.control_nodes[index].data.value === '')) {
                    this.control_nodes[index].node.textContent = this.control_nodes[index].data.value + 1;
                }
            }
            else {
                //屬性內容值塞入元素的text中
                this.control_nodes[index].node.textContent = this.control_nodes[index].data.value;
            }
        }
    };
    //切頁屬性數據更新
    this._control_update = function () {
        var limit = (Math.floor(this.page_package.page / 10) + 1) * 10;
        //若超過最大頁數則取最大頁數
        if (this.page_package.limit_page < limit) {
            limit = this.page_package.limit_page;
        }
        var st = Math.floor(this.page_package.page / 10) * 10;
        // columnIndex = 3 why?
        for (var index = 3; index < this.control_nodes.length - 3; index++) {
            //
            if (st + (index - 3) > limit) {
                this.control_nodes[index].data.value = '';
                this.control_nodes[index].data.type = 'disable';
            }
            else {
                this.control_nodes[index].data.value = st + (index - 3);
                if (this.page_package.page === (st + (index - 3))) {
                    this.control_nodes[index].data.type = 'selected';
                }
                else{
                    this.control_nodes[index].data.type = 'control';
                }
            }
        }
    };
    //計算總頁數
    this._compute_limit_page = function () {
        var totalRows = 0;
        for (var columnIndex = 0; columnIndex < this.data.length; columnIndex++) {
            totalRows += this.data[columnIndex].length;
        }
        this.page_package.limit_page = Math.floor(totalRows / this.row) - 1;
    };
    //變更欄位大小
    this._change_column_size = function (count, value) {
        if (value < this.min_column_width) {
            value = this.min_column_width;
        }
        //設定欄位的大小
        this.column_width[this.column_order[count]] = value;
        this._update_column_size();
        //設定content元素寬度
        this.contentNode.style.width = (this._compute_nodeLeft(this.column_width.length) * this.buffer_column_width) + 'px';
        //刷新物件內數據
        this._location_refresh();
        //刷新內容文字
        this._refresh();
    };
    //更新column size
    this._update_column_size = function () {
        for (var columnIndex = 0; columnIndex < this.display_nodes.length; columnIndex++) {
            for (var rowIndex = 0; rowIndex < this.display_nodes[columnIndex].length; rowIndex++) {
                //設定c欄r列的物件屬性width值
                this.display_nodes[columnIndex][rowIndex].data.width = this.column_width[this.column_order[columnIndex]];
                //計算c欄r列的物件屬性left值
                this.display_nodes[columnIndex][rowIndex].data.left = this._compute_nodeLeft(columnIndex);
            }
        }
    };
    //刷新內容文字設定
    this._refresh = function () {
        this._compute_show_word();
        for (var columnIndex = 0; columnIndex < this.column; columnIndex++) {
            //包含header
            for (var rowIndex = 0; rowIndex < (this.row + 1) ; rowIndex++) {
                this.display_nodes[columnIndex][rowIndex].node.textContent = this._short_str(this.display_nodes[columnIndex][rowIndex].data.value, this.display_nodes[columnIndex][rowIndex].data.width_count);
            }
        }
    };
    //計算顯示字元
    this._compute_show_word = function () {
        var tmp;
        for (var columnIndex = 0; columnIndex < this.display_nodes.length; columnIndex++) {
            // 欄位寬度除以字體大小減10
            tmp = this.display_nodes[columnIndex][0].data.width / this.font_size - 10;//
            for(var rowIndex = 0; rowIndex < this.display_nodes[columnIndex].length;rowIndex++){
                this.display_nodes[columnIndex][rowIndex].data.width_count = tmp;
            }
        }
    };
    //文字縮寫計算 => xxx...
    this._short_str = function (str, value) {
        if (!!str) {
            var ans = 0;
            for (var count = 0; count < str.length; count++) {
                if (ans < value) {
                    //128以上即非英數字元
                    if (str.charCodeAt(count) < 128) {
                        ans += 1;
                    }
                    else {
                        ans += 2;
                    }
                }
                else {
                    //內容文字超過設定值 變成 => XXX...
                    return str.substr(0, count) + "...";
                }
            }
        }
        return str;
    };
    //calculate the node left 
    this._compute_nodeLeft = function (nodeColumnIndex) {
        //one unit 
        var nodeLeft = this.pading_size + this.border_size;// 1 cell/per
        //add all node width
        for (var count = 0; count < nodeColumnIndex; count++) {
            nodeLeft += this.border_size + this.column_width[this.column_order[count]];
        }
        return nodeLeft;
    };

    this.Initial();
}


