/*
 * q3movement.js - Handles player movement through a bsp structure
 */
 
/*
 * Copyright (c) 2009 Brandon Jones
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

// Much of this file is a simplified/dumbed-down version of the Q3 player movement code
// found in bg_pmove.c and bg_slidemove.c

// Some movement constants ripped from the Q3 Source code
var q3movement_stopspeed = 100.0;
var q3movement_duckScale = 0.25;
var q3movement_jumpvelocity = 50;

var q3movement_accelerate = 10.0;
var q3movement_airaccelerate = 0.1;
var q3movement_flyaccelerate = 8.0;

var q3movement_friction = 6.0;
var q3movement_flightfriction = 3.0;

var q3movement_frameTime = 0.30;
var q3movement_overclip = 0.501;
var q3movement_stepsize = 18;

var q3movement_gravity = 20.0;

var q3movement_playerRadius = 10.0;
var q3movement_scale = 50;
 
q3movement = function(bsp) {
    this.bsp = bsp;
    
    this.velocity = [0, 0, 0];
    this.position = [0, 0, 0];
    this.onGround = false;
    
    this.groundTrace = null;
};

q3movement.prototype.applyFriction = function() {
    if(!this.onGround) { return; }
    
    var speed = vec3.length(this.velocity);
    
    var drop = 0;
    
    var control = speed < q3movement_stopspeed ? q3movement_stopspeed : speed;
    drop += control*q3movement_friction*q3movement_frameTime;
    
    var newSpeed = speed - drop;
    if (newSpeed < 0) {
        newSpeed = 0;
    }
    if(speed !== 0) {
        newSpeed /= speed;
        vec3.scale(this.velocity, newSpeed);
    } else {
        this.velocity = [0, 0, 0];
    }
};

q3movement.prototype.groundCheck = function() {
    var checkPoint = [this.position[0], this.position[1], this.position[2] - q3movement_playerRadius - 0.25];
    
    this.groundTrace = this.bsp.trace(this.position, checkPoint, q3movement_playerRadius);
    
    if(this.groundTrace.fraction == 1.0) { // falling
        this.onGround = false;
        return;
    }
    
    if ( this.velocity[2] > 0 && vec3.dot( this.velocity, this.groundTrace.plane.normal ) > 10 ) { // jumping
        this.onGround = false;
        return;
    }
    
    if(this.groundTrace.plane.normal[2] < 0.7) { // steep slope
        this.onGround = false;
        return;
    }
    
    this.onGround = true;
};

q3movement.prototype.clipVelocity = function(velIn, normal) {
    var backoff = vec3.dot(velIn, normal);
    
    if ( backoff < 0 ) {
        backoff *= q3movement_overclip;
    } else {
        backoff /= q3movement_overclip;
    }
    
    var change = vec3.scale(normal, backoff, [0,0,0]);
    return vec3.subtract(velIn, change, change);
};

q3movement.prototype.accelerate = function(dir, speed, accel) {
    var currentSpeed = vec3.dot(this.velocity, dir);
    var addSpeed = speed - currentSpeed;
    if (addSpeed <= 0) {
        return;
    }
    
    var accelSpeed = accel*q3movement_frameTime*speed;
    if (accelSpeed > addSpeed) {
        accelSpeed = addSpeed;
    }
    
    var accelDir = vec3.scale(dir, accelSpeed, [0,0,0]);
    vec3.add(this.velocity, accelDir);
};

q3movement.prototype.jump = function() {
    if(!this.onGround) { return false; }
    
    this.onGround = false;
    this.velocity[2] = q3movement_jumpvelocity;
    
    //Make sure that the player isn't stuck in the ground
    var groundDist = vec3.dot( this.position, this.groundTrace.plane.normal ) - this.groundTrace.plane.distance - q3movement_playerRadius;
    vec3.add(this.position, vec3.scale(this.groundTrace.plane.normal, groundDist + 5, [0, 0, 0]));
    
    return true;
};

q3movement.prototype.move = function(dir, frameTime) {
    q3movement_frameTime = frameTime*0.0075;
    
    this.groundCheck();
    
    vec3.normalize(dir);
    
    if(this.onGround) {
        this.walkMove(dir);
    } else {
        this.airMove(dir);
    }
    
    return this.position;
};

q3movement.prototype.airMove = function(dir) {
    var speed = vec3.length(dir) * q3movement_scale;
    
    this.accelerate(dir, speed, q3movement_airaccelerate);
    
    this.stepSlideMove( true );
};

q3movement.prototype.walkMove = function(dir) {
    this.applyFriction();
    
    var speed = vec3.length(dir) * q3movement_scale;
    
    this.accelerate(dir, speed, q3movement_accelerate);
    
    this.velocity = this.clipVelocity(this.velocity, this.groundTrace.plane.normal);
    
    if(!this.velocity[0] && !this.velocity[1]) { return; }
    
    this.stepSlideMove( false );
};

q3movement.prototype.slideMove = function(gravity) {
    var bumpcount;
    var numbumps = 4;
    var planes = [];
    var endVelocity = [0,0,0];
    
    if ( gravity ) {
        vec3.set(this.velocity, endVelocity );
        endVelocity[2] -= q3movement_gravity * q3movement_frameTime;
        this.velocity[2] = ( this.velocity[2] + endVelocity[2] ) * 0.5;
        
        if ( this.groundTrace && this.groundTrace.plane ) {
            // slide along the ground plane
            this.velocity = this.clipVelocity(this.velocity, this.groundTrace.plane.normal);
        }
    }

    // never turn against the ground plane
    if ( this.groundTrace && this.groundTrace.plane ) {
        planes.push(vec3.set(this.groundTrace.plane.normal, [0,0,0]));
    }

    // never turn against original velocity
    planes.push(vec3.normalize(this.velocity, [0,0,0]));
    
    var time_left = q3movement_frameTime;
    var end = [0,0,0];
    for(bumpcount=0; bumpcount < numbumps; ++bumpcount) {
        
        // calculate position we are trying to move to
        vec3.add(this.position, vec3.scale(this.velocity, time_left, [0,0,0]), end);
        
        // see if we can make it there
        var trace = this.bsp.trace(this.position, end, q3movement_playerRadius);

        if (trace.allSolid) {
            // entity is completely trapped in another solid
            this.velocity[2] = 0;   // don't build up falling damage, but allow sideways acceleration
            return true;
        }

        if (trace.fraction > 0) {
            // actually covered some distance
            vec3.set(trace.endPos, this.position);
        }

        if (trace.fraction == 1) {
             break;     // moved the entire distance
        }
        
        time_left -= time_left * trace.fraction;
        
        planes.push(vec3.set(trace.plane.normal, [0,0,0]));

        //
        // modify velocity so it parallels all of the clip planes
        //

        // find a plane that it enters
        for(var i = 0; i < planes.length; ++i) {
            var into = vec3.dot(this.velocity, planes[i]);
            if ( into >= 0.1 ) { continue; } // move doesn't interact with the plane
            
            // slide along the plane
            var clipVelocity = this.clipVelocity(this.velocity, planes[i]);
            var endClipVelocity = this.clipVelocity(endVelocity, planes[i]);

            // see if there is a second plane that the new move enters
            for (var j = 0; j < planes.length; j++) {
                if ( j == i ) { continue; }
                if ( vec3.dot( clipVelocity, planes[j] ) >= 0.1 ) { continue; } // move doesn't interact with the plane
                
                // try clipping the move to the plane
                clipVelocity = this.clipVelocity( clipVelocity, planes[j] );
                endClipVelocity = this.clipVelocity( endClipVelocity, planes[j] );

                // see if it goes back into the first clip plane
                if ( vec3.dot( clipVelocity, planes[i] ) >= 0 ) { continue; }

                // slide the original velocity along the crease
                var dir = [0,0,0];
                vec3.cross(planes[i], planes[j], dir);
                vec3.normalize(dir);
                var d = vec3.dot(dir, this.velocity);
                vec3.scale(dir, d, clipVelocity);

                vec3.cross(planes[i], planes[j], dir);
                vec3.normalize(dir);
                d = vec3.dot(dir, endVelocity);
                vec3.scale(dir, d, endClipVelocity);

                // see if there is a third plane the the new move enters
                for(var k = 0; k < planes.length; ++k) {
                    if ( k == i || k == j ) { continue; }
                    if ( vec3.dot( clipVelocity, planes[k] ) >= 0.1 ) { continue; } // move doesn't interact with the plane
                    
                    // stop dead at a tripple plane interaction
                    this.velocity = [0,0,0];
                    return true;
                }
            }

            // if we have fixed all interactions, try another move
            vec3.set( clipVelocity, this.velocity );
            vec3.set( endClipVelocity, endVelocity );
            break;
        }
    }

    if ( gravity ) {
        vec3.set( endVelocity, this.velocity );
    }

    return ( bumpcount !== 0 );
};

q3movement.prototype.stepSlideMove = function(gravity) {
    var start_o = vec3.set(this.position, [0,0,0]);
    var start_v = vec3.set(this.velocity, [0,0,0]);
    
    if ( this.slideMove( gravity ) === 0 ) { return; } // we got exactly where we wanted to go first try

    var down = vec3.set(start_o, [0,0,0]);
    down[2] -= q3movement_stepsize;
    var trace = this.bsp.trace(start_o, down, q3movement_playerRadius);
    
    var up = [0,0,1];
    
    // never step up when you still have up velocity
    if ( this.velocity[2] > 0 && (trace.fraction == 1.0 || vec3.dot(trace.plane.normal, up) < 0.7)) { return; }
    
    var down_o = vec3.set(this.position, [0,0,0]);
    var down_v = vec3.set(this.velocity, [0,0,0]);
    
    vec3.set(start_o, up);
    up[2] += q3movement_stepsize;
    
    // test the player position if they were a stepheight higher
    trace = this.bsp.trace(start_o, up, q3movement_playerRadius);
    if ( trace.allSolid ) { return; } // can't step up
    
    var stepSize = trace.endPos[2] - start_o[2];
    // try slidemove from this position
    vec3.set(trace.endPos, this.position);
    vec3.set(start_v, this.velocity);
    
    this.slideMove( gravity );
    
    // push down the final amount
    vec3.set(this.position, down);
    down[2] -= stepSize;
    trace = this.bsp.trace(this.position, down, q3movement_playerRadius);
    if ( !trace.allSolid ) {
        vec3.set(trace.endPos, this.position);
    }
    if ( trace.fraction < 1.0 ) {
        this.velocity = this.clipVelocity( this.velocity, trace.plane.normal );
    }
};