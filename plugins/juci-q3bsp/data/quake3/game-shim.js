/**
 * @fileoverview game-shim - Shims to normalize gaming-related APIs to their respective specs
 * @author Brandon Jones
 * @version 0.6
 */

/*
 * Copyright (c) 2011 Brandon Jones
 *
 * This software is provided 'as-is', without any express or implied
 * warranty. In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 *    1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 *
 *    2. Altered source versions must be plainly marked as such, and must not
 *    be misrepresented as being the original software.
 *
 *    3. This notice may not be removed or altered from any source
 *    distribution.
 */

(function(global) {
    "use strict";

    var elementPrototype = (global.HTMLElement || global.Element)["prototype"];
    var getter;

    var GameShim = global.GameShim = {
        supports: {
            fullscreen: true,
            pointerLock: true
        }
    };

    //=====================
    // Fullscreen
    //=====================

    if(!("fullscreenElement" in document)) {
        getter = (function() {
            // These are the functions that match the spec, and should be preferred
            if("webkitFullscreenElement" in document) {
                return function() { return document.webkitFullscreenElement; };
            }
            if("mozFullscreenElement" in document) {
                return function() { return document.mozFullscreenElement; };
            }
            return function() { return null; }; // not supported
        })();

        Object.defineProperty(document, "fullscreenElement", {
            enumerable: true, configurable: false, writeable: false,
            get: getter
        });
    }

    // Document event: fullscreenchange
    function fullscreenchange(oldEvent) {
        var newEvent = document.createEvent("CustomEvent");
        newEvent.initCustomEvent("fullscreenchange", true, false, null);
        // TODO: Any need for variable copy?
        document.dispatchEvent(newEvent);
    }
    document.addEventListener("webkitfullscreenchange", fullscreenchange, false);
    document.addEventListener("mozfullscreenchange", fullscreenchange, false);

    // Document event: fullscreenerror
    function fullscreenerror(oldEvent) {
        var newEvent = document.createEvent("CustomEvent");
        newEvent.initCustomEvent("fullscreenerror", true, false, null);
        // TODO: Any need for variable copy?
        document.dispatchEvent(newEvent);
    }
    document.addEventListener("webkitfullscreenerror", fullscreenerror, false);
    document.addEventListener("mozfullscreenerror", fullscreenerror, false);

    // element.requestFullScreen
    if(!("requestFullScreen" in elementPrototype)) {
        elementPrototype.requestFullScreen = (function() {
            if("webkitRequestFullScreen" in elementPrototype) {
                return elementPrototype.webkitRequestFullScreen;
            }

            if("mozRequestFullScreen" in elementPrototype) {
                return elementPrototype.mozRequestFullScreen;
            }

            return function(){ /* unsupported, fail silently */ };
        })();
    }

    // document.exitFullScreen
    if(!("exitFullScreen" in document)) {
        document.exitFullScreen = (function() {
            if("webkitExitFullScreen" in document) {
                return document.webkitExitFullScreen;
            }

            if("mozExitFullScreen" in document) {
                return document.mozExitFullScreen;
            }

            return function(){ /* unsupported, fail silently */ };
        })();
    }

    //=====================
    // Pointer Lock
    //=====================

    var mouseEventPrototype = global.MouseEvent.prototype;

    if(!("movementX" in mouseEventPrototype)) {
        Object.defineProperty(mouseEventPrototype, "movementX", {
            enumerable: true, configurable: false, writeable: false,
            get: function() { return this.webkitMovementX || this.mozMovementX || 0; }
        });
    }

    if(!("movementY" in mouseEventPrototype)) {
        Object.defineProperty(mouseEventPrototype, "movementY", {
            enumerable: true, configurable: false, writeable: false,
            get: function() { return this.webkitMovementY || this.mozMovementY || 0; }
        });
    }

    // Navigator pointer is not the right interface according to spec.
    // Here for backwards compatibility only
    if(!navigator.pointer) {
        navigator.pointer = navigator.webkitPointer || navigator.mozPointer;
    }

    // Document event: pointerlockchange
    function pointerlockchange(oldEvent) {
        var newEvent = document.createEvent("CustomEvent");
        newEvent.initCustomEvent("pointerlockchange", true, false, null);
        document.dispatchEvent(newEvent);
    }
    document.addEventListener("webkitpointerlockchange", pointerlockchange, false);
    document.addEventListener("webkitpointerlocklost", pointerlockchange, false);
    document.addEventListener("mozpointerlockchange", pointerlockchange, false);
    document.addEventListener("mozpointerlocklost", pointerlockchange, false);

    // Document event: pointerlockerror
    function pointerlockerror(oldEvent) {
        var newEvent = document.createEvent("CustomEvent");
        newEvent.initCustomEvent("pointerlockerror", true, false, null);
        document.dispatchEvent(newEvent);
    }
    document.addEventListener("webkitpointerlockerror", pointerlockerror, false);
    document.addEventListener("mozpointerlockerror", pointerlockerror, false);

    // document.pointerLockEnabled
    if(!("pointerLockEnabled" in document)) {
        getter = (function() {
            // These are the functions that match the spec, and should be preferred
            if("webkitPointerLockEnabled" in document) {
                return function() { return document.webkitPointerLockEnabled; };
            }
            if("mozPointerLockEnabled" in document) {
                return function() { return document.mozPointerLockEnabled; };
            }

            GameShim.supports.pointerLock = false;
            return function() { return false; }; // not supported, never locked
        })();

        Object.defineProperty(document, "pointerLockEnabled", {
            enumerable: true, configurable: false, writeable: false,
            get: getter
        });
    }

    if(!("pointerLockElement" in document)) {
        getter = (function() {
            // These are the functions that match the spec, and should be preferred
            if("webkitPointerLockElement" in document) {
                return function() { return document.webkitPointerLockElement; };
            }
            if("mozPointerLockElement" in document) {
                return function() { return document.mozPointerLockElement; };
            }

            return function() { return null; }; // not supported
        })();

        Object.defineProperty(document, "pointerLockElement", {
            enumerable: true, configurable: false, writeable: false,
            get: getter
        });
    }

    // element.requestPointerLock
    if(!("requestPointerLock" in elementPrototype)) {
        elementPrototype.requestPointerLock = (function() {
            if("webkitRequestPointerLock" in elementPrototype) {
                return elementPrototype.webkitRequestPointerLock;
            }

            if("mozRequestPointerLock" in elementPrototype) {
                return elementPrototype.mozRequestPointerLock;
            }

            return function() { /* unsupported, fail silently */ };
        })();
    }

    // document.exitPointerLock
    if(!("exitPointerLock" in document)) {
        document.exitPointerLock = (function() {
            if("webkitExitPointerLock" in elementPrototype) {
                return document.webkitExitPointerLock;
            }

            if("mozExitPointerLock" in elementPrototype) {
                return document.mozExitPointerLock;
            }

            return function() { /* unsupported, fail silently */ };
        })();
    }

})((typeof(exports) != 'undefined') ? global : window); // Account for CommonJS environments
