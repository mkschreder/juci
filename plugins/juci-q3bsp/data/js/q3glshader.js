/*
 * q3glshader.js - Transforms a parsed Q3 shader definition into a set of WebGL compatible states
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
 
//
// Default Shaders
//

q3bsp_default_vertex = '\
    #ifdef GL_ES \n\
    precision highp float; \n\
    #endif \n\
    attribute vec3 position; \n\
    attribute vec3 normal; \n\
    attribute vec2 texCoord; \n\
    attribute vec2 lightCoord; \n\
    attribute vec4 color; \n\
\n\
    varying vec2 vTexCoord; \n\
    varying vec2 vLightmapCoord; \n\
    varying vec4 vColor; \n\
\n\
    uniform mat4 modelViewMat; \n\
    uniform mat4 projectionMat; \n\
\n\
    void main(void) { \n\
        vec4 worldPosition = modelViewMat * vec4(position, 1.0); \n\
        vTexCoord = texCoord; \n\
        vColor = color; \n\
        vLightmapCoord = lightCoord; \n\
        gl_Position = projectionMat * worldPosition; \n\
    } \n\
';

q3bsp_default_fragment = '\
    #ifdef GL_ES \n\
    precision highp float; \n\
    #endif \n\
    varying vec2 vTexCoord; \n\
    varying vec2 vLightmapCoord; \n\
    uniform sampler2D texture; \n\
    uniform sampler2D lightmap; \n\
\n\
    void main(void) { \n\
        vec4 diffuseColor = texture2D(texture, vTexCoord); \n\
        vec4 lightColor = texture2D(lightmap, vLightmapCoord); \n\
        gl_FragColor = vec4(diffuseColor.rgb * lightColor.rgb, diffuseColor.a); \n\
    } \n\
';

q3bsp_model_fragment = '\
    #ifdef GL_ES \n\
    precision highp float; \n\
    #endif \n\
    varying vec2 vTexCoord; \n\
    varying vec4 vColor; \n\
    uniform sampler2D texture; \n\
\n\
    void main(void) { \n\
        vec4 diffuseColor = texture2D(texture, vTexCoord); \n\
        gl_FragColor = vec4(diffuseColor.rgb * vColor.rgb, diffuseColor.a); \n\
    } \n\
';

var q3glshader = {}

q3glshader.lightmap = null;
q3glshader.white = null;
q3glshader.defaultShader = null;
q3glshader.defaultTexture = null;
q3glshader.texMat = mat4.create();
q3glshader.defaultProgram = null;

q3glshader.init = function(gl, lightmap) {
    q3glshader.lightmap = lightmap;
    q3glshader.white = q3glshader.createSolidTexture(gl, [255,255,255,255]);
    
    q3glshader.defaultProgram = q3glshader.compileShaderProgram(gl, q3bsp_default_vertex, q3bsp_default_fragment);
    q3glshader.modelProgram = q3glshader.compileShaderProgram(gl, q3bsp_default_vertex, q3bsp_model_fragment); 
    
    var image = new Image();
    q3glshader.defaultTexture = gl.createTexture();
    image.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, q3glshader.defaultTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
    }
    image.src = q3bsp_base_folder + '/webgl/no-shader.png';
    
    // Load default stage
    q3glshader.defaultShader = q3glshader.buildDefault(gl);
}

//
// Shader building
//

q3glshader.build = function(gl, shader) {
    var glShader = {
        cull: q3glshader.translateCull(gl, shader.cull),
        sort: shader.sort,
        sky: shader.sky,
        blend: shader.blend,
        name: shader.name,
        stages: []
    };
    
    for(var j = 0; j < shader.stages.length; ++j) {
        var stage = shader.stages[j];
        var glStage = stage;
        
        glStage.texture = null;
        glStage.blendSrc = q3glshader.translateBlend(gl, stage.blendSrc);
        glStage.blendDest = q3glshader.translateBlend(gl, stage.blendDest);
        glStage.depthFunc = q3glshader.translateDepthFunc(gl, stage.depthFunc);
        
        glShader.stages.push(glStage);
    }
    
    return glShader;
}

q3glshader.buildDefault = function(gl, surface) {
    var diffuseStage = {
        map: (surface ? surface.shaderName + '.png' : null),
        isLightmap: false,
        blendSrc: gl.ONE,
        blendDest: gl.ZERO,
        depthFunc: gl.LEQUAL,
        depthWrite: true
    };
    
    if(surface) {
        q3glshader.loadTexture(gl, surface, diffuseStage);
    } else {
        diffuseStage.texture = q3glshader.defaultTexture;
    }
    
    var glShader = {
        cull: gl.FRONT,
        blend: false,
        sort: 3,
        stages: [ diffuseStage ]
    };
    
    return glShader;
}

q3glshader.translateDepthFunc = function(gl, depth) {
    if(!depth) { return gl.LEQUAL; }
    switch(depth.toLowerCase()) {
        case 'gequal': return gl.GEQUAL;
        case 'lequal': return gl.LEQUAL;
        case 'equal': return gl.EQUAL;
        case 'greater': return gl.GREATER;
        case 'less': return gl.LESS;
        default: return gl.LEQUAL;
    }
};

q3glshader.translateCull = function(gl, cull) {
    if(!cull) { return gl.FRONT; }
    switch(cull.toLowerCase()) {
        case 'disable':
        case 'none': return null;
        case 'front': return gl.BACK;
        case 'back':
        default: return gl.FRONT;
    }
};

q3glshader.translateBlend = function(gl, blend) {
    if(!blend) { return gl.ONE; }
    switch(blend.toUpperCase()) {
        case 'GL_ONE': return gl.ONE;
        case 'GL_ZERO': return gl.ZERO;
        case 'GL_DST_COLOR': return gl.DST_COLOR;
        case 'GL_ONE_MINUS_DST_COLOR': return gl.ONE_MINUS_DST_COLOR;
        case 'GL_SRC_ALPHA ': return gl.SRC_ALPHA;
        case 'GL_ONE_MINUS_SRC_ALPHA': return gl.ONE_MINUS_SRC_ALPHA;
        case 'GL_SRC_COLOR': return gl.SRC_COLOR;
        case 'GL_ONE_MINUS_SRC_COLOR': return gl.ONE_MINUS_SRC_COLOR;
        default: return gl.ONE;
    }
};

//
// Texture loading
//

q3glshader.loadShaderMaps = function(gl, surface, shader) {
    for(var i = 0; i < shader.stages.length; ++i) {
        var stage = shader.stages[i];
        if(stage.map) {
            q3glshader.loadTexture(gl, surface, stage);
        }
        
        if(stage.shaderSrc && !stage.program) {
            stage.program = q3glshader.compileShaderProgram(gl, stage.shaderSrc.vertex, stage.shaderSrc.fragment);
        }
    }
};

q3glshader.loadTexture = function(gl, surface, stage) {
    if(!stage.map) {
        stage.texture = q3glshader.white;
        return;
    } else if(stage.map == '$lightmap') {
        stage.texture = (surface.geomType != 3 ? q3glshader.lightmap : q3glshader.white);
        return;
    } else if(stage.map == '$whiteimage') {
        stage.texture = q3glshader.white;
        return;
    }
    
    stage.texture = q3glshader.defaultTexture;
    
    if(stage.map == 'anim') {
        stage.animTexture = [];
        for(var i = 0; i < stage.animMaps.length; ++i) {
            var animLoad = function(i) {
                stage.animTexture[i] = q3glshader.defaultTexture;
                q3glshader.loadTextureUrl(gl, stage, stage.animMaps[i], function(texture) {
                    stage.animTexture[i] = texture;
                });
            };
            animLoad(i);
        }
        stage.animFrame = 0;
    } else {
        q3glshader.loadTextureUrl(gl, stage, stage.map, function(texture) {
            stage.texture = texture;
        });
    }
};

q3glshader.loadTextureUrl = function(gl, stage, url, onload) {
    var image = new Image();
    image.onload = function() {
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        if(stage.clamp) {
            gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
            gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
        }
        gl.generateMipmap(gl.TEXTURE_2D);
        onload(texture);
    }
    image.src = q3bsp_base_folder + '/' + url;
}

q3glshader.createSolidTexture = function(gl, color) {
    var data = new Uint8Array(color);
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    return texture;
}

//
// Render state setup
//

q3glshader.setShader = function(gl, shader) {
    if(!shader) {
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
    } else if(shader.cull && !shader.sky) {
        gl.enable(gl.CULL_FACE);
        gl.cullFace(shader.cull);
    } else {
        gl.disable(gl.CULL_FACE);
    }
    
    return true;
}

q3glshader.setShaderStage = function(gl, shader, shaderStage, time) {
    var stage = shaderStage;
    if(!stage) {
        stage = q3glshader.defaultShader.stages[0];
    }
    
    if(stage.animFreq) {
        // Texture animation seems like a natural place for setInterval, but that approach has proved error prone. 
        // It can easily get out of sync with other effects (like rgbGen pulses and whatnot) which can give a 
        // jittery or flat out wrong appearance. Doing it this way ensures all effects are synced.
        var animFrame = Math.floor(time*stage.animFreq) % stage.animTexture.length;
        stage.texture = stage.animTexture[animFrame];
    }
    
    gl.blendFunc(stage.blendSrc, stage.blendDest);
    
    if(stage.depthWrite && !shader.sky) {
        gl.depthMask(true);
    } else {
        gl.depthMask(false);
    }
    
    gl.depthFunc(stage.depthFunc);
    
    var program = stage.program;
    if(!program) { 
        if(shader.model) {
            program = q3glshader.modelProgram;
        } else {
            program = q3glshader.defaultProgram;
        }
    }
        
    gl.useProgram(program);
    
    var texture = stage.texture;
    if(!texture) { texture = q3glshader.defaultTexture; }
    
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(program.uniform.texture, 0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    if(program.uniform.lightmap) {
        gl.activeTexture(gl.TEXTURE1);
        gl.uniform1i(program.uniform.lightmap, 1);
        gl.bindTexture(gl.TEXTURE_2D, q3glshader.lightmap);
    }
    
    if(program.uniform.time) {
        gl.uniform1f(program.uniform.time, time);
    }
    
    return program;
};

//
// Shader program compilation
//

q3glshader.compileShaderProgram = function(gl, vertexSrc, fragmentSrc) {
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentSrc);
    gl.compileShader(fragmentShader);
    
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        /*console.debug(gl.getShaderInfoLog(fragmentShader));
        console.debug(vertexSrc);
        console.debug(fragmentSrc);*/
        gl.deleteShader(fragmentShader);
        return null;
    }
    
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexSrc);
    gl.compileShader(vertexShader);
    
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        /*console.debug(gl.getShaderInfoLog(vertexShader));
        console.debug(vertexSrc);
        console.debug(fragmentSrc);*/
        gl.deleteShader(vertexShader);
        return null;
    }
    
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        gl.deleteProgram(shaderProgram);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        /*console.debug('Could not link shaders');
        console.debug(vertexSrc);
        console.debug(fragmentSrc);*/
        return null;
    }
    
    var i, attrib, uniform;
    var attribCount = gl.getProgramParameter(shaderProgram, gl.ACTIVE_ATTRIBUTES);
    shaderProgram.attrib = {};
    for (i = 0; i < attribCount; i++) {
        attrib = gl.getActiveAttrib(shaderProgram, i);
        shaderProgram.attrib[attrib.name] = gl.getAttribLocation(shaderProgram, attrib.name);
    }

    var uniformCount = gl.getProgramParameter(shaderProgram, gl.ACTIVE_UNIFORMS);
    shaderProgram.uniform = {};
    for (i = 0; i < uniformCount; i++) {
        uniform = gl.getActiveUniform(shaderProgram, i);
        shaderProgram.uniform[uniform.name] = gl.getUniformLocation(shaderProgram, uniform.name);
    }

    return shaderProgram;
}