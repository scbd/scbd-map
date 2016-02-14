define(['app',
  'lodash',
  'text!./pin-popup.html',
  './long-lat',
  './map-data',
], function(app, _, defaultPinPopOver) {
  'use strict';

  app.factory('ammap3Service', ["locale", "$q", "longLatServ", "mapData", function(locale, $q, longLatServ, mapData) {

    var countries = null;
    var mapObject = {};
    var mapCtrls = {};
    var pinLibrary = ['default', 'invisi-pin'];
    var pinImgLibrary = [];
    pinImgLibrary['invisi-pixel'] = '/app/libs/scbd-map/images/pins/invisi-pin.svg';

    var pinPopOverLibrary = [];
    pinPopOverLibrary['default'] = defaultPinPopOver;


    //=======================================================================
    //
    //=======================================================================
    function loadCountries(mapId,data) {
      countries = data;
      return bindCountryData(mapId).then(function(mapCtrl) {

        mapCtrl.getMap().validateData();
        if (mapCtrl.getAttrs().zoomInOnLoad)
          mapCtrl.getMap().zoomIn();

        mapCtrl.pinMap();
        return;
      });
    }

    //=======================================================================
    //
    //=======================================================================
    function setMapObject(map) {
      mapObject = map;
    }

    //=======================================================================
    //
    //=======================================================================
    function bindCountryData(mapId) {
      var deferred = $q.defer();
      deferred.resolved = 0;

      var cancelId = setInterval(function() {
        if (mapCtrls[mapId] && countries) {
          clearInterval(cancelId);
          var image = {};
          var lat;
          var long;
          var country = 0;
          _.each(mapCtrls[mapId].getMap().dataProvider.areas, function(mapArea) {


            country = _.find(countries, function(c) {
              return (c.code === mapArea.id);
            });

            if (!country) {
              //country = normalizeCountryData({});
              country={};
              country.code = mapArea.id;
            } else
              country.nameLocalized = country.name[locale];


            //mapCtrls[mapId].getMapObject(country.code).scbdData=country;
            long = mapCtrls[mapId].getMap().getAreaCenterLongitude(mapCtrls[mapId].getMapObject(country.code));
            lat = mapCtrls[mapId].getMap().getAreaCenterLatitude(mapCtrls[mapId].getMapObject(country.code));

            image.lat = lat;
            image.long = long;
            image.code = mapArea.id;
            //image =_.find(longLatServ.data, function(c){return(c[0]===country.code); });
            image.scbdData = country;
            mapData.loadImage(mapId, image);
          });

          deferred.resolved = 1;
          deferred.resolve(mapCtrls[mapId]);

          return deferred.promise;
        }

      }, 500);


      setTimeout(function() {
        clearInterval(cancelId);
        if (!(mapCtrls[mapId].getMap() && countries))
          throw ('Error: no controller or map initialazed on mapID:' + mapId + ' or no country data loaded');

      }, 7000);
      return deferred.promise;
    }

    //=======================================================================
    //
    //=======================================================================
    function setMapCtrl(mapCtrl) {

      if (mapCtrl.getCtrlMapId()) {

        mapCtrls[mapCtrl.getCtrlMapId()] = mapCtrl;


      } else
        throw "Error: thrying to register a map controler in the ammap3Service with out  a mapID";
    }



    //=======================================================================
    //
    //=======================================================================
    function getCountries() {
      var deferred = $q.defer();
      deferred.resolved = 0;

      var cancelId = setInterval(function() {
        if (countries) {

          deferred.resolve(countries);
          deferred.resolved = 1;
          clearInterval(cancelId);
          return deferred.promise;
        }
      }, 100);
      setTimeout(function() {
        if (!deferred.resolved) {
          deferred.reject('Receiving country data timed out.');
          clearInterval(cancelId);
        }
      }, 7000);
      return deferred.promise;
    }

    //=======================================================================
    //
    //=======================================================================
    function setGlobalClickListener(mapId, onClickToDo) {

      var cancelId = setInterval(function() {
        if (mapCtrls[mapId].getMap()) {
          clearInterval(cancelId);
          return mapCtrls[mapId].getMap().addListener("click", onClickToDo);
        }
      }, 500);

      setTimeout(function() {
        clearInterval(cancelId);
        if (!mapCtrls[mapId].getMap())
          throw (' setGlobalClickListener Error: no controller or map initialazed on mapID:' + mapId);

      }, 7000);
    } //setGlobalClickListener

    //=======================================================================
    //
    //=======================================================================
    function setCountryClickListener(mapId, onClickToDo) {

      var cancelId = setInterval(function() {
        if (mapCtrls[mapId].getMap()) {
          clearInterval(cancelId);
          // console.log(mapCtrls[mapId].getMap());
          return mapCtrls[mapId].getMap().addListener("clickMapObject", onClickToDo);
        }
      }, 500);

      setTimeout(function() {
        clearInterval(cancelId);
        if (!mapCtrls[mapId].getMap())
          throw ('setGlobalClickListener:Error: no controller or map initialazed on mapID:' + mapId);

      }, 7000);
    } //setGlobalClickListener


    //=======================================================================
    //
    //=======================================================================
    function whenMapLoaded(mapId) {
      var deferred = $q.defer();
      deferred.resolved = 0;

      var cancelId = setInterval(function() {
        if (mapCtrls[mapId] && mapCtrls[mapId].getMap()) {

          deferred.resolve(mapCtrls[mapId].getMap());
          deferred.resolved = 1;
          clearInterval(cancelId);
          return deferred.promise;
        }
      }, 100);
      setTimeout(function() {
        if (!deferred.resolved) {
          deferred.reject('Map is not loaded within 7 seconds.');
          clearInterval(cancelId);
        }
      }, 7000);
      return deferred.promise;
    }
    //=======================================================================
    //
    //=======================================================================
    function whenMapCtrlLoaded(mapId) {
      var deferred = $q.defer();
      deferred.resolved = 0;

      var cancelId = setInterval(function() {
        if (mapCtrls[mapId]) {

          deferred.resolve(mapCtrls[mapId]);
          deferred.resolved = 1;
          clearInterval(cancelId);
          return deferred.promise;
        }
      }, 100);
      setTimeout(function() {
        if (!deferred.resolved) {
          deferred.reject('Map Controler is not loaded within 7 seconds.');
          clearInterval(cancelId);
        }
      }, 7000);
      return deferred.promise;
    }
    //=======================================================================
    //'invisi-pixel''
    //=======================================================================
    function setPinImage(mapId, imgPathOrLibraryName) {
      if (!mapId) throw "setPinImage Error: trying to run setPinImage without specifiing a map instance with mapId";
      if (!imgPathOrLibraryName) throw "setPinImage Error: trying to run setPinImage without specifiing a and image";

      whenMapLoaded(mapId).then(
        function(mapInstance) {
          if (!mapInstance.scbdConfig) mapInstance.scbdConfig = {};

          if (pinImgLibrary[imgPathOrLibraryName])
            mapInstance.scbdConfig.pin = pinImgLibrary[imgPathOrLibraryName];
          else
            mapInstance.scbdConfig.pin = imgPathOrLibraryName;
        },
        function() {
          throw "setPinImage Error: map failed to load with mapId:" + mapId;
        }
      );

    } // setPinImage

    //=======================================================================
    //'invisi-pixel''
    //=======================================================================
    function setPinPopOver(mapId, template) {
      if (!mapId) throw "setPinPopover Error: trying to run setPinPopover without specifiing a map instance with mapId";
      //if(!template) throw "setPinPopover Error: trying to run setPinPopover without specifiing a popover html template";

      whenMapLoaded(mapId).then(
        function(mapInstance) {
          if (!mapInstance.scbdConfig) mapInstance.scbdConfig = {};


          if (!template)
            template = 'default';
          if (pinPopOverLibrary[template])
            mapInstance.scbdConfig.popOverTemplate = pinPopOverLibrary[template];
          else
            mapInstance.scbdConfig.popOverTemplate = template;
          mapInstance.scbdConfig.popOverTemplateTitle = ' ';
        },
        function() {
          throw "setPinPopover Error: map failed to load with mapId:" + mapId;
        }
      );

    } // setPinImage

    //=======================================================================
    //'invisi-pixel''
    //=======================================================================
    function setPinToPoint(mapId, long, lat) {
      if (!mapId) throw "setPinToPoint Error: trying to run setPinToPoint without specifiing a map instance with mapId";
      if (!(long && lat)) throw "setPinToPoint Error: trying to run setPinToPoint without specifiing long and lat";

      whenMapLoaded(mapId).then(
        function(mapInstance) {
          mapInstance.pinMap();
        },
        function() {
          throw "setPinPopover Error: map failed to load with mapId:" + mapId;
        }
      );

    } // setPinImage

    //=======================================================================
    //'invisi-pixel''
    //=======================================================================
    function openCountryPopup(mapId, cCode) {
      var image = _.find(mapCtrls[mapId].getMap().dataProvider.images, function(img) {
        if (img.scbdData && img.scbdData.code === cCode) return true;
        else
          return false;
      });
      if(!image){
        console.log('Country missing popover information:', cCode)
        return;
      };
      mapCtrls[mapId].closePopovers();
      //console.log('X',mapCtrls[mapId].getMap().moveDown());
      if (image.externalElement)
        setTimeout(function() {
          $(image.externalElement).children('#pin-' + cCode).popover('show');
        }, 2200);
      else
        console.log('Country missing popover information:', cCode);

      setTimeout(function() {
        mapCtrls[mapId].getMap().moveUp();
      }, 2500);

    } // setPinImage

    //=======================================================================
    //
    //=======================================================================
    function closePopovers(mapId) {

      mapCtrls[mapId].closePopovers();
    } // closePopovers
    //=======================================================================
    //
    //=======================================================================
    function clickMapObject(mapId, mapObject) {

      mapCtrls[mapId].getMap().clickMapObject(mapObject);
    } // closePopovers
    //=======================================================================
    //
    //=======================================================================
    function eachCountry(mapId, callBack) {
      _.each(mapCtrls[mapId].getMap().dataProvider.areas, function(area) {
        if (area.id.length === 2) {
          callBack(area);

        }
      });

    } // closePopovers
    //=======================================================================
    //
    //=======================================================================
    function randomCountry(mapId) {
      var i = 0;
      var country = {};
      var scbdParty = {};
      while (true) {
        country = _.sample(mapCtrls[mapId].getMap().dataProvider.areas);
        scbdParty = _.find(countries, function(c) {
          return (c.code === country.id);
        });
        if (country.id.length === 2 && scbdParty)
          return country;
        else
          i++;
        if (i >= 1000) throw 'Error not country found in ammap3-service.randomCountry';
      }
    } // randomCountry

    return {
      randomCountry: randomCountry,
      eachCountry: eachCountry,
      clickMapObject: clickMapObject,
      closePopovers: closePopovers,
      openCountryPopup: openCountryPopup,
      setPinToPoint: setPinToPoint,
      setPinPopOver: setPinPopOver,
      setPinImage: setPinImage,
      setMapCtrl: setMapCtrl,
      setMapObject: setMapObject,
      //					registerWriteMap:registerWriteMap,
      loadCountries: loadCountries,
      getCountries: getCountries,
      setGlobalClickListener: setGlobalClickListener,
      setCountryClickListener: setCountryClickListener
    };

  }]);
});