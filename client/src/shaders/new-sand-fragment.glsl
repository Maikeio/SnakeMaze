/*struct Fog{
    
};*/
precision highp float;
precision highp int;

layout(location = 0) out vec4 gAlbedoSpec;
layout(location = 1) out vec4 gNormal;
layout(location = 2) out vec4 gPosition;

in vec3 varyibngNormal;
in vec3 varyibngTangent;
in vec3 varyibngBinormal;

in vec3 varyingPosition;
uniform sampler2D normalMap;
uniform bool hasNormalMap;
uniform vec3 color;
in vec2 varyingUV;

void main() {
    gAlbedoSpec.rgb = color;// vec3(1.0, 0.921, 0.418);
    gAlbedoSpec.a = 0.3;

    vec2 uv = fract(varyingUV); 
    vec3 normal;
    if(hasNormalMap){
        normal =  normalize(texture(normalMap, uv).rgb * 2.0 -1.0);
    } else{
        normal = vec3(0.0, 1.0, 0.0);
    }
    normal = normalize(mat3(varyibngTangent, varyibngBinormal, varyibngNormal) * normal);
    gNormal = vec4(normal,1.0);
    

    gPosition = vec4(varyingPosition,0.0);
}