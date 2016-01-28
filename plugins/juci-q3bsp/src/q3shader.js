/*
 * q3shader.js - Parses Quake 3 shader files (.shader)
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
// Shader Tokenizer
//

shaderTokenizer = function(src) {
    // Strip out comments
    src = src.replace(/\/\/.*$/mg, ''); // C++ style (//...)
    src = src.replace(/\/\*[^*\/]*\*\//mg, ''); // C style (/*...*/) (Do the shaders even use these?)
    this.tokens = src.match(/[^\s\n\r\"]+/mg);
    
    this.offset = 0;
};

shaderTokenizer.prototype.EOF = function() {
    if(this.tokens === null) { return true; }
    var token = this.tokens[this.offset];
    while(token === '' && this.offset < this.tokens.length) {
        this.offset++;
        token = this.tokens[this.offset];
    }
    return this.offset >= this.tokens.length;
};

shaderTokenizer.prototype.next = function() {
    if(this.tokens === null) { return ; }
    var token = '';
    while(token === '' && this.offset < this.tokens.length) {
        token = this.tokens[this.offset++];
    }
    return token;
};

shaderTokenizer.prototype.prev = function() {
    if(this.tokens === null) { return ; }
    var token = '';
    while(token === '' && this.offset >= 0) {
        token = this.tokens[this.offset--];
    }
    return token;
};

//
// Shader Loading
//

q3shader = {};

q3shader.loadList = function(sources, onload) {
    for(var i = 0; i < sources.length; ++i) {
        q3shader.load(sources[i], onload);
    }
};

q3shader.load = function(url, onload) {
    var request = new XMLHttpRequest();
    
    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            q3shader.parse(url, request.responseText, onload);
        }
    };
    
    request.open('GET', url, true);
    request.setRequestHeader('Content-Type', 'text/plain');
    request.send(null);
};

q3shader.parse = function(url, src, onload) {
    var shaders = [];
    
    var tokens = new shaderTokenizer(src);
    
    // Parse a shader
    while(!tokens.EOF()) {
        var name = tokens.next();
        var shader = q3shader.parseShader(name, tokens);
        if(shader) {
            shader.url = url;
            
            if(shader.stages) {
                for(var i = 0; i < shader.stages.length; ++i) {
                    // Build a WebGL shader program out of the stage parameters set here
                    shader.stages[i].shaderSrc = q3shader.buildShaderSource(shader, shader.stages[i]);
                }
            }
        }
        shaders.push(shader);
    }
    
    // Send shaders to gl Thread
    onload(shaders);
};

q3shader.parseShader = function(name, tokens) {
    var brace = tokens.next();
    if(brace != '{') {
        return null;
    }
    
    var shader = {
        name: name,
        cull: 'back',
        sky: false,
        blend: false,
        opaque: false,
        sort: 0,
        vertexDeforms: [],
        stages: []
    };

    // Parse a shader
    while(!tokens.EOF()) {
        var token = tokens.next().toLowerCase();
        if(token == '}') { break; }
        
        switch (token) {
            case '{': {
                var stage = q3shader.parseStage(tokens);
                
                // I really really really don't like doing this, which basically just forces lightmaps to use the 'filter' blendmode
                // but if I don't a lot of textures end up looking too bright. I'm sure I'm jsut missing something, and this shouldn't
                // be needed.
                if(stage.isLightmap && (stage.hasBlendFunc)) {
                    stage.blendSrc = 'GL_DST_COLOR';
                    stage.blendDest = 'GL_ZERO';
                }
                
                // I'm having a ton of trouble getting lightingSpecular to work properly,
                // so this little hack gets it looking right till I can figure out the problem
                if(stage.alphaGen == 'lightingspecular') {
                    stage.blendSrc = 'GL_ONE';
                    stage.blendDest = 'GL_ZERO';
                    stage.hasBlendFunc = false;
                    stage.depthWrite = true;
                    shader.stages = [];
                }
                
                if(stage.hasBlendFunc) { shader.blend = true; } else { shader.opaque = true; }
                
                shader.stages.push(stage);
            } break;
            
            case 'cull':
                shader.cull = tokens.next();
                break;
                
            case 'deformvertexes':
                var deform = {
                    type: tokens.next().toLowerCase()
                };
                
                switch(deform.type) {
                    case 'wave':
                        deform.spread = 1.0 / parseFloat(tokens.next());
                        deform.waveform = q3shader.parseWaveform(tokens);
                        break;
                    default: deform = null; break;
                }
                
                if(deform) { shader.vertexDeforms.push(deform); }
                break;
                
            case 'sort':
                var sort = tokens.next().toLowerCase();
                switch(sort) {
                    case 'portal': shader.sort = 1; break;
                    case 'sky': shader.sort = 2; break;
                    case 'opaque': shader.sort = 3; break;
                    case 'banner': shader.sort = 6; break;
                    case 'underwater': shader.sort = 8; break;
                    case 'additive': shader.sort = 9; break;
                    case 'nearest': shader.sort = 16; break;
                    default: shader.sort = parseInt(sort); break; 
                };
                break;
                
            case 'surfaceparm':
                var param = tokens.next().toLowerCase();
                
                switch(param) {
                    case 'sky':
                        shader.sky = true;
                        break;
                    default: break;
                }
                break;
                
            default: break;
        }
    }
    
    if(!shader.sort) {
        shader.sort = (shader.opaque ? 3 : 9);
    }
    
    return shader;
};

q3shader.parseStage = function(tokens) {
    var stage = {
        map: null,
        clamp: false,
        tcGen: 'base',
        rgbGen: 'identity',
        rgbWaveform: null,
        alphaGen: '1.0',
        alphaFunc: null,
        alphaWaveform: null,
        blendSrc: 'GL_ONE', 
        blendDest: 'GL_ZERO',
        hasBlendFunc: false,
        tcMods: [],
        animMaps: [],
        animFreq: 0,
        depthFunc: 'lequal',
        depthWrite: true
    };
    
    // Parse a shader
    while(!tokens.EOF()) {
        var token = tokens.next();
        if(token == '}') { break; }
        
        switch(token.toLowerCase()) {
            case 'clampmap':
                stage.clamp = true;
            case 'map':
                stage.map = tokens.next().replace(/(\.jpg|\.tga)/, '.png');
                break;
                
            case 'animmap':
                stage.map = 'anim';
                stage.animFreq = parseFloat(tokens.next());
                var nextMap = tokens.next();
                while(nextMap.match(/(\.jpg|\.tga)/)) {
                    stage.animMaps.push(nextMap.replace(/(\.jpg|\.tga)/, '.png'));
                    nextMap = tokens.next();
                }
                tokens.prev();
                break;
                
            case 'rgbgen':
                stage.rgbGen = tokens.next().toLowerCase();;
                switch(stage.rgbGen) {
                    case 'wave':
                        stage.rgbWaveform = q3shader.parseWaveform(tokens);
                        if(!stage.rgbWaveform) { stage.rgbGen == 'identity'; }
                        break;
                };
                break;
                
            case 'alphagen':
                stage.alphaGen = tokens.next().toLowerCase();
                switch(stage.alphaGen) {
                    case 'wave':
                        stage.alphaWaveform = q3shader.parseWaveform(tokens);
                        if(!stage.alphaWaveform) { stage.alphaGen == '1.0'; }
                        break;
                    default: break;
                };
                break;
                
            case 'alphafunc':
                stage.alphaFunc = tokens.next().toUpperCase();
                break;
                
            case 'blendfunc':
                stage.blendSrc = tokens.next();
                stage.hasBlendFunc = true;
                if(!stage.depthWriteOverride) {
                    stage.depthWrite = false;
                }
                switch(stage.blendSrc) {
                    case 'add':
                        stage.blendSrc = 'GL_ONE';
                        stage.blendDest = 'GL_ONE';
                        break;
                        
                    case 'blend':
                        stage.blendSrc = 'GL_SRC_ALPHA';
                        stage.blendDest = 'GL_ONE_MINUS_SRC_ALPHA';
                        break;
                        
                    case 'filter':
                        stage.blendSrc = 'GL_DST_COLOR';
                        stage.blendDest = 'GL_ZERO';
                        break;
                        
                    default:
                        stage.blendDest = tokens.next();
                        break;
                }
                break;
                
            case 'depthfunc':
                stage.depthFunc = tokens.next().toLowerCase();
                break;
                
            case 'depthwrite':
                stage.depthWrite = true;
                stage.depthWriteOverride = true;
                break;
                
            case 'tcmod':
                var tcMod = {
                    type: tokens.next().toLowerCase()
                }
                switch(tcMod.type) {
                    case 'rotate': 
                        tcMod.angle = parseFloat(tokens.next()) * (3.1415/180);
                        break;
                    case 'scale':
                        tcMod.scaleX = parseFloat(tokens.next());
                        tcMod.scaleY = parseFloat(tokens.next());
                        break;
                    case 'scroll':
                        tcMod.sSpeed = parseFloat(tokens.next());
                        tcMod.tSpeed = parseFloat(tokens.next());
                        break;
                    case 'stretch':
                        tcMod.waveform = q3shader.parseWaveform(tokens);
                        if(!tcMod.waveform) { tcMod.type == null; }
                        break;
                    case 'turb':
                        tcMod.turbulance = {
                            base: parseFloat(tokens.next()),
                            amp: parseFloat(tokens.next()),
                            phase: parseFloat(tokens.next()),
                            freq: parseFloat(tokens.next())
                        };
                        break;
                    default: tcMod.type == null; break;
                }
                if(tcMod.type) {
                    stage.tcMods.push(tcMod);
                }
                break;
            case 'tcgen':
                stage.tcGen = tokens.next();
                break;
            default: break;
        }
    }
    
    if(stage.blendSrc == 'GL_ONE' && stage.blendDest == 'GL_ZERO') {
        stage.hasBlendFunc = false;
        stage.depthWrite = true;
    }
    
    stage.isLightmap = stage.map == '$lightmap'
    
    return stage;
};

q3shader.parseWaveform = function(tokens) {
    return {
        funcName: tokens.next().toLowerCase(),
        base: parseFloat(tokens.next()),
        amp: parseFloat(tokens.next()),
        phase: parseFloat(tokens.next()),
        freq: parseFloat(tokens.next())
    };
};

//
// WebGL Shader creation
//

// This whole section is a bit ugly, but it gets the job done. The job, in this case, is translating
// Quake 3 shaders into GLSL shader programs. We should probably be doing a bit more normalization here.

q3shader.buildShaderSource = function(shader, stage) {
    return {
        vertex: q3shader.buildVertexShader(shader, stage),
        fragment: q3shader.buildFragmentShader(shader, stage)
    };
}

q3shader.buildVertexShader = function(stageShader, stage) {
    var shader = new shaderBuilder();
    
    shader.addAttribs({
        position: 'vec3',
        normal: 'vec3',
        color: 'vec4',
    });
    
    shader.addVaryings({
        vTexCoord: 'vec2',
        vColor: 'vec4',
    });
    
    shader.addUniforms({
        modelViewMat: 'mat4',
        projectionMat: 'mat4',
        time: 'float',
    });
    
    if(stage.isLightmap) {
        shader.addAttribs({ lightCoord: 'vec2' });
    } else {
        shader.addAttribs({ texCoord: 'vec2' });
    }
    
    shader.addLines(['vec3 defPosition = position;']);
    
    for(var i = 0; i < stageShader.vertexDeforms.length; ++i) {
        var deform = stageShader.vertexDeforms[i];
        
        switch(deform.type) {
            case 'wave':
                var name = 'deform' + i;
                var offName = 'deformOff' + i;
                
                shader.addLines([
                    'float ' + offName + ' = (position.x + position.y + position.z) * ' + deform.spread.toFixed(4) + ';'
                ]);
                
                var phase = deform.waveform.phase;
                deform.waveform.phase = phase.toFixed(4) + ' + ' + offName;
                shader.addWaveform(name, deform.waveform);
                deform.waveform.phase = phase;
                
                shader.addLines([
                    'defPosition += normal * ' + name + ';'
                ]);
                break;
            default: break;
        }
    }
    
    shader.addLines(['vec4 worldPosition = modelViewMat * vec4(defPosition, 1.0);']);
    shader.addLines(['vColor = color;']);

    if(stage.tcGen == 'environment') {
        shader.addLines([
            'vec3 viewer = normalize(-worldPosition.xyz);',
            'float d = dot(normal, viewer);',
            'vec3 reflected = normal*2.0*d - viewer;',
            'vTexCoord = vec2(0.5, 0.5) + reflected.xy * 0.5;'
        ]);
    } else {
        // Standard texturing
        if(stage.isLightmap) {
            shader.addLines(['vTexCoord = lightCoord;']);
        } else {
            shader.addLines(['vTexCoord = texCoord;']);
        }
    }
    
    // tcMods
    for(var i = 0; i < stage.tcMods.length; ++i) {
        var tcMod = stage.tcMods[i];
        switch(tcMod.type) {
            case 'rotate':
                shader.addLines([
                    'float r = ' + tcMod.angle.toFixed(4) + ' * time;',
                    'vTexCoord -= vec2(0.5, 0.5);',
                    'vTexCoord = vec2(vTexCoord.s * cos(r) - vTexCoord.t * sin(r), vTexCoord.t * cos(r) + vTexCoord.s * sin(r));',
                    'vTexCoord += vec2(0.5, 0.5);',
                ]);
                break;
            case 'scroll':
                shader.addLines([
                    'vTexCoord += vec2(' + tcMod.sSpeed.toFixed(4) + ' * time, ' + tcMod.tSpeed.toFixed(4) + ' * time);'
                ]);
                break;
            case 'scale':
                shader.addLines([
                    'vTexCoord *= vec2(' + tcMod.scaleX.toFixed(4) + ', ' + tcMod.scaleY.toFixed(4) + ');'
                ]);
                break;
            case 'stretch':
                shader.addWaveform('stretchWave', tcMod.waveform);
                shader.addLines([
                    'stretchWave = 1.0 / stretchWave;',
                    'vTexCoord *= stretchWave;',
                    'vTexCoord += vec2(0.5 - (0.5 * stretchWave), 0.5 - (0.5 * stretchWave));',
                ]);
                break;
            case 'turb':
                var tName = 'turbTime' + i;
                shader.addLines([
                    'float ' + tName + ' = ' + tcMod.turbulance.phase.toFixed(4) + ' + time * ' + tcMod.turbulance.freq.toFixed(4) + ';',
                    'vTexCoord.s += sin( ( ( position.x + position.z )* 1.0/128.0 * 0.125 + ' + tName + ' ) * 6.283) * ' + tcMod.turbulance.amp.toFixed(4) + ';',
                    'vTexCoord.t += sin( ( position.y * 1.0/128.0 * 0.125 + ' + tName + ' ) * 6.283) * ' + tcMod.turbulance.amp.toFixed(4) + ';'
                ]);
                break;
            default: break;
        }
    }
    
    switch(stage.alphaGen) {
        case 'lightingspecular':
            shader.addAttribs({ lightCoord: 'vec2' });
            shader.addVaryings({ vLightCoord: 'vec2' });
            shader.addLines([ 'vLightCoord = lightCoord;' ]);
            break;
        default: 
            break;
    }
    
    shader.addLines(['gl_Position = projectionMat * worldPosition;']);
    
    return shader.getSource();
    
}

q3shader.buildFragmentShader = function(stageShader, stage) {
    var shader = new shaderBuilder();
    
    shader.addVaryings({
        vTexCoord: 'vec2',
        vColor: 'vec4',
    });
    
    shader.addUniforms({
        texture: 'sampler2D',
        time: 'float',
    });
    
    shader.addLines(['vec4 texColor = texture2D(texture, vTexCoord.st);']);
    
    switch(stage.rgbGen) {
        case 'vertex':
            shader.addLines(['vec3 rgb = texColor.rgb * vColor.rgb;']);
            break;
        case 'wave':
            shader.addWaveform('rgbWave', stage.rgbWaveform);
            shader.addLines(['vec3 rgb = texColor.rgb * rgbWave;']);
            break;
        default:
            shader.addLines(['vec3 rgb = texColor.rgb;']);
            break;
    }
    
    switch(stage.alphaGen) {
        case 'wave':
            shader.addWaveform('alpha', stage.alphaWaveform);
            break;
        case 'lightingspecular':
            // For now this is VERY special cased. May not work well with all instances of lightingSpecular
            shader.addUniforms({
                lightmap: 'sampler2D'
            });
            shader.addVaryings({
                vLightCoord: 'vec2',
                vLight: 'float'
            });
            shader.addLines([
                'vec4 light = texture2D(lightmap, vLightCoord.st);',
                'rgb *= light.rgb;',
                'rgb += light.rgb * texColor.a * 0.6;', // This was giving me problems, so I'm ignorning an actual specular calculation for now
                'float alpha = 1.0;'
            ]);
            break;
        default: 
            shader.addLines(['float alpha = texColor.a;']);
            break;
    }
    
    if(stage.alphaFunc) {
        switch(stage.alphaFunc) {
            case 'GT0':
                shader.addLines([
                    'if(alpha == 0.0) { discard; }'
                ]);
                break;
            case 'LT128':
                shader.addLines([
                    'if(alpha >= 0.5) { discard; }'
                ]);
                break;
            case 'GE128':
                shader.addLines([
                    'if(alpha < 0.5) { discard; }'
                ]);
                break;
            default: 
                break;
        }
    }
    
    shader.addLines(['gl_FragColor = vec4(rgb, alpha);']);
    
    return shader.getSource();
}

//
// WebGL Shader builder utility
//

shaderBuilder = function() {
    this.attrib = {};
    this.varying = {};
    this.uniform = {};
    
    this.functions = {};
    
    this.statements = [];
}

shaderBuilder.prototype.addAttribs = function(attribs) {
    for (var name in attribs) {
        this.attrib[name] = 'attribute ' + attribs[name] + ' ' + name + ';'
    }
}

shaderBuilder.prototype.addVaryings = function(varyings) {
    for (var name in varyings) {
        this.varying[name] = 'varying ' + varyings[name] + ' ' + name + ';'
    }
}

shaderBuilder.prototype.addUniforms = function(uniforms) {
    for (var name in uniforms) {
        this.uniform[name] = 'uniform ' + uniforms[name] + ' ' + name + ';'
    }
}

shaderBuilder.prototype.addFunction = function(name, lines) {
    this.functions[name] = lines.join('\n');
}

shaderBuilder.prototype.addLines = function(statements) {
    for(var i = 0; i < statements.length; ++i) {
        this.statements.push(statements[i]);
    }
}

shaderBuilder.prototype.getSource = function() {
    var src = '\
#ifdef GL_ES \n\
precision highp float; \n\
#endif \n';
    
    for(var i in this.attrib) {
        src += this.attrib[i] + '\n';
    }
    
    for(var i in this.varying) {
        src += this.varying[i] + '\n';
    }
    
    for(var i in this.uniform) {
        src += this.uniform[i] + '\n';
    }
    
    for(var i in this.functions) {
        src += this.functions[i] + '\n';
    }
    
    src += 'void main(void) {\n\t';
    src += this.statements.join('\n\t');
    src += '\n}\n';
    
    return src;
}

// q3-centric functions

shaderBuilder.prototype.addWaveform = function(name, wf, timeVar) {
    if(!wf) { 
        this.statements.push('float ' + name + ' = 0.0;');
        return; 
    }
    
    if(!timeVar) { timeVar = 'time'; }
    
    if(typeof(wf.phase) == "number") {
        wf.phase = wf.phase.toFixed(4)
    }
    
    switch(wf.funcName) {
        case 'sin':  
            this.statements.push('float ' + name + ' = ' + wf.base.toFixed(4) + ' + sin((' + wf.phase + ' + ' + timeVar + ' * ' + wf.freq.toFixed(4) + ') * 6.283) * ' + wf.amp.toFixed(4) + ';');
            return;
        case 'square': funcName = 'square'; this.addSquareFunc(); break;
        case 'triangle': funcName = 'triangle'; this.addTriangleFunc(); break;
        case 'sawtooth': funcName = 'fract'; break;
        case 'inversesawtooth': funcName = '1.0 - fract'; break;
        default: 
            this.statements.push('float ' + name + ' = 0.0;');
            return;
    }
    this.statements.push('float ' + name + ' = ' + wf.base.toFixed(4) + ' + ' + funcName + '(' + wf.phase + ' + ' + timeVar + ' * ' + wf.freq.toFixed(4) + ') * ' + wf.amp.toFixed(4) + ';');
}

shaderBuilder.prototype.addSquareFunc = function() {
    this.addFunction('square', [
        'float square(float val) {',
        '   return (mod(floor(val*2.0)+1.0, 2.0) * 2.0) - 1.0;',
        '}',
    ]);
}

shaderBuilder.prototype.addTriangleFunc = function() {
    this.addFunction('triangle', [
        'float triangle(float val) {',
        '   return abs(2.0 * fract(val) - 1.0);',
        '}',
    ]);
}