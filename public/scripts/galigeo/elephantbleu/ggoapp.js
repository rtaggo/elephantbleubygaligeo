(function() {
	'use strict';
	GGO.GGOApp = function(options) {
		this._options = options || {};
		this._init();
	};

	GGO.GGOApp.prototype = {
		_init: function() {
      var self = this;
			var modulesOptions = {
				app: this
			};
			this._uiManager = new GGO.UIManager(modulesOptions);
			/*
			this._dataManager = new GGO.DataManager(modulesOptions);
			this._mapManager = new GGO.MapManager(modulesOptions);
			this._uiManager = new GGO.UIManager(modulesOptions);
			this._sireneExplorer = new GGO.SireneExplorer(modulesOptions);
			this._posAnalyzer = new GGO.POSAnalyzer(modulesOptions);
            */
            
      setTimeout(function(e){
        $('#appLauncher').fadeOut(1000, function(e){
          console.log('fade out completed');
          $('#mainAppContainer').removeClass('slds-hide');
          self._uiManager.registerSwipes();
        });
      }, 3000);
    }
	};
})();
