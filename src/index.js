'use strict';

var utils = require('./utils'),
    page = require('page');

module.exports = function(Vue) {
    var component = require('./component-api')(Vue, page, utils),
        directive = require('./directive-api')(Vue, page, utils),
        route = require('./route-api')(Vue, page, utils),
        _ = Vue.util;

    var routeDefinition = {

        isLiteral: true,

        // Vue event method, $emit or $broadcast
        notifier: null,

        defaultRoute: '/',

        // Reference to $root.$options.routes
        routes: {},

        // Location context
        location: {
            regexp: null,
            path: null,
            componentId: null,
            params: null
        }
    };

    _.extend(routeDefinition, component); // Add methods from custom component directive
    _.extend(routeDefinition, directive); // Add directive lifecycle methods
    _.extend(routeDefinition, route); // Add routing methods

    Vue.directive('route', routeDefinition);
};