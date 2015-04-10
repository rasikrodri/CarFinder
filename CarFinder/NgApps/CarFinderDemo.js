/// <reference path="" />
//Modeule directive declaration
var carfinder = angular.module('CarFinderApp', ['ngRoute', 'ui.bootstrap']);



carfinder.config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
    $routeProvider.when('/', {
        templateUrl: 'Application/Views/CarFinderView.html'
    })
}])

//factory declaration for module - this provides the connectivity to the web api controllers and actions
carfinder.factory("carSvc", ["$http", function ($http) {
    var factory = {};

        //This is a service
        factory.getYears = function () {
            return $http.get("/api/years")
                .then(function (response) { return response.data; });//This calls the controller in a webapi service
        };

        factory.getMakes = function (year) {
            var options={params: {year:year}};
            return $http.get("/api/makes", options)
                .then(function (response) {return response.data;});
        };

        factory.getModels = function (year, make) {
            var options = { params: { year: year, make:make } };
            return $http.get("/api/models", options)
                .then(function (response) { return response.data; });
        };

        factory.getTrims = function (year, make, model) {
            var options = { params: { year: year, make: make, model: model } };
            return $http.get("/api/trims", options)
                .then(function (response) { return response.data; });
        };

        factory.getCars = function (year, make, model, trim, show_ammount, page) {
            var options = { params: { year: year, make: make, model: model, trim: trim, show_ammount: show_ammount, page: page } };
            return $http.get("/api/cars", options)
                .then(function (response) { return response.data; });
        };


        //factory.getImageLink = function (year, make, model, trim) {
        //    google.load('search', '1');
        //    var search = google.search.imageSearch();

        //    search.setSearchCompleteCallback(this, searchComplete, null);

        //    //imageSearch.setSearchCompleteCallback(this, function () {
        //    //    if (imageSearch.results && imageSearch.results.length > 0) {

        //    //    }
        //    //});

        //    search.execute("bugatti");

        //    var ttt = 2;

        

        //    //// Create a search control
        //    //var searchControl = new google.search.SearchControl();

        //    // Add in a full set of searchers
        //    ////var localSearch = new google.search.LocalSearch();
        //    //searchControl.addSearcher(localSearch);
        //    //searchControl.addSearcher(new google.search.WebSearch());
        //    //searchControl.addSearcher(new google.search.VideoSearch());
        //    //searchControl.addSearcher(new google.search.BlogSearch());
        //    //searchControl.addSearcher(new google.search.NewsSearch());
        //    //searchControl.addSearcher(new google.search.ImageSearch());
        //    //searchControl.addSearcher(new google.search.BookSearch());
        //    //searchControl.addSearcher(new google.search.PatentSearch());

        //    //// Set the Local Search center point
        //    //localSearch.setCenterPoint("New York, NY");

        //    //// tell the searcher to draw itself and tell it where to attach
        //    //searchControl.draw(document.getElementById("searchcontrol"));

        //    //// execute an inital search
        //    //searchControl.execute("VW GTI");
        //}

        return factory;
}]);


carfinder.service('getcarsSVC', ['$http', '$q', function ($http, $q) {

    getCars = function (year, make, model, trim, show_ammount, page) {
        var options = { params: { year: year, make: make, model: model, trim: trim, show_ammount: show_ammount, page: page } };
        return $http.get("/api/cars", options)
            .then(function (response) { return response.data; });
    };

    //This is an async method, it runs in a separate thread making the webbrowser responsive
    //This way I can show a loading animation while everything is being loaded
    return {
        GetCars: function (year, make, model, trim, show_ammount, page) {
            return $q.all([
                //$http.get("/api/cars", { params: { year: 2014, make: '', model: '', trim: '', show_ammount: 100, page: 1 } }),
                //.then(function (response) { return response.data; })//This will not make it async

                getCars(year, make, model, trim, show_ammount, page)

                //You can have many more functions here and this will wait until all of them are done and then return the data
            ]);
        }
    }
}]);
carfinder.service('searchForImageSVC', ['$http', '$q', function ($http, $q) {
    findImage = function (query, index) {
        return $http.post("/api/SearchForCarImage", { query: query, itemIndex: index })
            .then(function (response) { return response.data; });
    };

    //This is an async method, it runs in a separate thread making the webbrowser responsive
    //This way I can show a loading animation while everything is being loaded
    return {
        FindImageInGoogle: function (query, index) {
            return $q.all([
                findImage(query, index)
                //You can have many more functions here and this will wait until all of them are done and then return the data
            ]);
        }
    }
}]);
carfinder.service('searchForCarImageSVC', ['$http', '$q', function ($http, $q) {
    
    GetCarImagesInSearchEngine = function (year, make, model, trim, index) {
        var query = year + " " + make + " " + model + " " + trim;
        return $http.post("/api/SearchForCarImage", { query: query, itemIndex: index })
            .then(function (response) {
                return response.data;
            });
    };

    GetCarImagesFromSpecificWebsites = function (year, make, model, trim, index) {
        return $http.post("/api/CarSearchInSpecificWebsites", { year: year, make: make, model: model, trim: trim, itemIndex: index })
               .then(function (response) {
                   return response.data;
               });
    };

    //This is an async method, it runs in a separate thread making the webbrowser responsive
    //This way I can show a loading animation while everything is being loaded
    return {
        FindCarImages: function (year, make, model, trim, index) {
            return $q.all([
                GetCarImagesInSearchEngine(year, make, model, trim, index)
                //GetCarImagesFromSpecificWebsites(year, make, model, trim, index)
                //You can have many more functions here and this will wait until all of them are done and then return the data
            ]);
        }
    }
}]);



carfinder.filter('CleanPropertyName', function () {

    return function (value) {
        var result;
        if (value.length > 0) {
            //remove the undercores and make the next letter capital
            value = value.replace(/_/g, " ");
            //Capitalize the first letter of every word
            return value.replace(/[^\s]+/g, function (str) {
                return str.substr(0, 1).toUpperCase() + str.substr(1).toLowerCase();
            });
        }
    };
});


//Directive declaration for module
carfinder.directive("carFinder", ["carSvc", "getcarsSVC", "searchForCarImageSVC", "cardetailsModalService", "welcomeModalService", "searchModalService", function (carSvc, getcarsSVC, searchForCarImageSVC, cardetailsModalService, welcomeModalService, searchModalService) {
    return {
        //define usage restrictions
        restrict: "AEC",
        //bind scope variables and atributes
        scope: {
            selectedYear: "@",
            selectedMake: "@",
            selectedModel: "@",
            selectedTrim: "@",
            selectedShowAmmount: "@",
            selectedPage: "@"
        },
        //define html template
        templateUrl: "NgApps/Templates/CarFinderDirectiveTemplate.html",// "/NgApps/Templates/CarFinder.html",
        //define all functional behavior for this directive...
        link: function (scope, elem, attrs) {



            scope.showWelcomeModal = function () {
                welcomeModalService.showModal();
            }
            //Fire the welcome message
            scope.showWelcomeModal();

            scope.SlidesLoaded = 'false';
            scope.myInterval = 2500;
            scope.slides = [];
            scope.addSlide = function (url) {
                var newWidth = 600 + scope.slides.length + 1;
                scope.slides.push({
                    image: url,
                    text: ['More', 'Extra', 'Lots of', 'Surplus', 'More', 'Extra', 'Lots of', 'Surplus', 'More', 'Extra'][scope.slides.length % 4] + ' ' +
                      ['Cats', 'Kittys', 'Felines', 'Cutes', 'Cats', 'Kittys', 'Felines', 'Cutes', 'Cats', 'Kittys'][scope.slides.length % 4]
                });
                //scope.slides.push({
                //    image: 'http://placekitten.com/' + newWidth + '/300',
                //    text: ['More', 'Extra', 'Lots of', 'Surplus', 'More', 'Extra', 'Lots of', 'Surplus', 'More', 'Extra'][slides.length % 4] + ' ' +
                //      ['Cats', 'Kittys', 'Felines', 'Cutes', 'Cats', 'Kittys', 'Felines', 'Cutes','Cats', 'Kittys'][slides.length % 4]
                //});
            };

            
            scope.manualSearch = function (query) {
                searchModalService.showModal();

            }
            

            scope.showCarDetailsModal = function (car) {
                cardetailsModalService.showModal(car);
            }

            
            scope.showammounts = [10, 25, 50, 100];
            scope.pages = [];
            scope.selectedShowAmmount = "10";
            scope.selectedPage = "1";
            scope.pagesAvailable;
            scope.totalCars;

            scope.years = [];
            scope.getYears = function () {
                carSvc.getYears().then(function (data) {
                    scope.years = data;
                    scope.selectedYear = data[0];                   
                    scope.getMakes();

                    //scope.getCarsAsync();
                });
            }
            //get rolling!
            scope.getYears();

            scope.makes = [];
            scope.getMakes = function () {
                scope.makes = null;
                scope.selectedMake = "";
                scope.models = null;
                scope.selectedModel = "";
                scope.trims = null;
                scope.selectedTrim = "";
                carSvc.getMakes(scope.selectedYear).then(function (data) {
                    scope.makes = data;
                });

                scope.getCarsAsync();
            }

            scope.models = [];
            scope.getModels = function () {
                scope.models = null;
                scope.selectedModel = "";
                scope.trims = null;
                scope.selectedTrim = "";
                carSvc.getModels(scope.selectedYear, scope.selectedMake).then(function (data) {
                    scope.models = data;
                });

                scope.getCarsAsync();
            }

            scope.trims = [];
            scope.getTrims = function () {
                scope.trims = null;
                scope.selectedTrim = "";
                carSvc.getTrims(scope.selectedYear, scope.selectedMake, scope.selectedModel).then(function (data) {
                    scope.trims = data;
                });

                scope.getCarsAsync();
            }

            scope.cars = [];
            scope.getCarsAsync = function () {
                scope.cars = [];
                getcarsSVC.GetCars(scope.selectedYear, scope.selectedMake, scope.selectedModel, scope.selectedTrim, scope.selectedShowAmmount, scope.selectedPage).then(function (returnValues) {
                    var data = returnValues[0];
                    scope.SetupPagingInfo(data[0]);//sets the amount of pages available

                    data.splice(0, 1);//remove the first item because is actually the paging information
                    scope.cars = data;
                    //var from2 = returnValues[1].data;

                    scope.findImages();


                    //Now get 10 cars from the previews or next year if there is no previews year
                    scope.getExtraCarsAsync();
                });
            }

            scope.takeMeToYear = function (year) {
                scope.selectedYear = year;
                scope.getMakes();

                scope.ResetPagingInfo();
                scope.getCarsAsync();
            }

            scope.extracars = [];
            scope.extracarsYear = '2015';
            scope.getExtraCarsAsync = function () {
                scope.extracars = [];

                //Now get 10 cars from the previews or next year if there is no previews year
                for (var i = 0; i < scope.years.length; i++) {
                    if (scope.years[i] === scope.selectedYear) {
                        //we ar at the year
                        //now check if there is a lower year
                        if (i + 1 < scope.years.length) {
                            getcarsSVC.GetCars(scope.years[i + 1], '', '', '', '10', '1').then(function (returnValues) {
                                var data = returnValues[0];
                                data.splice(0, 1);//remove the first item because is actually the paging information
                                scope.extracars = data;

                                scope.extracarsYear = scope.years[i + 1];
                                scope.findImagesForExtraCars();
                            });
                            break;
                        }
                        if (i - 1 > -1)//test if we can grab the previews year
                        {

                            getcarsSVC.GetCars(scope.years[i - 1], '', '', '', '10', '1').then(function (returnValues) {
                                var data = returnValues[0];
                                data.splice(0, 1);//remove the first item because is actually the paging information
                                scope.extracars = data;

                                scope.extracarsYear = scope.years[i - 1];
                                scope.findImagesForExtraCars();
                            });
                            break;
                        }
                    }
                }

                
            }

            scope.findImages = function () {
                scope.SlidesLoaded = 'false';
                for (var index = 0; index < scope.cars.length; index++) {
                    var car = scope.cars[index];
                    searchForCarImageSVC.FindCarImages(car["model_year"], car["make"], car["model_name"], car["model_trim"], index).then(function (data) {
                        var expando = data[0];
                        var carIndex = expando["index"];
                        scope.cars[carIndex]["images"] = expando["images"];

                        //ad slydes of the first car, other cars may get here before, so we have to make sure is the first car
                        if (carIndex === '0') {
                            scope.slides = [];
                            for (var i = 0; i < 10; i++) {
                                if (expando["images"].length === i) {
                                    break;
                                }

                                //Remove the old slydes
                                $("div").remove("#carsSlidesToRemove");
                                scope.addSlide(expando["images"][i].url);

                                scope.SlidesLoaded = 'true';
                            }
                        }
                        else {//Remove the loading only from the other cars not from the first one
                            var sineName = ".car" + scope.cars[carIndex]["id"];
                            $("div").remove(sineName);
                        }
                    });
                }
                //searchForImageSVC.FindImageInGoogle(scope.cars[0], 0).then(function (data) {
                //    var expando = data[0];
                //    var carIndex = expando["carIndex"];
                //    scope.cars[carIndex]["image"] = expando["image"];
                //});
            }
            scope.findImagesForExtraCars = function () {
                for (var index = 0; index < scope.extracars.length; index++) {
                    var car = scope.extracars[index];
                    searchForCarImageSVC.FindCarImages(car["model_year"], car["make"], car["model_name"], car["model_trim"], index).then(function (data) {
                        var expando = data[0];
                        var carIndex = expando["index"];
                        scope.extracars[carIndex]["images"] = expando["images"];
                        var sineName = ".car" + scope.extracars[carIndex]["id"];
                        $("div").remove(sineName);
                    });
                }
                //searchForImageSVC.FindImageInGoogle(scope.cars[0], 0).then(function (data) {
                //    var expando = data[0];
                //    var carIndex = expando["carIndex"];
                //    scope.cars[carIndex]["image"] = expando["image"];
                //});
            }

            scope.ResetPagingInfo = function () {
                //scope.selectedShowAmmount = "10";
                scope.selectedPage = "1";
            }
            scope.SetupPagingInfo = function (pagingInfo) {
                scope.pagesAvailable = pagingInfo["total_pages"];
                scope.totalCars = pagingInfo["total_cars"];
                if (scope.selectedPage < 1)
                {
                    scope.selectedPage = 1;
                }
                if(scope.selectedPage > scope.pagesAvailable)
                {
                    scope.selectedPage = scope.pagesAvailable;
                }
                    
                    scope.pages = [];


                    //Preapre the the pages links

                    if (scope.selectedPage > scope.pagesAvailable) {
                        scope.selectedPage = scope.pagesAvailable;
                    }

                    //go 3 downwards                
                    var count = 3;
                    for (var i = parseFloat(scope.selectedPage) - 3; i < parseFloat(scope.selectedPage) ; i++) {
                        if (count === 0) { break; }
                        if (i > 0) {
                            scope.pages.push(i);
                            count--;
                        }
                    }

                    //Add the selected page number
                    scope.pages.push(scope.selectedPage);

                    //go 3 upwards
                    count = 7 - scope.pages.length;//This will ensure we allways have 7 if posible
                    if (scope.pages.length < 7) {
                        for (var i = parseFloat(scope.selectedPage) + 1; i < scope.pagesAvailable + 1; i++) {
                            if (count === 0) { break; }
                            scope.pages.push(i);
                            count--;
                        }
                    }

                    //if we still do not have 7 numbers is because we are at the last page
                    //we need to add the rest backwards
                    count = 7 - scope.pages.length;//This will ensure we allways have 7 if posible
                    var insertIndex = 0;
                    for (var i = parseFloat(scope.pages[0]) - count; i < parseFloat(scope.selectedPage) ; i++) {
                        if (count === 0) { break; }
                        if (i > 0) {
                            scope.pages.splice(insertIndex, 0, i);//insert in index insertIndex
                            insertIndex += 1;
                            count--;
                        }
                    }
            }

            scope.GoToPage = function (pageNum) {
                scope.selectedPage = pageNum;
                scope.getCarsAsync();
            }
            scope.GoToNextPage = function (pageNum) {
                scope.GoToPage(parseFloat(pageNum) + 1);
            }
            scope.GoToPrevPage = function (pageNum) {
                scope.GoToPage(parseFloat(pageNum) - 1);
            }

            scope.ShowTrimSelection = function(){
                if (scope.trims === null || scope.trims.length === 0 || scope.trims.length === 1 && scope.trims[0] === "") {
                    return false;
                }
                return true;
            }
            scope.FoudCars = function () {
                //index 0 has the paging object 
                if (scope.cars === null || scope.cars.length < 2){
                    return false;
                }
                return true;
            }

        }
    };
}]);

carfinder.service('welcomeModalService', ['$modal',
    function ($modal) {

        var modalDefaults = {
            backdrop: true,
            keyboard: true,
            modalFade: true,
            templateUrl: 'NgApps/Templates/WelcomeMessage.html'
        };

        var modalOptions = {
            closeButtonText: 'Close',
            actionButtonText: 'OK',
            headerText: 'Proceed?',
            bodyText: 'Perform this action?'
        };

        this.showModal = function (customModalDefaults, customModalOptions) {
            if (!customModalDefaults) customModalDefaults = {};
            customModalDefaults.backdrop = 'static';
            return this.show(customModalDefaults, customModalOptions);
        };

        this.show = function (customModalDefaults, customModalOptions) {
            //Create temp objects to work with since we're in a singleton service
            var tempModalDefaults = {};
            var tempModalOptions = {};

            //Map angular-ui modal custom defaults to modal defaults defined in service
            angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

            //Map modal.html $scope custom properties to defaults defined in service
            angular.extend(tempModalOptions, modalOptions, customModalOptions);

            if (!tempModalDefaults.controller) {
                tempModalDefaults.controller = function ($scope, $modalInstance) {
                    $scope.modalOptions = tempModalOptions;
                    $scope.modalOptions.ok = function (result) {
                        $modalInstance.close(result);
                    };
                    $scope.modalOptions.close = function (result) {
                        $modalInstance.dismiss('cancel');
                    };
                }
            }



            return $modal.open(tempModalDefaults).result;
        };

    }]);
carfinder.service('cardetailsModalService', ['$modal',
    function ($modal) {

        var modalDefaults = {
            backdrop: true,
            keyboard: true,
            modalFade: true,
            templateUrl: 'NgApps/Templates/CarDetailsModal.html',
            size: ''
        };

        var modalOptions = {
            closeButtonText: 'Close',
            actionButtonText: 'OK',
            headerText: 'Proceed?',
            bodyText: 'Perform this action?'
        };

        this.showModal = function (car ,customModalDefaults, customModalOptions) {
            if (!customModalDefaults) customModalDefaults = {};
            customModalDefaults.backdrop = 'static';
            return this.show(car, customModalDefaults, customModalOptions);
        };

        this.show = function (car, customModalDefaults, customModalOptions) {
            //Create temp objects to work with since we're in a singleton service
            var tempModalDefaults = {};
            var tempModalOptions = {};

            tempModalOptions.car = car;

            //Map angular-ui modal custom defaults to modal defaults defined in service
            angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

            //Map modal.html $scope custom properties to defaults defined in service
            angular.extend(tempModalOptions, modalOptions, customModalOptions);

            if (!tempModalDefaults.controller) {
                tempModalDefaults.controller = function ($scope, $modalInstance) {
                    $scope.modalOptions = tempModalOptions;
                    $scope.modalOptions.ok = function (result) {
                        $modalInstance.close(result);
                    };
                    $scope.modalOptions.close = function (result) {
                        $modalInstance.dismiss('cancel');
                    };
                }
            }


            
            return $modal.open(tempModalDefaults).result;
        };

    }]);


carfinder.service('searchModalService', ['$modal',  "searchForImageSVC",
    function ($modal, searchForImageSVC) {

        var modalDefaults = {
            backdrop: true,
            keyboard: true,
            modalFade: true,
            templateUrl: 'NgApps/Templates/SearchModal.html',
            size: ''
        };

        var modalOptions = {
            closeButtonText: 'Close',
            actionButtonText: 'OK',
            headerText: 'Proceed?',
            bodyText: 'Perform this action?'
        };

        
        this.showModal = function (customModalDefaults, customModalOptions) {
            if (!customModalDefaults) customModalDefaults = {};
            customModalDefaults.backdrop = 'static';
            return this.show(customModalDefaults, customModalOptions);
        };

        this.show = function (customModalDefaults, customModalOptions) {
            //Create temp objects to work with since we're in a singleton service
            var tempModalDefaults = {};
            var tempModalOptions = {};

            tempModalOptions.query = "bugatti veyron";
            tempModalOptions.results = [{ "url": "data:image/jpeg;base64,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" }];
            tempModalOptions.search = function () {
                searchForImageSVC.FindImageInGoogle(tempModalOptions.query, 0).then(function (data) {
                    var expando = data[0];
                    tempModalOptions.results = expando["images"];
                    //return images;
                });
            }


            //tempModalOptions.results = [{"url":"data:image/jpeg;base64,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"}];
            //tempModalOptions.query = "Type Here...";

            //Map angular-ui modal custom defaults to modal defaults defined in service
            angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

            //Map modal.html $scope custom properties to defaults defined in service
            angular.extend(tempModalOptions, modalOptions, customModalOptions);

            if (!tempModalDefaults.controller) {
                tempModalDefaults.controller = function ($scope, $modalInstance) {
                    $scope.modalOptions = tempModalOptions;
                    $scope.modalOptions.ok = function (result) {
                        $modalInstance.close(result);
                    };
                    $scope.modalOptions.close = function (result) {
                        $modalInstance.dismiss('cancel');
                    };
                }
            }



            return $modal.open(tempModalDefaults).result;
        };

    }]);

//carfinder.service('firstcarCarouselSevice', ['$scope',function ($scope) {
//    $scope.myInterval = 5000;
//    var slides = $scope.slides = [];
//    $scope.addSlide = function () {
//        var newWidth = 600 + slides.length + 1;
//        slides.push({
//            image: 'http://placekitten.com/' + newWidth + '/300',
//            text: ['More', 'Extra', 'Lots of', 'Surplus'][slides.length % 4] + ' ' +
//              ['Cats', 'Kittys', 'Felines', 'Cutes'][slides.length % 4]
//        });
//    };
//    for (var i = 0; i < 4; i++) {
//        $scope.addSlide();
//    }
//}]);

//carfinder.controller('ModalDemoCtrl', function ($scope, $modal, $log) {

//    $scope.items = ['item1', 'item2', 'item3'];

//    $scope.open = function (size) {

//        var modalInstance = $modal.open({
//            templateUrl: 'NgApps/Templates/CarDetailsModal.html',
//            controller: 'ModalInstanceCtrl',
//            size: size,
//            resolve: {
//                items: function () {
//                    return $scope.items;
//                }
//            }
//        });

//        modalInstance.result.then(function (selectedItem) {
//            $scope.selected = selectedItem;
//        }, function () {
//            $log.info('Modal dismissed at: ' + new Date());
//        });
//    };
//});

//// Please note that $modalInstance represents a modal window (instance) dependency.
//// It is not the same as the $modal service used above.

//carfinder.controller('ModalInstanceCtrl', function ($scope, $modalInstance, items) {

//    $scope.items = items;
//    $scope.selected = {
//        item: $scope.items[0]
//    };

//    $scope.ok = function () {
//        $modalInstance.close($scope.selected.item);
//    };

//    $scope.cancel = function () {
//        $modalInstance.dismiss('cancel');
//    };
//});