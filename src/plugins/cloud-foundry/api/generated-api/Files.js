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
    apiManager.register('cloud-foundry.api.Files', new FilesApi($http));
  }

  function FilesApi($http) {
    this.$http = $http;
  }

  /* eslint-disable camelcase */
  angular.extend(FilesApi.prototype, {

   /*
    * Retrieve File
    * For detailed information, see online documentation at: http://apidocs.cloudfoundry.org/231/files/retrieve_file.html
    */
    RetrieveFile: function (app_guid, instance_index, file_path, params) {
      var config = {};
      config.params = params;
      config.url = '/api/cf/v2/apps/' + app_guid + '/instances/' + instance_index + '/files/' + file_path + '';
      config.method = 'GET';
      return this.$http(config);
    }

  });
  /* eslint-enable camelcase */

})();
