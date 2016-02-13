define(['app', 'lodash'], function(app, _) {
  'use strict';

  app.factory('mapData', [function() {
    var mapData = [];
    var returnObject = {};
    if (window.innerWidth <= 600)
      var isXS = true;

    var images = [{
      "label": "EU",
      "latitude": -5.02,
      "longitude": -167.66
    }
	];


		initData();

    //=======================================================================
    //
    //=======================================================================
    function initData() {
      var zoomTop = '10';
      var zoomRight = '10';
      if (isXS) {
        zoomTop = '40%';
        zoomRight = 10;
      }
      mapData = {
        "type": "map",
        "theme": "light",
        "responsive": {
          "enabled": true
        },
        "dataProvider": {
          "map": "worldEUHigh",
          "getAreasFromMap": true,
        },
        "areasSettings": {
          "alpha": 1,
          "autoZoom": true,
          "selectedColor": '#1fa65d',
          "rollOverColor": '#000000',
          "selectable": true,
          "color": '#000000',
          "outlineThickness": 2.5,
          "outlineColor": '#1fa65d',
        },
        "smallMap": {
          "enabled": false,
          "rectangleColor": '#069554',
          "backgroundAlpha": 0.5,
          "mapColor": '#069554',

        },
        "zoomControl": {
          "right": zoomRight,
          "top": zoomTop,
          "buttonFillAlpha": 1,
          "panStepSize":.25,
        },
        "export": {
          "libs": {
            "autoLoad": false,
          },
          "enabled": false,
          "position": "top-right",
          "buttonFillAlpha": 1,
        },
      }; //
      mapData.dataProvider.images = _.clone(images);
    } //$scope.initMap
    //=======================================================================
    //
    //=======================================================================
    function loadImage(image) {

        mapData.dataProvider.images.push({label:image.code,latitude:image.lat,longitude:image.long,scbdData:image.scbdData});

    }

    return {
      mapData: mapData,
      loadImage:loadImage
    };

  }]);
});