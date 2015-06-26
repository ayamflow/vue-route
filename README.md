vue-route
=======

Routing directive for Vue.js, inspired by ng-view.
Based on `v-component` thus benefits from `v-transition`, `keep-alive`, `wait-for`, `transition-mode`.

Versions 1.5.0+ are made for **Vue.js v0.12+.**
Use older versions for Vue.js v0.11.

Allows you to declare your routes on the `$root` Vue object:

```js
var root = new Vue({
    el: 'body',

    routes: {
        '/home': {
            componentId: 'fg-home',
            isDefault: true
        },
        '/items/:item': {
            componentId: 'fg-item',
            afterUpdate: 'updateHeader',
            data: {
                defaultColor: '#3453DD'
            }
        },
        options: {
            hashbang: true
        }
    }
});

```

With minimal markup:

```html
<body>
    <div v-route></div>
</body>

```

`vue-route` extends the `v-component` directive by @yyx990803 (on the [vuejs repo](https://github.com/yyx990803/vue/tree/master/src/directives/component.js)). Buy him a coffee if you can.

## Get started

**1.** Install with npm/component(1): `npm i vue-route --save` or `component install ayamflow/vue-route`.

**2.** Require and install the plugin:

```js
var Vue = require('vue'),
    route = require('vue-route');

Vue.use(route); // BOOM
```

**3.** Put the `<div v-route></div>` in your main template.

**4.** Pass your routes to the `$root` VM of you app (see example above).

**5.** Profit !

## Transition, keep-alive and other directives
If you want to add custom transitions between your pages, it's recommended to put them on each page's component template. Putting anything on the `v-route` element itself will only be active if you change this element (for instance with a `v-if` directive).
Following the example, that would be:

```js
<div class="Home" v-transition="homeTransition">...</div> // fg-home component
```

## Additional infos

* Routes definition: when you pass your routes to the `$root`, you can pass several properties:
    * `componentId`: the Vue.component id for the associated template/VM.
    * `beforeUpdate`: a callback (method or name of method on the vm) to call before effectively changing to this routehtml.
    * `afterUpdate`: a callback (method or name of method on the vm) to call after effectively having changed to this route.
    * `data`: an object (or function returning an object) that will be **merged** with the view's `$data`. This is useful when we need to use the same component for different urls but using different data.
    * `isDefault`: boolean indicating wether this page should be the default, in case of non-existing URL. Think of it as the `otherwise` from Angular, so basically a 404 or the home page.

`beforeUpdate` is a middleware, this means you need to call the `next` function provided as the third argument, to continue routing. This allows to prevent a route based on some condition.
For instance, you can `return` before `next` is called to cancel the route; usefull for an authentication page for instance.
Another instance is to pause the app during loading and calling `next` when everything is loaded, thus resuming the flow.

Vue is augmented with an additional method, `Vue.navigate(path, [trigger])`. [trigger] is a boolean (defaults to true) that will `pushState` if true, `replaceState` otherwise.

* The router will emit events on your `$root` VM: `router:started`, `router:beforeUpdate`, `router:afterUpdate`.

* You can pass a `options` hash to pass configuration to the router:
    * `hashbang`: boolean (defaults to false) to use `#!` urls. Note that your links shouldn't include hashbangs, the router handles this.
    * `click`: boolean (defaults to true) to automatically bind all click to the router. Not that if `false`, you will need to explicitly call `Vue.navigate` method).
    * `base`: string (defaults to '/') to specify the base path.
    * `broadcast`: boolean (defaults to false) if true the events will be emitted using the $root `$broadcast` method, so all child VMs will receive the event until a handler `return false;`. If false, it uses `$emit`.
    * `debug`: boolean (defaults to false) to activate logging from the directive.

## Location context

When the router emits an event, 2 parameters are passed: `location` and `oldLocation`. Like in Angular, it is an object containing some useful properties:
* `regexp`: the route regexp, such as `/items/:item`.
* `path`: the current path, such as `/items/razor/`.
* `params`: a hash of the params from the route, here `{item: 'razor'}`.
* `componentId`: the componentId associated to the current route.

## Route parameters

Each component used by `v-route` will have its `$data` extended with the `location.params` array (see above). That means that on the route `/items/razor`, `this.$data.$routeParams.item == 'razor'`.

## Subroutes
Managing subviews with subroutes like `/route/:firstParam/:secondParam` is userland responsability; you should handle this with a `v-component` or programmatically.

## Compatibility note
vue-route supports the same browsers as Vue; however to make it properly work on IE9 you need to add the [HTML5-history-API polyfill](https://github.com/devote/HTML5-History-API).

## Contributing

* Fork & PR on **[dev](https://github.com/ayamflow/vue-route/tree/dev)** branch.
* If possible, add tests to cover the changes.
* Code style: 4 tabs, semicolons. Check the code if in doubt.
