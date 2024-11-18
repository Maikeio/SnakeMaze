/*struct Fog{
    
};*/
precision highp float;
precision highp int;

layout(location = 0) out vec4 gAlbedoSpec;
layout(location = 1) out vec4 gNormal;
layout(location = 2) out vec4 gPosition;
layout(location = 3) out vec4 gShadowPosition;

#define SCALE 50.0
#define FLAMESCALE 0.5

in vec3 varyibngNormal;
in vec3 varyibngTangent;
in vec3 varyibngBinormal;
in float varyingGlow;
in vec3 varyingGlowColor;
in vec3 varyingOrigPos;

in vec3 varyingOrigNormal;

in vec3 varyingPosition;

in vec4 varyingShadowPosition;

uniform sampler2D flameMap;
uniform float time;

in float vertexLayer;


#ifdef HAS_NORMALMAP
    uniform sampler2D normalMap;
    #define NORMAL mix(vec3(0.0, 0.0, 1.0), texture( normalMap, uv ).rgb * 2.0 - 1.0, 0.3)
    // #define NORMAL vec3(0.0, 0.0, 1.0)
#else
    #define NORMAL vec3(0.0, 0.0, 1.0)
#endif

#ifdef HAS_VERTEX_COLORS
    in vec3 varyingColor;
    #define COLOR varyingColor;
#else
    uniform vec3 color;
    #define COLOR color;
#endif

uniform bool hasNormalMap;
in vec2 varyingUV;

float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

float getFlameTexture(vec2 uv){
    float animationFrame = mod(floor(time* (1.0/36.0)),36.0);
    float startFrame = texture(flameMap, (uv + vec2(floor(animationFrame/6.0),mod(animationFrame,6.0)))*(1.0/6.0)).r;
    animationFrame = mod((animationFrame + 1.0) , 36.0);
    float endFrame = texture(flameMap, (uv + vec2(floor(animationFrame/6.0),mod(animationFrame,6.0)))*(1.0/6.0)).r;
    return mix(startFrame, endFrame, fract(time* (1.0/36.0)));
}

void main() {

    vec2 uv = fract(varyingUV);
    vec3 normal;


    bool doDiscard = !(distance(uv*SCALE - floor(uv*SCALE), vec2(0.5)) < 0.8 * (20.0 - vertexLayer)*0.05);
    doDiscard = doDiscard || random(floor(uv*SCALE)) < vertexLayer / 20.0;
    //doDiscard = !(!doDiscard || (varyingGlow > 0.1 && vertexLayer > 15.0 && flameValue > (0.95)));// - varyingGlow*0.02)));
    if(doDiscard && vertexLayer <= 15.0){
       discard;
    }

     gAlbedoSpec.rgb = COLOR ;// vec3(1.0, 0.921, 0.418);
    gAlbedoSpec.rgb *= (1.0+ vertexLayer*0.4);
    /*if((varyingGlow > 0.1 && vertexLayer > 15.0)){
        gAlbedoSpec.rgb = varyingGlowColor;
        gAlbedoSpec.rgb *= flameValue*10.0;
    }

    if(dot(abs(varyingOrigNormal.xyz),vec3(0.0,1.0,0.0)) >= (0.707106781)){
        newUV = varyingOrigPos.xz;
        newUV.y *= -1.0;
    }else if(dot(abs(varyingOrigNormal.xyz),vec3(0.0,0.0,1.0)) >= (0.707106781)){
        newUV = varyingOrigPos.xy;
        //varyingUV.x *= -1.0;
    } else{
        newUV = varyingOrigPos.zy ;
        //varyingUV.y *= -1.0;
    }*/

    vec2 timeOffset = vec2(0.0,-time*0.001);
    
    float col_front = getFlameTexture(fract(varyingOrigPos.xy *FLAMESCALE+timeOffset));
    float col_side = getFlameTexture(fract(varyingOrigPos.zy*FLAMESCALE+timeOffset));
    float col_top = getFlameTexture(fract(varyingOrigPos.xz* vec2(1.0,-1.0)*FLAMESCALE+timeOffset));

    vec3 weights = varyingOrigNormal;
    //show texture on both sides of the object (positive and negative)
    weights = abs(weights);
    //make the transition sharper
    weights = vec3(pow(weights.x, 5.0),pow(weights.y, 5.0),pow(weights.z, 5.0));
    //make it so the sum of all components is 1
    weights = weights / (weights.x + weights.y + weights.z);

    //combine weights with projected colors
    col_front *= weights.z;
    col_side *= weights.x;
    col_top *= weights.y;
    float flameValue = col_front + col_side + col_top;
    if(flameValue < 0.2 + (vertexLayer-15.0)/7.0){
        discard;
    }
    if(vertexLayer > 15.0 && varyingGlow < 1.0){
        discard;
    }
    //combine the projected colors
    if(vertexLayer > 15.0){
        gAlbedoSpec.rgb = vec3(  flameValue - 0.0)*(vertexLayer-15.0)*10.0*varyingGlowColor;
    }
    

    gAlbedoSpec.a = 0.3;

    gNormal = vec4( normalize(mat3(varyibngTangent, varyibngBinormal, varyibngNormal) * NORMAL),1.0) ;
    

    gPosition = vec4(varyingPosition,0.0);
    gShadowPosition = varyingShadowPosition;
}