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

        // Log the raw response from Firebase to confirm the structure
        console.log("Firebase raw response:", data);

        // Initialize an empty array to hold all menu items
        const allMenuItems = [];

        // Loop through each category (A, B, etc.) to get menu items
        for (let categoryKey in data) {
          if (data.hasOwnProperty(categoryKey)) {
            const category = data[categoryKey];
            // Check if menu_items exist and push them to allMenuItems
            if (category.menu_items && Array.isArray(category.menu_items)) {
              allMenuItems.push(...category.menu_items);
            }
          }
        }

        // Log the combined menu items array after adding items from all categories
        console.log("All menu items:", allMenuItems);

        // Filter the items by description to match the search term
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
  }

})();
