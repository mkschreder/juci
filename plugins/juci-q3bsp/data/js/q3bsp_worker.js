/*
 * q3bsp_worker.js - Parses Quake 3 Maps (.bsp) for use in WebGL
 * This file is the threaded backend that does the main parsing and processing
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

importScripts('./util/binary-file.js');
importScripts('./util/gl-matrix-min.js');

onmessage = function(msg) {
    switch(msg.data.type) {
        case 'load':
            q3bsp.load(msg.data.url, msg.data.tesselationLevel, function() {
                // Fallback to account for Opera handling URLs in a worker 
                // differently than other browsers. 
                q3bsp.load("../" + msg.data.url, msg.data.tesselationLevel);
            });
            break;
        case 'loadShaders':
            q3shader.loadList(msg.data.sources);
            break;
        case 'trace':
            q3bsp.trace(msg.data.traceId, msg.data.start, msg.data.end, msg.data.radius, msg.data.slide);
            break;
        case 'visibility':
            q3bsp.buildVisibleList(q3bsp.getLeaf(msg.data.pos));
            break;
        default:
            throw 'Unexpected message type: ' + msg.data;
    }
};

// BSP Elements
var planes, nodes, leaves, faces;
var brushes, brushSides;
var leafFaces, leafBrushes;
var visBuffer, visSize;
var shaders; // This needs to be kept here for collision detection (indicates non-solid surfaces)

q3bsp = {};

q3bsp.load = function(url, tesselationLevel, errorCallback) {
    var request = new XMLHttpRequest();
    
    request.addEventListener("load", function () {
        q3bsp.parse(new BinaryFile(request.responseText), tesselationLevel);
    }, false);
    
    request.open('GET', url, true);
    request.overrideMimeType('text/plain; charset=x-user-defined');
    request.setRequestHeader('Content-Type', 'text/plain');
    request.send(null);
};

// Parses the BSP file
q3bsp.parse = function(src, tesselationLevel) {
    postMessage({
        type: 'status',
        message: 'Map downloaded, parsing level geometry...'
    });
    
    var header = q3bsp.readHeader(src);
    
    if(header.tag != 'IBSP' && header.version != 46) { return; } // Check for appropriate format
    
    // Read map entities
    q3bsp.readEntities(header.lumps[0], src);
    
    // Load visual map components
    shaders = q3bsp.readShaders(header.lumps[1], src);
    var lightmaps = q3bsp.readLightmaps(header.lumps[14], src);
    var verts = q3bsp.readVerts(header.lumps[10], src);
    var meshVerts = q3bsp.readMeshVerts(header.lumps[11], src);
    faces = q3bsp.readFaces(header.lumps[13], src);
    
    q3bsp.compileMap(verts, faces, meshVerts, lightmaps, shaders, tesselationLevel);
    
    postMessage({
        type: 'status',
        message: 'Geometry compiled, parsing collision tree...'
    });
    
    // Load bsp components
    planes = q3bsp.readPlanes(header.lumps[2], src);
    nodes = q3bsp.readNodes(header.lumps[3], src);
    leaves = q3bsp.readLeaves(header.lumps[4], src);
    leafFaces = q3bsp.readLeafFaces(header.lumps[5], src);
    leafBrushes = q3bsp.readLeafBrushes(header.lumps[6], src);
    brushes = q3bsp.readBrushes(header.lumps[8], src);
    brushSides = q3bsp.readBrushSides(header.lumps[9], src);
    var visData = q3bsp.readVisData(header.lumps[16], src);
    visBuffer = visData.buffer;
    visSize = visData.size;
    
    postMessage({
        type: 'bsp',
        bsp: {
            planes: planes,
            nodes: nodes,
            leaves: leaves,
            leafFaces: leafFaces,
            leafBrushes: leafBrushes,
            brushes: brushes,
            brushSides: brushSides,
            surfaces: shaders,
            visBuffer: visBuffer,
            visSize: visSize
        }
    });
    
    
};

// Read all lump headers
q3bsp.readHeader = function(src) {
    // Read the magic number and the version
    var header = {
        tag: src.readString(4),
        version: src.readULong(),
        lumps: []
    };
    
    // Read the lump headers
    for(var i = 0; i < 17; ++i) {
        var lump = {
            offset: src.readULong(),
            length: src.readULong()
        };
        header.lumps.push(lump);
    }
    
    return header;
};

// Read all entity structures
q3bsp.readEntities = function(lump, src) {
    src.seek(lump.offset);
    var entities = src.readString(lump.length);
    
    var elements = {
        targets: {}
    };
    
    entities.replace(/\{([^}]*)\}/mg, function($0, entitySrc) {
        var entity = {
            classname: 'unknown'
        };
        entitySrc.replace(/"(.+)" "(.+)"$/mg, function($0, key, value) {
            switch(key) {
                case 'origin':
                    value.replace(/(.+) (.+) (.+)/, function($0, x, y, z) {
                        entity[key] = [
                            parseFloat(x),
                            parseFloat(y),
                            parseFloat(z)
                        ];
                    });
                    break;
                case 'angle':
                    entity[key] = parseFloat(value);
                    break;
                default:
                    entity[key] = value;
                    break;
            }
        });
        
        if(entity['targetname']) {
            elements.targets[entity['targetname']] = entity;
        }
        
        if(!elements[entity.classname]) { elements[entity.classname] = []; }
        elements[entity.classname].push(entity);
    });
    
    // Send the compiled vertex/index data back to the render thread
    postMessage({
        type: 'entities',
        entities: elements
    });
};

// Read all shader structures
q3bsp.readShaders = function(lump, src) {
    var count = lump.length / 72;
    var elements = [];
    
    src.seek(lump.offset);
    for(var i = 0; i < count; ++i) {
        var shader = {
            shaderName: src.readString(64),
            flags: src.readLong(),
            contents: src.readLong(),
            shader: null,
            faces: [],
            indexOffset: 0,
            elementCount: 0,
            visible: true
        };
        
        elements.push(shader);
    }
    
    return elements;
};

// Scale up an RGB color
q3bsp.brightnessAdjust = function(color, factor) {
    var scale = 1.0, temp = 0.0;
    
    color[0] *= factor;
    color[1] *= factor;
    color[2] *= factor;
    
    if(color[0] > 255 && (temp = 255/color[0]) < scale) { scale = temp; }
    if(color[1] > 255 && (temp = 255/color[1]) < scale) { scale = temp; }
    if(color[2] > 255 && (temp = 255/color[2]) < scale) { scale = temp; }
    
    color[0] *= scale;
    color[1] *= scale;
    color[2] *= scale;
    
    return color;
};

q3bsp.brightnessAdjustVertex = function(color, factor) {
    var scale = 1.0, temp = 0.0;
    
    color[0] *= factor;
    color[1] *= factor;
    color[2] *= factor;
    
    if(color[0] > 1 && (temp = 1/color[0]) < scale) { scale = temp; }
    if(color[1] > 1 && (temp = 1/color[1]) < scale) { scale = temp; }
    if(color[2] > 1 && (temp = 1/color[2]) < scale) { scale = temp; }
    
    color[0] *= scale;
    color[1] *= scale;
    color[2] *= scale;
    
    return color;
};

// Read all lightmaps
q3bsp.readLightmaps = function(lump, src) {
    var lightmapSize = 128 * 128;
    var count = lump.length / (lightmapSize*3);
    
    var gridSize = 2;
    
    while(gridSize * gridSize < count) {
        gridSize *= 2;
    }
    
    var textureSize = gridSize * 128;
    
    var xOffset = 0;
    var yOffset = 0;
    
    var lightmaps = [];
    var lightmapRects = [];
    var rgb = [ 0, 0, 0 ];
    
    src.seek(lump.offset);
    for(var i = 0; i < count; ++i) {
        var elements = new Array(lightmapSize*4);
        
        for(var j = 0; j < lightmapSize*4; j+=4) {
            rgb[0] = src.readUByte();
            rgb[1] = src.readUByte();
            rgb[2] = src.readUByte();
            
            q3bsp.brightnessAdjust(rgb, 4.0);
            
            elements[j] = rgb[0];
            elements[j+1] = rgb[1];
            elements[j+2] = rgb[2];
            elements[j+3] = 255;
        }
        
        lightmaps.push({
            x: xOffset, y: yOffset,
            width: 128, height: 128,
            bytes: elements
        });
        
        lightmapRects.push({
            x: xOffset/textureSize,
            y: yOffset/textureSize,
            xScale: 128/textureSize,
            yScale: 128/textureSize
        });
        
        xOffset += 128;
        if(xOffset >= textureSize) {
            yOffset += 128;
            xOffset = 0;
        }
    }
    
    // Send the lightmap data back to the render thread
    postMessage({
        type: 'lightmap',
        size: textureSize,
        lightmaps: lightmaps
    });
    
    return lightmapRects;
};

q3bsp.readVerts = function(lump, src) {
    var count = lump.length/44;
    var elements = [];
    
    src.seek(lump.offset);
    for(var i = 0; i < count; ++i) {
        elements.push({
            pos: [ src.readFloat(), src.readFloat(), src.readFloat() ],
            texCoord: [ src.readFloat(), src.readFloat() ],
            lmCoord: [ src.readFloat(), src.readFloat() ],
            lmNewCoord: [ 0, 0 ],
            normal: [ src.readFloat(), src.readFloat(), src.readFloat() ],
            color: q3bsp.brightnessAdjustVertex(q3bsp.colorToVec(src.readULong()), 4.0)
        });
    }

    return elements;
};

q3bsp.readMeshVerts = function(lump, src) {
    var count = lump.length/4;
    var meshVerts = [];
    
    src.seek(lump.offset);
    for(var i = 0; i < count; ++i) {
        meshVerts.push(src.readLong());
    }
    
    return meshVerts;
};

// Read all face structures
q3bsp.readFaces = function(lump, src) {
    var faceCount = lump.length / 104;
    var faces = [];
    
    src.seek(lump.offset);
    for(var i = 0; i < faceCount; ++i) {
        var face = {
            shader: src.readLong(),
            effect: src.readLong(),
            type: src.readLong(),
            vertex: src.readLong(),
            vertCount: src.readLong(),
            meshVert: src.readLong(),
            meshVertCount: src.readLong(),
            lightmap: src.readLong(),
            lmStart: [ src.readLong(), src.readLong() ],
            lmSize: [ src.readLong(), src.readLong() ],
            lmOrigin: [ src.readFloat(), src.readFloat(), src.readFloat() ],
            lmVecs: [[ src.readFloat(), src.readFloat(), src.readFloat() ],
                    [ src.readFloat(), src.readFloat(), src.readFloat() ]],
            normal: [ src.readFloat(), src.readFloat(), src.readFloat() ],
            size: [ src.readLong(), src.readLong() ],
            indexOffset: -1
        };
        
        faces.push(face);
    }

    return faces;
};

// Read all Plane structures
q3bsp.readPlanes = function(lump, src) {
    var count = lump.length / 16;
    var elements = [];
    
    src.seek(lump.offset);
    for(var i = 0; i < count; ++i) {
        elements.push({
            normal: [ src.readFloat(), src.readFloat(), src.readFloat() ],
            distance: src.readFloat()
        });
    }
    
    return elements;
};

// Read all Node structures
q3bsp.readNodes = function(lump, src) {
    var count = lump.length / 36;
    var elements = [];
    
    src.seek(lump.offset);
    for(var i = 0; i < count; ++i) {
        elements.push({
            plane: src.readLong(),
            children: [ src.readLong(), src.readLong() ],
            min: [ src.readLong(), src.readLong(), src.readLong() ],
            max: [ src.readLong(), src.readLong(), src.readLong() ]
        });
    }
    
    return elements;
};

// Read all Leaf structures
q3bsp.readLeaves = function(lump, src) {
    var count = lump.length / 48;
    var elements = [];
    
    src.seek(lump.offset);
    for(var i = 0; i < count; ++i) {
        elements.push({
            cluster: src.readLong(),
            area: src.readLong(),
            min: [ src.readLong(), src.readLong(), src.readLong() ],
            max: [ src.readLong(), src.readLong(), src.readLong() ],
            leafFace: src.readLong(),
            leafFaceCount: src.readLong(),
            leafBrush: src.readLong(),
            leafBrushCount: src.readLong()
        });
    }
    
    return elements;
};

// Read all Leaf Faces
q3bsp.readLeafFaces = function(lump, src) {
    var count = lump.length / 4;
    var elements = [];
    
    src.seek(lump.offset);
    for(var i = 0; i < count; ++i) {
        elements.push(src.readLong());
    }
    
    return elements;
};

// Read all Brushes
q3bsp.readBrushes = function(lump, src) {
    var count = lump.length / 12;
    var elements = [];
    
    src.seek(lump.offset);
    for(var i = 0; i < count; ++i) {
        elements.push({
            brushSide: src.readLong(),
            brushSideCount: src.readLong(),
            shader: src.readLong()
        });
    }
    
    return elements;
};

// Read all Leaf Brushes
q3bsp.readLeafBrushes = function(lump, src) {
    var count = lump.length / 4;
    var elements = [];
    
    src.seek(lump.offset);
    for(var i = 0; i < count; ++i) {
        elements.push(src.readLong());
    }
    
    return elements;
};

// Read all Brush Sides
q3bsp.readBrushSides = function(lump, src) {
    var count = lump.length / 8;
    var elements = [];
    
    src.seek(lump.offset);
    for(var i = 0; i < count; ++i) {
        elements.push({
            plane: src.readLong(),
            shader: src.readLong()
        });
    }
    
    return elements;
};

// Read all Vis Data
q3bsp.readVisData = function(lump, src) {
    src.seek(lump.offset);
    var vecCount = src.readLong();
    var size = src.readLong();
    
    var byteCount = vecCount * size;
    var elements = new Array(byteCount);
    
    for(var i = 0; i < byteCount; ++i) {
        elements[i] = src.readUByte();
    }
    
    return {
        buffer: elements,
        size: size
    };
};

q3bsp.colorToVec = function(color) {
    return[
        (color & 0xFF) / 0xFF,
        ((color & 0xFF00) >> 8) / 0xFF,
        ((color & 0xFF0000) >> 16) / 0xFF,
        1
    ];
};


//
// Compile the map into a stream of WebGL-compatible data
//

q3bsp.compileMap = function(verts, faces, meshVerts, lightmaps, shaders, tesselationLevel) {
    postMessage({
        type: 'status',
        message: 'Map geometry parsed, compiling...'
    });
    
    // Find associated shaders for all clusters
    
    // Per-face operations
    for(var i = 0; i < faces.length; ++i) {
        var face = faces[i];
    
        if(face.type==1 || face.type==2 || face.type==3) {
            // Add face to the appropriate texture face list
            var shader = shaders[face.shader];
            shader.faces.push(face);
            var lightmap = lightmaps[face.lightmap];
        
            if(!lightmap) {
                lightmap = lightmaps[0];
            }
        
            if(face.type==1 || face.type==3) {
                shader.geomType = face.type;
                // Transform lightmap coords to match position in combined texture
                for(var j = 0; j < face.meshVertCount; ++j) {
                    var vert = verts[face.vertex + meshVerts[face.meshVert + j]];

                    vert.lmNewCoord[0] = (vert.lmCoord[0] * lightmap.xScale) + lightmap.x;
                    vert.lmNewCoord[1] = (vert.lmCoord[1] * lightmap.yScale) + lightmap.y;
                }
            } else {
                postMessage({
                    type: 'status',
                    message: 'Tesselating face ' + i + " of " + faces.length
                });
                // Build Bezier curve
                q3bsp.tesselate(face, verts, meshVerts, tesselationLevel);
                for(var j = 0; j < face.vertCount; ++j) {
                    var vert = verts[face.vertex + j];
                
                    vert.lmNewCoord[0] = (vert.lmCoord[0] * lightmap.xScale) + lightmap.x;
                    vert.lmNewCoord[1] = (vert.lmCoord[1] * lightmap.yScale) + lightmap.y;
                }
            }
        }
    }
    
    // Compile vert list
    var vertices = new Array(verts.length*10);
    var offset = 0;
    for(var i = 0; i < verts.length; ++i) {
        var vert = verts[i];
        
        vertices[offset++] = vert.pos[0];
        vertices[offset++] = vert.pos[1];
        vertices[offset++] = vert.pos[2];
        
        vertices[offset++] = vert.texCoord[0];
        vertices[offset++] = vert.texCoord[1];
        
        vertices[offset++] = vert.lmNewCoord[0];
        vertices[offset++] = vert.lmNewCoord[1];
        
        vertices[offset++] = vert.normal[0];
        vertices[offset++] = vert.normal[1];
        vertices[offset++] = vert.normal[2];
        
        vertices[offset++] = vert.color[0];
        vertices[offset++] = vert.color[1];
        vertices[offset++] = vert.color[2];
        vertices[offset++] = vert.color[3];
    }
    
    // Compile index list
    var indices = new Array();
    for(var i = 0; i <  shaders.length; ++i) {
        var shader = shaders[i];
        if(shader.faces.length > 0) {
            shader.indexOffset = indices.length * 2; // Offset is in bytes
            
            for(var j = 0; j < shader.faces.length; ++j) {
                var face = shader.faces[j];
                face.indexOffset = indices.length * 2;
                for(var k = 0; k < face.meshVertCount; ++k) {
                    indices.push(face.vertex + meshVerts[face.meshVert + k]);
                }
                shader.elementCount += face.meshVertCount;
            }
        }
        shader.faces = null; // Don't need to send this to the render thread.
    }
    
    // Send the compiled vertex/index data back to the render thread
    postMessage({
        type: 'geometry',
        vertices: vertices,
        indices: indices,
        surfaces: shaders
    });
};

//
// Curve Tesselation
//

q3bsp.getCurvePoint3 = function(c0, c1, c2, dist) {
    var b = 1.0 - dist;
    
    return vec3.add(
        vec3.add(
            vec3.scale(c0, (b*b), [0, 0, 0]),
            vec3.scale(c1, (2*b*dist), [0, 0, 0])
        ),
        vec3.scale(c2, (dist*dist), [0, 0, 0])
    );
};

// This is kinda ugly. Clean it up at some point?
q3bsp.getCurvePoint2 = function(c0, c1, c2, dist) {
    var b = 1.0 - dist;
    
    c30 = [c0[0], c0[1], 0];
    c31 = [c1[0], c1[1], 0];
    c32 = [c2[0], c2[1], 0];
    
    var res = vec3.add(
        vec3.add(
            vec3.scale(c30, (b*b), [0, 0, 0]),
            vec3.scale(c31, (2*b*dist), [0, 0, 0])
        ),
        vec3.scale(c32, (dist*dist), [0, 0, 0])
    );
    
    return [res[0], res[1]];
};

q3bsp.tesselate = function(face, verts, meshVerts, level) {
    var off = face.vertex;
    var count = face.vertCount;
    
    var L1 = level + 1;
    
    face.vertex = verts.length;
    face.meshVert = meshVerts.length;
    
    face.vertCount = 0;
    face.meshVertCount = 0;
    
    for(var py = 0; py < face.size[1]-2; py += 2) {
        for(var px = 0; px < face.size[0]-2; px += 2) {
            
            var rowOff = (py*face.size[0]);
            
            // Store control points
            var c0 = verts[off+rowOff+px], c1 = verts[off+rowOff+px+1], c2 = verts[off+rowOff+px+2];
            rowOff += face.size[0];
            var c3 = verts[off+rowOff+px], c4 = verts[off+rowOff+px+1], c5 = verts[off+rowOff+px+2];
            rowOff += face.size[0];
            var c6 = verts[off+rowOff+px], c7 = verts[off+rowOff+px+1], c8 = verts[off+rowOff+px+2];
            
            var indexOff = face.vertCount;
            face.vertCount += L1 * L1;
            
            // Tesselate!
            for(var i = 0; i < L1; ++i) {
                var a = i / level;
                
                var pos = q3bsp.getCurvePoint3(c0.pos, c3.pos, c6.pos, a);
                var lmCoord = q3bsp.getCurvePoint2(c0.lmCoord, c3.lmCoord, c6.lmCoord, a);
                var texCoord = q3bsp.getCurvePoint2(c0.texCoord, c3.texCoord, c6.texCoord, a);
                var color = q3bsp.getCurvePoint3(c0.color, c3.color, c6.color, a);
                
                var vert = {
                    pos: pos,
                    texCoord: texCoord,
                    lmCoord: lmCoord,
                    color: [color[0], color[1], color[2], 1],
                    lmNewCoord: [ 0, 0 ],
                    normal: [0, 0, 1]
                };
                
                verts.push(vert);
            }
            
            for(var i = 1; i < L1; i++) {
                var a = i / level;
                
                var pc0 = q3bsp.getCurvePoint3(c0.pos, c1.pos, c2.pos, a);
                var pc1 = q3bsp.getCurvePoint3(c3.pos, c4.pos, c5.pos, a);
                var pc2 = q3bsp.getCurvePoint3(c6.pos, c7.pos, c8.pos, a);
                
                var tc0 = q3bsp.getCurvePoint3(c0.texCoord, c1.texCoord, c2.texCoord, a);
                var tc1 = q3bsp.getCurvePoint3(c3.texCoord, c4.texCoord, c5.texCoord, a);
                var tc2 = q3bsp.getCurvePoint3(c6.texCoord, c7.texCoord, c8.texCoord, a);
                
                var lc0 = q3bsp.getCurvePoint3(c0.lmCoord, c1.lmCoord, c2.lmCoord, a);
                var lc1 = q3bsp.getCurvePoint3(c3.lmCoord, c4.lmCoord, c5.lmCoord, a);
                var lc2 = q3bsp.getCurvePoint3(c6.lmCoord, c7.lmCoord, c8.lmCoord, a);
                
                var cc0 = q3bsp.getCurvePoint3(c0.color, c1.color, c2.color, a);
                var cc1 = q3bsp.getCurvePoint3(c3.color, c4.color, c5.color, a);
                var cc2 = q3bsp.getCurvePoint3(c6.color, c7.color, c8.color, a);
                
                for(j = 0; j < L1; j++)
                {
                    var b = j / level;
                    
                    var pos = q3bsp.getCurvePoint3(pc0, pc1, pc2, b);
                    var texCoord = q3bsp.getCurvePoint2(tc0, tc1, tc2, b);
                    var lmCoord = q3bsp.getCurvePoint2(lc0, lc1, lc2, b);
                    var color = q3bsp.getCurvePoint3(cc0, cc1, cc2, a);
                    
                    var vert = {
                        pos: pos,
                        texCoord: texCoord,
                        lmCoord: lmCoord,
                        color: [color[0], color[1], color[2], 1],
                        lmNewCoord: [ 0, 0 ],
                        normal: [0, 0, 1]
                    };
                
                    verts.push(vert);
                }
            }
            
            face.meshVertCount += level * level * 6;
            
            for(var row = 0; row < level; ++row) {
                for(var col = 0; col < level; ++col) {
                    meshVerts.push(indexOff + (row + 1) * L1 + col);
                    meshVerts.push(indexOff + row * L1 + col);
                    meshVerts.push(indexOff + row * L1 + (col+1));
                    
                    meshVerts.push(indexOff + (row + 1) * L1 + col);
                    meshVerts.push(indexOff + row * L1 + (col+1));
                    meshVerts.push(indexOff + (row + 1) * L1 + (col+1));
                }
            }
    
        }
    }
};

//
// BSP Collision Detection
//

q3bsp.trace = function(traceId, start, end, radius, slide) {
    if(!radius) { radius = 0; }
    if(!slide) { slide = false; }
    
    if (!brushSides) { return end; }
    
    var output = {
        startsOut: true,
        allSolid: false,
        plane: null,
        fraction: 1
    };
    
    q3bsp.traceNode(0, 0, 1, start, end, radius, output);
    
    if(output.fraction != 1) { // collided with something
        if(slide && output.plane) {
            var endDist = Math.abs(vec3.dot( end, output.plane.normal ) - (output.plane.distance + radius + 0.03125));
            for (var i = 0; i < 3; i++) {
                end[i] = end[i] + endDist * (output.plane.normal[i]);
            }
        } else {
            for (var i = 0; i < 3; i++) {
                end[i] = start[i] + output.fraction * (end[i] - start[i]);
            }
        }
    }
    
    postMessage({
        type: 'trace',
        traceId: traceId,
        end: end
    });
};

q3bsp.traceNode = function(nodeIdx, startFraction, endFraction, start, end, radius, output) {
    if (nodeIdx < 0) { // Leaf node?
        var leaf = leaves[-(nodeIdx + 1)];
        for (var i = 0; i < leaf.leafBrushCount; i++) {
            var brush = brushes[leafBrushes[leaf.leafBrush + i]];
            var shader = shaders[brush.shader];
            if (brush.brushSideCount > 0 && (shader.contents & 1)) {
                q3bsp.traceBrush(brush, start, end, radius, output);
            }
        }
        return;
    }
    
    // Tree node
    var node = nodes[nodeIdx];
    var plane = planes[node.plane];
    
    var startDist = vec3.dot(plane.normal, start) - plane.distance;
    var endDist = vec3.dot(plane.normal, end) - plane.distance;
    
    if (startDist >= radius && endDist >= radius) {
        q3bsp.traceNode(node.children[0], startFraction, endFraction, start, end, radius, output );
    } else if (startDist < -radius && endDist < -radius) {
        q3bsp.traceNode(node.children[1], startFraction, endFraction, start, end, radius, output );
    } else {
        var side;
        var fraction1, fraction2, middleFraction;
        var middle = [0, 0, 0];

        if (startDist < endDist) {
            side = 1; // back
            var iDist = 1 / (startDist - endDist);
            fraction1 = (startDist - radius + 0.03125) * iDist;
            fraction2 = (startDist + radius + 0.03125) * iDist;
        } else if (startDist > endDist) {
            side = 0; // front
            var iDist = 1 / (startDist - endDist);
            fraction1 = (startDist + radius + 0.03125) * iDist;
            fraction2 = (startDist - radius - 0.03125) * iDist;
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
        
        q3bsp.traceNode(node.children[side], startFraction, middleFraction, start, middle, radius, output );
        
        middleFraction = startFraction + (endFraction - startFraction) * fraction2;
        
        for (var i = 0; i < 3; i++) {
            middle[i] = start[i] + fraction2 * (end[i] - start[i]);
        }
        
        q3bsp.traceNode(node.children[side===0?1:0], middleFraction, endFraction, middle, end, radius, output );
    }
};

q3bsp.traceBrush = function(brush, start, end, radius, output) {
    var startFraction = -1;
    var endFraction = 1;
    var startsOut = false;
    var endsOut = false;
    var collisionPlane = null;
    
    for (var i = 0; i < brush.brushSideCount; i++) {
        var brushSide = brushSides[brush.brushSide + i];
        var plane = planes[brushSide.plane];
        
        var startDist = vec3.dot( start, plane.normal ) - (plane.distance + radius);
        var endDist = vec3.dot( end, plane.normal ) - (plane.distance + radius);

        if (startDist > 0) startsOut = true;
        if (endDist > 0) endsOut = true;

        // make sure the trace isn't completely on one side of the brush
        if (startDist > 0 && endDist > 0) { return; }
        if (startDist <= 0 && endDist <= 0) { continue; }

        if (startDist > endDist) { // line is entering into the brush
            var fraction = (startDist - 0.03125) / (startDist - endDist);
            if (fraction > startFraction) {
                startFraction = fraction;
                collisionPlane = plane;
            }
        } else { // line is leaving the brush
            var fraction = (startDist + 0.03125) / (startDist - endDist);
            if (fraction < endFraction)
                endFraction = fraction;
        }
    }
    
    if (startsOut === false) {
        output.startsOut = false;
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

//
// Visibility Checking
//

var lastLeaf = -1;

q3bsp.checkVis = function(visCluster, testCluster) {
    if(visCluster == testCluster || visCluster == -1) { return true; }
    var i = (visCluster * visSize) + (testCluster >> 3);
    var visSet = visBuffer[i];
    return (visSet & (1 << (testCluster & 7)) !== 0);
};

q3bsp.getLeaf = function(pos) {
    var index = 0;
    
    var node = null;
    var plane = null;
    var distance = 0;

    while (index >= 0) {
        node = nodes[index];
        plane = planes[node.plane];
        distance = vec3.dot(plane.normal, pos) - plane.distance;

        if (distance >= 0) {
            index = node.children[0];
        } else {
            index = node.children[1];
        }
    }

    return -(index+1);
};

q3bsp.buildVisibleList = function(leafIndex) {
    // Determine visible faces
    if(leafIndex == lastLeaf) { return; }
    lastLeaf = leafIndex;
    
    var curLeaf = leaves[leafIndex];
    
    var visibleShaders = new Array(shaders.length);
    
    for(var i = 0; i < leaves.length; ++i) {
        var leaf = leaves[i];
        if(q3bsp.checkVis(curLeaf.cluster, leaf.cluster)) {
            for(var j = 0; j < leaf.leafFaceCount; ++j) {
                var face = faces[leafFaces[[j + leaf.leafFace]]];
                if(face) {
                    visibleShaders[face.shader] = true;
                }
            }
        }
    }
    
    var ar = new Array(visSize);
    
    for(var i = 0; i < visSize; ++i) {
        ar[i] = visBuffer[(curLeaf.cluster * visSize) + i];
    }
    
    postMessage({
        type: 'visibility',
        visibleSurfaces: visibleShaders
    });
};