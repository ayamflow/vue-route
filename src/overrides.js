'use strict';

/*
    Overrides for (some of) v-component methods
 */

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
          if (this.keepAlive) {
            var cached = this.cache[this.ctorId];
            if (cached) {
              return cached;
            }
          }

          var vm = this.vm;
          var el = parsers.template.clone(this.el);
          var data = _.extend(this.routes[this.location.regexp].data || {}, {
            $routeParams: this.location.params
          });

          if (this.Ctor) {
            var child = vm.$addChild({
              el: el,
              _asComponent: true,
              data: function() {
                return data;
              }
            }, this.Ctor);
            if (this.keepAlive) {
              this.cache[this.ctorId] = child;
            }
            return child;
          }
        }
    };
};