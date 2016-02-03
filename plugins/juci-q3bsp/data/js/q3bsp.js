/*
 * q3bsp.js - Parses Quake 3 Maps (.bsp) for use in WebGL
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

// Constants
q3bsp_vertex_stride = 56;
q3bsp_sky_vertex_stride = 20;

q3bsp_base_folder = 'demo_baseq3';

/*
 * q3bsp
 */

q3bsp = function(gl) {
    // gl initialization
    this.gl = gl;
    this.onload = null;
    this.onbsp = null;
    this.onentitiesloaded = null;
    
    var map = this;
    
    this.showLoadStatus();
    
    // Spawn the web worker
    this.worker = new Worker('js/q3bsp_worker.js');
    this.worker.onmessage = function(msg) {
        map.onMessage(msg);
    };
    this.worker.onerror = function(msg) {
        console.error('Line: ' + msg.lineno + ', ' + msg.message);
    };
    
    // Map elements
    this.skyboxBuffer = null;
    this.skyboxIndexBuffer = null;
    this.skyboxIndexCount = 0;
    this.skyboxMat = mat4.create();
    
    this.vertexBuffer = null;
    this.indexBuffer = null;
    this.indexCount = 0;
    this.lightmap = q3glshader.createSolidTexture(gl, [255,255,255,255]);
    this.surfaces = null;
    this.shaders = {};
    
    this.highlighted = null;
    
    // Sorted draw elements
    this.skyShader = null;
    this.unshadedSurfaces = [];
    this.defaultSurfaces = [];
    this.modelSurfaces = [];
    this.effectSurfaces = [];
    
    // BSP Elements
    this.bspTree = null;
    
    // Effect elements
    this.startTime = new Date().getTime();
    this.bgMusic = null;
};

q3bsp.prototype.highlightShader = function(name) {
    this.highlighted = name;
};

q3bsp.prototype.playMusic = function(play) {
    if(!this.bgMusic) { return; }
    
    if(play) {
        this.bgMusic.play();
    } else {
        this.bgMusic.pause();
    }
};

q3bsp.prototype.onMessage = function(msg) {
    switch(msg.data.type) {
        case 'entities':
            this.entities = msg.data.entities;
            this.processEntities(this.entities);
            break;
        case 'geometry':
            this.buildBuffers(msg.data.vertices, msg.data.indices);
            this.surfaces = msg.data.surfaces;
            this.bindShaders();
            break;
        case 'lightmap':
            this.buildLightmaps(msg.data.size, msg.data.lightmaps);
            break;
        case 'shaders':
            this.buildShaders(msg.data.shaders);
            break;
        case 'bsp':
            this.bspTree = new q3bsptree(msg.data.bsp);
            if(this.onbsp) {
                this.onbsp(this.bspTree);
            }
            this.clearLoadStatus();
            break;
        case 'visibility':
            this.setVisibility(msg.data.visibleSurfaces);
            break;
        case 'status':
            this.onLoadStatus(msg.data.message);
            break;
        default:
            throw 'Unexpected message type: ' + msg.data.type;
    }
};

q3bsp.prototype.showLoadStatus = function() {
    // Yeah, this shouldn't be hardcoded in here
    var loading = document.getElementById('loading');
    loading.style.display = 'block';
};

q3bsp.prototype.onLoadStatus = function(message) {
    // Yeah, this shouldn't be hardcoded in here
    var loading = document.getElementById('loading');
    loading.innerHTML = message;
};

q3bsp.prototype.clearLoadStatus = function() {
    // Yeah, this shouldn't be hardcoded in here
    var loading = document.getElementById('loading');
    loading.style.display = 'none';
};

q3bsp.prototype.load = function(url, tesselationLevel) {
    if(!tesselationLevel) {
        tesselationLevel = 5;
    }
    this.worker.postMessage({
        type: 'load',
        url: '../' + q3bsp_base_folder + '/' + url,
        tesselationLevel: tesselationLevel
    });
};

q3bsp.prototype.loadShaders = function(sources) {
    var map = this;
    
    for(var i = 0; i < sources.length; ++i) {
        sources[i] = q3bsp_base_folder + '/' + sources[i];
    }
    
    q3shader.loadList(sources, function(shaders) {
        map.buildShaders(shaders);
    });
};

q3bsp.prototype.processEntities = function(entities) {
    if(this.onentitiesloaded) {
        this.onentitiesloaded(entities);
    }
    
    // Background music
    /*if(entities.worldspawn[0].music) {
        this.bgMusic = new Audio(q3bsp_base_folder + '/' + entities.worldspawn[0].music.replace('.wav', '.ogg'));
        // TODO: When can we change this to simply setting the 'loop' property?
        this.bgMusic.addEventListener('ended', function(){
            this.currentTime = 0;
        }, false);
        this.bgMusic.play();
    }*/
    
    // It would be relatively easy to do some ambient sound processing here, but I don't really feel like
    // HTML5 audio is up to the task. For example, lack of reliable gapless looping makes them sound terrible!
    // Look into this more when browsers get with the program.
    /*var speakers = entities.target_speaker;
    for(var i = 0; i < 1; ++i) {
        var speaker = speakers[i];
        q3bspCreateSpeaker(speaker);
    }*/
};

function q3bspCreateSpeaker(speaker) {
    speaker.audio = new Audio(q3bsp_base_folder + '/' + speaker.noise.replace('.wav', '.ogg'));
    
    // TODO: When can we change this to simply setting the 'loop' property?
    speaker.audio.addEventListener('ended', function(){
        this.currentTime = 0;
    }, false);
    speaker.audio.play();
};

q3bsp.prototype.buildBuffers = function(vertices, indices) {
    var gl = this.gl;
    
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    
    this.indexCount = indices.length;
    
    var skyVerts = [
        -128, 128, 128, 0, 0,
        128, 128, 128, 1, 0,
        -128, -128, 128, 0, 1,
        128, -128, 128, 1, 1,
        
        -128, 128, 128, 0, 1,
        128, 128, 128, 1, 1,
        -128, 128, -128, 0, 0,
        128, 128, -128, 1, 0,
        
        -128, -128, 128, 0, 0,
        128, -128, 128, 1, 0,
        -128, -128, -128, 0, 1,
        128, -128, -128, 1, 1,
        
        128, 128, 128, 0, 0,
        128, -128, 128, 0, 1,
        128, 128, -128, 1, 0,
        128, -128, -128, 1, 1,
        
        -128, 128, 128, 1, 0,
        -128, -128, 128, 1, 1,
        -128, 128, -128, 0, 0,
        -128, -128, -128, 0, 1
    ];
    
    var skyIndices = [
        0, 1, 2,
        1, 2, 3,
        
        4, 5, 6,
        5, 6, 7,
        
        8, 9, 10,
        9, 10, 11,
        
        12, 13, 14,
        13, 14, 15,
        
        16, 17, 18,
        17, 18, 19
    ];
    
    this.skyboxBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.skyboxBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(skyVerts), gl.STATIC_DRAW);
    
    this.skyboxIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.skyboxIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(skyIndices), gl.STATIC_DRAW);
    
    this.skyboxIndexCount = skyIndices.length;
};

q3bsp.prototype.buildLightmaps = function(size, lightmaps) {
    var gl = this.gl;
    
    gl.bindTexture(gl.TEXTURE_2D, this.lightmap);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    
    for(var i = 0; i < lightmaps.length; ++i) {
        gl.texSubImage2D(
            gl.TEXTURE_2D, 0, lightmaps[i].x, lightmaps[i].y, lightmaps[i].width, lightmaps[i].height,
            gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(lightmaps[i].bytes)
            );
    }
    
    gl.generateMipmap(gl.TEXTURE_2D);
    
    q3glshader.init(gl, this.lightmap);
};

q3bsp.prototype.buildShaders = function(shaders) {
    var gl = this.gl;
    
    for(var i = 0; i < shaders.length; ++i) {
        var shader = shaders[i];
        var glShader = q3glshader.build(gl, shader);
        this.shaders[shader.name] = glShader;
    }
};

q3bsp.prototype.bindShaders = function() {
    if(!this.surfaces) { return; }
    
    if(this.onsurfaces) {
        this.onsurfaces(this.surfaces);
    }
    
    for(var i = 0; i < this.surfaces.length; ++i) {
        var surface = this.surfaces[i];
        if(surface.elementCount === 0 || surface.shader || surface.shaderName == 'noshader') { continue; }
        this.unshadedSurfaces.push(surface);
    }
    
    var map = this;
    
    var interval = setInterval(function() {
        if(map.unshadedSurfaces.length === 0) { // Have we processed all surfaces?
            // Sort to ensure correct order of transparent objects
            map.effectSurfaces.sort(function(a, b) {
                var order = a.shader.sort - b.shader.sort;
                // TODO: Sort by state here to cut down on changes?
                return order; //(order == 0 ? 1 : order);
            });
    
            clearInterval(interval);
            return;
        }
    
        var surface = map.unshadedSurfaces.shift();
        
        var shader = map.shaders[surface.shaderName];
        if(!shader) {
            surface.shader = q3glshader.buildDefault(map.gl, surface);
            if(surface.geomType == 3) {
                surface.shader.model = true;
                map.modelSurfaces.push(surface);
            } else {
                map.defaultSurfaces.push(surface);
            }
        } else {
            surface.shader = shader;
            if(shader.sky) {
                map.skyShader = shader; // Sky does not get pushed into effectSurfaces. It's a separate pass
            } else {
                map.effectSurfaces.push(surface);
            }
            q3glshader.loadShaderMaps(map.gl, surface, shader);
        }
    }, 10);
};

// Update which portions of the map are visible based on position

q3bsp.prototype.updateVisibility = function(pos) {
    this.worker.postMessage({
        type: 'visibility',
        pos: pos
    });
};

q3bsp.prototype.setVisibility = function(visibilityList) {
    if(this.surfaces.length > 0) {
        for(var i = 0; i < this.surfaces.length; ++i) {
            this.surfaces[i].visible = (visibilityList[i] === true);
        }
    }
};

// Draw the map

q3bsp.prototype.bindShaderMatrix = function(shader, modelViewMat, projectionMat) {
    var gl = this.gl;
    
    // Set uniforms
    gl.uniformMatrix4fv(shader.uniform.modelViewMat, false, modelViewMat);
    gl.uniformMatrix4fv(shader.uniform.projectionMat, false, projectionMat);
}

q3bsp.prototype.bindShaderAttribs = function(shader) {
    var gl = this.gl;
    
    // Setup vertex attributes
    gl.enableVertexAttribArray(shader.attrib.position);
    gl.vertexAttribPointer(shader.attrib.position, 3, gl.FLOAT, false, q3bsp_vertex_stride, 0);
        
    if(shader.attrib.texCoord !== undefined) {
        gl.enableVertexAttribArray(shader.attrib.texCoord);
        gl.vertexAttribPointer(shader.attrib.texCoord, 2, gl.FLOAT, false, q3bsp_vertex_stride, 3*4);
    }
    
    if(shader.attrib.lightCoord !== undefined) {
        gl.enableVertexAttribArray(shader.attrib.lightCoord);
        gl.vertexAttribPointer(shader.attrib.lightCoord, 2, gl.FLOAT, false, q3bsp_vertex_stride, 5*4);
    }
    
    if(shader.attrib.normal !== undefined) {
        gl.enableVertexAttribArray(shader.attrib.normal);
        gl.vertexAttribPointer(shader.attrib.normal, 3, gl.FLOAT, false, q3bsp_vertex_stride, 7*4);
    }
    
    if(shader.attrib.color !== undefined) {
        gl.enableVertexAttribArray(shader.attrib.color);
        gl.vertexAttribPointer(shader.attrib.color, 4, gl.FLOAT, false, q3bsp_vertex_stride, 10*4);
    }
}

q3bsp.prototype.bindSkyMatrix = function(shader, modelViewMat, projectionMat) {
    var gl = this.gl;
    
    mat4.set(modelViewMat, this.skyboxMat);
    // Clear out the translation components
    this.skyboxMat[12] = 0;
    this.skyboxMat[13] = 0;
    this.skyboxMat[14] = 0;
    
    // Set uniforms
    gl.uniformMatrix4fv(shader.uniform.modelViewMat, false, this.skyboxMat);
    gl.uniformMatrix4fv(shader.uniform.projectionMat, false, projectionMat);
};

q3bsp.prototype.bindSkyAttribs = function(shader) {
    var gl = this.gl;

    // Setup vertex attributes
    gl.enableVertexAttribArray(shader.attrib.position);
    gl.vertexAttribPointer(shader.attrib.position, 3, gl.FLOAT, false, q3bsp_sky_vertex_stride, 0);
        
    if(shader.attrib.texCoord !== undefined) {
        gl.enableVertexAttribArray(shader.attrib.texCoord);
        gl.vertexAttribPointer(shader.attrib.texCoord, 2, gl.FLOAT, false, q3bsp_sky_vertex_stride, 3*4);
    }
};

q3bsp.prototype.setViewport = function(viewport) {
    if (viewport) {
        this.gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
    }
}

q3bsp.prototype.draw = function(leftViewMat, leftProjMat, leftViewport, rightViewMat, rightProjMat, rightViewport) {
    if(this.vertexBuffer === null || this.indexBuffer === null) { return; } // Not ready to draw yet
    
    var gl = this.gl; // Easier to type and potentially a bit faster
    
    // Seconds passed since map was initialized
    var time = (new Date().getTime() - this.startTime)/1000.0;
    var i = 0;
    
    // Loop through all shaders, drawing all surfaces associated with them
    if(this.surfaces.length > 0) {
        
        // If we have a skybox, render it first
        if(this.skyShader) {
            // SkyBox Buffers
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.skyboxIndexBuffer);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.skyboxBuffer);
        
            // Render Skybox
            if(q3glshader.setShader(gl, this.skyShader)) {
                for(var j = 0; j < this.skyShader.stages.length; ++j) {
                    var stage = this.skyShader.stages[j];
                    
                    var shaderProgram = q3glshader.setShaderStage(gl, this.skyShader, stage, time);
                    if(!shaderProgram) { continue; }
                    this.bindSkyAttribs(shaderProgram);
                    
                    // Draw Sky geometry
                    this.bindSkyMatrix(shaderProgram, leftViewMat, leftProjMat);
                    this.setViewport(leftViewport);
                    gl.drawElements(gl.TRIANGLES, this.skyboxIndexCount, gl.UNSIGNED_SHORT, 0);

                    if (rightViewMat) {
                        this.bindSkyMatrix(shaderProgram, rightViewMat, rightProjMat);
                        this.setViewport(rightViewport);
                        gl.drawElements(gl.TRIANGLES, this.skyboxIndexCount, gl.UNSIGNED_SHORT, 0);
                    }
                }
            }
        }

        // Map Geometry buffers
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        
        // Default shader surfaces (can bind shader once and draw all of them very quickly)
        if(this.defaultSurfaces.length > 0 || this.unshadedSurfaces.length > 0) {
            // Setup State
            var shader = q3glshader.defaultShader;
            q3glshader.setShader(gl, shader);
            var shaderProgram = q3glshader.setShaderStage(gl, shader, shader.stages[0], time);
            this.bindShaderAttribs(shaderProgram);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, q3glshader.defaultTexture);

            this.bindShaderMatrix(shaderProgram, leftViewMat, leftProjMat);
            this.setViewport(leftViewport);
            for(i = 0; i < this.unshadedSurfaces.length; ++i) {
                var surface = this.unshadedSurfaces[i];
                gl.drawElements(gl.TRIANGLES, surface.elementCount, gl.UNSIGNED_SHORT, surface.indexOffset);
            }
            for(i = 0; i < this.defaultSurfaces.length; ++i) {
                var surface = this.defaultSurfaces[i];
                var stage = surface.shader.stages[0];
                gl.bindTexture(gl.TEXTURE_2D, stage.texture);
                gl.drawElements(gl.TRIANGLES, surface.elementCount, gl.UNSIGNED_SHORT, surface.indexOffset);
            }

            if (rightViewMat) {
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, q3glshader.defaultTexture);

                this.bindShaderMatrix(shaderProgram, rightViewMat, rightProjMat);
                this.setViewport(rightViewport);
                for(i = 0; i < this.unshadedSurfaces.length; ++i) {
                    var surface = this.unshadedSurfaces[i];
                    gl.drawElements(gl.TRIANGLES, surface.elementCount, gl.UNSIGNED_SHORT, surface.indexOffset);
                }

                for(i = 0; i < this.defaultSurfaces.length; ++i) {
                    var surface = this.defaultSurfaces[i];
                    var stage = surface.shader.stages[0];
                    gl.bindTexture(gl.TEXTURE_2D, stage.texture);
                    gl.drawElements(gl.TRIANGLES, surface.elementCount, gl.UNSIGNED_SHORT, surface.indexOffset);
                }
            }
        }

        // Model shader surfaces (can bind shader once and draw all of them very quickly)
        if(this.modelSurfaces.length > 0) {
            // Setup State
            var shader = this.modelSurfaces[0].shader;
            q3glshader.setShader(gl, shader);
            var shaderProgram = q3glshader.setShaderStage(gl, shader, shader.stages[0], time);
            this.bindShaderAttribs(shaderProgram);
            gl.activeTexture(gl.TEXTURE0);

            this.bindShaderMatrix(shaderProgram, leftViewMat, leftProjMat);
            this.setViewport(leftViewport);
            for(i = 0; i < this.modelSurfaces.length; ++i) {
                var surface = this.modelSurfaces[i];
                var stage = surface.shader.stages[0];
                gl.bindTexture(gl.TEXTURE_2D, stage.texture);
                gl.drawElements(gl.TRIANGLES, surface.elementCount, gl.UNSIGNED_SHORT, surface.indexOffset);
            }

            if (rightViewMat) {
                this.bindShaderMatrix(shaderProgram, rightViewMat, rightProjMat);
                this.setViewport(rightViewport);
                for(i = 0; i < this.modelSurfaces.length; ++i) {
                    var surface = this.modelSurfaces[i];
                    var stage = surface.shader.stages[0];
                    gl.bindTexture(gl.TEXTURE_2D, stage.texture);
                    gl.drawElements(gl.TRIANGLES, surface.elementCount, gl.UNSIGNED_SHORT, surface.indexOffset);
                }
            }
        }
    
        // Effect surfaces
        for(var i = 0; i < this.effectSurfaces.length; ++i) {
            var surface = this.effectSurfaces[i];
            if(surface.elementCount == 0 || surface.visible !== true) { continue; }
            
            // Bind the surface shader
            var shader = surface.shader;
            
            if(this.highlighted && this.highlighted == surface.shaderName) {
                shader = q3glshader.defaultShader;
            }
            
            if(!q3glshader.setShader(gl, shader)) { continue; }
            
            for(var j = 0; j < shader.stages.length; ++j) {
                var stage = shader.stages[j];
                
                var shaderProgram = q3glshader.setShaderStage(gl, shader, stage, time);
                if(!shaderProgram) { continue; }
                this.bindShaderAttribs(shaderProgram);
                this.bindShaderMatrix(shaderProgram, leftViewMat, leftProjMat);
                this.setViewport(leftViewport);
                // Draw all geometry that uses this textures
                gl.drawElements(gl.TRIANGLES, surface.elementCount, gl.UNSIGNED_SHORT, surface.indexOffset);

                if (rightViewMat) {
                    this.bindShaderMatrix(shaderProgram, rightViewMat, rightProjMat);
                    this.setViewport(rightViewport);
                    // Draw all geometry that uses this textures
                    gl.drawElements(gl.TRIANGLES, surface.elementCount, gl.UNSIGNED_SHORT, surface.indexOffset);
                }
            }
        }
    }
};



//
// BSP Tree Collision Detection
//
q3bsptree = function(bsp) {
    this.bsp = bsp;
};

q3bsptree.prototype.trace = function(start, end, radius) {
    var output = {
        allSolid: false,
        startSolid: false,
        fraction: 1.0,
        endPos: end,
        plane: null
    };
    
    if(!this.bsp) { return output; }
    if(!radius) { radius = 0; }
    
    this.traceNode(0, 0, 1, start, end, radius, output);
    
    if(output.fraction != 1.0) { // collided with something
        for (var i = 0; i < 3; i++) {
            output.endPos[i] = start[i] + output.fraction * (end[i] - start[i]);
        }
    }
    
    return output;
};

var q3bsptree_trace_offset = 0.03125;

q3bsptree.prototype.traceNode = function(nodeIdx, startFraction, endFraction, start, end, radius, output) {
    if (nodeIdx < 0) { // Leaf node?
        var leaf = this.bsp.leaves[-(nodeIdx + 1)];
        for (var i = 0; i < leaf.leafBrushCount; i++) {
            var brush = this.bsp.brushes[this.bsp.leafBrushes[leaf.leafBrush + i]];
            var surface = this.bsp.surfaces[brush.shader];
            if (brush.brushSideCount > 0 && surface.contents & 1) {
                this.traceBrush(brush, start, end, radius, output);
            }
        }
        return;
    }
    
    // Tree node
    var node = this.bsp.nodes[nodeIdx];
    var plane = this.bsp.planes[node.plane];
    
    var startDist = vec3.dot(plane.normal, start) - plane.distance;
    var endDist = vec3.dot(plane.normal, end) - plane.distance;
    
    if (startDist >= radius && endDist >= radius) {
        this.traceNode(node.children[0], startFraction, endFraction, start, end, radius, output );
    } else if (startDist < -radius && endDist < -radius) {
        this.traceNode(node.children[1], startFraction, endFraction, start, end, radius, output );
    } else {
        var side;
        var fraction1, fraction2, middleFraction;
        var middle = [0, 0, 0];

        if (startDist < endDist) {
            side = 1; // back
            var iDist = 1 / (startDist - endDist);
            fraction1 = (startDist - radius + q3bsptree_trace_offset) * iDist;
            fraction2 = (startDist + radius + q3bsptree_trace_offset) * iDist;
        } else if (startDist > endDist) {
            side = 0; // front
            var iDist = 1 / (startDist - endDist);
            fraction1 = (startDist + radius + q3bsptree_trace_offset) * iDist;
            fraction2 = (startDist - radius - q3bsptree_trace_offset) * iDist;
        } else {
            side = 0; // front
            fraction1 = 1;
            fraction2 = 0;
        }
        
        if (fraction1 < 0) fraction1 = 0;
        else if (fraction1 > 1) fraction1 = 1;
        if (fraction2 < 0) fraction2 = 0;
        else if (fraction2 > 1) fraction2 = 1;
        
        middleFraction = startFraction + (endFraction - startFraction) * fraction1;
        
        for (var i = 0; i < 3; i++) {
            middle[i] = start[i] + fraction1 * (end[i] - start[i]);
        }
        
        this.traceNode(node.children[side], startFraction, middleFraction, start, middle, radius, output );
        
        middleFraction = startFraction + (endFraction - startFraction) * fraction2;
        
        for (var i = 0; i < 3; i++) {
            middle[i] = start[i] + fraction2 * (end[i] - start[i]);
        }
        
        this.traceNode(node.children[side===0?1:0], middleFraction, endFraction, middle, end, radius, output );
    }
};

q3bsptree.prototype.traceBrush = function(brush, start, end, radius, output) {
    var startFraction = -1;
    var endFraction = 1;
    var startsOut = false;
    var endsOut = false;
    var collisionPlane = null;
    
    for (var i = 0; i < brush.brushSideCount; i++) {
        var brushSide = this.bsp.brushSides[brush.brushSide + i];
        var plane = this.bsp.planes[brushSide.plane];
        
        var startDist = vec3.dot( start, plane.normal ) - (plane.distance + radius);
        var endDist = vec3.dot( end, plane.normal ) - (plane.distance + radius);

        if (startDist > 0) startsOut = true;
        if (endDist > 0) endsOut = true;

        // make sure the trace isn't completely on one side of the brush
        if (startDist > 0 && endDist > 0) { return; }
        if (startDist <= 0 && endDist <= 0) { continue; }

        if (startDist > endDist) { // line is entering into the brush
            var fraction = (startDist - q3bsptree_trace_offset) / (startDist - endDist);
            if (fraction > startFraction) {
                startFraction = fraction;
                collisionPlane = plane;
            }
        } else { // line is leaving the brush
            var fraction = (startDist + q3bsptree_trace_offset) / (startDist - endDist);
            if (fraction < endFraction)
                endFraction = fraction;
        }
    }
    
    if (startsOut === false) {
        output.startSolid = true;
        if (endsOut === false)
            output.allSolid = true;
        return;
    }

    if (startFraction < endFraction) {
        if (startFraction > -1 && startFraction < output.fraction) {
            output.plane = collisionPlane;
            if (startFraction < 0)
                startFraction = 0;
            output.fraction = startFraction;
        }
    }
    
    return;
};