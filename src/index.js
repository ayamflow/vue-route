'use strict';

var utils = require('./utils'),
    page = require('page');

module.exports = function(Vue) {
  var component = Vue.directive('_component'),
      overrides = require('./overrides')(Vue),
      routing = require('./routing')(Vue, page, utils),
      _ = Vue.util;

    var routeDefinition = _.extend({
        isLiteral: true,

        // Vue event method, $emit or $broadcast
        notifier: null,

        defaultRoute: '/',

        // Reference to $root.$options.routes
        routes: {},

        // Options to be passed to the routing library
        options: {
          base: '/',
          hashbang: false,
          click: true
        },

        // Location context
        location: {
            regexp: null,
            path: null,
            componentId: null,
            params: null
        },

        oldLocation: {
            regexp: null,
            path: null,
            componentId: null,
            params: null
        }
    }, component);

    // Extend the routing-related methods
    _.extend(routeDefinition, routing);

    // override some of components methods
    _.extend(routeDefinition, overrides);

    Vue.directive('route', routeDefinition);
};
