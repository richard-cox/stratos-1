(function () {
  'use strict';

  describe('application state service', function () {
    var $httpBackend, cfAppStateService, $translate;

    beforeEach(module('templates'));
    beforeEach(module('console-app'));
    beforeEach(inject(function ($injector) {
      $httpBackend = $injector.get('$httpBackend');
      cfAppStateService = $injector.get('cfAppStateService');
      $translate = $injector.get('$translate');
    }));

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('getAppSummary', function () {
      expect(cfAppStateService).not.toBe(null);
    });

    describe('check friendly names and indicators', function () {

      function makeTestData(appState, packageState, instanceStates) {
        var summary = {
          state: appState,
          package_state: packageState,
          running_instances: 0,
          instances: instanceStates ? instanceStates.length : undefined
        };
        var instances = [];
        var running = 0;
        if (instanceStates) {
          _.each(instanceStates, function (s) {
            instances.push({state: s});
            if (s === 'RUNNING') { running++; }
          });
        } else {
          instances = undefined;
        }
        summary.running_instances = running;
        return {
          summary: summary,
          instances: instances
        };
      }

      it('Busted push', function () {
        var testData = makeTestData('ANY', 'FAILED', ['RUNNING']);
        var res = cfAppStateService.get(testData.summary, testData.instances);
        expect(res.indicator).toBe('error');
        expect($translate.instant(res.label)).toBe('Staging Failed');
        expect(_.keys(res.actions).length).toBe(1);
        expect(res.actions.delete).toBe(true);
      });

      it('Updating app', function () {
        var testData = makeTestData('STOPPED', 'PENDING', ['RUNNING', 'CRASHED']);
        testData.summary.package_updated_at = 'some date';
        var res = cfAppStateService.get(testData.summary, testData.instances);
        expect(res.indicator).toBe('warning');
        expect($translate.instant(res.label)).toBe('Offline while Updating');
        expect(_.keys(res.actions).length).toBe(1);
        expect(res.actions.delete).toBe(true);
      });

      it('Incomplete app', function () {
        var testData = makeTestData('STOPPED', 'PENDING', ['RUNNING', 'CRASHED']);
        var res = cfAppStateService.get(testData.summary, testData.instances);
        expect(res.indicator).toBe('warning');
        expect($translate.instant(res.label)).toBe('Incomplete');
        expect(_.keys(res.actions).length).toBe(2);
        expect(res.actions.delete).toBe(true);
        expect(res.actions.cli).toBe(true);
      });

      it('User stopped app', function () {
        var testData = makeTestData('STOPPED', 'STAGED', ['RUNNING', 'CRASHED']);
        var res = cfAppStateService.get(testData.summary, testData.instances);
        expect(res.indicator).toBe('warning');
        expect($translate.instant(res.label)).toBe('Offline');
        expect(_.keys(res.actions).length).toBe(3);
        expect(res.actions.start).toBe(true);
        expect(res.actions.delete).toBe(true);
      });

      it('Incomplete', function () {
        var testData = makeTestData('STOPPED', undefined, ['RUNNING', 'CRASHED']);
        var res = cfAppStateService.get(testData.summary, testData.instances);
        expect(res.indicator).toBe('warning');
        expect($translate.instant(res.label)).toBe('Incomplete');
        expect(_.keys(res.actions).length).toBe(2);
        expect(res.actions.delete).toBe(true);
        expect(res.actions.cli).toBe(true);
      });

      it('During push', function () {
        var testData = makeTestData('STARTED', 'PENDING', ['RUNNING', 'CRASHED']);
        var res = cfAppStateService.get(testData.summary, testData.instances);
        expect(res.indicator).toBe('busy');
        expect($translate.instant(res.label)).toBe('Staging App');
        expect(_.keys(res.actions).length).toBe(1);
        expect(res.actions.delete).toBe(true);
      });

      it('After successful push', function () {
        var testData = makeTestData('STARTED', 'STAGED', ['STARTING']);
        var res = cfAppStateService.get(testData.summary, testData.instances);
        expect(res.indicator).toBe('busy');
        expect($translate.instant(res.label)).toBe('Deployed');
        expect($translate.instant(res.subLabel)).toBe('Starting App');
        expect(_.keys(res.actions).length).toBe(3);
        expect(res.actions.stop).toBe(true);
        expect(res.actions.restart).toBe(true);
      });

      it('Starting', function () {
        var testData = makeTestData('STARTED', 'STAGED', ['STARTING', 'RUNNING']);
        var res = cfAppStateService.get(testData.summary, testData.instances);

        expect(res.indicator).toBe('busy');
        expect($translate.instant(res.label)).toBe('Deployed');
        expect($translate.instant(res.subLabel)).toBe('Starting App');
        expect(_.keys(res.actions).length).toBe(3);
        expect(res.actions.stop).toBe(true);
        expect(res.actions.restart).toBe(true);
      });

      it('Running!', function () {
        var testData = makeTestData('STARTED', 'STAGED', ['RUNNING']);
        var res = cfAppStateService.get(testData.summary, testData.instances);
        expect(res.indicator).toBe('ok');
        expect($translate.instant(res.label)).toBe('Deployed');
        expect($translate.instant(res.subLabel)).toBe('Online');

        testData = makeTestData('STARTED', 'STAGED', ['RUNNING', 'RUNNING']);
        res = cfAppStateService.get(testData.summary, testData.instances);
        expect(res.indicator).toBe('ok');
        expect($translate.instant(res.label)).toBe('Deployed');
        expect($translate.instant(res.subLabel)).toBe('Online');
        expect(_.keys(res.actions).length).toBe(4);
        expect(res.actions.restart).toBe(true);
        expect(res.actions.stop).toBe(true);
        expect(res.actions.launch).toBe(true);
      });

      it('Borked, usually due to app code', function () {
        var testData = makeTestData('STARTED', 'STAGED', ['CRASHED']);
        var res = cfAppStateService.get(testData.summary, testData.instances);
        expect(res.indicator).toBe('error');
        expect(res.label).toBe('app.state.deployed');
        expect($translate.instant(res.subLabel)).toBe('Crashed');

        testData = makeTestData('STARTED', 'STAGED', ['CRASHED', 'CRASHED']);
        res = cfAppStateService.get(testData.summary, testData.instances);
        expect(res.indicator).toBe('error');
        expect($translate.instant(res.label)).toBe('Deployed');
        expect($translate.instant(res.subLabel)).toBe('Crashed');
        expect(_.keys(res.actions).length).toBe(3);
        expect(res.actions.restart).toBe(true);
        expect(res.actions.stop).toBe(true);
      });

      it('Borked, usually due to starting timeouts', function () {
        var testData = makeTestData('STARTED', 'STAGED', ['TIMEOUT']);
        var res = cfAppStateService.get(testData.summary, testData.instances);
        expect(res.indicator).toBe('warning');
        expect($translate.instant(res.label)).toBe('Deployed');
        expect($translate.instant(res.subLabel)).toBe('Starting App');

        testData = makeTestData('STARTED', 'STAGED', ['TIMEOUT', 'TIMEOUT']);
        res = cfAppStateService.get(testData.summary, testData.instances);
        expect(res.indicator).toBe('warning');
        expect($translate.instant(res.label)).toBe('Deployed');
        expect($translate.instant(res.subLabel)).toBe('Starting App');
        expect(_.keys(res.actions).length).toBe(3);
        expect(res.actions.restart).toBe(true);
        expect(res.actions.stop).toBe(true);
      });

      it('Borked, usually due to starting timeouts', function () {
        var testData = makeTestData('STARTED', 'STAGED', ['TIMEOUT', 'CRASHED']);
        var res = cfAppStateService.get(testData.summary, testData.instances);
        expect(res.indicator).toBe('error');
        expect($translate.instant(res.label)).toBe('Deployed');
        expect($translate.instant(res.subLabel)).toBe('Crashing');

        testData = makeTestData('STARTED', 'STAGED', ['TIMEOUT', 'TIMEOUT', 'CRASHED', 'CRASHED']);
        res = cfAppStateService.get(testData.summary, testData.instances);
        expect(res.indicator).toBe('error');
        expect($translate.instant(res.label)).toBe('Deployed');
        expect($translate.instant(res.subLabel)).toBe('Crashing');
        expect(_.keys(res.actions).length).toBe(3);
        expect(res.actions.restart).toBe(true);
        expect(res.actions.stop).toBe(true);
      });

      it('Borked, usually due to platform issues', function () {
        var testData = makeTestData('STARTED', 'STAGED', ['RUNNING', 'CRASHED']);
        var res = cfAppStateService.get(testData.summary, testData.instances);
        expect(res.indicator).toBe('warning');
        expect($translate.instant(res.label)).toBe('Deployed');
        expect($translate.instant(res.subLabel)).toBe('Partially Online');

        testData = makeTestData('STARTED', 'STAGED', ['RUNNING', 'RUNNING', 'CRASHED', 'CRASHED']);
        res = cfAppStateService.get(testData.summary, testData.instances);
        expect(res.indicator).toBe('warning');
        expect($translate.instant(res.label)).toBe('Deployed');
        expect($translate.instant(res.subLabel)).toBe('Partially Online');
        expect(_.keys(res.actions).length).toBe(4);
        expect(res.actions.restart).toBe(true);
        expect(res.actions.stop).toBe(true);
        expect(res.actions.launch).toBe(true);
      });

      it('Borked, usually due to platform issues (2)', function () {
        var testData = makeTestData('STARTED', 'STAGED', ['RUNNING', 'UNKNOWN']);
        var res = cfAppStateService.get(testData.summary, testData.instances);
        expect(res.indicator).toBe('warning');
        expect($translate.instant(res.label)).toBe('Deployed');
        expect($translate.instant(res.subLabel)).toBe('Partially Online');

        testData = makeTestData('STARTED', 'STAGED', ['RUNNING', 'RUNNING', 'UNKNOWN', 'UNKNOWN']);
        res = cfAppStateService.get(testData.summary, testData.instances);
        expect(res.indicator).toBe('warning');
        expect($translate.instant(res.label)).toBe('Deployed');
        expect($translate.instant(res.subLabel)).toBe('Partially Online');
        expect(_.keys(res.actions).length).toBe(4);
        expect(res.actions.restart).toBe(true);
        expect(res.actions.stop).toBe(true);
        expect(res.actions.launch).toBe(true);
      });

      it('Started, but no stats available', function () {
        var testData = makeTestData('STARTED', 'STAGED');
        var res = cfAppStateService.get(testData.summary, undefined);
        expect(res.indicator).toBe('tentative');
        expect($translate.instant(res.label)).toBe('Deployed');
        expect(res.subLabel).not.toBeDefined();
      });

      it('Started, but have instance counf set to 0', function () {
        var testData = makeTestData('STARTED', 'STAGED');
        var res = cfAppStateService.get(testData.summary, testData.instances);
        expect(res.indicator).toBe('tentative');
        expect($translate.instant(res.label)).toBe('Deployed');
        expect(res.subLabel).not.toBeDefined();
      });
    });

  });

})();
