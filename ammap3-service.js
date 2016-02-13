define(['app',
'lodash',
'text!./pin-popup.html',
'text!./pin-popup-abs.html',
'text!./pin-popup-title.html',
'./long-lat',
    './map-data',
], function (app, _,defaultPinPopOver,popAbs,defaultPinPopOverTitle) { 'use strict';

	app.factory('ammap3Service',  ["locale","$q","longLatServ","mapData", function(locale,$q,longLatServ,mapData) {

				var countries=null;
				var mapObject = {};
				var mapCtrls = {};
				var pinLibrary = ['default','invisi-pin'];
				var pinImgLibrary = [];
				pinImgLibrary['invisi-pixel']='/app/libs/scbd-map/images/pins/invisi-pin.svg';

				var pinPopOverLibrary = [];
				pinPopOverLibrary['default']=defaultPinPopOver;
				pinPopOverLibrary['abs']=popAbs;

					// $http.get('https://api.cbd.int/api/v2015/countries', {
	        //   cache: true,
	        // }).then(function(res) {
					//
	        //   res.data.forEach(function(c) {
	        //     c.name = c.name[locale];
	        //   });
	        //   items = res.data;
					// 	writeMaps ();
					// //	generateMaps ();
	        // });



					//=======================================================================
	        //
	        //=======================================================================
	        function resetLegend(legend) {

	          _.each(legend, function(legendItem) {
	            legendItem.visible = true;
	          });
	        } //$scope.legendHide

					//=======================================================================
	        //
	        //=======================================================================


					// //=======================================================================
	        // //
	        // //=======================================================================
					// var registrarGenerateMap = [];
					// function registerGenerateMap (callback){
					//  		registrarGenerateMap.push(callback);
					// }

					//=======================================================================
	        //
	        //=======================================================================
					var registrarWriteMap = {};
					function registerWriteMap (mapId,callback){
						  registrarWriteMap[mapId]=[];
					 		registrarWriteMap[mapId].push(callback);

					}

					// //=======================================================================
	        // //
	        // //=======================================================================
					// function generateMaps (){
					// 		 _.each(registarGenerateMap, function(callback){
					// 			 callback(items);
					// 		 });
					// }

					//=======================================================================
	        //
	        //=======================================================================
					function loadCountries (data){
									countries=data;
//console.log(data);

					}





					//=======================================================================
	        //
	        //=======================================================================
					function writeMaps (mapId){
							 _.each(registrarWriteMap.mapId, function(callback){
								 callback(countries);
							 });
					}

					//=======================================================================
					//// should be done in client
					//=======================================================================
					function normalizeCountryData (country){
							if(!country.CNA)
								country.CNA=0;

							if(!country.CP)
								country.CP=0;

							if(!country.CPC)
								country.CPC=0;

							if(!country.IRCC)
									country.IRCC=0;

							if(!country.MSR)
									country.MSR=0;

							if(!country.NDB)
									country.NDB=0;

							if(!country.NFP)
									country.NFP=0;

							return country;
					}
					//=======================================================================
					//
					//=======================================================================
					function setMapObject (map){
							mapObject = map;
					}
					//=======================================================================
					//
					//=======================================================================
					function bindCountryData (mapId){
						var deferred = $q.defer();
						deferred.resolved=0;

						var cancelId =  setInterval(function() {
																if (mapCtrls[mapId] && countries){
																		clearInterval(cancelId);
																		var image={};
																		var lat;
																		var long;
																		var country=0;
																		_.each(mapCtrls[mapId].getMap().dataProvider.areas,function(mapArea){


																					country=_.find(countries, function(c){return(c.code===mapArea.id); });

																					if(!country){country=normalizeCountryData({});country.code=mapArea.id;}
																					else
																					country.nameLocalized = country.name[locale];


																					//mapCtrls[mapId].getMapObject(country.code).scbdData=country;
																					long=mapCtrls[mapId].getMap().getAreaCenterLongitude(mapCtrls[mapId].getMapObject(country.code));
																					lat=mapCtrls[mapId].getMap().getAreaCenterLatitude(mapCtrls[mapId].getMapObject(country.code));

																					image.lat=lat;
																					image.long=long;
																					image.code=mapArea.id;
																					//image =_.find(longLatServ.data, function(c){return(c[0]===country.code); });
																					image.scbdData=normalizeCountryData(country);
																				  mapData.loadImage(image);
																		});
																		deferred.resolved=1;
																		deferred.resolve(mapCtrls[mapId]);

																		return deferred.promise;
																}

														 },500);


														setTimeout(function(){
																clearInterval(cancelId);
																if (!(mapCtrls[mapId].getMap() && countries))
																 throw('Error: no controller or map initialazed on mapID:'+mapId);

														 },7000);
											return deferred.promise;
					}

					//=======================================================================
					//
					//=======================================================================
					function setMapCtrl (mapCtrl){
						console.log('writing map');
writeMaps();
						if(mapCtrl.getCtrlMapId()){
							mapCtrls[mapCtrl.getCtrlMapId()] = mapCtrl;

							bindCountryData (mapCtrl.getCtrlMapId()).then(function(mapCtrl){

											mapCtrl.getMap().validateNow();
											if(mapCtrl.getAttrs().zoomInOnLoad)
												mapCtrl.getMap().zoomIn();
											mapCtrl.pinMap();

							});

						//
						}else
							throw "Error: thrying to register a map controler in the ammap3Service with out  a mapID";
					}



					//=======================================================================
					//
					//=======================================================================
					function getCountries(){
								var deferred = $q.defer();
								deferred.resolved=0;

								var cancelId =   setInterval(function() {
								    									if (countries){

																				 deferred.resolve(countries);
																				 deferred.resolved=1;
																				 clearInterval(cancelId);
																				 return deferred.promise;
																			}
																 }, 100);
								 setTimeout(function(){
											if(!deferred.resolved){deferred.reject('Receiving country data timed out.');
											clearInterval(cancelId);}
									},7000);
						  return deferred.promise;
						}

						//=======================================================================
						//
						//=======================================================================
						function setGlobalClickListener(mapId,onClickToDo){


							var cancelId =  setInterval(function() {
																	if (mapCtrls[mapId].getMap()){
																			clearInterval(cancelId);
																			return mapCtrls[mapId].getMap().addListener("click",onClickToDo);}
															 },500);


															setTimeout(function(){
																	clearInterval(cancelId);
																	if (!mapCtrls[mapId].getMap())
																	 throw(' setGlobalClickListener Error: no controller or map initialazed on mapID:'+mapId);

															 },7000);
						}//setGlobalClickListener

						//=======================================================================
						//
						//=======================================================================
						function setCountryClickListener(mapId,onClickToDo){


							var cancelId =  setInterval(function() {
																	if (mapCtrls[mapId].getMap()){
																			clearInterval(cancelId);
// console.log(mapCtrls[mapId].getMap());
																			return mapCtrls[mapId].getMap().addListener("clickMapObject",onClickToDo);}
															 },500);


															setTimeout(function(){
																	clearInterval(cancelId);
																	if (!mapCtrls[mapId].getMap())
																	 throw('setGlobalClickListener:Error: no controller or map initialazed on mapID:'+mapId);

															 },7000);
						}//setGlobalClickListener


						//=======================================================================
						//
						//=======================================================================
						function whenMapLoaded(mapId){
									var deferred = $q.defer();
									deferred.resolved=0;

									var cancelId =   setInterval(function() {
									    									if (mapCtrls[mapId] &&  mapCtrls[mapId].getMap()){

																					 deferred.resolve(mapCtrls[mapId].getMap());
																					 deferred.resolved=1;
																					 clearInterval(cancelId);
																					 return deferred.promise;
																				}
																	 }, 100);
									 setTimeout(function(){
												if(!deferred.resolved){deferred.reject('Map is not loaded within 7 seconds.');
												clearInterval(cancelId);}
										},7000);
							  return deferred.promise;
							}
							//=======================================================================
							//
							//=======================================================================
							function whenMapCtrlLoaded(mapId){
										var deferred = $q.defer();
										deferred.resolved=0;

										var cancelId =   setInterval(function() {
										    									if (mapCtrls[mapId] ){

																						 deferred.resolve(mapCtrls[mapId]);
																						 deferred.resolved=1;
																						 clearInterval(cancelId);
																						 return deferred.promise;
																					}
																		 }, 100);
										 setTimeout(function(){
													if(!deferred.resolved){deferred.reject('Map Controler is not loaded within 7 seconds.');
													clearInterval(cancelId);}
											},7000);
								  return deferred.promise;
								}
					//=======================================================================
					//'invisi-pixel''
					//=======================================================================
					function setPinImage(mapId,imgPathOrLibraryName){
							if(!mapId) throw "setPinImage Error: trying to run setPinImage without specifiing a map instance with mapId";
							if(!imgPathOrLibraryName) throw "setPinImage Error: trying to run setPinImage without specifiing a and image";

							whenMapLoaded(mapId).then(
								function(mapInstance){
											if(!mapInstance.scbdConfig)mapInstance.scbdConfig={};

											if(pinImgLibrary[imgPathOrLibraryName])
												mapInstance.scbdConfig.pin=pinImgLibrary[imgPathOrLibraryName];
											else
												mapInstance.scbdConfig.pin=imgPathOrLibraryName;
								}, function(){
											throw "setPinImage Error: map failed to load with mapId:"+mapId;
								}
							);

					}// setPinImage

					//=======================================================================
					//'invisi-pixel''
					//=======================================================================
					function setPinPopOver(mapId,template){
							if(!mapId) throw "setPinPopover Error: trying to run setPinPopover without specifiing a map instance with mapId";
							//if(!template) throw "setPinPopover Error: trying to run setPinPopover without specifiing a popover html template";

							whenMapLoaded(mapId).then(
								function(mapInstance){
											if(!mapInstance.scbdConfig)mapInstance.scbdConfig={};


											if(!template)
													template='default';
											if(pinPopOverLibrary[template])
													mapInstance.scbdConfig.popOverTemplate=pinPopOverLibrary[template];
											else
													mapInstance.scbdConfig.popOverTemplate=template;
 													mapInstance.scbdConfig.popOverTemplateTitle=defaultPinPopOverTitle;
								}, function(){
											throw "setPinPopover Error: map failed to load with mapId:"+mapId;
								}
							);

					}// setPinImage

					//=======================================================================
					//'invisi-pixel''
					//=======================================================================
					function setPinToPoint(mapId,long,lat){
							if(!mapId) throw "setPinToPoint Error: trying to run setPinToPoint without specifiing a map instance with mapId";
							if(!(long && lat)) throw "setPinToPoint Error: trying to run setPinToPoint without specifiing long and lat";

							whenMapLoaded(mapId).then(
								function(mapInstance){
										mapInstance.pinMap();
								}, function(){
											throw "setPinPopover Error: map failed to load with mapId:"+mapId;
								}
							);

					}// setPinImage

					//=======================================================================
					//'invisi-pixel''
					//=======================================================================
					function openCountryPopup(mapId,cCode){
							var image = _.find(mapCtrls[mapId].getMap().dataProvider.images,function(img){
										if(img.scbdData && img.scbdData.code===cCode) return true;
										else
										return false;
							});
							mapCtrls[mapId].closePopovers();
							//console.log('X',mapCtrls[mapId].getMap().moveDown());
							if(image.externalElement)
														setTimeout(function(){$(image.externalElement).children('#pin-'+cCode).popover('show');},1500);
							else
								console.log('Country missing popover information:', cCode);

							setTimeout(function(){mapCtrls[mapId].getMap().moveUp();},1700);

					}// setPinImage
				return {
					openCountryPopup:openCountryPopup,
					setPinToPoint:setPinToPoint,
					setPinPopOver:setPinPopOver,
					setPinImage:setPinImage,
					setMapCtrl:setMapCtrl,
					setMapObject:setMapObject,
					registerWriteMap:registerWriteMap,
					loadCountries:loadCountries,
					getCountries:getCountries,
					setGlobalClickListener:setGlobalClickListener,
					setCountryClickListener:setCountryClickListener
				};

    }]);
});