//########### Buttons ##############################################
function ControlButton(buttonID){
	this.button = document.getElementById(buttonID);
};

ControlButton.prototype.createButton = function(buttonID){
	//var newButton = 
	//buttons.push(newButton);
	this.button = document.getElementById(buttonID);
	//return document.getElementById(buttonID);;
};

ControlButton.prototype.onButtonClick = function(callback){
	//button.onclick = function(e){
	this.button.onclick = function(e){
		e.preventDefault();
		callback();
	}
};

ControlButton.prototype.hide = function(){
    //this.button.setAttribute("hidden", "true");
    this.button.disabled = true;
};

ControlButton.prototype.show = function(){
    //this.button.removeAttribute("hidden");
    this.button.disabled = false;
}