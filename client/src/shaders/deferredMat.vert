in vec3 position;
in vec3 normal;
in vec4 tangent;
in vec2 uv;

float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

#ifdef IS_SKINNED

    vec2 getUvAT(float pixel){
        vec2 uv = vec2(mod(pixel, BONE_TEXTURE_SIZE) + 0.5, floor(pixel / BONE_TEXTURE_SIZE) + 0.5);
        return uv / BONE_TEXTURE_SIZE;
    }   

    in vec4 skinWeight;
    in vec4 skinIndex;
    uniform sampler2D boneTexture;

    mat4 getBoneMatrix(float boneNdx) {
        float start = boneNdx * 4.0;
        return mat4(
            texture(boneTexture, getUvAT(start)),
            texture(boneTexture, getUvAT(start + 1.0)),
            texture(boneTexture, getUvAT(start + 2.0)),
            texture(boneTexture, getUvAT(start + 3.0)));
    }

    #define POSITION getBoneMatrix(skinIndex[0]) * vec4(position, 1.0) * skinWeight[0] + \
        getBoneMatrix(skinIndex[1]) * vec4(position, 1.0) * skinWeight[1] +\
        getBoneMatrix(skinIndex[2]) * vec4(position, 1.0) * skinWeight[2] +\
        getBoneMatrix(skinIndex[3]) * vec4(position, 1.0) * skinWeight[3]
#else
    #define POSITION vec4(position, 1.0)
#endif

#ifdef HAS_VERTEX_COLORS
    in vec3 color;
    out vec3 varyingColor;
#endif

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform mat4 modelMatrix;

uniform mat4 viewShadowMatrix;
uniform mat4 projectionShadowMatrix;

out vec3 varyibngNormal;
out vec3 varyibngTangent;
out vec3 varyibngBinormal;

out vec3 varyingPosition;
out vec4 varyingShadowPosition;
out vec2 varyingUV;

uniform vec2 uvOffset;


void main() {
    varyingUV = uv + uvOffset;
    vec4 pos = POSITION;
    varyingPosition = (modelViewMatrix * pos).xyz;
    varyingShadowPosition = projectionShadowMatrix * viewShadowMatrix * modelMatrix * pos;
    varyibngNormal = normalize(normalMatrix * normal);
    varyibngTangent = normalize(normalMatrix * tangent.rgb);
    varyibngBinormal = normalize(normalMatrix * cross(normal, tangent.rgb));

    #ifdef HAS_VERTEX_COLORS
        varyingColor = color;
    #endif
    //varyingColor = vec3(random(uv),random(uv+0.2),random(uv+0.4));

    gl_Position = projectionMatrix * modelViewMatrix * pos; 
}