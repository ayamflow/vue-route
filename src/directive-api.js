'use strict';

/*
    Directive API
    bind, update, unbind
*/

module.exports = function(Vue, page, utils) {
    var _ = Vue.util;

    return {
        bind: function () {
            if (!this.el.__vue__) {
                // create a ref anchor
                this.ref = document.createComment('v-route');
                _.replace(this.el, this.ref);
                // check keep-alive options
                this.checkKeepAlive();
                // check parent directives
                this.parentLinker = this.el._parentLinker;
                // if static, build right now.
                if (!this._isDynamicLiteral) {
                this.resolveCtor(this.expression);
                this.build();
                }
            }
            else {
              _.warn('v-route="' + this.expression + '" cannot be ' + 'used on an already mounted instance.');
            }

            // get the routes options
            this.routes = this.vm.$root.$options.routes;
            if(!this.routes) {
                _.warn('v-route needs the $root to be passed a "routes" option hash.');
            }

            var broadcast = !!this.routes.broadcast;
            this.notifier = broadcast ? '$broadcast' : '$emit';

            this.debug = !!this.routes.debug;

            // Register all the routes
            for(var route in this.routes) {
                if(utils.hasOwnProp.call(this.routes, route)) {
                    this.addRoute(route, this.routes[route]);
                }
            }

            // Bind default route
            page('*', _.bind(this.onDefaultRoute, this));

            // start the routing
            this.start();
        },

        update: function (value) {
            this.unbuild(true);
            if(value) {
                this.resolveCtor(value);
                this.build();
            }
        },

        unbind: function () {
            this.keepAlive = false;
            this.unbuild();
        }
    };
};