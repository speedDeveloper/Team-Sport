angular.module('mainCtrl.runningApp', [])
  .controller('mainCtrl', ['$scope', '$mdDialog', "$http", "$rootScope", "$cookies", "coordinates", function($scope, $mdDialog, $http, $rootScope, $cookies, coordinates) {
    $http.get("/api/find/events")
      .then(function(response) {
        console.log(response.data);
        $scope.locs = response.data;
        console.log(response.data);
      }, function(response) {
        console.log("Error: " + response.data);
      });
    $scope.positions = [];
    $scope.showAdvanced = function(ev) {
      $mdDialog.show({
          controller: DialogController,
          templateUrl: 'views/addEvent.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: true
        })
        .then(function(eventz) {
          console.log(eventz)
          $http.post('api/add/event', eventz)
            .then(function(response) {
              console.log('added')
              $http.get("/api/find/events")
                .then(function(response) {
                  console.log(response.data);
                  $scope.locs = response.data;
                  console.log(response.data);
                }, function(response) {
                  console.log("Error: " + response.data);
                });
            });

        }, function() {
          $scope.status = 'You cancelled the dialog.';
        });
    };
    $scope.message = "I'm awesome!!!";
    var map;
    var event;
    $scope.$on('mapInitialized', function(evt, evtMap) {
      map = evtMap;

      $scope.placeMarker = function(e) {
        console.log(e.latLng);

        coordinates.setCoordinates(e.latLng.K, e.latLng.G);
        $scope.map = map;
        event = e;
        $scope.showAdvanced(event);


      };

    });
    $scope.message = "I'm awesome!!!";






    $scope.showSearch = function(ev) {
      $mdDialog.show({
          controller: dialogCtrl,
          templateUrl: 'views/pFindEvent.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: true
        })
        .then(function(eventz) {
          console.log(eventz);
        }, function() {
          $scope.status = 'You cancelled the dialog.';
        });
    };



  }]);

function getArrayWithoutLastLocation(scope) {
  return scope.positions.map(function(element) {
    if (!(scope.lastLocation === element))
      return true;
  });

}

function DialogController($scope, $mdDialog, $http, $rootScope, $cookies, types, coordinates) {
  $scope.timespan = 10;
  $scope.myDate = new Date();
  $scope.minDate = new Date(
    $scope.myDate.getFullYear(),
    $scope.myDate.getMonth(),
    $scope.myDate.getDate());
  $scope.maxDate = new Date(
    $scope.myDate.getFullYear(),
    $scope.myDate.getMonth(),
    $scope.myDate.getDate() + 7);
  $scope.list = types;
  $scope.hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
  $scope.minutes = [0, 15, 30, 45];
  $scope.hide = function() {
    $mdDialog.hide();
  };
  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.answer = function(answer) {


    $mdDialog.hide(answer);

  };

  $scope.addPin = function() {
    var uid;

    var userCookie = $cookies.get('currentUser');
    if (userCookie != null) {
      userCookie = JSON.parse(userCookie.substring(2));
      if (typeof userCookie._id === 'string')
        uid = userCookie._id;
    }
    eventz = {
      type: $scope.type,
      name: $scope.place,
      description: $scope.user.biography,
      start: $scope.myDate,
      timespan: $scope.timespan,
      people: [uid],
      x: coordinates.getLongitude(),
      y: coordinates.getLatitude(),
      coordinates: [coordinates.getLongitude(), coordinates.getLatitude()]
    }
    console.log(eventz);
    $mdDialog.hide(eventz);
  }
}








function dialogCtrl($scope, $mdDialog, types) {
  $scope.list = types;

  $scope.hide = function() {
    $mdDialog.hide();
  };
  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.answer = function(answer) {
    $mdDialog.hide($scope.searchText);
  };
};
