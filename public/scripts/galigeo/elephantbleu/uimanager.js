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
      this._viewSize.thirdHeight = (this._viewSize.height/3);
      this._viewSize.heightThreshold = (this._viewSize.height/7);
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
          if (phase !== "cancel" && phase !== "end") {
            if (fingerData[0].end.y < (self._viewSize.height - 20)) {
              var tempCardHeight = (self._viewSize.height - fingerData[0].end.y);
              $('#dataExplorerCard').css('height', tempCardHeight);
            } 
            if (fingerData[0].end.y < (self._viewSize.halfHeight)) {
              $('#locateuser_container').addClass('slds-hide');
            } else {
              $('#locateuser_container').removeClass('slds-hide');
            }
          } else if ( phase === "end") {
            console.log('ENDED fingerData: ' + JSON.stringify(fingerData[0]));
            self._handleSwipeUpDownEnd(direction, fingerData[0]);
          }
        },
        //Default is 75px, set to 0 for demo so any distance triggers swipe
        threshold:0
      });
      $('#layerSwitcherIcon').click(function(e){
        $('#layerSwitcherCard').toggleClass('slds-hide');
      });
      $('#layerSwitcherCard .slds-card__header button').click(function(e){
        $('#layerSwitcherCard').addClass('slds-hide');
      });
      $('#layerSwitcherCard').css('height', this._viewSize.thirdHeight + 'px');
      $('.basemap_icons_container .basemap_icon').click(function(e){
        var basemapClicked = $(this).attr('data-basemap');
        $(this).siblings().removeClass('selected');
        $(this).addClass('selected');
        console.log('Basemap to display: ' + basemapClicked);
        GGO.EventBus.dispatch(GGO.EVENTS.SWITCHBASEMAP, basemapClicked);
      });

      $('.map_details_container .layer_details').click(function(e){
        var layerClicked = $(this).attr('data-layer');
        $(this).toggleClass('selected');
        var isVisible = $(this).hasClass('selected');
        console.log('Layer ' + layerClicked + ' is toggled to ' + (isVisible?'visible': 'hidden'));
      });
    },
    _handleSwipeUpDownEnd: function(direction, data) {
      var self = this;
      var bCardHeight = 24;
      switch (direction) {
        case 'up' : 
          bCardHeight = (data.end.y < (this._viewSize.halfHeight - this._viewSize.heightThreshold)) ? this._viewSize.height : this._viewSize.thirdHeight;
          break;
        case 'down' : 
          bCardHeight = (data.end.y > (this._viewSize.thirdHeight + this._viewSize.heightThreshold)) ? bCardHeight : this._viewSize.thirdHeight;
          break;
        default:
          console.log('Direction \''+direction+'\' not supported');
          bCardHeight = this._viewSize.thirdHeight;
      }
      $('#dataExplorerCard').css('height', bCardHeight + 'px');
    },
    registerSwipes: function() {
      
    }
  };
})();
