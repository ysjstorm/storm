var hashBang = function(){
};

/**
 * The htState's Structure
 *
 * normalized: boolean
 * title: string
 * url: string
 * hash: string
 * data: hash
  **/

hashBang.prototype = {

	getState: function(){
		var sHash = window.location.hash;
		var htTemp = {};

		if(sHash !== ""){ 
			sHash = sHash.replace("#", "");
			var aData = sHash.split(/\??&/);

			$.each(aData, function(i, n){
				var temp = n.split(/=\??/);

				if(temp[0] != "_suid"){
					htTemp[temp[0]] = temp[1];
				}
			});
		}

		return htTemp;
	},

	setState: function(sTitle, htAddData){
		htHash = this.getState();
		for(var sName in htAddData){
			if(htAddData[sName] == ''){
				delete htHash[sName];
			}else {
				htHash[sName] = htAddData[sName];
			}
		}

		if(sTitle != ''){
			this.setTitle(sTitle);
		}

		window.location.hash = this.createState(htHash);
	},

	createState : function(htHash){
		i = 0;
		sHashUrl = '';
		for(var sName in htHash){
			if(i != 0){
				sHashUrl = sHashUrl + '&';
			}
			sHashUrl = sHashUrl + sName + '=' + htHash[sName];
			i++;
		}
		return sHashUrl;
	},

	setTitle : function(sTitle){
		document.title = sTitle;
	}
}