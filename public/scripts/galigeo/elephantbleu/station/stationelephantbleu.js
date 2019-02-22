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
        console.warn('GGO.StationElephantBleu.renderHTML need to be implemented');
        var content = $('<div></div>');
        content.append($('<span></span>').text('Station de lavage ' + this._data.nom));
        return content;
      },
    };
    GGO.StationElephantBleu.prototype = $.extend(true, {}, GGO.Station.prototype, GGO.StationElephantBleu.prototype);
  })();