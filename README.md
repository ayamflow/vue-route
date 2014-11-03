vue-route
=======

Routing directive for Vue.js, inspired by ng-view.

Allows you to declare your routes on the $root Vue object:

```
var root = new Vue({
    el: 'body',

    routes: {
        '/home': {
            componentId: 'fg-home',
            transition: 'outAndAfterIn',
            isDefault: true
        },
        '/work/:work': {
            componentId: 'fg-work',
            transition: 'outAndAfterIn'
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
It's heavily based on the `v-component` directive by @yyx990803 (on the [vuejs repo](https://github.com/yyx990803/vue/blob/0.11.0-rc3/src/directives/component.js)) so big up to him!

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
    * *transition*: A timing indicator for the transition between 2 pages.
    * *beforeRouting*: a callback to call before effectively changing to this route
    * *afterRouting*: a callback to call after effectively having changed to this route
    * *isDefault*: boolean indicating wether this page should be the default, in case of non-existing URL. Think of it as the `otherwise` from Angular, so basically a 404 or the home page.

* The router will `$emit` on your $root VM: `routing:started`, and `routing:updated`.