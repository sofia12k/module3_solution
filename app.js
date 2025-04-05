(function () {
'use strict';

angular.module('NarrowItDownApp', [])
.controller('NarrowItDownController', NarrowItDownController)
.service('MenuSearchService', MenuSearchService)
.directive('foundItems', FoundItemsDirective);

function FoundItemsDirective() {
  return {
    restrict: 'E',
    templateUrl: 'foundItems.html',
    scope: {
      found: '<',
      onRemove: '&'
    }
  };
}

NarrowItDownController.$inject = ['MenuSearchService'];
function NarrowItDownController(MenuSearchService) {
  var ctrl = this;
  ctrl.searchTerm = "";
  ctrl.found = [];
  ctrl.nothingFound = false;

  ctrl.narrowDown = function () {
    ctrl.nothingFound = false;
    if (!ctrl.searchTerm || ctrl.searchTerm.trim() === "") {
      ctrl.found = [];
      ctrl.nothingFound = true;
      return;
    }

    MenuSearchService.getMatchedMenuItems(ctrl.searchTerm)
      .then(function (items) {
        ctrl.found = items;
        ctrl.nothingFound = items.length === 0;
      });
  };

  ctrl.removeItem = function (index) {
    ctrl.found.splice(index, 1);
  };
}

MenuSearchService.$inject = ['$http'];
function MenuSearchService($http) {
  var service = this;

  service.getMatchedMenuItems = function (searchTerm) {
    return $http({
      method: "GET",
      url: "https://coursera-jhu-default-rtdb.firebaseio.com/menu_items.json"
    }).then(function (response) {
      const data = response.data;
      const menuItems = data.menu_items || data;
      const allItems = Object.values(menuItems);

      return allItems.filter(item =>
        item.description &&
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  };
}

})();