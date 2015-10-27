/*
    canvas Grid
*/

var Grid = function (obj) {
    /*
        Property
    */
    //原始JSON數據
    this.data = [];
    //目前所使用的數據資料
    this.dataIndex = -1;
    //重新定義的資料物件
    this.refinedData = [];
    //外部來源主DOM
    this.mainElement = obj.mainElement;
    //總寬度(含border,padding,不含scrollBar)
    this.width = obj.width || obj.mainElement.offsetWidth;
    //總高度(含border,padding,不含scrollBar)
    this.height = obj.height || obj.mainElement.offsetHeight;
    //欄數
    this.column = obj.column || 5;
    //列數
    this.row = obj.row || 20;
    //主Grid DOM元素
    this.gridElement;
    //資料展示元件
    this.refineNodeTable = [];
    //縮放元件主Node
    this.ResizeBarRootNode;
    //縮放元件
    this.ResizeBarNodeList = [];
    //縮放元件寬度
    this.ResizeBarCount = this.column;
    //紀錄每次滑鼠移動時的間距差
    this.ResizeBar_X_rangeList = [];
    //mousedown start position
    this.X_start;
    //mousemove end position
    this.X_end;
    //Grid欄位的平均寬度
    this.columnWidth;
    //Grid列的平均高度
    this.rowHeight;
    //flexi bar元件的寬度値
    this.ResizeBarWidth = 10;
    //page control root node
    this.pageControlRootNode = { incrementPageRoot: undefined, specifiedPageRoot: undefined };
    //page control array
    this.pageControl = { incrementPageList: [], specifiedPageList: [] };
    //current click page
    this.currentPage = 0;
    //Grid額外的寬度
    this.GridExtraWidth = 50;
    //欄位的排列順序
    this.columnSequence = [];
    //sort root node
    this.columnSortedRootNode;
    //sort
    this.columnSortNodeList = [];
    //排序過的數據
    this.sortedObject = {};
    //初始化
    this.init = function () {
        //1.建立展示資料元素
        this.createDisplayNode();
        //2.重新定義元素結構
        this.redefineGridNodesStruct();
        //2-1.設定欄位順序陣列
        this.set_columnSequenceArray();
        //3.設定主grid元素外框CSS style
        //this.set_gridRootNodeStyle();
        //4.刷新Grid的所有元素style
        this.refresh_allDisplayElementCssStyle();
        //5.建立flexi bar
        //this.createResizeBar();
        //6.refresh flexi bar css style 
        //this.refresh_ResizeBarCssStyle();
        //7.flexi bar bind mouse evnt and calculate X range(Closure)
        //this.bind_event_ResizeBar();
        //8.建立(遞增或遞減)切頁元件
        //this.createIncrementPageControl();
        //9.設定(遞增或遞減)切頁元件CSS Style
        //this.set_incrementPageControl_CSS();
        //10.(遞增或遞減)切頁事件綁定
        //this.bind_event_incrementPageControl();
        //11.建立(指定頁)切頁元件(1~10個)
        //this.createSpecifiedPageControl();
        //12.刷新(指定頁)切頁元件CSS與値
        //this.set_specifiedPageControl_CSS();
        //13.綁定(指定頁)切頁事件
        //this.bind_event_specifiedPageControl();

        //11.欄位拖曳資料交換事件綁定--作欄與欄資料交換
        //this.event_bind_header();
        //12.建立欄位排序元件
        //this.createSortNodeList();
        //13.設定欄位排序元件CSS
        //this.set_columnSortNode_CSS();
        //14.欄位排序元素click事件綁定
        //this.bind_event_columnSortNode();
    };
    /*
        資料表格元件
    */
    //1.建立展示資料元素
    this.createDisplayNode = function () {
        //建立展示資料元素
        this.gridElement = this.shared.createElement('canvas', 'grid');
        this.gridElement.setAttribute('width', this.width);
        this.gridElement.setAttribute('height', this.height);
        this.mainElement.appendChild(this.gridElement);
    };
    //2.設定自定義的node結構
    this.redefineGridNodesStruct = function () {
        const main = this;
        const container = [];                   //頁
        //const innerContainer = [];              //欄 used es6 array copy [...innerContainer]
        const len = main.column * main.row;     //total cells 
        const averageWidth = main.columnWidth;
        var isHeader;
        var type;
        var attributes;
        var rowIndex;
        var columnIndex;
        var default_Left;
        var nodeCss;
        var node;
        var dataContainer;
        //set every column width and height(設定欄位平均寬度和厚度)
        main.columnWidth = (main.width / main.column);
        main.rowHeight = (main.height / main.row);

        for (var elementIndex = 0; elementIndex < len; elementIndex++) {
            isHeader = (elementIndex % main.row === 0);
            type = isHeader ? "header" : "cell";
            attributes = isHeader ? { draggable: true } : {};
            rowIndex = (elementIndex % main.row);
            columnIndex = Math.floor(elementIndex / this.row);
            default_Left = (columnIndex * main.columnWidth);
            nodeCss = {                                    //CSS Style 
                position: "absolute",
                width: (main.columnWidth),//+ "px",
                height: (main.rowHeight),//+ "px",
                top: (rowIndex * main.rowHeight),//+ "px",//因以欄位為基準,所以剛好相反
                left: (columnIndex * main.columnWidth),//+ "px",
                border: 2,//"2px solid white",
                textAlign: "center",
                backgroundColor: isHeader ? "rgb(120, 207, 207)" : "rgb(174, 233, 233)",
                overflow: "hidden"
            };
            node = new Cell_canvas(
                columnIndex + "-" + rowIndex,   //name
                nodeCss.left,                   //x axis 列導向所以相反
                nodeCss.top,                    //y axis
                nodeCss.width,                  //width
                nodeCss.height,                 //height
                nodeCss.backgroundColor,        //backgound color
                nodeCss.border);                //border width
            //defined data content(自訂的資料物件)
            dataContainer = new CellContainer(type, rowIndex, columnIndex, averageWidth, default_Left, null, node);

            //[[{}]] => column( row( data Object ) )
            //若不存在建立新的陣列容器
            if (!container[dataContainer.column]) {
                //container.push([...innerContainer]);//es6 array copy not support on vs2013 but browser is support
                container.push([]);
            }
            //自訂物件推入array
            container[dataContainer.column].push(dataContainer);
        }
        console.log('refine result', container);
        //結果輸出
        this.refineNodeTable = container;
    };
    //2-1.設定欄位順序陣列
    this.set_columnSequenceArray = function () {
        var main = this;
        main.refineNodeTable.forEach(function (current, index) {
            main.columnSequence.push(index);
        });

    };
    /*
    //3.設定主grid元素外框CSS style
    this.set_gridRootNodeStyle = function () {
        var main = this;
        main.gridElement.style.position = "relative";
        //main.gridElement.style.border = "1px solid red";
        main.gridElement.style.width = main.width + main.GridExtraWidth + "px";//加上擴展的寬度(使最右邊的flexi bar可以向右拖曳不卡住)
        main.gridElement.style.height = main.height + 10 + "px";
        main.gridElement.style.overflowY = "hidden";
        main.gridElement.style.overflowX = "visable";//
    };
    */
    //4.刷新Grid內所有display元素的CSS Style屬性或指定的CSS屬性
    this.refresh_allDisplayElementCssStyle = function (mainObj, columnIndex, propertyName) {
        const main = mainObj || this;
        const ctx = main.gridElement.getContext('2d');

        //object css set into element css style 刷新所有展
        for (var column_Index = columnIndex || 0; column_Index < main.column; column_Index++) {
            for (var rowIndex = 0; rowIndex < main.row; rowIndex++) {
                //若無指定CSS屬性名稱
                if (!propertyName) {
                    tempObj = main.refineNodeTable[column_Index][rowIndex];
                    //tempObj.node.style["backgroundColor"] = tempObj.nodeCSS["backgroundColor"];
                    //tempObj.node.refresh_textContent(ctx);
                    tempObj.node.translate_and_refresh_textContent(ctx);
                }
                else {
                    //指定刷新
                    main.refineNodeTable[column_Index][rowIndex].node.style[propertyName] = main.refineNodeTable[column_Index][rowIndex].nodeCSS[propertyName];
                }
            }
        }
    };
    /*
        欄位縮放元件
    */
    //5.create flexi bar and initial property (flexi bar:控制Grid上每個欄位的寬度與位置)
    this.createResizeBar = function () {
        var main = this,
            tmpNodes;
        //建立 flexi bar 元素
        main.ResizeBarRootNode = main.new.create('div', main.ResizeBarCount, 'ResizeBar');
        //casting to array
        tmpNodes = Array.prototype.slice.call(main.ResizeBarRootNode.children);//轉成陣列元素

        //set property into main object //iterator
        tmpNodes.forEach(function (currentElement, index, array) {
            var default_left = ((main.columnWidth * (index + 1)));// - main.ResizeBarWidth),//每個flexi bar的預設 X axis 位置
            //建立縮放元素(flexi bar)的資料結構
            data = {
                index: index,               //第幾條
                default_left: default_left, //初始位置
                X_deviation: 0,//滑鼠事件的移動變化值(原始值的遞增或遞減)
                forward_width: default_left - ((!!main.ResizeBarNodeList[index - 1]) ? main.ResizeBarNodeList[index - 1].default_left : 0),//與前一個元素的間距寬度
                node: currentElement,       //DOM元素
                nodeCSS: {                  //設定用CSS
                    position: "absolute",
                    //border: "1px solid yellow", //只是用來看元件位置
                    backgroundColor: "",
                    width: main.ResizeBarWidth + "px",
                    height: main.height + "px",
                    left: default_left + "px",
                    top: "0px"
                },
                type: "ResizeBar"            //物件種類
            };
            //console.log(currentElement);
            main.ResizeBarNodeList.push(data);//加入主物件
        });
        //console.log('init flexi bar', main.ResizeBarNodeList.map(function (current, index, array) { return current.forward_width; }))
        //輸出到Grid元素上
        main.gridElement.appendChild(main.ResizeBarRootNode);
    };
    //6.refresh flexi bar css style 
    this.refresh_ResizeBarCssStyle = function (mainObj, columnIndex, propertyName) {
        var main = mainObj || this;
        //flexiNodes = main.ResizeBarRootNode.children;
        //設定所有縮放元素,若有指定起始index則取指定値當起始値
        for (var index = columnIndex || 0; index < main.ResizeBarNodeList.length; index++) {
            //若有指定設定名稱
            if (!!propertyName) {
                main.ResizeBarNodeList[index].node.style[propertyName] = main.ResizeBarNodeList[index].nodeCSS[propertyName];
            }
            else {
                //設定所有Css Style
                for (var property in main.ResizeBarNodeList[index].nodeCSS) {
                    main.ResizeBarNodeList[index].node.style[property] = main.ResizeBarNodeList[index].nodeCSS[property];
                }
            }
        }
    };
    //7.flexi bar bind mouse evnt and calculate X range(Closure)
    this.bind_event_ResizeBar = function () {
        var main = this,
            moveFlag = false,
            ResizeBarIndex = 0;//紀錄當前觸發flexi bar 的索引值,當作column index
        //對所有的flexi bar 設定mousedown事件綁定//currentElement為自訂義物件
        main.ResizeBarNodeList.forEach(function (currentElement, index, array) {
            //console.log("CurrentElement", currentElement);

            currentElement.node.addEventListener("mousedown", function (e) {
                e.stopPropagation();//事件不再上升
                e.preventDefault();//停用DOM的drag功能,避免拖曳DOM
                //ref:http://stackoverflow.com/questions/69430/is-there-a-way-to-make-text-unselectable-on-an-html-page
                console.log("Down", e.target.className, index);
                ResizeBarIndex = index;
                moveFlag = true;
                main.X_start = document.body.scrollLeft + main.gridElement.scrollLeft + e.pageX;
                console.log("Down:pageX ", main.X_start);
            }, false);
        });
        //對Grid Root 元素作mousemove事件綁定 -- 用來計算移動間距與展示移動間距
        main.gridElement.addEventListener("mousemove", function (e) {
            //document.addEventListener("mousemove", function (e) {
            if (moveFlag) {
                main.X_end = e.pageX;//X axis end position
                //console.log("srcollLeft", document.body.scrollLeft, "main.X_end", main.X_end, "main.X_start", main.X_start);
                var range = (document.body.scrollLeft + main.gridElement.scrollLeft + main.X_end - main.X_start);

                //檢查最小間距
                if ((main.ResizeBarNodeList[ResizeBarIndex].forward_width + range) < 30) {
                    range = 30 - main.ResizeBarNodeList[ResizeBarIndex].forward_width;
                }
                //取得移動間距差(設定目前指定索引的間距)
                main.ResizeBar_X_rangeList[ResizeBarIndex] = range;//(document.body.scrollLeft + main.gridElement.scrollLeft + main.X_end - main.X_start);//取得間距
                //console.log("Range", main.ResizeBar_X_rangeList[ResizeBarIndex], "Index", ResizeBarIndex);

                //更新flexi bar並累計最後的X軸偏移量
                main._update_nodeCSS_CssStyle(main, ResizeBarIndex, main.ResizeBar_X_rangeList[ResizeBarIndex], 'left');
            }
        });
        //mouse up event (設定最終的X axis偏移量)
        document.addEventListener("mouseup", function (e) {
            if (moveFlag) {
                moveFlag = false;//關閉mousemove
                //設定最終的X axis偏移量(ResizeBarNodeList陣列內所有的X_deviation)
                main._update_ResizeBar_last_Xdeviation(main, ResizeBarIndex, main.ResizeBar_X_rangeList[ResizeBarIndex]);
                //只看X偏移量,所以其它屬性濾掉了
                console.log("Up:X軸變化量", main.ResizeBarNodeList.map(function (current, index, array) { return current.X_deviation; }));
                //只看寬度變化量
                console.log("Up:寬度變化量", main.ResizeBarNodeList.map(function (current, index, array) { return current.forward_width; }));
            }
        });
    };
    //7-1.更新指定與其相關的dispaly物件和flexi bar物件的width值與left值(update specified column width and others left, update specified flexi bar width and others left )
    this._update_nodeCSS_CssStyle = function (mainObj, columnIndex, x_range, propertyName) {
        for (var index = columnIndex ; index < mainObj.ResizeBarNodeList.length; index++) {
            /**********************************************************/
            //(指定的拖曳軸)預設left + 上次變化量 + 本次變化量 => (指定拖曳軸)本次所需移動的left位置
            var resizeBar_Left = (mainObj.ResizeBarNodeList[index].default_left + mainObj.ResizeBarNodeList[index].X_deviation + x_range);
            /*******更新flexi bar條*******/
            //更新flexi bar的nodeCSS內指定的屬性值
            mainObj.ResizeBarNodeList[index].nodeCSS[propertyName] = resizeBar_Left + "px";
            //更新flexi bar元素的指定CSS style
            mainObj.ResizeBarNodeList[index].node.style[propertyName] = mainObj.ResizeBarNodeList[index].nodeCSS[propertyName];

            //debugger;
            /**********************************************************/
            /*
                更新Grid元件
            */
            //若為拖曳元素的索引値
            if (index === columnIndex) {
                //變更目前寬度
                mainObj.refineNodeTable[index].forEach(function (currentElement, innerIndex, array) {
                    //更新display元素的nodeCSS內指定的屬性值
                    currentElement.nodeCSS['width'] = (mainObj.ResizeBarNodeList[index].forward_width + x_range) + "px";//前一次的寬度値 + 變化量
                    //更新display元素的指定CSS style
                    currentElement.node.style['width'] = currentElement.nodeCSS['width'];
                });
            }
            else {
                //為拖曳元素後面所有的元素(left位置重新定位)
                mainObj.refineNodeTable[index].forEach(function (currentElement, innerIndex, array) {
                    //前一個元素的預設值位置 + 之前累積的變化量 + 這次的變化量
                    currentElement.nodeCSS[propertyName] = (mainObj.ResizeBarNodeList[index - 1].default_left + mainObj.ResizeBarNodeList[index - 1].X_deviation + x_range) + 'px';//
                    currentElement.node.style[propertyName] = currentElement.nodeCSS[propertyName];
                });
            }
            /**********************************************************/
            /*
                更新排序元件位置
            */
            mainObj.columnSortNodeList[index].nodeCSS[propertyName] = resizeBar_Left - 15 + "px";
            mainObj.columnSortNodeList[index].node.style[propertyName] = mainObj.columnSortNodeList[index].nodeCSS[propertyName];
        }
        //console.log('Move refinedNodeList', mainObj.refineNodeTable);
    };
    //7-2.依據指定索引更新flexi bar指定的間距値並累加指定索引後面的X軸變化量(依據指定的索引變更並累計ResizeBarNodeList陣列內所有的X_deviation)
    this._update_ResizeBar_last_Xdeviation = function (mainObj, columnIndex, x_range) {
        for (var index = columnIndex ; index < mainObj.ResizeBarNodeList.length; index++) {
            mainObj.ResizeBarNodeList[index].X_deviation += x_range;//累加X axis 變化量
        }
        mainObj.ResizeBarNodeList[columnIndex].forward_width += x_range;//依據指定索引更新寬度變化量
    };
    /*
        切頁元件
    */
    //8.建立(遞增或遞減)切頁元件(只有7個control:首頁,遞增1或10頁,遞減1或10頁,末頁)
    this.createIncrementPageControl = function () {
        var main = this,
            tmpNodes,
            textValue = ['min', '-10', '-1', 'Status', '+1', '+10', 'max'];
        //建立(遞增或遞減)切頁控制元件
        main.pageControlRootNode.incrementPageRoot = main.new.create('div', 7, 'multiple_page_control');
        //Control DOM Collection cast to Array 
        tmpNodes = Array.prototype.slice.call(main.pageControlRootNode.incrementPageRoot.children);//
        //console.log('Control Node', tmpNodes);
        /*********************************************************/
        //initial control property
        tmpNodes.forEach(function (current, index, array) {
            //依據textValue陣列資料値選擇並取得切頁資料物件
            var data = main._get_incrementPageControl_Object(current, index, textValue[index]);
            main.pageControl.incrementPageList.push(data);
        });
        console.log('page Control', main.pageControl.incrementPageList);
        main.mainElement.appendChild(main.pageControlRootNode.incrementPageRoot);
    };
    //(私)取得(遞增或遞減)切頁資料物件
    this._get_incrementPageControl_Object = function (node, index, category) {
        var main = this,
            data = {
                index: index,
                node: node,
                nodeCSS: {
                    "position": "absolute",
                    "background-color": "#e8f3f3",
                    "border": "1px solid white",
                    //"border-radius": "10px",
                    "width": "50px",
                    "height": "50px",
                    "top": (main.height + 12) + "px",
                    "text-align": "center",
                    //padding:"20px",
                    "line-height": "50px",  //textContent下移
                    "visibility": "visible"
                },
                value: "",//category,
                category: category,
                type: "page_control"
            };
        switch (category) {
            case "Status":
                data.nodeCSS["width"] = (main.width * 10 / 16) + 'px';//"100px";
                data.nodeCSS["left"] = (+main.pageControl.incrementPageList[index - 1].nodeCSS['width'].split('px')[0] + +main.pageControl.incrementPageList[index - 1].nodeCSS['left'].split('px')[0]) + "px";
                data.nodeCSS["visibility"] = "hidden";//隱藏起來(暫時不用)
                break;
            case "-10":
                data.node.classList.add('double_arrow_left');
                data.nodeCSS["width"] = (main.width / 16) + 'px';//分成16等份來切區塊//"50px";
                data.nodeCSS["left"] = (+main.pageControl.incrementPageList[index - 1].nodeCSS['width'].split('px')[0] + +main.pageControl.incrementPageList[index - 1].nodeCSS['left'].split('px')[0]) + "px";
                break;
            case "-1":
                data.node.classList.add('arrow_left');
                data.nodeCSS["width"] = (main.width / 16) + 'px';//分成16等份來切區塊//"50px";
                data.nodeCSS["left"] = (+main.pageControl.incrementPageList[index - 1].nodeCSS['width'].split('px')[0] + +main.pageControl.incrementPageList[index - 1].nodeCSS['left'].split('px')[0]) + "px";
                break;
            case "+1":
                data.node.classList.add('arrow_right');
                data.nodeCSS["width"] = (main.width / 16) + 'px';//分成16等份來切區塊//"50px";
                data.nodeCSS["left"] = (+main.pageControl.incrementPageList[index - 1].nodeCSS['width'].split('px')[0] + +main.pageControl.incrementPageList[index - 1].nodeCSS['left'].split('px')[0]) + "px";
                break;
            case "+10":
                data.node.classList.add('double_arrow_right');
                data.nodeCSS["width"] = (main.width / 16) + 'px';//分成16等份來切區塊//"50px";
                data.nodeCSS["left"] = (+main.pageControl.incrementPageList[index - 1].nodeCSS['width'].split('px')[0] + +main.pageControl.incrementPageList[index - 1].nodeCSS['left'].split('px')[0]) + "px";
                break;
            case "max":
                data.node.classList.add('right_end');
                data.nodeCSS["width"] = (main.width / 16) + 'px';//分成16等份來切區塊//"50px";
                data.nodeCSS["left"] = (+main.pageControl.incrementPageList[index - 1].nodeCSS['width'].split('px')[0] + +main.pageControl.incrementPageList[index - 1].nodeCSS['left'].split('px')[0]) + "px";
                break;
            case "min":
                data.node.classList.add('left_end');
                data.nodeCSS["width"] = "50px";
                data.nodeCSS["left"] = "0px";
                break;
            default:
                throw new Error("Page Control Category not defined");
        }
        return data;
    };
    //9.刷新(遞增或遞減)切頁元件CSS與値
    this.set_incrementPageControl_CSS = function () {
        var main = this;
        for (var index = 0; index < main.pageControl.incrementPageList.length; index++) {
            var cssText = "";
            for (var propertyName in main.pageControl.incrementPageList[index].nodeCSS) {
                cssText += propertyName + ":" + main.pageControl.incrementPageList[index].nodeCSS[propertyName] + "; ";
            }
            main.pageControl.incrementPageList[index].node.style.cssText = cssText;
            main.pageControl.incrementPageList[index].node.textContent = main.pageControl.incrementPageList[index].value;
        }
    };
    //10.綁定(遞增或遞減)切頁事件
    this.bind_event_incrementPageControl = function () {
        var main = this;

        main.pageControl.incrementPageList.forEach(function (current, index, array) {
            switch (current.category) {
                case "min":
                    current.node.onclick = function (e) {
                        e.stopPropagation();
                        //
                        main.refresh_specifiedPageControl_pageIndex(1);
                        //main.pageControl.incrementPageList[3].node.textContent = main.currentPage + "/" + (main.refinedData.length - 1);
                        console.log('切頁:min');
                    };
                    break;
                case "-10":
                    current.node.onclick = function (e) {
                        e.stopPropagation();
                        var currentPage = ((main.currentPage - 10) >= 1) ? (main.currentPage - 10) : 1;
                        main.refresh_specifiedPageControl_pageIndex(currentPage);
                        //main.display_data(main.currentPage);
                        //main.pageControl.incrementPageList[3].node.textContent = main.currentPage + "/" + (main.refinedData.length - 1);
                        console.log('切頁: -10');
                    };
                    break;
                case "-1":
                    current.node.onclick = function (e) {
                        e.stopPropagation();
                        var currentPage = ((main.currentPage - 1) >= 1) ? (main.currentPage - 1) : 1;
                        main.refresh_specifiedPageControl_pageIndex(currentPage);
                        //main.display_data(main.currentPage);
                        //main.pageControl.incrementPageList[3].node.textContent = main.currentPage + "/" + (main.refinedData.length - 1);
                        console.log('切頁: -1');
                    };
                    break;
                case "+1":
                    current.node.onclick = function (e) {
                        e.stopPropagation();
                        var currentPage = ((main.currentPage + 1) <= (main.refinedData.length - 1)) ? (main.currentPage + 1) : (main.refinedData.length - 1);
                        console.log('+1', currentPage);
                        main.refresh_specifiedPageControl_pageIndex(currentPage);
                        //main.display_data(main.currentPage);
                        //main.pageControl.incrementPageList[3].node.textContent = main.currentPage + "/" + (main.refinedData.length - 1);
                        console.log('切頁: +1');
                    };
                    break;
                case "+10":
                    current.node.onclick = function (e) {
                        e.stopPropagation();
                        var currentPage = ((main.currentPage + 10) <= (main.refinedData.length - 1)) ? (main.currentPage + 10) : (main.refinedData.length - 1);
                        main.refresh_specifiedPageControl_pageIndex(currentPage);
                        //main.display_data(main.currentPage);
                        //main.pageControl.incrementPageList[3].node.textContent = main.currentPage + "/" + (main.refinedData.length - 1);
                        console.log('切頁: +10');
                    };
                    break;
                case "max":
                    current.node.onclick = function (e) {
                        e.stopPropagation();
                        var currentPage = (main.refinedData.length - 1);
                        main.refresh_specifiedPageControl_pageIndex(currentPage);
                        //main.display_data(main.currentPage);
                        //main.pageControl.incrementPageList[3].node.textContent = main.currentPage + "/" + (main.refinedData.length - 1);
                        console.log('切頁:max');
                    };
                    break;
            }

        });
    };
    //11.建立(指定頁)切頁元件(1~10頁)
    this.createSpecifiedPageControl = function () {
        var main = this,
            tmpNodes;
        //建立(指定頁)控制元件
        main.pageControlRootNode.specifiedPageRoot = main.new.create('div', 10, 'page_control');
        //Control DOM Collection cast to Array 
        tmpNodes = Array.prototype.slice.call(main.pageControlRootNode.specifiedPageRoot.children);//
        //console.log('Control Node', tmpNodes);
        //initial control property
        tmpNodes.forEach(function (current, index, array) {

            var data = {
                //物件索引
                index: index,
                //DOM元素
                node: current,
                //DOM對應的style設定
                nodeCSS: {
                    "position": "absolute",
                    "background-color": "#e8f3f3",
                    "border": "1px solid white",
                    //border-radius": "10px",
                    "width": (main.width / 16) + 'px',
                    "height": "50px",
                    "left": +main.pageControl.incrementPageList[2].nodeCSS.left.split('px')[0] + (main.width / 16 * (index + 1)) + "px",
                    "top": main.height + 12 + "px",
                    "text-align": "center",
                    //padding:"20px",
                    "line-height": "50px",  //下移
                    "visibility": "visible"
                },
                //選擇flag
                selected: false,
                //頁數
                pageIndex: (index + 1),//初始的預設値: 1 ~ 10
                //物件格式
                type: "page_control",
                //set selected flag func
                set_select: function (flag) {
                    this.selected = flag, this._change_backgroundColorStyle(this.selected);//依據flag變更css style
                },
                get_select: function () {
                    return this.selected;
                },
                //設定指定頁物件的pageIndex屬性
                set_pageIndex: function (pageIndex) {
                    //檢查是否為數字
                    var page = isNaN(Number(pageIndex)) ? undefined : pageIndex;
                    this.pageIndex = page;
                    this.node.textContent = this.pageIndex;
                    //依據pageIndex屬性設定:若非數字則隱藏DOM元素
                    this._change_visibility(this.pageIndex);
                },
                //取得指定頁物件的pageIndex屬性
                get_pageIndex: function () {
                    return this.pageIndex;
                },
                //(private)chagne self css style
                _change_backgroundColorStyle: function (flag) {
                    this.nodeCSS['backgroundColor'] = !!flag ? "#3399FF" : "rgb(232, 243, 243)";
                    this.node.style['backgroundColor'] = this.nodeCSS['backgroundColor'];
                },
                //(private)change DOM visibility style when visible is true or hidden
                _change_visibility: function (visible) {
                    this.node.style['visibility'] = !!visible ? "visible" : "hidden";
                }
            };
            main.pageControl.specifiedPageList.push(data);//物件注入指定頁屬性(陣列)
        });
        //console.log('page Control[specifiedPageList]:', main.pageControl.specifiedPageList);
        main.mainElement.appendChild(main.pageControlRootNode.specifiedPageRoot);//附加到主DOM上
    };
    //12.刷新(指定頁)切頁元件CSS與値
    this.set_specifiedPageControl_CSS = function () {
        var main = this;
        for (var index = 0; index < main.pageControl.specifiedPageList.length; index++) {
            var cssText = "";
            for (var propertyName in main.pageControl.specifiedPageList[index].nodeCSS) {
                cssText += propertyName + ":" + main.pageControl.specifiedPageList[index].nodeCSS[propertyName] + "; ";
            }
            main.pageControl.specifiedPageList[index].node.style.cssText = cssText;
            main.pageControl.specifiedPageList[index].node.textContent = main.pageControl.specifiedPageList[index].pageIndex;
        }
    };
    //刷新指定頁的pageIndex屬性
    this.refresh_specifiedPageControl_pageIndex = function (pageIndex) {
        var main = this,
            maxPage = (main.refinedData.length - 1),    //取得自定資料物件的最大頁數値
            last_digit_ten = Math.floor((main.currentPage - 1) / 10),
            digit_ten = Math.floor((pageIndex - 1) / 10);     //取得頁的非個位數的値(ex: 第10頁 => 0,第11頁 => 1)
        if (pageIndex < 0 || pageIndex > (main.refinedData.length - 1)) {
            throw new Error("[_refresh_specifiedPageControl_pageIndex] Error: PageIndex:" + pageIndex + " out of range");
        };
        //前一次的頁範圍與當前頁範圍不同才刷新指定頁物件
        if (last_digit_ten !== digit_ten) {
            //刷新指定頁物件的所有pageIndex屬性與DOM內容
            main.pageControl.specifiedPageList.forEach(function (current, index, array) {
                var pageIndex = (digit_ten * 10) + index + 1;//當前要設定的頁索引値,若超過自定資料物件的最大頁數則設為空
                if (pageIndex <= maxPage) {
                    current.set_pageIndex(pageIndex);
                }
                else {
                    current.set_pageIndex("");
                }
            });
        }
        //取消前一次指定頁的select屬性與背景色
        main.pageControl.specifiedPageList[(main.currentPage - 1) % 10].set_select(false);
        //設定當前頁
        main.currentPage = pageIndex;
        //設定當前指定頁的slect屬性與背景色
        main.pageControl.specifiedPageList[(main.currentPage - 1) % 10].set_select(true);
        //刷新顯示資料
        main.display_data(main.currentPage);
    };
    //13.綁定(指定頁)切頁事件
    this.bind_event_specifiedPageControl = function () {
        var main = this,
            currentIndex = 0,
            tmpCurrentPageIndex = 0;
        main.pageControl.specifiedPageList.forEach(function (current, index, array) {
            current.node.onclick = function (e) {
                //取消上次指定頁物件的select屬性並還原背景色
                main.pageControl.specifiedPageList[(main.currentPage - 1) % 10].set_select(false);

                //設定觸發click事件的物件索引
                currentIndex = index;
                tmpCurrentPageIndex = current.pageIndex;//取得物件內page屬性的值
                console.log("page click: " + currentIndex, 'Control object PageIndex:', current.pageIndex);
                main.currentPage = tmpCurrentPageIndex;//變更主物件的當前頁屬性値
                main.display_data(main.currentPage);//依據頁値刷新顯示資料
                main.pageControl.specifiedPageList[(main.currentPage - 1) % 10].set_select(true);//變更本次指定頁物件的select屬性並變更背景色
            }
        });
    };
    /*
        數據注入公用方法
    */
    //json data load and refine data for table format
    this.JsonDataLoad = function (JsonData, refinedFunc) {
        var data;
        if (!!JsonData) {
            data = (!!refinedFunc) ? refinedFunc(JsonData) : JsonData;//if has refine function then call it or just origin JSON
            this.data.push(data);
            this.dataIndex += 1;//目前所使用的厡始資料索引
            this.refine_JsonData(data);//將注入資料轉換成自訂格式物件(即refinedData[頁][欄][列])
            this.currentPage = 1;//定義當前頁屬性為第1頁
            this.display_data(this.currentPage);//使用自定格式物件刷新頁面
            this.pageControl.specifiedPageList[this.currentPage - 1].set_select(true);//變更指定頁物件的select屬性並變更背景
            this._refresh_columnSortName();//
            //頁狀態物件的元素屬性(node => DOM)
            this.pageControl.incrementPageList[3].node.textContent = this.currentPage + "/" + (this.refinedData.length - 1);
        }
    };
    /*
        數據元件
    */
    //重新定義輸入的數據轉成自訂格式 => [頁][欄][列] => 數據
    this.refine_JsonData = function (jsonData) {
        if (jsonData instanceof Array) {

            var everyRowCount = this.row - 1;//every page include header in row 0 so minus 1
            var currentPage,
                columnIndex,
                currentRowIndex,
                refinedData = this.refinedData = [];//給個指標,否則下面的func會指回Winodw

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
            //console.log('refined array', this.refinedData);//[page][column][row] => page:[column:[row:[]]]
        }
    };
    //數據寫入顯示元素
    this.display_data = function (pageIndex) {
        var main = this;
        for (var columnIndex = 0; columnIndex < main.refineNodeTable.length; columnIndex++) {
            for (var rowIndex = 0; rowIndex < main.refineNodeTable[columnIndex].length; rowIndex++) {
                //console.log("順序", main.columnSequence[columnIndex], main.refinedData[pageIndex][main.columnSequence[columnIndex]][rowIndex]);
                //欄位資料依據欄位陣列順序排列
                main.refineNodeTable[columnIndex][rowIndex].value = main.refinedData[pageIndex][main.columnSequence[columnIndex]][rowIndex] || "";
                main.refineNodeTable[columnIndex][rowIndex].node.textContent = main.refineNodeTable[columnIndex][rowIndex].value;
            }
        }
    };
    /*
        欄位數據交換
    */
    //11.欄位拖曳資料交換事件綁定--作欄與欄資料交換(Closure)
    this.event_bind_header = function () {
        var main = this,
            selectColumnA = -1,
            selectColumnB = -1;
        main.refineNodeTable.forEach(function (current, index, array) {
            if ('header' === current[0].type) {
                var i = 0;
                //console.log("Header", current);
                current[0].node.ondragstart = function (e) {
                    e.stopPropagation();
                    selectColumnA = index;//紀錄起始拖曳的索引值
                    this.style.opacity = "0.4";

                    console.log('start', selectColumnA);
                };
                current[0].node.ondragend = function (e) {
                    e.stopPropagation();
                    this.style.opacity = "";
                    console.log("dragend event", ++i);
                };

                //拉起來後就會一直不斷的觸發(即使滑鼠不動)--這是只要拉起來
                //current[0].node.ondrag = function (e) {
                //    console.log("drag event", e.currentTarget.textContent, ++i);
                //};
                //拉起來後就會一直不斷的觸發(即使滑鼠不動)--這是只要經過有的拖易物件滑過去,就會觸發
                current[0].node.ondragover = function (e) {
                    e.stopPropagation();
                    // prevent default to allow drop,By default, data/elements cannot be dropped in other elements. To allow a drop, we must prevent the default handling of the element.
                    e.preventDefault();//一定要終止此預設行為才能引發drop事件
                    console.log("dragover event", e.currentTarget.textContent, ++i);
                };
                //用來改拖曳進入時的元素底色
                current[0].node.ondragenter = function (e) {
                    e.stopPropagation();
                    console.log("dragendter event", e.currentTarget.textContent, ++i);
                    this.style.backgroundColor = "yellow";
                };
                //用來還原拖曳離開時的元素底色(改回原來的)
                current[0].node.ondragleave = function (e) {
                    e.stopPropagation();
                    console.log("dragendter event", e.currentTarget.textContent, ++i);
                    this.style.backgroundColor = "rgb(120, 207, 207)";
                };
                //拖曳放下確定時
                current[0].node.ondrop = function (e) {
                    e.stopPropagation();
                    this.style.backgroundColor = "rgb(120, 207, 207)";
                    //console.log("drop event", e, ++i);
                    selectColumnB = index;//紀錄結束拖曳的索引值
                    //console.log('end', selectColumnB);
                    main._swap(main.columnSequence, selectColumnA, selectColumnB);//交換起始與結束的索引順序
                    main._swap_columnSortNode_sortName(selectColumnA, selectColumnB);//交換排序的欄位數據
                    main.display_data(main.currentPage);
                };
                //若有drag事件就不會有mouseup事件
                //current[0].node.onmouseup = function (e) {
                //    console.log("mouseup  event", e.currentTarget.textContent,++i);
                //};
                //current[0].node.onmousedown = function (e) {
                //    console.log('mouse down', e);
                //};
            }
        })
    };
    //(私)物件屬性値交換
    this._swap = function (ary, a, b) {
        var tmp = ary[a];
        ary[a] = ary[b];
        ary[b] = tmp;
    };
    /*
        欄位排序元件
    */
    //12.建立欄位排序元件
    this.createSortNodeList = function () {
        var main = this,
            tmpNodes;
        //create column sort elements
        main.columnSortedRootNode = main.new.create('div', main.column, 'triangle_up');

        tmpNodes = Array.prototype.slice.call(main.columnSortedRootNode.children);//

        //set property into main object //iterator
        tmpNodes.forEach(function (currentElement, index, array) {
            var default_left = ((main.columnWidth * (index + 1))) - 15,//每個sort node的預設 X axis 位置
            //建立縮放元素(flexi bar)的資料結構
            data = {
                index: index,               //第幾條
                node: currentElement,       //DOM元素
                default_left: default_left,
                nodeCSS: {                  //設定用CSS
                    position: "absolute",
                    //border: "1px solid yellow", //只是用來看元件位置
                    //backgroundColor: "red",
                    //width: "10px",
                    //height: "10px",
                    left: default_left + "px",
                    top: "5px"
                },
                columnSortName: "",
                dataType: "",
                type: "column_sort"            //物件種類
            };
            main.columnSortNodeList.push(data);//加入columnSortNodeList陣列
        });
        //輸出到Grid元素上
        main.gridElement.appendChild(main.columnSortedRootNode);
    };
    //(私)數據注入時,刷新columnSortName屬性值
    this._refresh_columnSortName = function () {
        var main = this,
            dataType = ['number', 'number', 'number', 'number', 'number'];   //kai的json數據
        //['number', 'date', 'string', 'string', 'string'];  //借來的json數據
        main.columnSortNodeList.forEach(function (currentElement, index, array) {
            currentElement.columnSortName = main.refineNodeTable[main.columnSequence[index]][0].value;//取得json物件的屬性名稱(當排序的依據條件)
            currentElement.dataType = dataType[index];
        });
    };
    //13.刷新所有排序欄位元素的CSS或指定的CSS屬性
    this.set_columnSortNode_CSS = function (mainObj, columnIndex, propertyName) {
        var main = this;
        var main = mainObj || this;

        //設定所有縮放元素,若有指定起始index則取指定値當起始値
        for (var index = columnIndex || 0; index < main.columnSortNodeList.length; index++) {
            //若有指定設定名稱
            if (!!propertyName) {
                main.columnSortNodeList[index].node.style[propertyName] = main.columnSortNodeList[index].nodeCSS[propertyName];
            }
            else {
                //設定所有Css Style
                for (var property in main.columnSortNodeList[index].nodeCSS) {
                    main.columnSortNodeList[index].node.style[property] = main.columnSortNodeList[index].nodeCSS[property];
                }
            }
        }
    };
    //14.欄位排序元素click事件綁定
    this.bind_event_columnSortNode = function () {
        var main = this;
        main.columnSortNodeList.forEach(function (current, index, array) {
            var isToogle = false;//紀錄click的狀態
            current.node.onclick = function (event) {
                var sortName = main.columnSortNodeList[index].columnSortName,   //排序的指定欄位名稱
                    dataType = main.columnSortNodeList[index].dataType,         //排序的指定欄位資料格式
                    data = main.data[main.dataIndex],                           //排序的指定資料來源
                    newData;                                                    //排序完的新自訂資料物件[頁][欄][列]=>値
                /************************************************/
                /*
                    排序的CSS shape change
                */
                if (isToogle = !isToogle) {
                    current.node.classList.remove("triangle_up");
                    current.node.classList.add("triangle_down");
                }
                else {
                    current.node.classList.remove("triangle_down");
                    current.node.classList.add("triangle_up");
                }
                /************************************************/
                /*
                    依據條件重新排序數據
                */
                //若此欄位沒排序過
                if (!main.sortedObject[sortName]) {
                    //重新計算與排序
                    newData = main.quickSort(data, sortName, dataType);
                    //加入排序物件
                    main.sortedObject[sortName] = newData;
                }
                //反轉陣列
                main.sortedObject[sortName] = main.sortedObject[sortName].reverse();
                //重新定義數據元件
                main.refine_JsonData(main.sortedObject[sortName]);
                //console.log('sorted', sortName);
                //重新刷新指定頁物件並回到第一頁
                main.refresh_specifiedPageControl_pageIndex(1);
                //main.pageControl.specifiedPageList[(main.currentPage - 1) % 10]
                main.pageControl.incrementPageList[3].node.textContent = main.currentPage + "/" + (main.refinedData.length - 1);
                //console.log('sorted', main.refinedData);
            };
        });
    };
    //(私)排序元件的屬性(欄位名稱與資料格式)交換
    this._swap_columnSortNode_sortName = function (index1, index2) {
        var main = this;
        var tmpColumnSortName,
            tmpDataType;
        tmpColumnSortName = main.columnSortNodeList[index1].columnSortName;
        tmpDataType = main.columnSortNodeList[index1].dataType;
        main.columnSortNodeList[index1].columnSortName = main.columnSortNodeList[index2].columnSortName;
        main.columnSortNodeList[index1].dataType = main.columnSortNodeList[index2].dataType;
        main.columnSortNodeList[index2].columnSortName = tmpColumnSortName;
        main.columnSortNodeList[index2].dataType = tmpDataType;
    };
    //快速排序法(被比較的陣列,比較的物件屬性,比較的數據類型)
    this.quickSort = function quick_Sort(ary, conditionName, type) {
        var len = ary.length;
        if (len <= 1) {
            return ary.slice(0);
        }
        var left = [],
            right = [],
            mid = [ary[0]];//指標為輸入陣列的第0個
        for (var i = 1; i < len; i++) {
            /*************************************************************************************/
            var compared = false;
            switch (type) {
                //日期比較
                case 'date'://((!isNaN(Date.parse(ary[i][conditionName]))) && (!isNaN(Date.parse(mid[0][conditionName])))):
                    //Date
                    //console.log(data1, data2, (new Date(data1).getTime()), (new Date(data2).getTime()));
                    compared = ((new Date(ary[i][conditionName]).getTime()) < (new Date(mid[0][conditionName]).getTime()));

                    break;
                    //數字比較
                case 'number'://((!isNaN(Number(ary[i][conditionName]))) && (!isNaN(Number(mid[0][conditionName])))):
                    compared = parseInt(ary[i][conditionName], 10) < parseInt(mid[0][conditionName], 10);
                    break;
                    /*
                    //字串比較(不比較字串,資料太多會stack over flow)
                case "string":
                    console.log('開始比較字串');
                    //字串1長度少於字串2
                    if (ary[i][conditionName].length < mid[0][conditionName].length) {
                        compared = true;
                    }
                        //字串1長度大於字串2
                    else if (ary[i][conditionName].length > mid[0][conditionName].length) {
                        compared = false;
                    }
                    else {
                        //字串1長度等於字串2
                        for (var i = 0; i < ary[i][conditionName].length; i++) {
                            //只要有一個字元(字串1)大於字串2的
                            if (ary[i][conditionName].charCodeAt(i) > mid[0][conditionName].charCodeAt(i)) {
                                compared = false;
                            }
                        }
                        compared = true;
                    }
                    break;
                    */
                default:
                    compared = false;
            }
            /*************************************************************************************/
            if (compared) {//main._select_Compare(ary[i][conditionName],mid[0][conditionName],type)){//(ary[i][conditionName] < mid[0][conditionName]) {
                left.push(ary[i]);//左邊放比指標小的
            }
            else {
                right.push(ary[i]);//右邊放比指標大的
            }
        }
        //將左邊遞迴完的陣列串聯中間的再串聯右邊遞迴完的陣列
        return quick_Sort(left, conditionName, type).concat(mid.concat(quick_Sort(right, conditionName, type)));
    };
    //(棄用)依據比較的類型選擇比較方式並回傳比較結果(true/false)
    this._select_Compare = function (data1, data2, type) {
        switch (type) {
            //日期比較
            case "date":
                //console.log(data1, data2, (new Date(data1).getTime()), (new Date(data2).getTime()));
                return ((Date.parse(data1)) < (Date.parse(data2)));
                //字串比較
            case "string":
                //字串1長度少於字串2
                if (data1.length < data2.length) {
                    return true;
                }
                    //字串1長度大於字串2
                else if (data1.length > data2.length) {
                    return false;
                }
                else {
                    //字串1長度等於字串2
                    for (var i = 0; i < data1.length; i++) {
                        //只要有一個字元(字串1)大於字串2的
                        if (data1.charCodeAt(i) > data2.charCodeAt(i)) {
                            return false;
                        }
                    }
                    return true;
                }
                //數字比較
            case "number":
                return parseInt(data1) < parseInt(data2);
        }
    };
}

//
Grid.prototype.shared = {
    //建立DOM元素並設定class Name
    createElement:function(tagName, className){
        const element = document.createElement(tagName);
        if (!!className) {
            element.classList.add(className);
        };
        return element;
    },
    createCell: function () {


    }
}

/*
 *  Grid的單位物件
 *
 *  @param {String} type
 *  @param {Number} rowIndex
 *  @param {Number} columnIndex
 *  @param {Number} default_Width
 *  @param {Number} default_Left
 *  @param {Object} nodeCssObj
 *  @param {Object|HTMLElement} node
 *  @param {Object} nodeAttrObj
 *  @param {String} value
 */
function CellContainer(type,rowIndex,columnIndex,default_Width,default_Left,nodeCssObj,node,nodeAttrObj,value) {
    this.type = type;                   ////column導向       //(Math.floor(elementIndex / this.column) == 0) ? "header" : "body"//row導向
    this.row = rowIndex;                //column導向                    //Math.floor(elementIndex / this.column),  //row導向
    this.column = columnIndex;          //column導向            //(elementIndex % this.column),//列導向
    this.default_Width =  default_Width;//預設寬度:平均值
    this.default_Left = default_Left;   //預設X軸位置:固定寬度的間距
    this.nodeCSS = nodeCssObj;          //
    this.node = node;                   //
    this.nodeAttributes = nodeAttrObj;
    this.value = value;
    this.isSelected = false;
    this.deleFunc = [];
}
//DOTO ... 要繼承Cell_canvas的屬性(即把兩個物件綁在一起:base是Cell_canvas)  
CellContainer.prototype = {
    isMe: function (x, y) {
        const that = this;
        if (!that.isSelected && that.checkRange(x,y)) {
            that.isSelected = true;
            console.log(that.node.name);
            that.deleFunc.forEach(function (current,index,array){
                current.apply(null,x,y);
            });
        }
        else {
            that.isSelected = false;

        }
    },
    checkRange: function (x, y) {
        //if(x > )
    }
};


//模擬DOM紀錄DOM相關屬性値
function Cell_canvas (name, x, y, width, height, backgroundColor, border) {
    if (arguments.length !== arguments.callee.length) {
        throw new Error("parameter must have " + arguments.callee.length);
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
        //border
        this.border = border || 1;
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
//Cell prototype function and default value
Cell_canvas.prototype = {
    /*
        default prototype value
    */
    //pseudo dom name
    name: "",
    //畫布位移用的參數
    translate: new canvas_translate(0, 0),
    //translate_Y: 0,
    //位置與大小的數據
    style: {
        //寬度
        width: 0,
        //高度
        height: 0,
        //X axis
        left: 0,
        //Y axis
        top: 0,
        //border width
        border: 0,
        //background color
        backgroundColor: "yellow",
        //cursor style
        cursor: "default"
    },
    //typeface and size setting
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
    //畫矩形(清除後再畫會內縮1px)
    draw_rect: function (ctx) {
        //console.log('draw rectangle:' + this.name);
        //ctx.clearRect(this.style.left, this.style.top, this.style.width, this.style.height);
        ctx.fillStyle = this.style.backgroundColor;
        ctx.fillRect(this.style.left + this.style.border, this.style.top + this.style.border, this.style.width - (this.style.border * 2), this.style.height - (this.style.border * 2));
    },
    //清除矩形
    clear_rect: function (ctx) {
        ctx.clearRect(this.style.left, this.style.top, this.style.width, this.style.height);
    },
    //刷新矩型內的文字內容(先畫矩形再畫文字內容)
    refresh_textContent: function (ctx, text) {
        this.textContent = text || this.textContent;
        this.save_restore(ctx, this.clear_rect, this.draw_rect, this.draw_text);//清除矩形並重畫矩形再重畫文字內容
    },
    //清除畫布->位移畫布->畫矩形->寫字
    translate_and_refresh_textContent: function (ctx, text) {
        this.textContent = text || this.textContent;
        this.save_restore(ctx, this.clear_rect, this.translatePosition, this.draw_rect, this.draw_text);//清除矩形並重畫矩形再重畫文字內容
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
    //畫布位移
    translatePosition: function (ctx, trans_x, trans_y) {
        var x = trans_x || this.translate.x;
        var y = trans_y || this.translate.y;
        if (x !== 0 || y !== 0) {
            console.log("執行位移", x, y);
            ctx.translate(x, y);
        }
    },
    //隔離畫布狀態並執行操作方法,操作方法指標依序帶入參數
    save_restore: function (ctx) {
        ctx.save();//產生新的stack隔離上次的Style設定
        for (var i = 1; i < arguments.length; i++) {
            if (arguments[i].constructor !== Function) {
                console.log("此參數非函式", arguments[i]);
                continue;
            }
            arguments[i].call(this, ctx);//因為再呼叫function時的this指到window了,所以這邊帶入當前的物件
        }
        ctx.restore();
    },
    //設定canvas translate位置的數據
    set_translate: function (x, y) {
        this.translate.modify(x, y);
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
        //依據Canvas的font 設定
        this.font.color = color || this.font.color;//ex:'red', 'rgb(0,0,0)', 'rgba(0,0,0,1)', '#ffffffff'
        this.font.size = +size || this.font.size; //number(自動轉10進位)
        this.font.unit = unit || this.font.unit;//文字單位 ex: px, pt, em, %,...
        this.font.typeface = typeface || this.font.typeface;//字體 ex: 'Cibrili', '標楷體'
        this.font.textBaseline = textBaseline || this.font.textBaseline;
        this.font.textAlign = textAlign || this.font.textAlign;
    }
}
//translate當作共用的值(用來全部一起位移)
//用來設定canvas translate,只改一次,所有instance參考同一個値
function canvas_translate(x, y) {
    this.x = x;
    this.y = y;
};
//用來變更所有instance的値
canvas_translate.prototype.modify = function (x, y) {
    //console.log("變更translate =>x:" + x + " y:" + y);
    this.x = +x;
    this.y = +y;
};