/*
 * main.js - Setup for Quake 3 WebGL demo
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

// The bits that need to change to load different maps are right here!
// ===========================================

var mapName = 'q3tourney2';

// If you're running from your own copy of Quake 3, you'll want to use these shaders
/*var mapShaders = [
    'scripts/base.shader', 'scripts/base_button.shader', 'scripts/base_floor.shader',
    'scripts/base_light.shader', 'scripts/base_object.shader', 'scripts/base_support.shader',
    'scripts/base_trim.shader', 'scripts/base_wall.shader', 'scripts/common.shader',
    'scripts/ctf.shader', 'scripts/eerie.shader', 'scripts/gfx.shader',
    'scripts/gothic_block.shader', 'scripts/gothic_floor.shader', 'scripts/gothic_light.shader',
    'scripts/gothic_trim.shader', 'scripts/gothic_wall.shader', 'scripts/hell.shader',
    'scripts/liquid.shader', 'scripts/menu.shader', 'scripts/models.shader',
    'scripts/organics.shader', 'scripts/sfx.shader', 'scripts/shrine.shader',
    'scripts/skin.shader', 'scripts/sky.shader', 'scripts/test.shader'
];*/

// For my demo, I compiled only the shaders the map used into a single file for performance reasons
var mapShaders = ['scripts/web_demo.shader'];

// ===========================================
// Everything below here is common to all maps
var leftViewMat, rightViewMat, leftProjMat, rightProjMat;
var leftViewport, rightViewport;
var activeShader;
var map, playerMover;
var mobileSite = false;

var zAngle = 3;
var xAngle = 0;
var cameraPosition = [0, 0, 0];
var onResize = null;

// VR Globals
var vrEnabled = false;
var vrForced = false;
var vrHMD = null;
var vrSensor = null;
var vrTimewarp = true;

// These values are in meters
var vrEyeLeft = [-0.03, 0.0, 0.0];
var vrEyeRight = [0.03, 0.0, 0.0];
var playerHeight = 57; // Roughly where my eyes sit (1.78 meters off the ground)
var vrIPDScale = 32.0; // There are 32 units per meter in Quake 3
var vrMovementScale = 2.0; // I really just don't know.
var vrFovLeft = null;
var vrFovRight = null;
var vrPosition = null;

var vrDrawMode = 0;

var SKIP_FRAMES = 0;
var REPEAT_FRAMES = 1;

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return unescape(pair[1]);
        }
    }
    return null;
}

// Set up basic GL State up front
function initGL(gl, canvas) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.enable(gl.CULL_FACE);

    leftViewMat = mat4.create();
    rightViewMat = mat4.create();
    leftProjMat = mat4.create();
    rightProjMat = mat4.create();

    leftViewport = { x: 0, y: 0, width: 0, height: 0 };
    rightViewport = { x: 0, y: 0, width: 0, height: 0 };

    initMap(gl);
}

// Load the map
function initMap(gl) {
    var titleEl = document.getElementById("mapTitle");
    titleEl.innerHtml = mapName.toUpperCase();

    var tesselation = getQueryVariable("tesselate");
    if(tesselation) {
        tesselation = parseInt(tesselation, 10);
    }

    var vrMode = getQueryVariable("vrDrawMode");
    if (vrMode) {
      vrForced = true;
      vrDrawMode = parseInt(vrMode, 10);
    }

    var qPlayerHeight = getQueryVariable("playerHeight");
    if (qPlayerHeight) {
      playerHeight = parseFloat(qPlayerHeight);
    }

    map = new q3bsp(gl);
    map.onentitiesloaded = initMapEntities;
    map.onbsp = initPlayerMover;
    //map.onsurfaces = initSurfaces;
    map.loadShaders(mapShaders);
    map.load('maps/' + mapName +'.bsp', tesselation);
}

// Process entities loaded from the map
function initMapEntities(entities) {
    respawnPlayer(0);
}

function initPlayerMover(bsp) {
    playerMover = new q3movement(bsp);
    respawnPlayer(0);
    document.getElementById('viewport').style.display = 'block';
    onResize();
}

var lastIndex = 0;
// "Respawns" the player at a specific spawn point. Passing -1 will move the player to the next spawn point.
function respawnPlayer(index) {
    if(map.entities && playerMover) {
        if(index == -1) {
            index = (lastIndex+1)% map.entities.info_player_deathmatch.length;
        }
        lastIndex = index;

        var spawnPoint = map.entities.info_player_deathmatch[index];
        playerMover.position = [
            spawnPoint.origin[0],
            spawnPoint.origin[1],
            spawnPoint.origin[2]+30 // Start a little ways above the floor
        ];

        playerMover.velocity = [0,0,0];

        zAngle = -(spawnPoint.angle || 0) * (3.1415/180) + (3.1415*0.5); // Negative angle in radians + 90 degrees
        xAngle = 0;
    }
}

function eulerFromQuaternion(out, q, order) {
  function clamp(value, min, max) {
    return (value < min ? min : (value > max ? max : value));
  }
  // Borrowed from Three.JS :)
  // q is assumed to be normalized
  // http://www.mathworks.com/matlabcentral/fileexchange/20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/content/SpinCalc.m
  var sqx = q.x * q.x;
  var sqy = q.y * q.y;
  var sqz = q.z * q.z;
  var sqw = q.w * q.w;

  if ( order === 'XYZ' ) {
    out[0] = Math.atan2( 2 * ( q.x * q.w - q.y * q.z ), ( sqw - sqx - sqy + sqz ) );
    out[1] = Math.asin(  clamp( 2 * ( q.x * q.z + q.y * q.w ), -1, 1 ) );
    out[2] = Math.atan2( 2 * ( q.z * q.w - q.x * q.y ), ( sqw + sqx - sqy - sqz ) );
  } else if ( order ===  'YXZ' ) {
    out[0] = Math.asin(  clamp( 2 * ( q.x * q.w - q.y * q.z ), -1, 1 ) );
    out[1] = Math.atan2( 2 * ( q.x * q.z + q.y * q.w ), ( sqw - sqx - sqy + sqz ) );
    out[2] = Math.atan2( 2 * ( q.x * q.y + q.z * q.w ), ( sqw - sqx + sqy - sqz ) );
  } else if ( order === 'ZXY' ) {
    out[0] = Math.asin(  clamp( 2 * ( q.x * q.w + q.y * q.z ), -1, 1 ) );
    out[1] = Math.atan2( 2 * ( q.y * q.w - q.z * q.x ), ( sqw - sqx - sqy + sqz ) );
    out[2] = Math.atan2( 2 * ( q.z * q.w - q.x * q.y ), ( sqw - sqx + sqy - sqz ) );
  } else if ( order === 'ZYX' ) {
    out[0] = Math.atan2( 2 * ( q.x * q.w + q.z * q.y ), ( sqw - sqx - sqy + sqz ) );
    out[1] = Math.asin(  clamp( 2 * ( q.y * q.w - q.x * q.z ), -1, 1 ) );
    out[2] = Math.atan2( 2 * ( q.x * q.y + q.z * q.w ), ( sqw + sqx - sqy - sqz ) );
  } else if ( order === 'YZX' ) {
    out[0] = Math.atan2( 2 * ( q.x * q.w - q.z * q.y ), ( sqw - sqx + sqy - sqz ) );
    out[1] = Math.atan2( 2 * ( q.y * q.w - q.x * q.z ), ( sqw + sqx - sqy - sqz ) );
    out[2] = Math.asin(  clamp( 2 * ( q.x * q.y + q.z * q.w ), -1, 1 ) );
  } else if ( order === 'XZY' ) {
    out[0] = Math.atan2( 2 * ( q.x * q.w + q.y * q.z ), ( sqw - sqx + sqy - sqz ) );
    out[1] = Math.atan2( 2 * ( q.x * q.z + q.y * q.w ), ( sqw + sqx - sqy - sqz ) );
    out[2] = Math.asin(  clamp( 2 * ( q.z * q.w - q.x * q.y ), -1, 1 ) );
  } else {
    console.log('No order given for quaternion to euler conversion.');
    return;
  }
}

function mat4PerspectiveFromVRFieldOfView(fov, zNear, zFar, out) {
  var upTan, downTan, leftTan, rightTan;
  if (fov == null) {
    // If no FOV is given plug in some dummy values
    upTan = Math.tan(50 * Math.PI/180.0);
    downTan = Math.tan(50 * Math.PI/180.0);
    leftTan = Math.tan(45 * Math.PI/180.0);
    rightTan = Math.tan(45 * Math.PI/180.0);
  } else {
    upTan = Math.tan(fov.upDegrees * Math.PI/180.0);
    downTan = Math.tan(fov.downDegrees * Math.PI/180.0);
    leftTan = Math.tan(fov.leftDegrees * Math.PI/180.0);
    rightTan = Math.tan(fov.rightDegrees * Math.PI/180.0);
  }

  var xScale = 2.0 / (leftTan + rightTan);
  var yScale = 2.0 / (upTan + downTan);

  out[0] = xScale;
  out[4] = 0.0;
  out[8] = -((leftTan - rightTan) * xScale * 0.5);
  out[12] = 0.0;

  out[1] = 0.0;
  out[5] = yScale;
  out[9] = ((upTan - downTan) * yScale * 0.5);
  out[13] = 0.0;

  out[2] = 0.0;
  out[6] = 0.0;
  out[10] = zFar / (zNear - zFar);
  out[14] = (zFar * zNear) / (zNear - zFar);

  out[3] = 0.0;
  out[7] = 0.0;
  out[11] = -1.0;
  out[15] = 0.0;
}

var lastMove = 0;

function onFrame(gl, event) {
    if(!map || !playerMover) { return; }

    // Update player movement @ 60hz
    // The while ensures that we update at a fixed rate even if the rendering bogs down
    while(event.elapsed - lastMove >= 16) {
        updateInput(16);
        lastMove += 16;
    }

    // For great laggage!
    for (var i = 0; i < REPEAT_FRAMES; ++i)
      drawFrame(gl);
}

var hmdOrientationMatrix = mat4.create();
function getViewMatrix(out, translated, vrPosition, eyeOffset) {
  mat4.identity(out);

  if (vrPosition) {
    if(vrPosition.orientation) {
      quat4.toMat4([-vrPosition.orientation.x, -vrPosition.orientation.y, -vrPosition.orientation.z, vrPosition.orientation.w], hmdOrientationMatrix);
    }
    if (eyeOffset) {
      mat4.translate(out, [-eyeOffset[0]*vrIPDScale, -eyeOffset[1]*vrIPDScale, -eyeOffset[2]*vrIPDScale]);
    }
    mat4.multiply(out, hmdOrientationMatrix, out);
    if (translated && vrPosition.position) {
      mat4.translate(out, [
        -vrPosition.position.x*vrIPDScale*vrMovementScale,
        -vrPosition.position.y*vrIPDScale*vrMovementScale,
        -vrPosition.position.z*vrIPDScale*vrMovementScale]);
    }
  }
  mat4.rotateX(out, xAngle-Math.PI/2);
  mat4.rotateZ(out, zAngle);
  if (translated) {
    mat4.translate(out, [-playerMover.position[0], -playerMover.position[1], -playerMover.position[2]-playerHeight]);
  }
}

// Draw a single frame
function drawFrame(gl) {
    // Clear back buffer but not color buffer (we expect the entire scene to be overwritten)
    gl.depthMask(true);
    gl.clear(gl.DEPTH_BUFFER_BIT);

    if(!map || !playerMover) { return; }

    if (!vrEnabled && !vrForced) {
      // Matrix setup
      getViewMatrix(leftViewMat, true, vrPosition);

      // Here's where all the magic happens...
      map.draw(leftViewMat, leftProjMat);
    } else if (vrDrawMode == 1) {
      var canvas = document.getElementById("viewport");
      leftViewport.width = canvas.width / 2.0;
      leftViewport.height = canvas.height;

      rightViewport.x = canvas.width / 2.0; 
      rightViewport.width = canvas.width / 2.0;
      rightViewport.height = canvas.height;

      getViewMatrix(leftViewMat, true, vrPosition, vrEyeLeft);
      mat4PerspectiveFromVRFieldOfView(vrFovLeft, 1.0, 4096.0, leftProjMat);

      getViewMatrix(rightViewMat, true, vrPosition, vrEyeRight);
      mat4PerspectiveFromVRFieldOfView(vrFovRight, 1.0, 4096.0, rightProjMat);

      map.draw(leftViewMat, leftProjMat, leftViewport,
               rightViewMat, rightProjMat, rightViewport);
    } else {
      var canvas = document.getElementById("viewport");

      // Left Eye
      gl.viewport(0, 0, canvas.width / 2.0, canvas.height);
      getViewMatrix(leftViewMat, true, vrPosition, vrEyeLeft);
      mat4PerspectiveFromVRFieldOfView(vrFovLeft, 1.0, 4096.0, leftProjMat);

      map.draw(leftViewMat, leftProjMat);

      // Right Eye
      gl.viewport(canvas.width / 2.0, 0, canvas.width / 2.0, canvas.height);
      getViewMatrix(rightViewMat, true, vrPosition, vrEyeRight);
      mat4PerspectiveFromVRFieldOfView(vrFovRight, 1.0, 4096.0, rightProjMat);

      map.draw(rightViewMat, rightProjMat);
    }
}

var pressed = new Array(128);
var cameraMat = mat4.create();

function moveLookLocked(xDelta, yDelta) {
    zAngle += xDelta*0.0025;
    while (zAngle < 0)
        zAngle += Math.PI*2;
    while (zAngle >= Math.PI*2)
        zAngle -= Math.PI*2;

  if (!vrEnabled && !vrForced) {
    xAngle += yDelta*0.0025;
    while (xAngle < -Math.PI*0.5)
        xAngle = -Math.PI*0.5;
    while (xAngle > Math.PI*0.5)
        xAngle = Math.PI*0.5;
  }
}

function filterDeadzone(value) {
    return Math.abs(value) > 0.35 ? value : 0;
}

var vrEuler = vec3.create();
function moveViewOriented(dir, frameTime) {
  if(dir[0] !== 0 || dir[1] !== 0 || dir[2] !== 0) {
      mat4.identity(cameraMat);
      if (vrPosition) {
        eulerFromQuaternion(vrEuler, vrPosition.orientation, 'YXZ');
        mat4.rotateZ(cameraMat, zAngle - vrEuler[1]);
      } else {
        mat4.rotateZ(cameraMat, zAngle);
      }
      mat4.inverse(cameraMat);

      mat4.multiplyVec3(cameraMat, dir);
  }

  // Send desired movement direction to the player mover for collision detection against the map
  playerMover.move(dir, frameTime);
}

function updateInput(frameTime) {
    if(!playerMover) { return; }

    var dir = [0, 0, 0];

    // This is our first person movement code. It's not really pretty, but it works
    if(pressed['W'.charCodeAt(0)]) {
        dir[1] += 1;
    }
    if(pressed['S'.charCodeAt(0)]) {
        dir[1] -= 1;
    }
    if(pressed['A'.charCodeAt(0)]) {
        dir[0] -= 1;
    }
    if(pressed['D'.charCodeAt(0)]) {
        dir[0] += 1;
    }

    var gamepads = [];
    if (navigator.getGamepads) {
        gamepads = navigator.getGamepads();
    } else if (navigator.webkitGetGamepads) {
        gamepads = navigator.webkitGetGamepads();
    }

    for (var i = 0; i < gamepads.length; ++i) {
        var pad = gamepads[i];
        if(pad) {
            dir[0] += filterDeadzone(pad.axes[0]);
            dir[1] -= filterDeadzone(pad.axes[1]);

            moveLookLocked(
                filterDeadzone(pad.axes[2]) * 25.0,
                filterDeadzone(pad.axes[3]) * 25.0
            );

            for(var j = 0; j < Math.max(pad.buttons.length, 4); ++j) {
                var button = pad.buttons[j];
                if (typeof(button) == "number" && button == 1.0) {
                    playerMover.jump();
                } else if (button.pressed) {
                    playerMover.jump();
                }
            }
        }
    }

    if (vrSensor) {
      vrPosition = vrSensor.getState();
    }

    moveViewOriented(dir, frameTime);
}

// Set up event handling
function initEvents() {
    var movingModel = false;
    var lastX = 0;
    var lastY = 0;
    var lastMoveX = 0;
    var lastMoveY = 0;
    var viewport = document.getElementById("viewport");
    var viewportFrame = document.getElementById("viewport-frame");

    document.addEventListener("keydown", function(event) {
        if(event.keyCode == 32 && !pressed[32]) {
            playerMover.jump();
        }
        pressed[event.keyCode] = true;
        if ((event.keyCode == 'W'.charCodeAt(0) ||
             event.keyCode == 'S'.charCodeAt(0) ||
             event.keyCode == 'A'.charCodeAt(0) ||
             event.keyCode == 'D'.charCodeAt(0) ||
             event.keyCode == 32) && !event.ctrlKey) {
            event.preventDefault();
        }
    }, false);

    document.addEventListener("keypress", function(event) {
        if(event.charCode == 'R'.charCodeAt(0) || event.charCode == 'r'.charCodeAt(0)) {
            respawnPlayer(-1);
        }
        if(event.charCode == 'C'.charCodeAt(0) || event.charCode == 'c'.charCodeAt(0)) {
            if (vrSensor && "zeroSensor" in vrSensor) {
              vrSensor.zeroSensor();
            }
        }
        if(event.charCode == 'T'.charCodeAt(0) || event.charCode == 't'.charCodeAt(0)) {
            if (vrHMD && "setTimewarp" in vrHMD) {
              vrTimewarp = !vrTimewarp;
              vrHMD.setTimewarp(vrTimewarp);
            }
        }
        if(event.charCode == '='.charCodeAt(0)) {
          vrIPDScale += 5.0;
        }
        if(event.charCode == '-'.charCodeAt(0)) {
          vrIPDScale -= 5.0;
        }
    }, false);

    document.addEventListener("keyup", function(event) {
        pressed[event.keyCode] = false;
    }, false);

    function startLook(x, y) {
        movingModel = true;

        lastX = x;
        lastY = y;
    }

    function endLook() {
        movingModel = false;
    }

    function moveLook(x, y) {
        var xDelta = x - lastX;
        var yDelta = y - lastY;
        lastX = x;
        lastY = y;

        if (movingModel) {
            moveLookLocked(xDelta, yDelta);
        }
    }

    function startMove(x, y) {
        lastMoveX = x;
        lastMoveY = y;
    }

    function moveUpdate(x, y, frameTime) {
        var xDelta = x - lastMoveX;
        var yDelta = y - lastMoveY;
        lastMoveX = x;
        lastMoveY = y;

        var dir = [xDelta, yDelta * -1, 0];

        moveViewOriented(dir, frameTime*2);
    }

    viewport.addEventListener("click", function(event) {
        viewport.requestPointerLock();
    }, false);

    // Mouse handling code
    // When the mouse is pressed it rotates the players view
    viewport.addEventListener("mousedown", function(event) {
        if(event.which == 1) {
            startLook(event.pageX, event.pageY);
        }
    }, false);
    viewport.addEventListener("mouseup", function(event) {
        endLook();
    }, false);
    viewportFrame.addEventListener("mousemove", function(event) {
        if(document.pointerLockElement) {
            moveLookLocked(event.movementX, event.movementY);
        } else {
            moveLook(event.pageX, event.pageY);
        }
    }, false);

    // Touch handling code
    viewport.addEventListener('touchstart', function(event) {
        var touches = event.touches;
        switch(touches.length) {
            case 1: // Single finger looks around
                startLook(touches[0].pageX, touches[0].pageY);
                break;
            case 2: // Two fingers moves
                startMove(touches[0].pageX, touches[0].pageY);
                break;
            case 3: // Three finger tap jumps
                playerMover.jump();
                break;
            default:
                return;
        }
        event.stopPropagation();
        event.preventDefault();
    }, false);
    viewport.addEventListener('touchend', function(event) {
        endLook();
        return false;
    }, false);
    viewport.addEventListener('touchmove', function(event) {
        var touches = event.touches;
        switch(touches.length) {
            case 1:
                moveLook(touches[0].pageX, touches[0].pageY);
                break;
            case 2:
                moveUpdate(touches[0].pageX, touches[0].pageY, 16);
                break;
            default:
                return;
        }
        event.stopPropagation();
        event.preventDefault();
    }, false);
}

// Utility function that tests a list of webgl contexts and returns when one can be created
// Hopefully this future-proofs us a bit
function getAvailableContext(canvas, contextList) {
    if (canvas.getContext) {
        for(var i = 0; i < contextList.length; ++i) {
            try {
                var context = canvas.getContext(contextList[i], { antialias:false });
                if(context !== null)
                    return context;
            } catch(ex) { }
        }
    }
    return null;
}

function renderLoop(gl, element, stats) {
    var startTime = new Date().getTime();
    var lastTimestamp = startTime;
    var lastFps = startTime;

    var frameId = 0;

    function onRequestedFrame(){
        timestamp = new Date().getTime();

        window.requestAnimationFrame(onRequestedFrame, element);

        frameId++;
        if (SKIP_FRAMES != 0 && frameId % SKIP_FRAMES != 0)
          return;

        stats.begin();

        onFrame(gl, {
            timestamp: timestamp,
            elapsed: timestamp - startTime,
            frameTime: timestamp - lastTimestamp
        });

        stats.end();
    }
    window.requestAnimationFrame(onRequestedFrame, element);
}

function main() {
    var stats = new Stats();
    document.getElementById("viewport-frame").appendChild( stats.domElement );

    var canvas = document.getElementById("viewport");

    // Get the GL Context (try 'webgl' first, then fallback)
    var gl = getAvailableContext(canvas, ['webgl', 'experimental-webgl']);

    onResize = function() {
        if ((vrEnabled || vrForced) && vrHMD) {
          if ("getEyeParameters" in vrHMD) {
            var leftEyeViewport = vrHMD.getEyeParameters("left").renderRect;
            var rightEyeViewport = vrHMD.getEyeParameters("right").renderRect;
            canvas.width = rightEyeViewport.left + rightEyeViewport.width;
            canvas.height = Math.max(leftEyeViewport.height, rightEyeViewport.height);
          } else if ("getRecommendedEyeRenderRect" in vrHMD) {
            var leftEyeViewport = vrHMD.getRecommendedEyeRenderRect("left");
            var rightEyeViewport = vrHMD.getRecommendedEyeRenderRect("right");
            canvas.width = rightEyeViewport.left + rightEyeViewport.width;
            canvas.height = Math.max(leftEyeViewport.height, rightEyeViewport.height);
          } else {
            // Hard-coded fallback, Oculus DK1 values.
            canvas.width = 2000;
            canvas.height = 1056;
          }
        } else {
          var devicePixelRatio = window.devicePixelRatio || 1;

          if(document.fullscreenElement) {
              canvas.width = screen.width * devicePixelRatio;
              canvas.height = screen.height * devicePixelRatio;
          } else {
              canvas.width = canvas.clientWidth * devicePixelRatio;
              canvas.height = canvas.clientHeight * devicePixelRatio;
          }

          if (!vrEnabled && !vrForced) {
            gl.viewport(0, 0, canvas.width, canvas.height);
            mat4.perspective(45.0, canvas.width/canvas.height, 1.0, 4096.0, leftProjMat);
          }
        }
    }

    if(!gl) {
        document.getElementById('viewport-frame').style.display = 'none';
        document.getElementById('webgl-error').style.display = 'block';
    } else {
        document.getElementById('viewport-info').style.display = 'block';
        initEvents();
        initGL(gl, canvas);
        renderLoop(gl, canvas, stats);
    }

    onResize();
    window.addEventListener("resize", onResize, false);

    var showFPS = document.getElementById("showFPS");
    showFPS.addEventListener("change", function() {
        stats.domElement.style.display = showFPS.checked ? "block" : "none";
    });

    function EnumerateVRDevice(devices) {
        // Yay! We support WebVR!
        for (var i = 0; i < devices.length; ++i) {
            if (devices[i] instanceof HMDVRDevice) {
                vrHMD = devices[i];

                if ('getEyeParameters' in vrHMD) {
                  var leftEye = vrHMD.getEyeParameters("left");
                  var rightEye = vrHMD.getEyeParameters("right");

                  var e = leftEye.eyeTranslation;
                  vrEyeLeft = [e.x, e.y, e.z];
                  e = rightEye.eyeTranslation;
                  vrEyeRight = [e.x, e.y, e.z];

                  vrFovLeft = leftEye.recommendedFieldOfView;
                  vrFovRight = rightEye.recommendedFieldOfView;
                } else {
                  var e = vrHMD.getEyeTranslation("left");
                  vrEyeLeft = [e.x, e.y, e.z];
                  e = vrHMD.getEyeTranslation("right");
                  vrEyeRight = [e.x, e.y, e.z];

                  vrFovLeft = vrHMD.getRecommendedEyeFieldOfView("left");
                  vrFovRight = vrHMD.getRecommendedEyeFieldOfView("right");
                }

                onResize();

                break;
            }
        }

        for (var i = 0; i < devices.length; ++i) {
            if (devices[i] instanceof PositionSensorVRDevice) {
                // If we have an HMD, make sure to get the associated sensor
                if (vrHMD == null || vrHMD.hardwareUnitId == devices[i].hardwareUnitId) {
                    vrSensor = devices[i];
                    break;
                }
            }
        }

        if (vrHMD || vrSensor) {
            var vrToggle = document.getElementById("vrToggle");
            vrToggle.style.display = "block";
            var mobileVrBtn = document.getElementById("mobileVrBtn");
            mobileVrBtn.style.display = "block";
        }
    }

    if (navigator.getVRDevices) {
      navigator.getVRDevices().then(EnumerateVRDevice);
    } else if (navigator.mozGetVRDevices) {
      navigator.mozGetVRDevices(EnumerateVRDevice);
    }

    /*var playMusic = document.getElementById("playMusic");
    playMusic.addEventListener("change", function() {
        if(map) {
            map.playMusic(playMusic.checked);
        }
    });*/

    // Handle fullscreen transition
    var viewportFrame = document.getElementById("viewport-frame");
    var viewport = document.getElementById("viewport");
    document.addEventListener("fullscreenchange", function() {
        if(document.fullscreenElement) {
            viewport.requestPointerLock(); // Attempt to lock the mouse automatically on fullscreen
        } else {
          vrEnabled = false;
        }
        onResize();
    }, false);

    // Fullscreen
    function goFullscreen() {
        viewportFrame.requestFullScreen();
    }
    var fullscreenButton = document.getElementById('fullscreenBtn');
    var mobileFullscreenBtn = document.getElementById("mobileFullscreenBtn");
    fullscreenButton.addEventListener('click', goFullscreen, false);
    mobileFullscreenBtn.addEventListener('click', goFullscreen, false);

    // VR
    function goVrFullscreen() {
        vrEnabled = true;
        xAngle = 0.0;
        viewport.requestFullScreen({ vrDisplay: vrHMD });
    }
    var vrBtn = document.getElementById("vrBtn");
    var mobileVrBtn = document.getElementById("mobileVrBtn");
    vrBtn.addEventListener("click", goVrFullscreen, false);
    mobileVrBtn.addEventListener("click", goVrFullscreen, false);

}
window.addEventListener("load", main); // Fire this once the page is loaded up
