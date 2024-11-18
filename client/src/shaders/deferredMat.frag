/*struct Fog{
    
};*/
precision highp float;
precision highp int;

layout(location = 0) out vec4 gAlbedoSpec;
layout(location = 1) out vec4 gNormal;
layout(location = 2) out vec4 gPosition;
layout(location = 3) out vec4 gShadowPosition;

in vec3 varyibngNormal;
in vec3 varyibngTangent;
in vec3 varyibngBinormal;

in vec3 varyingPosition;
in vec4 varyingShadowPosition;


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

void main() {
    gAlbedoSpec.rgb = COLOR;// vec3(1.0, 0.921, 0.418);
    gAlbedoSpec.a = 1.0;

    vec2 uv = fract(varyingUV);
    vec3 normal;

    gNormal = vec4( normalize(mat3(varyibngTangent, varyibngBinormal, varyibngNormal) * NORMAL),1.0) ;
    

    gPosition = vec4(varyingPosition,0.0);
    gShadowPosition = varyingShadowPosition;
}