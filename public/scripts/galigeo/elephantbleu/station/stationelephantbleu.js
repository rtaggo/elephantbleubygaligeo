(function() {
    'use strict';
    GGO.StationElephantBleu = function(data) {
      this._data = data;
    };
    GGO.StationElephantBleu.prototype = {
      getDetails: function(){
        console.warn('GGO.StationElephantBleu.getDetails need to be implemented');
      },
      renderHTML: function(){
        var content = $('<div data-stationid="'+this._data.id+'"></div>');
        content
          .append($('<div class="station-title_container"></div>')
            .append($('<span class="station-title" data-stationid="'+this._data.id+'"></span>').text('Station ' + this._data.nom))
            .append($('<span class="station-distance"></span>').text(GGO.formatDistance(this._data.distance)))
            .append($('<svg class="slds-icon slds-icon_x-small slds-icon-text-default slds-m-left_small slds-shrink-none" aria-hidden="true" data-stationid="'+this._data.id+'"><use xlink:href="/styles/slds/assets/icons/utility-sprite/svg/symbols.svg#chevronright"></use></svg>')));
        var hasServices = false;            
        var servicesContent = $('<div class="services-content"></div>');
        var picto_hp_src = './images/pictos/picto_hp.png';
        var picto_portique_src = './images/pictos/picto_portique.png';
        var picto_aspi_src = './images/pictos/picto_aspirateur.png';
        var picto_gonfleur_src = './images/pictos/picto_gonfleur.png';
        var hasHP = false;
        if (this._data.piste_hp !== null && this._data.piste_hp>0) {
          servicesContent
            .append($('<div class="service-type"></div>')
              .append($('<img src="' + picto_hp_src +'"/>'))
              .append($('<div>' + this._data.piste_hp + ' Piste(s) Haute pression</div>')));
          hasServices = true;
          hasHP = true;
        }
        if (this._data.piste_pl) {
          servicesContent
            .append($('<div class="service-type"></div>')
              .append($('<img src="' + picto_hp_src +'"/>'))
              .append($('<div>Piste Utiliraire</div>')));
          hasServices = true;
          hasHP = true;
        }
        if (this._data.rouleau_lavage !== null && this._data.rouleau_lavage>0) {
          servicesContent
            .append($('<div class="service-type"></div>')
              .append($('<img src="' + picto_portique_src +'"/>'))
              .append($('<div>' + this._data.rouleau_lavage + ' Rouleau(x) de lavage</div>')));
          hasServices = true;
        }
        if (this._data.gonfleur) {
          servicesContent
            .append($('<div class="service-type"></div>')
              .append($('<img src="' + picto_gonfleur_src +'"/>'))
              .append($('<div>Gonfleur</div>')));
          hasServices = true;
          hasHP = true;
        }
        if (this._data.aspirateur !== null && this._data.aspirateur>0) {
          servicesContent
            .append($('<div class="service-type"></div>')
              .append($('<img src="' + picto_aspi_src +'"/>'))
              .append($('<div>' + this._data.aspirateur + ' Rouleau(x) de lavage</div>')));
          hasServices = true;
        }
        
        if (hasServices) {
          content.append(servicesContent);
        }
        return content;
      },
      buildDetailsView: function(container){

      },  
      getId: function(){
        return this._data.id;
      },
      getTitle: function(){
        return this._data.nom;
      }
    };
    GGO.StationElephantBleu.prototype = $.extend(true, {}, GGO.Station.prototype, GGO.StationElephantBleu.prototype);
  })();