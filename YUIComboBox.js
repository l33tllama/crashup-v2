function YUIComboBox(elementID){
	this.elementID = elementID;
};


YUIComboBox.prototype.getValueOnChange = function(callback){
	
	var selector;
	var elementID = this.elementID;
	
	YUI().use('node', function(Y){
		selector = Y.one(elementID);
		selector.on("change", function(e){
			e.preventDefault();
			selector.get('options').each(function(){
				if (this.get('selected')){
					//console.log("Year change: " + this.get("text"));
					callback(this.get("value"));
				}
			});
		});
	});
};

YUIComboBox.prototype.setValue = function(value){
	var elementID = this.elementID;
	YUI().use('node', function(Y){
		var yearSelect = Y.one(elementID);
		yearSelect.get('options').each(function(){
			if(this.get("value") == ""+value){
				this.set("selected", "selected");	
			} else {
				this.set("selected", "");
			}
		});
	});
}

