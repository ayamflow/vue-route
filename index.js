'use strict';

var page = require('page'),
    hasOwnProp = Object.prototype.hasOwnProperty,
    toString = Object.prototype.toString,
    concat = Array.prototype.concat;

/*
    PLUGIN DEFINITION
    V-ROUTE DIRECTIVE
    ===================
 */

module.exports = function(Vue, params) {
    var _ = Vue.util;

    Vue.directive('route', {
        isLiteral: true,

        notifier: null,

        defaultRoute: '/',

        routes: {},

        location: {
            regexp: null,
            path: null,
            componentId: null,
            params: null
        },

        /*
        ROUTING API
        ===================
        */

        /*
            Registers the route with the specified path/pattern (express-like regexp)
            route: infos as {id: "route-id", path: "/route"} or {id: "route-id", path: "/route/:id"}
        */
        addRoute: function(path, options) {
            if(this.debug) _.log('[v-route] addRoute', path, options);

            page(path, _.bind(function(context, next) {
                this.onRoute(path, context, next);
            }, this));

            if(options.isDefault) {
                this.defaultRoute = path;
            }
        },

        /*
            Starts the router.
        */
        start: function() {
            if(this.debug) _.log('[v-route] start');
            page.start();
            this.vm.$root[this.notifier]('router:started');
        },

        /*
            Internal method.
            Updates the context and emit the `router:update` event.
        */
        onRoute: function(path, context, next) {
            if(this.debug) _.log('[v-route] onRoute', path, context);

            /*
                Get new route, componentId and update location context
             */
            var route = this.routes[path],
                componentId = route.componentId,
                oldLocation = {};

            _.extend(oldLocation, this.location);
            this.location.regexp = path;
            this.location.path = context.path;
            this.location.componentId = componentId;
            this.location.params = context.params;

            /*
                before applying the route, emit the event + execute custom callback
             */
            this.callRouteHook('before', route.beforeUpdate, [this.location, oldLocation]);

            // Update the current component
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
            if(this.debug) _.log('[v-route] onDefaultRoute', context);

            Vue.nextTick(function() {
                page(this.defaultRoute);
            }.bind(this));
        },

        callRouteHook: function(when, method, params) {
            if(this.debug) _.log('[v-route] callRouteHook', when, method, params);

            if(method) {
                if(toString.call(method) == '[object String]') {
                    if(this.vm.$root[method]) {
                        this.vm.$root[method].apply(this.vm, params);
                    }
                }
                else {
                    method.apply(params);
                }
            }

            this.vm.$root[this.notifier].apply(this.vm.$root,
                concat.call([], 'router:' + when + 'Update', params)
            );
        },

        /*
            DIRECTIVE API
            bind, update, unbind
            ===================
        */

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
                if(hasOwnProp.call(this.routes, route)) {
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
        },

        /*
            V-COMPONENT API
            ===================
        */

        checkKeepAlive: function () {
           // check keep-alive flag
           this.keepAlive = this.el.hasAttribute('keep-alive');
           if (this.keepAlive) {
                this.el.removeAttribute('keep-alive');
                this.cache = {};
            }
        },

        resolveCtor: function(id) {
            this.ctorId = id;
            this.Ctor = this.vm.$options.components[id];
            _.assertAsset(this.Ctor, 'component', id);
        },

        build: function () {
            if (this.keepAlive) {
                var cached = this.cache[this.ctorId];
                if (cached) {
                    this.childVM = cached;
                    cached.$before(this.ref);
                    return;
                }
            }
            var vm = this.vm;
            if (this.Ctor && !this.childVM) {
                this.childVM = vm.$addChild({
                    el: clone(this.el)
                }, this.Ctor);
                if (this.parentLinker) {
                    var dirCount = vm._directives.length;
                    var targetVM = this.childVM.$options.inherit ? this.childVM : vm;
                    this.parentLinker(targetVM, this.childVM.$el);
                    this.parentDirs = vm._directives.slice(dirCount);
                }
                if (this.keepAlive) {
                    this.cache[this.ctorId] = this.childVM;
                }
                this.childVM.$before(this.ref);
            }
        },

        unbuild: function (remove) {
            if (!this.childVM) {
                return;
            }
            if (this.keepAlive) {
                if (remove) {
                    this.childVM.$remove();
                }
            } else {
                this.childVM.$destroy(remove);
                if (this.parentDirs) {
                    var i = this.parentDirs.length;
                    while (i--) {
                        this.parentDirs[i]._teardown();
                    }
                }
            }
            this.childVM = null;
        }
    });
};

/*
  NON-REQUIREABLE VUE INTERNALS
  (COPIED FROM V-COMPONENT SOURCE)
  ===================
 */

/**
 * Test for the presence of the Safari template cloning bug
 * https://bugs.webkit.org/show_bug.cgi?id=137755
 */

var hasBrokenTemplate = (function () {
  var a = document.createElement('div');
  a.innerHTML = '<template>1</template>';
  return !a.cloneNode(true).firstChild.innerHTML;
})();

/**
 * Deal with Safari cloning nested <template> bug by
 * manually cloning all template instances.
 *
 * @param {Element|DocumentFragment} node
 * @return {Element|DocumentFragment}
 */

function clone(node) {
  var res = node.cloneNode(true);

  if (hasBrokenTemplate) {
    var templates = node.querySelectorAll('template');
    if (templates.length) {
      var cloned = res.querySelectorAll('template');
      var i = cloned.length;
      while (i--) {
        cloned[i].parentNode.replaceChild(templates[i].cloneNode(true), cloned[i]);
      }
    }
  }
  return res;
}