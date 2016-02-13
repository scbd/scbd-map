define(['text!./zoom-map.html', 'app', 'lodash',
    'ammap',
    'shim!./worldEUHigh[ammap]',
    'shim!ammap/themes/light[ammap]',
], function(template, app, _) {
  'use strict';

  app.directive('zoomMap', ['$location','$timeout', function($location,$timeout) {
    return {
      restrict: 'EAC',
      template: template,
      replace: true,
      require:  '^zoomMap',
      scope: {
        zoomTo: '=zoomTo',
      },
      link: function($scope, $element, $attr, zoomMap) {



        $scope.$watch('zoomTo', function() {
          zoomTo();
        }); //

        initMap();
        zoomMap.writeMap();


        //=======================================================================
        //
        //=======================================================================
        function zoomTo() {
          if ($scope.zoomTo)
            $scope.map.clickMapObject(zoomMap.getMapObject(_.clone($scope.zoomTo).toUpperCase()));
        } //$scope.legendHide


        $scope.map.addListener("clickMapObject", function(event) {

            if(event.mapObject.id != $scope.zoomTo)
            $timeout(function(){
                $location.url('/actions/countries/'+event.mapObject.id.toUpperCase());
            });

        }); //$scope.map.addListener("clickMapObject",

        $scope.images = [{
          "label": "EU",
          "latitude": -5.02,
          "longitude": -167.66
        }];
        //=======================================================================
        //
        //=======================================================================
        function initMap() {
          $scope.mapData = {
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
              "autoZoom": true,
              "selectedColor": "#428bca",
              "rollOverColor": "#428bca",
              "selectable": true,
              "color": "#e5e5e5",
            },
            zoomControl:{'homeButtonEnabled':false}




          }; //
          $scope.mapData.images = _.clone($scope.images);
        } //$scope.initMap
        //not working


      }, //link
      //////controller
      controller: ["$scope", function($scope) {


        //=======================================================================
        //
        //=======================================================================
        function generateMap(schema) {


          if (!schema) return;
          if (schema === 'parties')
            progressColorMap(partiesMap);
          else
            pinMap(defaultPinMap);
        } //$scope.legendHide


        //=======================================================================
        //
        //=======================================================================
        function writeMap(mapData) {

          if (!mapData) mapData = getMapData();
          $scope.map = AmCharts.makeChart("mapdiv", mapData); //jshint ignore:line
          $scope.map.write("mapdiv");

        } // writeMap

        //=======================================================================
        //
        //=======================================================================
        function progressColorMap(mapTypeFunction) {

          hideAreas();
          $scope.legendTitle = ""; // rest legend title
          buildProgressBaloonParties({
            'code': 'GL'
          });
          _.each($scope.items, function(country) {

            if (!_.isEmpty(country.docs))
              _.each(country.docs, function(schema) {
                if (mapTypeFunction) mapTypeFunction(country, schema, $scope.schema);
              });
            else mapTypeFunction(country);
          });
          $scope.map.validateData(); // updates map with color changes
        } //progressColorMap


        // //=======================================================================
        // //
        // //=======================================================================
        function changeAreaColor(id, color, area) {
          if (!area)
            area = getMapObject(id);
          area.colorReal = area.originalColor = color;

          if (id === 'DK') {
            var area2 = getMapObject('GL');
            area2.colorReal = area.colorReal;
            area2.originalColor = area.originalColor;
          }

        } //getMapObject



        //=======================================================================
        //
        //=======================================================================
        function getMapData() {

          return $scope.mapData;
        }

        // //=======================================================================
        // // changes color of all un colored areas
        // //=======================================================================
        function hideAreas(color) {
          // Walkthrough areas
          if (!color) color = '#dddddd';
          _.each($scope.map.dataProvider.areas, function(area) {
            if (area.id !== 'divider1') {
              area.colorReal = area.originalColor = color;
              area.mouseEnabled = true;
              area.balloonText = '[[title]]';
            }
          });
        } //hideAreas(color)

        // //=======================================================================
        // //
        // //=======================================================================
        function getMapObject(id) {

          var index = _.findIndex($scope.map.dataProvider.areas, function(area) {
            return area.id === id;
          });
          if(index < 0)
            return 0;
          else
            return $scope.map.dataProvider.areas[index];
        } //getMapObject



        this.getMapObject = getMapObject;
        this.writeMap = writeMap;
        this.getMapData = getMapData;
        this.generateMap = generateMap;
        this.progressColorMap = progressColorMap;
      }],
    }; // return
  }]); //app.directive('searchFilterCountries
}); // define
