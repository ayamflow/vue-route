vue-route
=======

Routing directive for Vue.js **(v0.11)**, inspired by ng-view.

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
            afterUpdate: 'updateHeader'
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
It's heavily based on the `v-component` directive by @yyx990803 (on the [vuejs repo](https://github.com/yyx990803/vue/blob/0.11.0-rc3/src/directives/component.js)) so big up to him! *`keep-alive` is not implemented.*

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
    * *afterUpdate*: a callback (mehod or name of method on the vm) to call after effectively having changed to this route
    * *isDefault*: boolean indicating wether this page should be the default, in case of non-existing URL. Think of it as the `otherwise` from Angular, so basically a 404 or the home page.

* The router will `$emit` on your $root VM: `routing:started`, `routing:beforeUpdate`, `routing:afterUpdate`.

## Todo
* unit tests
* transition timing (out then in, in then out, ...)