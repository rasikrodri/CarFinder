angular.module("template/carousel/carousel.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/carousel/carousel.html",
      "<div ng-mouseenter=\"pause()\" ng-mouseleave=\"play()\" class=\"carousel\" ng-swipe-right=\"prev()\" ng-swipe-left=\"next()\">\n" +
      //"    <ol class=\"carousel-indicators\" ng-show=\"slides.length > 1\">\n" +
      //"        <li ng-repeat=\"slide in slides track by $index\" ng-class=\"{active: isActive(slide)}\" ng-click=\"select(slide)\"></li>\n" +
      //"    </ol>\n" +
      "    <div class=\"carousel-inner\" ng-transclude></div>\n" +
      "    <a class=\"left carousel-control\" ng-click=\"prev()\" ng-show=\"slides.length > 1\"><span class=\"glyphicon glyphicon-arrow-left\" style=\"color: #f3501e;\"></span></a>\n" +
      "    <a class=\"right carousel-control\" ng-click=\"next()\" ng-show=\"slides.length > 1\"><span class=\"glyphicon glyphicon-arrow-right\" style=\"color: #f3501e;\"></span></a>\n" +
      "</div>\n" +
      "");
}]);

angular.module("template/carousel/slide.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/carousel/slide.html",
      "<div ng-class=\"{\n" +
      "    'active': leaving || (active && !entering),\n" +
      "    'prev': (next || active) && direction=='prev',\n" +
      "    'next': (next || active) && direction=='next',\n" +
      "    'right': direction=='prev',\n" +
      "    'left': direction=='next'\n" +
      "  }\" class=\"item text-center\" ng-transclude></div>\n" +
      "");
}]);