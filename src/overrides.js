'use strict';

/*
    Overrides for (some of) v-component methods
 */

var utils = require('./utils');

module.exports = function(Vue) {
    var component = Vue.directive('component'),
        _ = Vue.util,
        parsers = Vue.parsers;

    return {
        bind: function() {
            // Force dynamic directive
            this._isDynamicLiteral = true;
            component.bind.call(this);
            this.init();
        },

        resolveCtor: function(id) {
            if(!id.length) return;
            component.resolveCtor.call(this, id);
        },

        /*
          This one is copied/pasted from the source
          except the routeParams part (no way to override it cleanly :/)
         */
        build: function() {
            var routeData = this.routes[this.location.regexp].data;
            var data = _.extend({}, (utils.isFunction(routeData) ? routeData() : routeData) || {});
            data = _.extend(data, {
                $routeParams: this.location.params
            });

            if(this.keepAlive) {
                var cached = this.cache[this.ctorId];
                if(cached) {
                    _.extend(cached.$data, data);
                    return cached;
                }
            }

            var vm = this.vm;
            var el = parsers.template.clone(this.el);

            if(this.Ctor) {
                var child = vm.$addChild({
                    el: el,
                    _asComponent: true,
                    data: function() {
                        return data;
                    }
                }, this.Ctor);

                if(this.keepAlive) {
                    this.cache[this.ctorId] = child;
                }

                return child;
            }
        }
    };
};
