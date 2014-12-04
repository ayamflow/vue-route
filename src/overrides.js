'use strict';

/*
    Overrides for (some of) v-component methods
 */

module.exports = function(Vue) {
    var component = Vue.directive('component'),
        parsers = Vue.parsers;

    return {
        bind: function () {
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
          var vm = this.vm,
              routeParams = this.location.params;
          var el = parsers.template.clone(this.el);
          if (this.Ctor) {
            var child = vm.$addChild({
              el: el,
              _asComponent: true,
              data: function() {
                return {
                  $routeParams: routeParams
                };
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