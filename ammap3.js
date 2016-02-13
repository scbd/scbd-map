define(['text!./ammap3.html', 'app', 'lodash',

   'css!./ammap3',
   'css!/app/libs/flag-icon-css/css/flag-icon.min.css',
    'ammap',
    'ammap/plugins/export/libs/FileSaver.js/FileSaver.min',
    'ammap/plugins/export/libs/jszip/jszip.min',
    'shim!./worldEUHigh[ammap]',
    'shim!ammap/themes/light[ammap]',
    'shim!ammap/plugins/export/export.min[ammap]',
    'shim!ammap/plugins/export/libs/fabric.js/fabric.min[ammap]',
    'shim!ammap/plugins/export/libs/pdfmake/pdfmake.min[ammap]',
    'shim!ammap/plugins/export/libs/pdfmake/vfs_fonts[ammap]',
    'shim!ammap/plugins/export/libs/xlsx/xlsx.min[ammap]',
    'css!ammap/plugins/export/export.css',
    'css!./mappin.css',
    'scbd-angularjs-services/locale',
    './ammap3-service',
    './map-data',
], function(template, app, _) {
  'use strict';

  app.directive('ammap3', ['$timeout', '$http','locale','ammap3Service','mapData','$interpolate', function($timeout,  $http,locale,ammap3Service,mapDataService,$interpolate) {
    return {
      restrict: 'E',
      template: template,
      replace: true,
      require: '^ammap3',
      scope: {
        items: '=ngModel',
        // schema: '=schema',
         debug: '=debug',
        //      pins: '=pins'
      },
      link: function($scope, $element, $attr, ammap3) {
        $scope.items=[];
        setAttributes();


        $scope.map = AmCharts.makeChart("mapdiv", mapDataService.mapData); //jshint ignore:line
        // //=======================================================================
        // // call back init faster then watch
        // //=======================================================================
        // ammap3Service.registerGenerateMap(function(items) {
        //     $timeout(function() {
        //       $scope.items = items;
        //       //$scope.map.dataProvider.images = _.clone($scope.images);
        //       //ammap3.generateMap($scope.schema);
        //     });
        // });

        // //=======================================================================
        // // call back init faster then watch
        // //=======================================================================
        // ammap3Service.registerWriteMap(function() {
        //     $timeout(function() {
        //
        //       $scope.mapData=mapDataService.mapData;
        //
        //       ammap3.writeMap();
        //       //addClickListener();
        //       $scope.map.zoomIn();
        //     });
        // });
        //=======================================================================
        // call back init faster then watch
        //=======================================================================
        ammap3Service.registerWriteMap($scope.attr.mapId,function() {
            $timeout(function() {
                  // if($scope.zoomInOnLoad)
                  //   ammap3.writeMapZoomIn();
                  // else
                    ammap3.writeMap();

                //ammap3.updateCustomMarkers();
//setTimeout(function(){console.log('ssss');$scope.map.zoomIn(1);},6000);
            });
        });
        // //=======================================================================
        // // call back init faster then watch
        // //=======================================================================
        // ammap3Service.setMapObject($scope.map);

        //=======================================================================
        // call back init faster then watch
        //=======================================================================


        // //generates new map with new data
        // $(window).resize(function(){
        //   if(window.innerWidth<=600)
        //     $timeout(function(){
        //       alert('sss');
        //        $scope.isXS=true;
        //        $scope.map.dataProvider.images = _.clone($scope.images);
        //        ammap3.generateMap($scope.schema);
        //     });
        // });

        function setAttributes(){
          $scope.attr={};
          if($attr.mapId){
              $scope.attr.mapId=$attr.mapId;
              ammap3Service.setMapCtrl(ammap3);
          }


          if($attr.color)
              $scope.attr.color=$attr.color;
          else
              $scope.attr.color='#000000';

          if($attr.colorSelect)
              $scope.attr.colorSelect=$attr.colorSelect;
          else
              $scope.attr.colorSelect='#000000';

          if($attr.colorHover)
              $scope.attr.colorHover=$attr.colorHover;
          else
              $scope.attr.colorHover='#000000';

          if($attr.height)
              $scope.attr.height=$attr.height;
          else
              $scope.attr.height='500px';

          $element.find('#mapdiv').css('height',$scope.attr.height);

          if($attr.width)
                  $scope.attr.width=$attr.width;
          else
                  $scope.attr.width='100%';

          $element.find('#mapdiv').css('width',$scope.attr.width);
          if($attr.zoomInOnLoad)
            $scope.attr.zoomInOnLoad=$attr.zoomInOnLoad;

          if($attr.miniMap)
              $scope.attr.miniMap=$attr.miniMap;
          else
              $scope.attr.miniMap='false';
        }

        // $scope.map.addListener("click", function(event) {
        //   ammap3.closePopovers();
        //   var info = event.chart.getDevInfo();
        //   $timeout(function() {
        //     $("#mapdiv").find("#pin").popover('hide');
        //     if ($scope.debug)
        //         console.log({
        //           "latitude": info.latitude,
        //           "longitude": info.longitude,
        //           "all": info,
        //         });
        //   });
        // });

      }, //link

      //////controller
      controller: ["$scope", function($scope) {

        function closePopovers(pin) {
          // get map object
          var map = $scope.map;
          var cCode='';
          // go through all of the images
          for (var x in map.dataProvider.images) {
            if (x !== $(pin).data('i'))
            if(map.dataProvider.images[x].scbdData)
                cCode=map.dataProvider.images[x].scbdData.code;
              $($scope.map.dataProvider.images[x].externalElement).children('#pin-'+cCode).popover('hide');
          }

        }
        // this function will take current images on the map and create HTML elements for them
        function updateCustomMarkers() {
          // get map object

          var map = $scope.map;

          // go through all of the images
          for (var x in map.dataProvider.images) {
            // get MapImage object
            if(x===0)continue;
            // tempImage = new Image();
            // if (map.dataProvider.images[x].logo_s)
            //   tempImage.src = map.dataProvider.images[x].logo_s;
            // if (map.dataProvider.images[x].imgURL)
            //   tempImage.src = map.dataProvider.images[x].imgURL;

            var image = map.dataProvider.images[x];
//console.log(map.dataProvider.images);
            //if (map.dataProvider.images[x].label && map.dataProvider.images[x].label === 'EU') continue;
            // check if it has corresponding HTML element
            if ('undefined' == typeof image.externalElement && image.scbdData) {
              image.externalElement = generateMarker(x);
            }

            if ('undefined' !== typeof image.externalElement) {
              // reposition the element accoridng to coordinates
              image.externalElement.style.top = map.latitudeToY(image.latitude) + 'px';
              image.externalElement.style.left = map.longitudeToX(image.longitude) + 'px';
            }


          }
          $scope.map.addListener("positionChanged", updateCustomMarkers);
          $scope.map.addListener("clickMapObject", function(event) {



            var id = event.mapObject.id;
            if (event.mapObject.id === 'GL') {
              $scope.map.clickMapObject(getMapObject('DK'));
              id = 'DK';
            }
          });
        }

        // this function creates and returns a new marker element
        function generateMarker(imageIndex) {

          // if ($scope.schema === 'actions')
          //   return makeMarker(imageIndex, 'pin-cbd', 'pulse-cbd', 'app/img/cbd-leaf-green.svg');
          // if ($scope.schema === 'actors')
          //   return makeMarker(imageIndex, 'pin-actor', 'pulse-actor', 'app/img/ic_nature_people_black_24px.svg');
return makeMarker(imageIndex, 'pin','pin-invisi', '/app/libs/scbd-map/images/pins/invisi-pin.svg');
        }
        // this function creates and returns a new marker element
        function makeMarker(imageIndex, pinBaseClass, decretivePinClass, imagePath) {
          var image = $scope.map.dataProvider.images[imageIndex];
          var holder = document.createElement('div');
          holder.className = 'map-marker';
          holder.style.position = 'absolute';

//console.log(imageIndex);
          //create pin
          var pin = document.createElement('div');

pin.id = 'pin-'+image.scbdData.code;
          pin.className = pinBaseClass +' '+ decretivePinClass;
$(pin).data('i', imageIndex);
          $(pin).data('toggle', 'popover');

          $(pin).popover(generatePopover(imageIndex));
          pin.addEventListener('click', function(event) {
            closePopovers(pin);
            if ($(pin).data('bs.popover').tip().hasClass('in')) {

              if ($scope.map.dataProvider.images[imageIndex].latitude > 25)
                $scope.map.dataProvider.images[imageIndex].zoomLatitude = $scope.map.dataProvider.images[imageIndex].latitude + 10;

              if ($scope.map.dataProvider.images[imageIndex].latitude <= 25)
                $scope.map.dataProvider.images[imageIndex].zoomLatitude = $scope.map.dataProvider.images[imageIndex].latitude + 20;

              $scope.map.dataProvider.images[imageIndex].zoomLongitude = $scope.map.dataProvider.images[imageIndex].longitude;
              $scope.map.clickMapObject($scope.map.dataProvider.images[imageIndex]);
            }

          }, false);
          holder.appendChild(pin);

          // // create pulse
          // var pulse = document.createElement('div');
          // pulse.className = pulseClass;
          // holder.appendChild(pulse);

          // create image
          // var img = document.createElement('img');
          // img.setAttribute('src', imagePath);
          // img.setAttribute('height', '.01px');
          // img.setAttribute('width', '.01px');
          // img.className = 'leaf-image';
          // pin.appendChild(img);

          // append the marker to the map container

          $scope.map.dataProvider.images[imageIndex].chart.chartDiv.appendChild(holder);

          return holder;
        }
        //=======================================================================
        //
        //=======================================================================
        function generatePopover(imageIndex) {
          var image = $scope.map.dataProvider.images[imageIndex];
          var popoverTitleParsed = '';
          var popoverTemplateParsed = '';
          image.scbdData.codeLower=image.scbdData.code.toLowerCase();



         if(image.scbdData.isNPParty)
            image.scbdData.status='<span style="text-align:right;background-color: #428bca;" class="party-status" ng-if="isNPParty">Party</span>';

         else if(image.scbdData.isNPSignatory)
            image.scbdData.status='<span style="text-align:right;background-color: #5bc0de;" class="party-status" ng-if="isNPRatified">Signatory</span>';
         else
            image.scbdData.status='<span style="text-align:right;background-color: #888888;" class="party-status" ng-if="isNPSignatory">Non Party</span>';
popoverTemplateParsed = $interpolate($scope.map.scbdConfig.popOverTemplate)(image.scbdData);
         console.log('$scope.map.',image.scbdData);
              return {
                html: true,
                trigger: 'click',
                placement: 'top',
                title: $scope.map.scbdConfig.popOverTemplateTitle,
                template: popoverTemplateParsed,
              };


        } //$scope.legendHide


        //=======================================================================
        //
        //=======================================================================
        function generateMap() {


          //$scope.map.validateData(); // updates map with color changes

          //updateCustomMarkers();
        } //$scope.legendHide

        //=======================================================================
        //
        //=======================================================================
        function writeMapZoomIn() {
          writeMap();
          $scope.map.zoomIn();
        //  setTimeout(function(){console.log('ssss');$scope.map.clickMapObject($scope.map.dataProvider);},4500);


        } //$scope.legendHide

        //=======================================================================
        //
        //=======================================================================
        $scope.legendHide = function(legendItem) {
          var area2 = {};


          _.each($scope.map.dataProvider.areas, function(area) {

            if (legendItem.color === area.originalColor && area.mouseEnabled === true && 'GL' !== area.id) {
              area.colorReal = '#FFFFFF';
              area.mouseEnabled = false;

            } else if (legendItem.color === area.originalColor && area.mouseEnabled === false && 'GL' !== area.id) {
              area.colorReal = legendItem.color;
              area.mouseEnabled = true;

            }
            if (area.id.toUpperCase() === 'DK') {
              area2 = getMapObject('GL');
              //area2.originalColor = area.originalColor;
              area2.colorReal = area.colorReal;
              area2.mouseEnabled = area.mouseEnabled;
            }
          });
          if (legendItem.visible)
            legendItem.visible = false;
          else
            legendItem.visible = true;
          $scope.map.validateData();
        }; //$scope.legendHide

        //=======================================================================
        //
        //=======================================================================
        function toggleLegend(legend, color) { //jshint ignore:line

          var index = _.findIndex(legend, function(legendItem) {
            return legendItem.color == 'color';
          });
          legend[index].visible = false;
        } //toggleLeggend



        //=======================================================================
        //
        //=======================================================================
        function progressColorMap(mapTypeFunction) {

          hideAreas();

          _.each($scope.items, function(country) {

            if (!_.isEmpty(country.docs))
              _.each(country.docs, function(schema) {
                if (mapTypeFunction) mapTypeFunction(country, schema, $scope.schema);
              });
            else mapTypeFunction(country);
          });
          $scope.map.validateData(); // updates map with color changes
        } //progressColorMap

        //=======================================================================
        //
        //=======================================================================
        function pinMap() {
          updateCustomMarkers();
//$scope.map.validateData();
          //$scope.map.dataProvider.images.push(itemToImagePin(item));
          //$scope.map.validateData(); // updates map with color changes

          //updateCustomMarkers();

        } //progressColorMap

        //=======================================================================
        //
        //=======================================================================
        function partiesMap(country) {
          genTreatyCombinations();

          changeAreaColor(country.code, getPartyColor(country));
          buildProgressBaloonParties(country);

          legendTitle($scope.schema);

        } // aichiMap
        //=======================================================================
        //
        //=======================================================================
        function defaultPinMap(item) {


          if (item)
            $scope.map.dataProvider.images.push(itemToImagePin(item));

        } // aichiMap
        //=======================================================================
        //
        //=======================================================================
        function itemToImagePin(item) {


                return {
            //      zoomLevel: 5,
            //      scale: 0.5,
                  lable:'here',

                  latitude: item.lat,
                  longitude: item.long,
                };



          }//item to image






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
          return $scope.map.dataProvider.areas[index];
        } //getMapObject
        // //=======================================================================
        // //
        // //=======================================================================
        function getMap() {

          return $scope.map;
        } //getMapObject
        //=======================================================================
        //
        //=======================================================================
        function writeMap(mapData) {


          $scope.map.write("mapdiv");
          //$scope.map.validateData();
        } // writeMap
        //=======================================================================
        //
        //=======================================================================
        function getCtrlMapId() {

          return $scope.attr.mapId;
        } // writeMap

        //=======================================================================
        //
        //=======================================================================
        function getAttrs() {

          return $scope.attr;
        } // writeMap
        this.getAttrs =getAttrs;
        this.writeMapZoomIn=writeMapZoomIn;
        this.pinMap=pinMap;
        this.getCtrlMapId=getCtrlMapId;
        this.closePopovers = closePopovers;
        this.getMapObject = getMapObject;
        this.getMap = getMap;
        this.writeMap = writeMap;
        this.generatePopover = generatePopover;
        this.generateMap = generateMap;
        this.defaultPinMap=defaultPinMap;
        this.progressColorMap = progressColorMap;
      }],
    }; // return
  }]); //app.directive('searchFilterCountries
}); // define
