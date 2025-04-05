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

MenuSearchService.getMatchedMenuItems = function (searchTerm) {
  return $http({
    method: "GET",
    url: "https://coursera-jhu-default-rtdb.firebaseio.com/menu_items.json"
  }).then(function (response) {
    const data = response.data;

    // Log the raw response from Firebase
    console.log("Firebase raw response:", data);

    const menuItems = Array.isArray(data.menu_items) ? data.menu_items : Object.values(data.menu_items);

    // Log the extracted list of items
    console.log("Extracted menuItems array:", menuItems);

    const foundItems = menuItems.filter(item =>
      item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Log the final filtered list
    console.log("Filtered foundItems:", foundItems);

    return foundItems;
  });
};

})();
