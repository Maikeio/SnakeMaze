in vec3 position;

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

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;



void main() {
    vec4 pos = POSITION;

    gl_Position = projectionMatrix * modelViewMatrix * pos; 
}