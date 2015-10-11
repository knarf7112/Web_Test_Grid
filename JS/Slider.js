var Slider = function () {
    this.max;
    this.min;
    this.currentValue;

    //DOM
    this.mainDOM;
    //slider
    this.sliderDOM;
    //slider bar
    this.sliderBarDOM;
    //
    this.style;
    this.slider.style = {};
    this.sliderBar.style = {};
    //
    this.createSlider = function () {
        var main = this;
        main.mainDOM = main.createElement("div", undefined, "Slider");

        main.sliderDOM = main.createElement("div", "slider");

        main.sliderBarDOM = main.createElement("span", "sliderBar");
    };
};

Slider.prototype = {
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
    }
};

