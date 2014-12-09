'use strict';

/*
    Routing API
    Methods for handling the route change
    and trigger the directive update
*/

module.exports = function(Vue, page, utils) {
    var _ = Vue.util;

    /*
        Allow to manually navigate to a path.
        Useful if you passed the `click: false` option.
     */
    Vue.navigate = function(path, trigger) {
        page.show(path, null, trigger !== false);
    };

    return {
        init: function() {
          /*
              Link the routes declaration
           */
          this.routes = this.vm.$root.$options.routes;
          if(!this.routes) {
              _.warn('v-route needs the $root to be passed a "routes" option hash.');
          }

          /*
              Options for v-route & page (base, hashbang, debug...)
           */
          this.options = this.routes.options || {};

          /*
            If options.broadcast, uses $broadcast for routing events, else uses $emit
           */
          this.notifier = !!this.options.broadcast ? '$broadcast' : '$emit';

          /*
            Register all the routes
           */
          for(var route in this.routes) {
              // Ignore options
              if(route[0] === '/') {
                  if(utils.hasOwnProp.call(this.routes, route)) {
                      this.addRoute(route, this.routes[route]);
                  }
              }
          }

          /*
            Bind default route
           */
          page('*', _.bind(this.onDefaultRoute, this));

          /*
            Start the routing
           */
          this.start();
        },

        /*
            Registers the route with the specified path/pattern (express-like regexp)
            route: infos as {id: "route-id", path: "/route"} or {id: "route-id", path: "/route/:id"}
        */
        addRoute: function(path, options) {
            if(this.options.debug) _.log('[v-route] addRoute', path, options);

            var routeFn = function(context, next) {
                Vue.nextTick(function() {
                    this.onRoute(path, context, next);
                }, this);
            };

            // Add a relevant stack trace
            routeFn.displayName = 'routing ' + path;

            page(path, _.bind(routeFn, this));

            if(options.isDefault) {
                this.defaultRoute = path;
            }
        },

        /*
            Starts the router.
        */
        start: function() {
            if(this.options.debug) _.log('[v-route] start');
            page.start(this.options);
            this.vm.$root[this.notifier]('router:started');
        },

        /*
            Internal method.
            Updates the context and emit the `router:update` event.
        */
        onRoute: function(path, context, next) {
            if(this.options.debug) _.log('[v-route] onRoute', path, context);

            /*
                Get new route, componentId and update location context
             */
            var route = this.routes[path],
                componentId = route.componentId,
                oldLocation = _.extend({}, this.location);

            this.location.regexp = path;
            this.location.path = context.path;
            this.location.componentId = componentId;
            this.location.params = context.params;

            /*
                before applying the route, emit the event + execute custom callback
             */
            this.callRouteHook('before', route.beforeUpdate, [this.location, oldLocation]);
            /*
                Update the current component
             */
            this.update(componentId);

            /*
                after applying the route, emit the event + execute custom callback
             */
            this.callRouteHook('after', route.afterUpdate, [this.location, oldLocation]);
        },

        /*
            Called when the requested route does not exists
            Redirects to proper default route
        */
        onDefaultRoute: function(context) {
            if(this.options.debug) _.log('[v-route] onDefaultRoute', context);

            Vue.nextTick(function() {
                page(this.defaultRoute);
            }.bind(this));
        },

        callRouteHook: function(when, method, params) {
            if(this.options.debug) _.log('[v-route] callRouteHook', when, method, params);

            if(method) {
                if(utils.toString.call(method) == '[object String]') {
                    if(this.vm.$root[method]) {
                        this.vm.$root[method].apply(this.vm, params);
                    }
                }
                else {
                    method.apply(params);
                }
            }

            this.vm.$root[this.notifier].apply(this.vm.$root,
                utils.concat.call([], 'router:' + when + 'Update', params)
            );
        }
    };
};