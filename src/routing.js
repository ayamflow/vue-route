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
            Use page.base to set the URL base
            TODO tests
           */
          if(this.options.base) {
            page.base(this.options.base);
          }

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
                // Vue.nextTick(function() {
                    this.onRoute(path, context, next);
                // }, this);
            };

            // Add a relevant stack trace
            routeFn.displayName = 'routing ' + path;

            // Middleware prop
            /*
              page(path, onRoute, beforeUpdate, updateRoute, afterUpdate);
              - onRoute -> updateLocation field
              - beforeUpdate -> emit event, call callbacks, if no callbacks -> next
              - updateRoute -> effectively applies the route, next
              - afterUpdate -> emit event, call callbacks
            */

            // page(path, _.bind(routeFn, this));

            page(path, _.bind(routeFn, this), _.bind(this.beforeUpdate, this), _.bind(this.updateRoute, this));

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
                componentId = route.componentId;

            this.oldLocation = _.extend({}, this.location);
            this.location = {
                regexp: path,
                path: context.path,
                componentId: componentId,
                params: context.params
            };

            next();
        },

        beforeUpdate: function(context, next) {
            this.callRouteHook('before', next);
        },

        updateRoute: function() {
          /*
              Update the current component
           */
          var componentId = this.routes[this.location.regexp].componentId;
          this.update(componentId);

          /*
              after applying the route, emit the event + execute custom callback
           */
          this.callRouteHook('after');
        },

        /*
            Called when the requested route does not exists
            Redirects to proper default route
        */
        onDefaultRoute: function(context) {
            if(this.options.debug) _.log('[v-route] onDefaultRoute', context);

            Vue.nextTick(function() {
                page(this.defaultRoute);
            }, this);
        },

        callRouteHook: function(when, next) {
            if(this.options.debug) _.log('[v-route] callRouteHook', when, next);

            var route = this.routes[this.location.regexp],
                callback = route[when + 'Update'],
                $root = this.vm.$root,
                locations = [this.location, this.oldLocation],
                middleware;

            if(callback) {
              if(utils.isFunction(callback)) {
                  middleware = callback;
              }
              else if(utils.isString(callback)) {
                if($root[callback]) {
                  middleware = $root[callback];
                }
              }
            }

            _.nextTick(function() {
              this.callRouteEvents(when, locations);
            }, this);

            /*
              If a middleware is declared, we call it and wait for the call to `next`
             */
            if(middleware) {
              middleware.apply($root, utils.concat.call(locations, next));
            }

            /*
              If no middleware is declared, we call `next` to continue the routing
             */
            else if(next) {
              next();
            }
        },

        callRouteEvents: function(when, locations) {
            var $root = this.vm.$root;

            $root[this.notifier].apply($root,
                utils.concat.call([], 'router:' + when + 'Update', locations)
            );
        }
    };
};
