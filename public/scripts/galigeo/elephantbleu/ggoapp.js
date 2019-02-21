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
      this.wakeupApp();
    },
    wakeupApp: function() {
      var self = this;
      var wakeupUrl = '/services/rest/elephantbleu';
      $.ajax({
        type: 'GET',
        url: wakeupUrl,
        success: function(data) {
          console.log(' WakeUp Response : ', data);
          self.handleWakeupApp(data);
        },
        error:  function(jqXHR, textStatus, errorThrown) { 
          if (textStatus === 'abort') {
            console.warn('WakeUp Request aborted');
          } else {
            console.error('Error for WakeUp request: ' + textStatus, errorThrown);
          }
        }
      });
    },
    handleWakeupApp: function(data) {
      if (data.code === 200) {
        setTimeout(function(e){
          $('#appLauncher').fadeOut(1000, function(e){
            console.log('fade out completed');
            $('#mainAppContainer').removeClass('slds-hide');
          });
        }, 3000);
      }
    }
  };
})();
