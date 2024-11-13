"use strict";var _slicedToArray=function(n,r){if(Array.isArray(n))return n;if(Symbol.iterator in Object(n))return function(n,r){var t=[],e=!0,o=!1,u=void 0;try{for(var i,c=n[Symbol.iterator]();!(e=(i=c.next()).done)&&(t.push(i.value),!r||t.length!==r);e=!0);}catch(n){o=!0,u=n}finally{try{!e&&c.return&&c.return()}finally{if(o)throw u}}return t}(n,r);throw new TypeError("Invalid attempt to destructure non-iterable instance")},_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(n){return typeof n}:function(n){return n&&"function"==typeof Symbol&&n.constructor===Symbol&&n!==Symbol.prototype?"symbol":typeof n};function _toConsumableArray(n){if(Array.isArray(n)){for(var r=0,t=Array(n.length);r<n.length;r++)t[r]=n[r];return t}return Array.from(n)}!function(){var n=function(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+*/",r=n.split(""),t=n.length,e=r.reduce((function(n,r,t){return n[r]=t,n}),{}),o=function(n){if(0===n)return r[0];for(var e="";n>0;)e=r[n%t]+e,n=Math.floor(n/t);return e},u=function(n){for(var r=0,o=n.length,u=0;u<o;u++)r+=e[n.charAt(u)]*Math.pow(t,o-u-1);return r};return{encode:function(n){return n<0?"-"+o(-n):o(n)},decode:function(n){return"-"===n[0]?-1*u(n.substring(1)):u(n)}}};window&&(window.BaseConvert=n());var r=n(),t=function(n,r){return function(t){if(!r(t))throw new Error("Expected ["+n+"], received "+(void 0===t?"undefined":_typeof(t))+" "+JSON.stringify(t))}},e=t("integer >= 0",(function(n){return"number"==typeof n&&n>=0})),o=function(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:6,o=[].concat(_toConsumableArray(Array(n))).map((function(n,r){return 1<<r})),u=function(n){return Array.isArray(n)&&n.every((function(n){return"number"==typeof n}))&&n.length>0},i=function(r,o){e(r),t("input is bit field",u)(o);var i=o.length*n-1;return t("address is number between 0 and "+i,(function(n){return n<=i}))(r),[Math.floor(r/n),r%n]},c=function(n,r,t){return!!(t[n]&o[r])},a=function(n,r){var t=i(n,r),e=_slicedToArray(t,2),o=e[0],u=e[1];return c(o,u,r)};return{of:function(r){e(r);var t=Math.max(Math.floor((r-1)/n)+1,1);return[].concat(_toConsumableArray(Array(t))).map((function(n){return 0}))},getAt:a,setAt:function(n,r){var t=i(n,r),e=_slicedToArray(t,2),u=e[0],c=e[1];return r.map((function(n,r){return r===u?n|o[c]:n}))},clearAt:function(n,r){var t=i(n,r),e=_slicedToArray(t,2),u=e[0],a=e[1];return c(u,a,r)?r.map((function(n,r){return r===u?n^o[a]:n})):r},toBase65:function(t){var e=t.map(r.encode);return n<7?e.join(""):e.join(",")},fromBase65:function(t){return(n<7?t.split(""):t.split(",")).map(r.decode)},count:function(r){for(var t=r.length*n,e=0,o=0;o<t;o++)a(o,r)&&e++;return e},padTo:function(r,t){var e=Math.max(Math.floor((r-1)/n)+1,1);if(t.length<e){var o=t.length-e,u=[].concat(_toConsumableArray(Array(o))).map((function(){return 0}));return t.concat(u)}}}};window&&(window.BitFieldBase=o),window&&(window.BitField=o());var u=o(),i=function(n){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},e=t.compress,o=void 0===e?function(n){return n}:e,i=t.uncompress,c=void 0===i?function(n){return n}:i,a=function(r){return Object.keys(n).filter((function(t){return _typeof(n[t])===r}))},f=a("boolean"),l=a("number"),s=a("string"),y=Object.keys(n).filter((function(r){return Array.isArray(n[r])})),d="$",v=function(n,r){var t={};return Object.keys(n).forEach((function(r){return t[r]=n[r]})),Object.keys(r).forEach((function(n){return t[n]=r[n]})),t},p=function(n){var r=u.fromBase65(n);return f.reduce((function(n,t,e){return n[t]=u.getAt(e,r),n}),{})},m=function(n,r){return function(t){return t.split("|").reduce((function(t,e,o){return t[n[o]]=r(e),t}),{})}},h=m(s,(function(n){return n})),A=m(l,r.decode),b=m(y,u.fromBase65),w=function(n){var r=c(n).split(d),t=_slicedToArray(r,4),e=t[0],o=t[1],u=t[2],i=t[3];return[A(e),h(o),p(u),b(i)].reduce(v,{})},g=function(n,r){Object.keys(r).forEach((function(t){null!==r[t]&&void 0!==r[t]&&n[t]!==r[t]&&(n[t]=r[t])}))};return{parse:w,initialize:function(r){g(r,n)},hydrate:function(n,r){g(n,w(r))},serialize:function(n){return o(function(n){return l.map((function(t){return r.encode(n[t])})).join("|")}(n)+d+function(n){return s.map((function(r){return n[r]})).join("|")}(n)+d+function(n){var r=f.reduce((function(r,t,e){return n[t]?u.setAt(e,r):u.clearAt(e,r)}),u.of(f.length));return u.toBase65(r)}(n)+d+function(n){return y.map((function(r){return u.toBase65(n[r])}))}(n))}}};window&&(window.State=i)}();
