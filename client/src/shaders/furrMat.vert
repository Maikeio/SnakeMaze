precision highp float;
precision highp int;

in vec3 position;
in vec3 normal;
in vec4 tangent;
in vec2 uv;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform float glowPercantage;
uniform vec3 glowColor;
out float varyingGlow;
out vec3 varyingGlowColor;

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
#endif
out vec3 varyingColor;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

uniform mat4 viewShadowMatrix;
uniform mat4 projectionShadowMatrix;

out vec3 varyibngNormal;
out vec3 varyibngTangent;
out vec3 varyibngBinormal;

out float vertexLayer;

out vec3 varyingPosition;
out vec2 varyingUV;

out vec4 varyingShadowPosition;

out vec3 varyingOrigNormal;
out vec3 varyingOrigPos;

uniform vec2 uvOffset;
uniform float vertexCount;


void main() {
    varyingOrigPos = position;

    varyingUV = uv + uvOffset;
    vec4 pos = POSITION;
    varyibngNormal = normalize(normalMatrix * normal);
    varyibngTangent = normalize(normalMatrix * tangent.rgb);
    varyibngBinormal = normalize(normalMatrix * cross(normal, tangent.rgb));

    #ifdef HAS_VERTEX_COLORS
        varyingColor = color;
    #endif

    vertexLayer = float(gl_VertexID/ int(vertexCount));
    
    vec3 worldNomral = (transpose(inverse(modelMatrix))*vec4(normal,0.0)).xyz;

    /*if(dot(abs(normal.xyz),vec3(0.0,1.0,0.0)) >= (0.707106781)){
        varyingUV = pos.xz;
        varyingUV.y *= -1.0;
    }else if(dot(abs(normal.xyz),vec3(0.0,0.0,1.0)) >= (0.707106781)){
        varyingUV = pos.xy;
        //varyingUV.x *= -1.0;
    } else{
        varyingUV = pos.zy ;
        //varyingUV.y *= -1.0;
    }
    varyingUV *= 1.;*/
    varyingUV = uv * 4.;
    vec3 moveMent = vec3(0.0,-5.0,4.0);
    //moveMent *= 1.0-pow(dot(normalize(moveMent),worldNomral ),2.0);
    moveMent += worldNomral * 3.5;
    moveMent = normalize(moveMent) * 0.015;

    varyingGlow = min(pow(abs(pos.z - glowPercantage)*0.5,-3.0),20.0);
    if(varyingGlow > 0.1){
        varyingGlowColor = glowColor;
    }
    if(varyingGlow > 4.0){
        //moveMent += worldNomral * 0.0002*varyingGlow;
    }

    vec4 worldPos = modelMatrix *pos + vec4(moveMent * vertexLayer,0.0);
    varyingShadowPosition = projectionShadowMatrix * viewShadowMatrix * worldPos;

    varyingPosition = (viewMatrix * worldPos).xyz;

    varyingOrigNormal = normal;
    
    gl_Position = projectionMatrix * viewMatrix * worldPos;
}