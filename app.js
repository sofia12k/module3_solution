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

    // Log the raw response to see the structure of the data
    console.log("Firebase raw response:", data);

    // Initialize an empty array to store all the menu items
    const allMenuItems = [];

    // Loop through each category (A, B, etc.)
    for (let categoryKey in data) {
      if (data.hasOwnProperty(categoryKey)) {
        // Add the menu items from each category to the allMenuItems array
        allMenuItems.push(...data[categoryKey].menu_items);
      }
    }

    // Log the combined array of menu items
    console.log("All menu items:", allMenuItems);

    // Filter items by the searchTerm
    const foundItems = allMenuItems.filter(item =>
      item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Log the filtered foundItems
    console.log("Filtered foundItems:", foundItems);

    return foundItems;
  }).catch(function (error) {
    console.error("Error fetching data:", error);
  });
};


})();
