'use strict';

var page = require('page'),
    Vue = require('vue'),
    _ = Vue.util,
    verbose = false,
    hasOwnProp = Object.prototype.hasOwnProperty;

/*
  NON-REQUIREABLE VUE INTERNALS
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

/*
    PLUGIN DEFINITION
    V-ROUTE DIRECTIVE
    ===================
 */

module.exports = function(Vue, params) {

    Vue.directive('route', {
        isLiteral: true,

        defaultRoute: '/',

        routes: {},

        params: {},

        /*
        ROUTING API
        ===================
        */

        /*
            Registers the route with the specified path/pattern (express-like regexp)
            route: infos as {id: "route-id", path: "/route"} or {id: "route-id", path: "/route/:id"}
        */
        addRoute: function(path, options) {
            if(verbose) console.warn('addRoute', path, options);

            // pre-route callback
            if(options.beforeRoute) {
                page(path, options.beforeRoute);
            }

            page(path, _.bind(function(context, next) {
                this.onRoute(path, context, next);
            }, this));

            // post-route callback
            if(options.afterRoute) {
                page(path, options.afterRoute);
            }

            if(options.isDefault) {
                this.defaultRoute = path;
            }
        },

        /*
            Starts the router.
        */
        start: function() {
            page.start();
            this.vm.$root.$emit('router:started');
        },

        /*
            Internal method.
            Updates the context and emit the `router:update` event.
        */
        onRoute: function(path, context, next) {
            if(verbose) console.debug('[router] onRoute', path, context);

            // call before then next

            var componentId = this.routes[path].componentId;
            this.params = context.params;

            // call next

            // call after

            /*this.context.params = context.params;
            this.context.componentId = this.getCurrentRouteId(context.path);
            this.context.path = context.path;*/

            this.vm.$root.$emit('router:updated', context.path);

            this.update(componentId);
        },

        /*
            Called when the requested route does not exists
            Redirects to proper default route
        */
        onDefaultRoute: function(context) {
            if(verbose) console.log('onDefaultRoute', context);
            Vue.nextTick(function() {
                // history.replaceState({}, '', '/' + this.defaultRoute);
                page(this.defaultRoute);
            }.bind(this));
        },

        /*
            V-COMPONENT API
            ===================
        */

        /**
            * Resolve the component constructor to use when creating
            * the child vm.
        */

        resolveCtor: function(id) {
            this.ctorId = id;
            this.Ctor = this.vm.$options.components[id];
            _.assertAsset(this.Ctor, 'component', id);
        },

        /**
            * Instantiate/insert a new child vm.
        */

        build: function () {
            var vm = this.vm,
                routeParams = this.params;

            if (this.Ctor && !this.childVM) {
                this.childVM = vm.$addChild({
                    el: clone(this.el),
                    data: function() {
                        return {
                            $routeParams: routeParams
                        };
                    }
                }, this.Ctor);
                if (this.parentLinker) {
                    var dirCount = vm._directives.length;
                    var targetVM = this.childVM.$options.inherit ? this.childVM : vm;
                    this.parentLinker(targetVM, this.childVM.$el);
                    this.parentDirs = vm._directives.slice(dirCount);
                }
                this.childVM.$before(this.ref);
            }
        },

        /**
            * Teardown the active vm.
            *
            * @param {Boolean} remove
        */

        unbuild: function (remove) {
        if (!this.childVM) {
            return;
        }
        this.childVM.$destroy(remove);
        if (this.parentDirs) {
            var i = this.parentDirs.length;
                while (i--) {
                    this.parentDirs[i]._teardown();
                }
            }
            this.childVM = null;
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
                // check parent directives
                this.parentLinker = this.el._parentLinker;
            } else {
                _.warn('v-route="' + this.expression + '" cannot be ' + 'used on an already mounted instance.');
            }

            // Ensure the $root has a 'route' prop
            if(!this.vm.$root.route) {
                this.vm.$root.$add('route', null);
            }

            // get the routes options
            this.routes = this.vm.$root.$options.routes;
            if(!this.routes) {
                _.warn('v-route needs the $root to be passed a "routes" option.');
            }

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


        /**
            * Update callback for the dynamic literal scenario,
            * e.g. v-component="{{view}}"
        */

        update: function (value) {
            this.unbuild(true);
            if (value) {
                this.resolveCtor(value);
                this.build();
            }
        },

        /**
            * Unbind.
            * Make sure keepAlive is set to false so that the
            * instance is always destroyed.
        */

        unbind: function () {
            this.unbuild();
        }
    });
};