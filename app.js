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
          ctrl.found = items; // Assign the filtered items to the found array
          ctrl.nothingFound = items.length === 0; // Set the flag if no items found
        })
        .catch(function (error) {
          console.error("Error in narrowing down items:", error);
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
        url: "menu_items.json" // local path to the JSON file
      }).then(function (response) {
        const data = response.data;

        console.log("Loaded data:", data); // Check if data is loaded correctly

        const allMenuItems = [];

        // Loop through each category (A, B, etc.) to get menu items
        for (let categoryKey in data) {
          if (data.hasOwnProperty(categoryKey)) {
            const category = data[categoryKey];
            if (category.menu_items && Array.isArray(category.menu_items)) {
              allMenuItems.push(...category.menu_items);
            }
          }
        }

        console.log("All menu items:", allMenuItems); // Check if all items are combined correctly

        const foundItems = allMenuItems.filter(item =>
          item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())
        );

        console.log("Filtered foundItems:", foundItems); // Check if filtering works

        return foundItems;
      }).catch(function (error) {
        console.error("Error fetching data:", error);
      });
    };
  }

})();
