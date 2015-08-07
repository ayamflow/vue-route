'use strict';

var test = require('prova'),
    Vue = require('vue'),
    page = require('page'),
    route = require('../src/index.js');

var tempDiv = document.createElement('div');
tempDiv.innerHTML = '<div keep-alive v-route></div>';
document.body.appendChild(tempDiv.firstChild);

var routes = {
    '/page1': {
        componentId: 'page-1',
        data: {
            isPage1: true
        },
        isDefault: true
    },
    '/page2/:page': {
        componentId: 'page-2',
        data: {
            isPage1: 'nope',
            isPage2: true
        }
    }
};

Vue.use(route);

Vue.component('page-1', {
    template: '<div class="page1"></div>',
    ready: function() {
        // console.log('page-1', this.$data.$routeParams.page);
        // console.log('page-1', routes['/page2/:page'].data, this.$data);
    }
});

Vue.component('page-2', {
    template: '<h2 keep-alive class="page2"></h2>',
    attached: function() {
        // console.log('page-2', this.$data.$routeParams.page);
        // console.log('page-2', routes['/page2/:page'].data, this.$data);
    }
});

/*var root = new Vue({
    el: 'body',
    routes: routes
});

test('data', function(assert) {
    setTimeout(function() {
        Vue.navigate('/page2/test');
        setTimeout(function() {
            Vue.navigate('/page1');
            setTimeout(function() {
                Vue.navigate('/page2/otherParam');
                setTimeout(function() {
                    Vue.navigate('/page1');
                    setTimeout(function() {
                        Vue.navigate('/page2/andAnother');
                    }, 800);
                }, 800);
            }, 800);
        }, 800);
    }, 800);
});
*/
