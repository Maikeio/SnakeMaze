/*struct Fog{
    
};*/
precision highp float;
precision highp int;
out vec4 fragColor;

/*layout(location = 0) out vec4 gAlbedoSpec;
layout(location = 1) out vec4 gNormal;
layout(location = 2) out vec4 gPosition;
layout(location = 3) out vec4 gShadowPosition;*/

uniform sampler2D flameMap;
uniform float time;

in vec3 varyibngNormal;
in vec3 varyibngTangent;
in vec3 varyibngBinormal;


in float varyingColorMix;
in vec2 screenPos;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

float getFlameTexture(vec2 uv){
    float animationFrame = mod(floor(time* (1.0/36.0)),36.0);
    float startFrame = texture(flameMap, (uv + vec2(floor(animationFrame/6.0),mod(animationFrame,6.0)))*(1.0/6.0)).r;
    animationFrame = mod((animationFrame + 1.0) , 36.0);
    float endFrame = texture(flameMap, (uv + vec2(floor(animationFrame/6.0),mod(animationFrame,6.0)))*(1.0/6.0)).r;
    return mix(startFrame, endFrame, fract(time* (1.0/36.0)));
}



uniform vec3 color;

uniform bool hasNormalMap;
uniform vec2 uvScale;
uniform float opacity;
in vec2 varyingUV;

void main() {

    vec2 uv = fract(varyingUV*uvScale);
    vec3 normal;

    float flameValue = getFlameTexture(uv);

    vec3 color1 = vec3(1.0,0.5,0.901);


    vec4 glNull = projectionMatrix * modelViewMatrix * vec4(0.0,0.0,0.0,1.0);
    vec2 pos1 = glNull.xy/ glNull.w *0.5 + 0.5;

    float distanceToCenter = distance(pos1, screenPos);

    float mixVal = varyingColorMix*1.2 + (flameValue)*0.7 * (0.4-distance(pos1, screenPos))+distanceToCenter*2.0;

    fragColor = vec4(mix(color1,color,mixVal),opacity);

    //fragColor = vec4(vec3(mix(0.5,1.0,flameValue)),1.0);// vec3(1.0, 0.921, 0.418);
    //gl_FragColor.a = 1.0;

    /*gNormal = vec4( normalize(mat3(varyibngTangent, varyibngBinormal, varyibngNormal) * vec3(0.0, 0.0, 1.0)),1.0) ;
    

    gPosition = vec4(varyingPosition,1.0);
    gShadowPosition = varyingShadowPosition;*/
}