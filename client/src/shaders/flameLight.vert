in vec3 position;
in vec3 normal;
in vec4 tangent;
in vec2 uv;
in float colorMix;

float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

#define POSITION vec4(position, 1.0)


uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform mat4 modelMatrix;

out vec3 varyibngNormal;
out vec3 varyibngTangent;
out vec3 varyibngBinormal;

out vec3 varyingPosition;
out vec4 varyingShadowPosition;
out vec2 varyingUV;
out float varyingColorMix;
out vec2 screenPos;

uniform vec2 uvOffset;


void main() {
    varyingUV = uv + uvOffset;
    vec4 pos = POSITION;
    varyibngNormal = normalize(normalMatrix * normal);
    varyibngTangent = normalize(normalMatrix * tangent.rgb);
    varyibngBinormal = normalize(normalMatrix * cross(normal, tangent.rgb));
    varyingColorMix = colorMix; 

    #ifdef HAS_VERTEX_COLORS
        varyingColor = color;
    #endif
    //varyingColor = vec3(random(uv),random(uv+0.2),random(uv+0.4));

    gl_Position = projectionMatrix * modelViewMatrix * pos; 

    screenPos = gl_Position.xy/ gl_Position.w *0.5 + 0.5;
    
}