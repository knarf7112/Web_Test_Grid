/*
    canvas Grid
*/

var Grid = function () {
    /*
        Property
    */


    /*
        Function
    */
    //1.create display component
    this._create_DisplayObject = function () {

    };

    //2.
    this._set_DisplayObject = function () {

    }
}

//
Grid.prototype = {
    createCell: function () {


    }
}

/*
    Cell Function
*/
function Cell(name, index,left, top, width, height) {
    this.name = name;
    this.index = index;
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
}

Cell.prototype = {
    name: "",
    index: 0,
    group: 0,
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    type: ""
}