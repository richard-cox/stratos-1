/* DO NOT EDIT: This code has been generated by the cf-dotnet-sdk-builder */

(function () {
  'use strict';

  angular
    .module('cloud-foundry.api')
    .run(registerApi);

  registerApi.$inject = [
    '$http',
    'app.api.apiManager'
  ];

  function registerApi($http, apiManager) {
    apiManager.register('cloud-foundry.api.Routes', new RoutesApi($http));
  }

  function RoutesApi($http) {
    this.$http = $http;
  }

  /* eslint-disable camelcase */
  angular.extend(RoutesApi.prototype, {

   /*
    * Associate App with the Route
    * For detailed information, see online documentation at: http://apidocs.cloudfoundry.org/195/routes/associate_app_with_the_route.html
    */
    AssociateAppWithRoute: function (guid, app_guid, params) {
      var config = {};
      config.params = params;
      config.url = "/v2/routes/" + guid + "/apps/" + app_guid + "";
      config.method = 'PUT';
      return $http(config);
    },

   /*
    * Check a Route exists
    * This endpoint returns a status code of 204 if the route exists, and 404 if it does not.
    * For detailed information, see online documentation at: http://apidocs.cloudfoundry.org/195/routes/check_a_route_exists.html
    */
    CheckRouteExists: function (domain_guid, host, path, params) {
      var config = {};
      config.params = params;
      config.url = "/v2/routes/reserved/domain/" + domain_guid + "/host/" + host + "?path=" + path + "";
      config.method = 'GET';
      return $http(config);
    },

   /*
    * Creating a Route
    * For detailed information, see online documentation at: http://apidocs.cloudfoundry.org/195/routes/creating_a_route.html
    */
    CreateRoute: function (value, params) {
      var config = {};
      config.params = params;
      config.url = "/v2/routes";
      config.method = 'POST';
      config.data = value;
      return $http(config);
    },

   /*
    * Delete a Particular Route
    * For detailed information, see online documentation at: http://apidocs.cloudfoundry.org/195/routes/delete_a_particular_route.html
    */
    DeleteRoute: function (guid, params) {
      var config = {};
      config.params = params;
      config.url = "/v2/routes/" + guid + "?recursive=true";
      config.method = 'DELETE';
      return $http(config);
    },

   /*
    * List all Apps for the Route
    * For detailed information, see online documentation at: http://apidocs.cloudfoundry.org/195/routes/list_all_apps_for_the_route.html
    */
    ListAllAppsForRoute: function (guid, params) {
      var config = {};
      config.params = params;
      config.url = "/v2/routes/" + guid + "/apps";
      config.method = 'GET';
      return $http(config);
    },

   /*
    * List all Routes
    * For detailed information, see online documentation at: http://apidocs.cloudfoundry.org/195/routes/list_all_routes.html
    */
    ListAllRoutes: function (params) {
      var config = {};
      config.params = params;
      config.url = "/v2/routes";
      config.method = 'GET';
      return $http(config);
    },

   /*
    * Remove App from the Route
    * For detailed information, see online documentation at: http://apidocs.cloudfoundry.org/195/routes/remove_app_from_the_route.html
    */
    RemoveAppFromRoute: function (guid, app_guid, params) {
      var config = {};
      config.params = params;
      config.url = "/v2/routes/" + guid + "/apps/" + app_guid + "";
      config.method = 'DELETE';
      return $http(config);
    },

   /*
    * Retrieve a Particular Route
    * For detailed information, see online documentation at: http://apidocs.cloudfoundry.org/195/routes/retrieve_a_particular_route.html
    */
    RetrieveRoute: function (guid, params) {
      var config = {};
      config.params = params;
      config.url = "/v2/routes/" + guid + "";
      config.method = 'GET';
      return $http(config);
    },

   /*
    * Update a Route
    * For detailed information, see online documentation at: http://apidocs.cloudfoundry.org/195/routes/update_a_route.html
    */
    UpdateRoute: function (guid, value, params) {
      var config = {};
      config.params = params;
      config.url = "/v2/routes/" + guid + "";
      config.method = 'PUT';
      config.data = value;
      return $http(config);
    }

  });
  /* eslint-enable camelcase */

})();
