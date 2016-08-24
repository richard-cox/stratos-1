(function () {
  'use strict';

  angular
    .module('cloud-foundry.view.applications')
    .directive('deleteAppWorkflow', deleteAppWorkflow);

  deleteAppWorkflow.$inject = [];

  /**
   * @memberof cloud-foundry.view.applications
   * @name deleteAppWorkflow
   * @description An delete-app-workflow directive
   * @returns {object} The delete-app-workflow directive definition object
   */
  function deleteAppWorkflow() {
    return {
      controller: DeleteAppWorkflowController,
      controllerAs: 'deleteAppWorkflowCtrl',
      templateUrl: 'plugins/cloud-foundry/view/applications/workflows/delete-app-workflow/delete-app-workflow.html'
    };
  }

  DeleteAppWorkflowController.$inject = [
    'app.model.modelManager',
    'app.event.eventService',
    '$q',
    '$interpolate',
    'app.utils.utilsService'
  ];

  /**
   * @memberof cloud-foundry.view.applications
   * @name DeleteAppWorkflowController
   * @constructor
   * @param {app.model.modelManager} modelManager - the Model management service
   * @param {app.event.eventService} eventService - the Event management service
   * @param {object} $q - angular $q service
   * @param {object} $interpolate - the Angular $interpolate service
   * @param {app.utils.utilsService} utils - the utils service
   * @property {app.event.eventService} eventService - the Event management service
   * @property {object} $q - angular $q service
   * @property {object} $interpolate - the Angular $interpolate service
   * @property {app.utils.utilsService} utils - the utils service
   * @property {object} appModel - the Cloud Foundry applications model
   * @property {object} routeModel - the Cloud Foundry route model
   * @property {boolean} deletingApplication - a flag indicating if the workflow in progress
   * @property {object} data - a data bag
   * @property {object} userInput - user's input about new application
   */
  function DeleteAppWorkflowController(modelManager, eventService, $q, $interpolate, utils) {
    var that = this;

    this.eventService = eventService;
    this.$q = $q;
    this.$interpolate = $interpolate;
    this.utils = utils;
    this.appModel = modelManager.retrieve('cloud-foundry.model.application');
    this.routeModel = modelManager.retrieve('cloud-foundry.model.route');
    this.serviceInstanceModel = modelManager.retrieve('cloud-foundry.model.service-instance');
    this.hceModel = modelManager.retrieve('cloud-foundry.model.hce');
    this.deletingApplication = false;
    this.cnsiGuid = null;
    this.hceCnsiGuid = null;

    this.eventService.$on('cf.events.START_DELETE_APP_WORKFLOW', function (event, data) {
      that.startWorkflow(data);
    });
  }

  angular.extend(DeleteAppWorkflowController.prototype, {
    reset: function () {
      var that = this;
      var path = 'plugins/cloud-foundry/view/applications/workflows/delete-app-workflow/';
      this.cnsiGuid = null;
      this.hceCnsiGuid = null;
      this.data = {};
      this.userInput = {
        checkedRouteValue: _.keyBy(this.appModel.application.summary.routes, 'guid'),
        checkedServiceValue: _.keyBy(this.appModel.application.summary.services, 'guid')
      };

      this.data.workflow = {
        initControllers: function (wizard) {
          that.wizard = wizard;
          wizard.postInitTask.promise.then(function () {
            that.options.isBusy = true;
            that.wizard.nextBtnDisabled = true;
            that.checkAppServices();
            that.checkAppRoutes().finally(function () {
              that.wizard.nextBtnDisabled = false;
              that.options.isBusy = false;
            });
          });
        },
        allowCancelAtLastStep: true,
        title: gettext('Delete App, Pipeline, and Selected Items'),
        hideStepNavStack: true,
        steps: [
          {
            templateUrl: path + 'delete-services-and-routes.html',
            nextBtnText: gettext('Delete app and associated items'),
            isLastStep: true
          }
        ]
      };

      this.options = {
        workflow: that.data.workflow,
        userInput: this.userInput,
        appModel: this.appModel,
        isBusy: true,
        safeRoutes: [],
        safeServices: []
      };

      this.deleteApplicationActions = {
        stop: function () {
          that.stopWorkflow();
        },

        finish: function () {
          that.finishWorkflow();
        }
      };
    },

    checkAppRoutes: function () {
      var that = this;
      this.options.safeRoutes = [];
      var tasks = [];
      var routes = this.appModel.application.summary.routes;
      routes.forEach(function (route) {
        tasks.push(that.routeModel.listAllAppsForRoute(that.cnsiGuid, route.guid));
      });
      return this.$q.all(tasks).then(function (results) {
        results.forEach(function (routeInfo, index) {
          // Check that each route is only bound to 1 app (which implicitly must be this app)
          if (routeInfo.total_results === 1) {
            that.options.safeRoutes.push(routes[index]);
          }
        });
      });
    },

    checkAppServices: function () {
      this.options.safeServices = _.filter(
        this.appModel.application.summary.services,
        function (o) {
          return o.bound_app_count === 1;
        }
      );
    },

    /**
     * @function deleteApp
     * @memberOf cloud-foundry.view.applications.DeleteAppWorkflowController
     * @description delete an application
     * @returns {promise} A resolved/rejected promise
     */
    deleteApp: function () {
      var that = this;

      var tryDeleteEachRoute = this.$q.defer();
      var deleteApp = this.$q.defer();

      this.removeAppFromRoutes().then(function () {
        that.tryDeleteEachRoute().then(function () {
          tryDeleteEachRoute.resolve();
        }, function () {
          tryDeleteEachRoute.reject();
        });
      });

      this.$q.all([
        tryDeleteEachRoute.promise,
        this.deleteServiceBindings(),
        this.deleteProject()
      ]).then(function () {
        that.appModel.deleteApp(that.cnsiGuid, that.appModel.application.summary.guid).then(function () {
          deleteApp.resolve();
        }, function () {
          deleteApp.reject();
        });
      });

      return deleteApp.promise;
    },

    /**
     * @function removeAppFromRoutes
     * @memberOf cloud-foundry.view.applications.DeleteAppWorkflowController
     * @description remove app from all the routes
     * @returns {promise} A resolved/rejected promise
     */
    removeAppFromRoutes: function () {
      var that = this;
      var checkedRouteValue = this.userInput.checkedRouteValue;
      var appGuid = this.appModel.application.summary.guid;
      var funcStack = [];

      Object.keys(checkedRouteValue).forEach(function (guid) {
        funcStack.push(function () {
          return that.routeModel.removeAppFromRoute(that.cnsiGuid, guid, appGuid);
        });
      });

      return this.utils.runInSequence(funcStack);
    },

    /**
     * @function deleteServiceBindings
     * @memberOf cloud-foundry.view.applications.DeleteAppWorkflowController
     * @description delete all service binding for the app
     * @returns {promise} A resolved/rejected promise
     */
    deleteServiceBindings: function () {
      var that = this;
      var checkedServiceValue = this.userInput.checkedServiceValue;

      /**
       * service instances that aren't bound to only this app
       * should not be deleted, only unbound
       */
      var serviceInstanceGuids = _.keys(checkedServiceValue);
      if (serviceInstanceGuids.length > 0) {
        return this._unbindServiceInstances(serviceInstanceGuids)
          .then(function () {
            var safeServiceInstances = _.chain(checkedServiceValue)
              .filter(function (o) { return o && o.bound_app_count === 1; })
              .map('guid')
              .value();
            return that._deleteServiceInstances(safeServiceInstances);
          });
      } else {
        var deferred = this.$q.defer();
        deferred.resolve();
        return deferred.promise;
      }
    },

    /**
     * @function _unbindServiceInstances
     * @memberOf cloud-foundry.view.applications.DeleteAppWorkflowController
     * @description Unbind service instance from app
     * @param {array} bindingGuids - the service binding GUIDs
     * @returns {promise} A resolved/rejected promise
     */
    _unbindServiceInstances: function (bindingGuids) {
      var that = this;
      var appGuid = this.appModel.application.summary.guid;
      var q = 'service_instance_guid IN ' + bindingGuids.join(',');
      return this.appModel.listServiceBindings(this.cnsiGuid, appGuid, {q: q})
        .then(function (bindings) {
          var funcStack = [];

          angular.forEach(bindings, function (binding) {
            funcStack.push(function () {
              return that.appModel.unbindServiceFromApp(that.cnsiGuid, appGuid, binding.metadata.guid);
            });
          });

          return that.utils.runInSequence(funcStack);
        });
    },

    /**
     * @function _deleteServiceInstances
     * @memberOf cloud-foundry.view.applications.DeleteAppWorkflowController
     * @description Delete service instances
     * @param {array} safeServiceInstances - the service instance GUIDs
     * @returns {promise} A resolved/rejected promise
     */
    _deleteServiceInstances: function (safeServiceInstances) {
      var that = this;
      var funcStack = [];

      angular.forEach(safeServiceInstances, function (serviceInstanceGuid) {
        funcStack.push(function () {
          return that.serviceInstanceModel.deleteServiceInstance(that.cnsiGuid, serviceInstanceGuid);
        });
      });

      return this.utils.runInSequence(funcStack);
    },

    /**
     * @function deleteRouteIfPossible
     * @memberOf cloud-foundry.view.applications.DeleteAppWorkflowController
     * @description delete an route if possible
     * @param {string} routeId - the identifier of the route
     * @returns {promise} A resolved/rejected promise
     */
    deleteRouteIfPossible: function (routeId) {
      var that = this;
      return this.$q(function (resolve, reject) {
        that.routeModel.listAllAppsForRouteWithoutStore(that.cnsiGuid, routeId)
          .then(function (apps) {
            if (apps.length === 0) {
              that.routeModel.deleteRoute(that.cnsiGuid, routeId).then(resolve, reject);
            } else {
              reject();
            }
          });
      });
    },

    /**
     * @function tryDeleteEachRoute
     * @memberOf cloud-foundry.view.applications.DeleteAppWorkflowController
     * @description try delete each route associated with the application
     * @returns {promise} A resolved/rejected promise
     */
    tryDeleteEachRoute: function () {
      var that = this;
      var checkedRouteValue = this.userInput.checkedRouteValue;
      var funcStack = [];

      Object.keys(checkedRouteValue).forEach(function (routeId) {
        funcStack.push(function () {
          return that.deleteRouteIfPossible(routeId);
        });
      });

      return this.utils.runInSequence(funcStack);
    },

    /**
     * @function deleteProject
     * @memberOf cloud-foundry.view.applications.DeleteAppWorkflowController
     * @description Delete HCE project
     * @returns {promise} A promise
     */
    deleteProject: function () {
      if (this.appModel.application.project) {
        return this.hceModel.removeProject(this.hceCnsiGuid, this.appModel.application.project.id);
      } else {
        var deferred = this.$q.defer();
        deferred.resolve();
        return deferred.promise;
      }
    },

    /**
     * @function startWorkflow
     * @memberOf cloud-foundry.view.applications.DeleteAppWorkflowController
     * @param {object} data - cnsiGuid and hceCnsiGuid
     * @description start workflow
     */
    startWorkflow: function (data) {
      this.deletingApplication = true;
      this.reset();
      this.cnsiGuid = data.cnsiGuid;
      this.hceCnsiGuid = data.hceCnsiGuid;
    },

    /**
     * @function stopWorkflow
     * @memberOf cloud-foundry.view.applications.DeleteAppWorkflowController
     * @description stop workflow
     */
    stopWorkflow: function () {
      this.deletingApplication = false;
    },

    /**
     * @function finishWorkflow
     * @memberOf cloud-foundry.view.applications.DeleteAppWorkflowController
     * @description finish workflow
     */
    finishWorkflow: function () {
      var that = this;
      var appName = this.appModel.application.summary.name;
      this.deleteApp().then(function () {
        that.deletingApplication = false;
        // show notification for successful binding
        var successMsg = gettext('"{{appName}}" has been deleted.');
        var message = that.$interpolate(successMsg)({appName: appName});
        that.eventService.$emit('cf.events.NOTIFY_SUCCESS', {message: message});
        that.eventService.$emit(that.eventService.events.REDIRECT, 'cf.applications.list.gallery-view');
      });
    }
  });

})();
