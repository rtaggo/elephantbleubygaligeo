(function() {
	'use strict';
  GGO.UIManager = function(options) {
    this._options = options || {};
    this._stations = {
      elephantbleu : {

      },
      concurrence : {

      }
    };
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
      $('#dataExplorerCard').css({
        'max-height' : (this._viewSize.thirdHeight) + 'px'
      });
      $('#dataExplorerCard .slds-card__body').css({
        'height' :  (this._viewSize.thirdHeight-20) + 'px',
        'max-height' :  (this._viewSize.thirdHeight-20) + 'px'
      });
      this._setupListeners();
    },
    _setupListeners: function() {
      var self = this;
      $('#swiper_handle').swipe( {
        swipeStatus: function(event, phase, direction, distance, duration, fingers, fingerData, currentDirection) {
          if (phase !== "cancel" && phase !== "end") {
            if (fingerData[0].end.y < (self._viewSize.height - 20)) {
              var tempCardHeight = (self._viewSize.height - fingerData[0].end.y);
              $('#dataExplorerCard').css({
                'height': (tempCardHeight),
                'max-height': (tempCardHeight),
              });
              tempCardHeight -= 20;
              $('#dataExplorerCard .slds-card__body').css({
                'height' : tempCardHeight + 'px',
                'max-height' : tempCardHeight + 'px'
              });
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
      $('#locateUserIcon').click(function(e){
        GGO.EventBus.dispatch(GGO.EVENTS.ZOOMTOUSERLOCATION);
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
      // RENDERSTATIONS
      GGO.EventBus.addEventListener(GGO.EVENTS.RENDERSTATIONS, function(e) {
				var data = e.target;
        console.log('UIManager Received GGO.EVENTS.RENDERSTATIONS', data);
        self.renderStations(data);
			});
    },
    renderStations: function(data){
      var self = this;    
      var ctnr = $('#elephantbleuStations_Container').empty();
      var theUL = $('<ul class="slds-has-dividers_bottom-space"></ul>');
      this._stations.elephantbleu.stations = data.stations;
      $.each(data.stations, function(idx, val){
        theUL.append($('<li class="slds-item"></li>').append(val.renderHTML()));
      });
      theUL.find('.station-title_container .slds-icon').click(function(e){
        var stationId = $(this).attr('data-stationid');
        console.log('Click on icon to display information for station id = ' + stationId);
        self.findStationForDetails(stationId, 'elephantbleu');
      });
      theUL.find('.station-title_container .station-title').click(function(e){
        var stationId = $(this).attr('data-stationid');
        console.log('Click on on title for station id = ' + stationId + ' ==> TODO: zoom to it');
        GGO.EventBus.dispatch(GGO.EVENTS.ZOOMTOSTATION, {stationId: stationId, layer: 'elephantbleu'});
      });
      ctnr.append(theUL);
    },
    findStationForDetails: function(stationId, layer){
      try {
        var stations = this._stations[layer].stations;
        var nbStations = stations.length;
        var s, station;
        for (s = 0; s<nbStations; s++) {
          station = stations[s];
          if (station.getId() === stationId){
            this.showStationDetails(station);
            break;
          } 
        }
      } catch (e){
        console.error('Error in findStationForDetails method', e);
      }
    },
    showStationDetails: function(station){
      console.log('showStationDetails', station);
      var self = this;
      this._currentStation = station;
      this._detailsPanel = $('<div class="slds-panel slds-is-open slds-size_full station-details_panel" aria-hidden="false"></div>');
      var backBtn = $('<button class="slds-button slds-button_icon slds-button_icon-small slds-panel__back" title="Collapse Panel Header"></button>')
        .append($('<svg class="slds-button__icon" aria-hidden="true"><use xlink:href="/styles/slds/assets/icons/utility-sprite/svg/symbols.svg#back"></use></svg>'));
      this._detailsPanel
        .append($('<div class="slds-panel__header"></div>')
          .append(backBtn)
          .append($('<h2 class="slds-panel__header-title slds-text-heading_small slds-truncate" title="Panel Header">Station de lavage '+this._currentStation.getTitle()+'</h2>'))
        );
        backBtn.click(function(e){
        self._detailsPanel.remove();
      });
      var panelBody = $('<div class="slds-panel__body"></div>');
      // TODO: append station details in panelBody
      this._currentStation.buildDetailsView(panelBody);
      this._detailsPanel.append(panelBody);
      $('#mainAppContainer').prepend(this._detailsPanel);
    },
    _handleSwipeUpDownEnd: function(direction, data) {
      var self = this;
      var bCardHeight = 24;
      switch (direction) {
        case 'up' : 
          bCardHeight = (data.end.y < (this._viewSize.halfHeight - this._viewSize.heightThreshold)) ? this._viewSize.height : this._viewSize.thirdHeight;
          break;
        case 'down' : 
          bCardHeight = (data.end.y > (this._viewSize.thirdHeight + 2*this._viewSize.heightThreshold)) ? bCardHeight : this._viewSize.thirdHeight;
          break;
        default:
          console.log('Direction \''+direction+'\' not supported');
          bCardHeight = this._viewSize.thirdHeight;
      }
      $('#dataExplorerCard').css({
        'height' : bCardHeight + 'px',
        'max-height' : bCardHeight + 'px'
      });
      bCardHeight -= 20;
      $('#dataExplorerCard .slds-card__body').css({
        'height' : bCardHeight + 'px',
        'max-height' : bCardHeight + 'px'
      });
    },
    registerSwipes: function() {
      
    }
  };
})();
