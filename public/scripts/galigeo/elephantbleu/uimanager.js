(function() {
	'use strict';
  GGO.UIManager = function(options) {
		this._options = options || {};
		this._init();
	};

  GGO.UIManager.prototype = {
    _init: function() {
      this._viewSize = {
        width: $(window).width(),
        height: $(window).height()
      };
      this._viewSize.halfHeight = (this._viewSize.height/2);
      this._viewSize.heightThreshold = (this._viewSize.height/4);
      this._setupListeners();
    },
    _setupListeners: function() {
      var self = this;
      $('#swiper_handle').swipe( {
        /*
        wipeUp : function(event, direction, distance, duration, fingerCount, fingerData) {
          $('#traceDiv').append($('<p>Swipe ' + direction +'</p>'));
          console.log("Swipe " + direction);
        },
        swipeDown : function(event, direction, distance, duration, fingerCount, fingerData) {
          $('#traceDiv').append($('<p>Swipe ' + direction +'</p>'));
          console.log("Swipe " + direction);
        },
        */
        swipeStatus: function(event, phase, direction, distance, duration, fingers, fingerData, currentDirection) {
          console.log('fingerData: ' + JSON.stringify(fingerData[0]));
          if (phase !== "cancel" && phase !== "end") {
            var tempCardHeight = (self._viewSize.height - fingerData[0].end.y) + 'px';

            $('#mainAppContainer .bottom-card').css('height', tempCardHeight);
          } else if ( phase === "end") {
            console.log('ENDED fingerData: ' + JSON.stringify(fingerData[0]));
            self._handleSwipeUpDownEnd(direction, fingerData[0].end);
          }
        },
        //Default is 75px, set to 0 for demo so any distance triggers swipe
        threshold:0
      });
    },
    _handleSwipeUpDownEnd: function(direction, data) {

    },
    registerSwipes: function() {
      
    }
  };
})();
