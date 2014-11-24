'use strict';

/*
    v-component API
    Taken straight from the source
    with non-requirable internals (clone, hasBrokenTemplate)
*/

module.exports = function(Vue) {
    var _ = Vue.util;

    return {
        checkKeepAlive: function () {
           // check keep-alive flag
           this.keepAlive = this.el.hasAttribute('keep-alive');
           if (this.keepAlive) {
                this.el.removeAttribute('keep-alive');
                this.cache = {};
            }
        },

        resolveCtor: function(id) {
            if(!id.length) return; // prevent the null id warning
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
            var vm = this.vm,
                routeParams = this.location.params;
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
    };
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