define(['app', 'lodash'], function(app, _) {
  'use strict';

  app.factory('mapData', [function() {
    var mapData = {};

    if (window.innerWidth <= 600)
      var isXS = true;

    var images = {};

    var euImageLabel = [{
      "label": "EU",
      "latitude": -5.02,
      "longitude": -167.66
    }
	];




    //=======================================================================
    //
    //=======================================================================
    function initData(mapId) {
      var zoomTop = '10';
      var zoomRight = '10';
      if (isXS) {
        zoomTop = '40%';
        zoomRight = 10;
      }
      mapData[mapId] = {
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
      mapData[mapId].dataProvider.images=[];
      mapData[mapId].dataProvider.images.push(euImageLabel);
    } //$scope.initMap

    function setAttrubutes(mapId,attrs){
          if(attrs.color)
              mapData[mapId].areasSettings.color=attrs.color;

          if(attrs.selectedColor)
              mapData[mapId].areasSettings.selectedColor=attrs.selectedColor;

          if(attrs.rollOverColor)
              mapData[mapId].areasSettings.rollOverColor=attrs.rollOverColor;

          // if(attrs.smallMap.enabled)
          //     mapData[mapId].smallMap.enabled=attrs.smallMap.enabled;


    }
    //=======================================================================
    //
    //=======================================================================
    function loadImage(mapId,image) {

        mapData[mapId].dataProvider.images.push({latitude:image.lat,longitude:image.long,scbdData:image.scbdData});

    }
    //=======================================================================
    //
    //=======================================================================
    function getMapData(mapId) {
        return mapData[mapId];
    }

    return {
      initData:initData,
      getMapData:getMapData,
      setAttrubutes:setAttrubutes,
      mapData: mapData,
      loadImage:loadImage
    };

  }]);
});