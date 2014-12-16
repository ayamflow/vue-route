vue-route
=======

Routing directive for Vue.js **(v0.11)**, inspired by ng-view.
Based on `v-component` thus benefits from `v-transition`, `keep-alive`, `wait-for`, `transition-mode`.

Allows you to declare your routes on the $root Vue object:

```
var root = new Vue({
    el: 'body',

    routes: {
        '/home': {
            componentId: 'fg-home',
            isDefault: true
        },
        '/work/:work': {
            componentId: 'fg-work',
            afterUpdate: 'updateHeader',
            data: {
                defaultColor: '#3453DD'
            }
        },
        options: {
            hashbang: true
        }
    },
})

```

with minimal markup:

```
<body>
    <div v-route></div>
</body>

```

`vue-route` extends the `v-component` directive by @yyx990803 (on the [vuejs repo](https://github.com/yyx990803/vue/tree/master/src/directives/component.js)). Buy him a coffee if you can.

## Get started

**1.** Install with npm/component(1): `npm i vue-route --save` or `component install ayamflow/vue-route`.

**2.** require and install the plugin:

```
var Vue = require('vue'),
    route = require('vue-route');

Vue.use(route); // BOOM
```

**3.** Put the `<div v-route></div>` in your main template.

**4.** Pass your routes to the $root VM of you app (see example above).

**5.** Profit !

## Additional infos

* routes definition: when you pass your routes to the $root, you can pass several properties:
    * *componentId*: the Vue.component id for the associated template/VM.
    * *beforeUpdate*: a callback (method or name of method on the vm) to call before effectively changing to this route
    * *afterUpdate*: a callback (method or name of method on the vm) to call after effectively having changed to this route
    * *data*: an object that will be **merged** with the view's `$data`. This is useful when we need to use the same component for different urls but using different data.
    * *isDefault*: boolean indicating wether this page should be the default, in case of non-existing URL. Think of it as the `otherwise` from Angular, so basically a 404 or the home page.

beforeUpdate is a middleware, this means you need to call the `next` function provided as the third argument, to continue routing. This allows to prevent a route based on some condition.

Vue is augmented with an additional method, `Vue.navigate(path, [trigger])`. [trigger] is a boolean (defaults to true) that will `pushState` if true, `replaceState` otherwise.

* The router will emit events on your $root VM: `router:started`, `router:beforeUpdate`, `router:afterUpdate`.

* You can pass a `options` hash to pass configuration to the router:
    * `hashbang` boolean (defaults to false) to use '#!' urls
    * `click` boolean (defaults to true) to automatically bind all click to the router. Not that if `false`, you will need to explicitly call `Vue.navigate` method)
    * `base` string (defaults to '/') to specify the base path
    * `broadcast` boolean (defaults to false) if true the events will be emitted using the $root `$broadcast` method, so all child VMs will receive the event until a handler `return false;`. If false, it uses `$emit`.
    * `debug` boolean (defaults to false) to activate logging from the directive.

## Location context

When the router emits an event, 2 parameters are passed: `location` and `oldLocation`. Like in Angular, it is an object containing some useful properties:
* regexp: the route regexp, such as `/items/:itemId`
* path: the current path, such as `/items/razor/`
* params: a hash of the params from the route, here `{item: 'razor'}`
* componentId: the componentId associated to the current route

## Contributing

* fork & PR on **[dev](https://github.com/ayamflow/vue-route/tree/dev)** branch.
* if possible, add tests to cover the changes.
* code style: 4 tabs, semicolons. Check the code if in doubt.
