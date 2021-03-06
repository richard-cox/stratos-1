/* DO NOT EDIT: This code has been generated by the cf-dotnet-sdk-builder */

(function () {
  'use strict';

  angular
    .module('cloud-foundry.api')
    .run(registerApi);

  function registerApi($http, apiManager) {
    apiManager.register('cloud-foundry.api.SecurityGroups', new SecurityGroupsApi($http));
  }

  function SecurityGroupsApi($http) {
    this.$http = $http;
  }

  /* eslint-disable camelcase */
  angular.extend(SecurityGroupsApi.prototype, {

    /*
    * Associate Space with the Security Group
    * For detailed information, see online documentation at: http://apidocs.cloudfoundry.org/237/security_groups/associate_space_with_the_security_group.html
    */
    AssociateSpaceWithSecurityGroup: function (guid, space_guid, params, httpConfigOptions) {
      var config = {};
      config.params = params;
      config.url = '/pp/v1/proxy/v2/security_groups/' + guid + '/spaces/' + space_guid + '';
      config.method = 'PUT';

      for (var option in httpConfigOptions) {
        if (!httpConfigOptions.hasOwnProperty(option)) { continue; }
        config[option] = httpConfigOptions[option];
      }
      return this.$http(config);
    },

    /*
    * Creating a Security Group
    * For detailed information, see online documentation at: http://apidocs.cloudfoundry.org/237/security_groups/creating_a_security_group.html
    */
    CreateSecurityGroup: function (value, params, httpConfigOptions) {
      var config = {};
      config.params = params;
      config.url = '/pp/v1/proxy/v2/security_groups';
      config.method = 'POST';
      config.data = value;

      for (var option in httpConfigOptions) {
        if (!httpConfigOptions.hasOwnProperty(option)) { continue; }
        config[option] = httpConfigOptions[option];
      }
      return this.$http(config);
    },

    /*
    * Delete a Particular Security Group
    * For detailed information, see online documentation at: http://apidocs.cloudfoundry.org/237/security_groups/delete_a_particular_security_group.html
    */
    DeleteSecurityGroup: function (guid, params, httpConfigOptions) {
      var config = {};
      config.params = params;
      config.url = '/pp/v1/proxy/v2/security_groups/' + guid + '';
      config.method = 'DELETE';

      for (var option in httpConfigOptions) {
        if (!httpConfigOptions.hasOwnProperty(option)) { continue; }
        config[option] = httpConfigOptions[option];
      }
      return this.$http(config);
    },

    /*
    * List all Security Groups
    * For detailed information, see online documentation at: http://apidocs.cloudfoundry.org/237/security_groups/list_all_security_groups.html
    */
    ListAllSecurityGroups: function (params, httpConfigOptions) {
      var config = {};
      config.params = params;
      config.url = '/pp/v1/proxy/v2/security_groups';
      config.method = 'GET';

      for (var option in httpConfigOptions) {
        if (!httpConfigOptions.hasOwnProperty(option)) { continue; }
        config[option] = httpConfigOptions[option];
      }
      return this.$http(config);
    },

    /*
    * List all Spaces for the Security Group
    * For detailed information, see online documentation at: http://apidocs.cloudfoundry.org/237/security_groups/list_all_spaces_for_the_security_group.html
    */
    ListAllSpacesForSecurityGroup: function (guid, params, httpConfigOptions) {
      var config = {};
      config.params = params;
      config.url = '/pp/v1/proxy/v2/security_groups/' + guid + '/spaces';
      config.method = 'GET';

      for (var option in httpConfigOptions) {
        if (!httpConfigOptions.hasOwnProperty(option)) { continue; }
        config[option] = httpConfigOptions[option];
      }
      return this.$http(config);
    },

    /*
    * Remove Space from the Security Group
    * For detailed information, see online documentation at: http://apidocs.cloudfoundry.org/237/security_groups/remove_space_from_the_security_group.html
    */
    RemoveSpaceFromSecurityGroup: function (guid, space_guid, params, httpConfigOptions) {
      var config = {};
      config.params = params;
      config.url = '/pp/v1/proxy/v2/security_groups/' + guid + '/spaces/' + space_guid + '';
      config.method = 'DELETE';

      for (var option in httpConfigOptions) {
        if (!httpConfigOptions.hasOwnProperty(option)) { continue; }
        config[option] = httpConfigOptions[option];
      }
      return this.$http(config);
    },

    /*
    * Retrieve a Particular Security Group
    * For detailed information, see online documentation at: http://apidocs.cloudfoundry.org/237/security_groups/retrieve_a_particular_security_group.html
    */
    RetrieveSecurityGroup: function (guid, params, httpConfigOptions) {
      var config = {};
      config.params = params;
      config.url = '/pp/v1/proxy/v2/security_groups/' + guid + '';
      config.method = 'GET';

      for (var option in httpConfigOptions) {
        if (!httpConfigOptions.hasOwnProperty(option)) { continue; }
        config[option] = httpConfigOptions[option];
      }
      return this.$http(config);
    },

    /*
    * Updating a Security Group
    * For detailed information, see online documentation at: http://apidocs.cloudfoundry.org/237/security_groups/updating_a_security_group.html
    */
    UpdateSecurityGroup: function (guid, value, params, httpConfigOptions) {
      var config = {};
      config.params = params;
      config.url = '/pp/v1/proxy/v2/security_groups/' + guid + '';
      config.method = 'PUT';
      config.data = value;

      for (var option in httpConfigOptions) {
        if (!httpConfigOptions.hasOwnProperty(option)) { continue; }
        config[option] = httpConfigOptions[option];
      }
      return this.$http(config);
    }

  });
  /* eslint-enable camelcase */

})();
