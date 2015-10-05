/*
    虛擬DOM
*/
var pseudoDOM = function () {
    this.width;
    this.height;
    this.left;
    this.top;
    this.textContent = "";
    this.backgroundColor;
    this.cursor;
}

pseudoDOM.prototype = {
    /*
        default prototype value
    */
    //寬度
    width: 0,
    //高度
    height: 0,
    //X axis
    left: 0,
    //Y axis
    top: 0,
    //text
    textContent: undefined,
    //background color
    backgroundColor: "yellow",
    //cursor style
    cursor: "default",
    /*
      draw function
    */
    //draw
    draw_rect: function (ctx, x, y, width, height) {
        ctx.save();
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(x + 1, y + 1, width - 1, height - 1);
        ctx.restore();
    }
}