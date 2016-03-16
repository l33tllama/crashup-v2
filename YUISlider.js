// ############ YUI Slider for showing current year progress ########

function YUISlider(className){
	this.slider = null;
	this.className = className;
};

YUISlider.prototype.renderSlider = function(maxDay, sliderLength, callback){
	//setTimeout(this.checkIfRendered, 10);
	if (this.slider){
		this.slider = null;
	}
	var theClassName = this.className;
	var me = this;
	
	YUI().use('slider', function (Y) {

		me.slider = new Y.Slider({length: sliderLength, max: maxDay});
		me.slider.render(theClassName);
		console.log("rendered slider");
		callback();
	});
};

// Re-render slider (when year changes)
YUISlider.prototype.reRender = function(max, length, callback){
    console.log("RE-rendering slider with " + max + " days in the yr +" + length +  " length");
	this.slider.set('legnth', max);
       callback();
	//this.renderSlider(max, length, callback);
    //this.slider.setValue(0);
};
/*
YUISlider.prototype.stepForward = function(){
	this.slider.setValue(this.slider.getValue() + 1);
};
YUISlider.prototype.stepBack = function(){
	this.slider.setValue(this.slider.getValue() - 1);
};*/

// Update day on slider
YUISlider.prototype.updateDay = function(day){
	var doy = day.getDOY();
	this.slider.setValue(doy);
};
YUISlider.prototype.onSlideStart = function(callback){
	this.slider.on("slideStart", callback);
};
YUISlider.prototype.onSlideEnd = function(callback){
	this.slider.on("slideEnd", callback);	
	//if(this.slider != null){} else {console.log("Slider is null?? :(");}
};
YUISlider.prototype.onValueChange = function(callback){
	this.slider.after("valueChange", callback);
	//if(this.slider != null && callback != null){}
}
YUISlider.prototype.getValue = function(){
	return this.slider.getValue();
};
YUISlider.prototype.resize = function(size){
    if(this.slider != undefined && this.slider != null){
        this.slider.set('length', size);
    }
};
