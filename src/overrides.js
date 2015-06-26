'use strict';

/*
    Overrides for (some of) v-component methods
 */

var utils = require('./utils');

module.exports = function(Vue) {
    var component = Vue.directive('_component'),
        _ = Vue.util,
        parsers = Vue.parsers;

    return {
        bind: function() {
            // Force dynamic directive
            this._isDynamicLiteral = true;
            component.bind.call(this);
            this.init();
        },

        resolveCtor: function(id, cb) {
            if(!id.length) return;
            component.resolveCtor.call(this, id, cb);
        },

        /*
          This one is copied/pasted from the source
          except the routeParams part (no way to override it cleanly :/)
         */
        build: function(data) {
            var routeData = this.routes[this.location.regexp].data;

            // The 'data' function should use the passed one, if any,
            // and get merged with any data passed to the plugin for this route,
            // as well as the router params (GET params)
            var compData = _.extend({}, data);
            compData = _.extend(compData, (utils.isFunction(routeData) ? routeData() : routeData) || {});
            compData = _.extend(compData, {
                $routeParams: this.location.params
            });

            if(this.keepAlive) {
                var cached = this.cache[this.ctorId];
                if(cached) {
                    _.extend(cached.$data, compData);
                    return cached;
                }
            }

            var vm = this.vm;
            var el = parsers.template.clone(this.el);

            if(this.Ctor) {
                var child = vm.$addChild({
                    el: el,
                    data: function() {
                        return compData;
                    },
                    template: this.template,
                    // if no inline-template, then the compiled
                    // linker can be cached for better performance.
                    _linkerCachable: !this.template,
                    _asComponent: true,
                    _host: this._host,
                    _isRouterView: this._isRouterView
                }, this.Ctor);

                if(this.keepAlive) {
                    this.cache[this.ctorId] = child;
                }

                return child;
            }
        }
    };
};
