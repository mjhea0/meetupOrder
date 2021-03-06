myApp.controller("PizzaController", ["$scope", "$http", "meetupFactory", function($scope, $http, meetupFactory) {

  $scope.eventURL = "";
  $scope.correctInfo = false;
  $scope.incorrectInfo = false;

  //Find specific event and create object - HANDLE ERROR

  $scope.findEvent = function() {
    $scope.eventID = $scope.eventURL.split("/").slice(-2,-1).toString();
    meetupFactory.getEvent($scope.eventID)
      .success(function(data){
        $scope.eventInfo = {
          name: data.name,
          description: data.description,
          attending: data.yes_rsvp_count,
          address_name: data.venue.name,
          address_street: data.venue.address_1.split(',')[0],
          address_city: data.venue.city,
          lat: data.venue.lat,
          lon: data.venue.lon,
          zip_code: '',
          expected_ratio: Number,
          user_email: String,
          user_password: String
        };
      $scope.getZip($scope.eventInfo);
      $scope.incorrectInfo = false;
    });
  };

  $scope.placeOrder = function(info) {
    return meetupFactory.placeOrder($scope.eventInfo);
  };

  $scope.getZip = function(eventInfo) {
    meetupFactory.getZip({lat: eventInfo.lat, lon: eventInfo.lon})
    .success(function(data){
      eventInfo.zip_code = data;
    });
  };

  //Add DPC username and password + expected attendance ratio to event object

  $scope.addUser = function () {
    $scope.eventInfo.user_email = $scope.email;
    $scope.eventInfo.user_password = $scope.password;
    $scope.eventInfo.expected_ratio =  parseFloat($scope.expectedRatio);
  };

  //Event info check

  $scope.confirmInfo = function () {
    $scope.correctInfo = true;
  };

  $scope.denyInfo = function () {
    $scope.incorrectInfo = true;
    $scope.eventInfo = null;
    $scope.eventURL = "";

  };

}]);
