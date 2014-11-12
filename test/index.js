'use strict';

var test = require('tape'),
    Vue = require('vue'),
    page = require('page'),
    route = require('../src/index.js');

var has = Object.prototype.hasOwnProperty;

// Insert pushtate markup
var tempDiv = document.createElement('div');
tempDiv.innerHTML = '<meta name="fragment" content="!" /><base href="/"/>';
var $head = document.getElementsByTagName('head')[0];
$head.appendChild(tempDiv.firstChild);
$head.appendChild(tempDiv.firstChild);
// Insert v-route directive
tempDiv.innerHTML = '<div v-route></div>';
document.body.appendChild(tempDiv.firstChild);

// Phantomjs fix
Function.prototype.bind = require('function-bind');

/*
    Test setup
 */
Vue.use(route);

Vue.component('page-1', {
    template: '<div class="page1"></div>'
});

Vue.component('page-2', {
    template: '<h2 class="page2"></h2>'
});

Vue.component('page-3', {
    template: '<div class="page3"></div>',
    created: function() {
        this.$root.$emit('page3', this.$data.$routeParams);
    }
});

var beforeCalled = false,
    afterCalled = false,
    routes = {
        '/page1': {
            componentId: 'page-1',
            isDefault: true
        },
        '/page2': {
            componentId: 'page-2',
            beforeUpdate: before,
            afterUpdate: 'after'
        },
        '/page3/:foo': {
            componentId: 'page-3'
        }
    };

function before() {
    beforeCalled = true;
}

var root = new Vue({
    el: 'body',

    routes: routes,

    methods: {
        after: function() {
            afterCalled = true;
        }
    }
});

test('addRoute', function(assert) {
    for(var route in routes) {
        if(has.call(routes, route)) {
            assert.equal(routes[route], root.$options.routes[route], 'route ' + route + ' should be set.');
        }
    }

    assert.end();
});

test('before/after callbacks', function(assert) {
    assert.plan(2);

    beforeCalled = false;
    afterCalled = false;

    page('/page2');

    Vue.nextTick(function() {
        assert.ok(beforeCalled, 'before callback was called as a method.');
        assert.ok(afterCalled, 'after callback was called as a string (method on root vm).');
    });
});

test('router events', function(assert) {
    assert.plan(2);

    root.$on('router:beforeUpdate', function() {
        assert.pass('router:beforeUpdate event has been called.');
    });

    root.$on('router:afterUpdate', function() {
        assert.pass('router:afterUpdate event has been called.');
    });

    page('/page1');
});


test('location context update', function(assert) {
    assert.plan(1);
    root.$off();

    root.$on('router:afterUpdate', function(location, oldLocation) {
        assert.notEqual(location.path, oldLocation.path, 'location and oldLocation should be different.');
    });

    page('/page2');
});

test('route params', function(assert) {
    assert.plan(1);
    root.$off();

    var foo = 'thing';

    root.$on('page3', function(params) {
        assert.equal(params.foo, foo, 'The route parameter should have been set.');
    });

    page('/page3/' + foo);
});

test('onDefaultRoute', function(assert) {
    assert.plan(1);

    var url = (Math.random() * 10000).toString(36);
    page('/' + url);

    Vue.nextTick(function() {
        assert.equal(location.pathname, '/page1', 'Should get back to the default route.');
    });
});