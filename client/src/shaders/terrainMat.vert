in vec3 position;
//in vec3 normal;
in vec4 tangent;
in vec2 uv;

float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

#ifdef HAS_VERTEX_COLORS
    in vec3 color;
    //out vec3 varyingColor;
#endif
out vec3 varyingColor;

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

uniform sampler2D terrainImage;

float getSmoothedHeight(vec2 pos){

    float terrainSize = float(TERRAIN_IMAGE_SIZE);

    vec2 uvCord = mod(((pos+uvOffset)*10.0),terrainSize)/terrainSize;

    float height = 0.0;
    float texelSize = 30.0/terrainSize;
    float viewDist = length(modelViewMatrix * vec4(position,1.0));

    /*vec2 poissonDisk[8] = vec2[](
        vec2( -0.94201624, -0.39906216 ),
        vec2( 0.94558609, -0.76890725 ),
        vec2( -0.094184101, -0.92938870 ),
        vec2( 0.34495938, 0.29387760 ),
        vec2( 0.94201624, 0.39906216 ),
        vec2( -0.94558609, 0.76890725 ),
        vec2( 0.094184101, 0.92938870 ),
        vec2( -0.34495938, -0.29387760 )
    );
    
    vec2 poissonDisk[9] = vec2[](

        vec2(-texelSize,-texelSize),
        vec2(0.0,-texelSize),
        vec2(texelSize,-texelSize),
        vec2(-texelSize,0.0),
        vec2(0.0,0.0),
        vec2(texelSize,0.0),
        vec2(-texelSize,texelSize),
        vec2(0.0,texelSize),
        vec2(texelSize,texelSize)
    );*/
    vec2 poissonDisk[25] = vec2[](POISSON_DISK);

    for (int i=0;i<25;i++){
        height += texture( terrainImage, min(max(fract(uvCord + poissonDisk[i]),texelSize),1.0-texelSize)).x;// * max(log(viewDist*0.05),0.0) ).x;
    }
    return height *0.04;
}

float getHeight(vec2 pos){

    float terrainSize = float(TERRAIN_IMAGE_SIZE);

    vec2 uvCord = mod(((pos+uvOffset)*10.0),terrainSize)/terrainSize;

    return texture( terrainImage, uvCord ).x;
}


void main() {
    varyingUV = (uv + uvOffset)*0.03;

    
    vec4 pos = vec4(position.x, getSmoothedHeight(position.xz) * 7.0 , position.z,1.0);

    vec3 xNormalEnd = position + vec3(0.1,0.0,0.0);
    xNormalEnd.y = getSmoothedHeight(xNormalEnd.xz) * 7.0;

    vec3 zNormalEnd = position + vec3(0.0,0.0,0.1);
    zNormalEnd.y = getSmoothedHeight(zNormalEnd.xz) * 7.0;

    vec3 normalStart = vec3(position.x, getSmoothedHeight(position.xz) * 7.0 , position.z);

    vec3 normal = normalize(cross(zNormalEnd - normalStart,xNormalEnd- normalStart));


    varyingPosition = (modelViewMatrix * pos).xyz;
    varyingShadowPosition = projectionShadowMatrix * viewShadowMatrix * modelMatrix * pos;
    
    varyibngNormal =  normalize(normalMatrix * normal);
    varyibngTangent = normalize(normalMatrix * tangent.rgb);
    varyibngBinormal = normalize(normalMatrix * cross(normal, tangent.rgb));

    #ifdef HAS_VERTEX_COLORS
        varyingColor = color;
    #endif
    float terrainSize = float(TERRAIN_IMAGE_SIZE);
    varyingColor = vec3(getHeight(position.xz));// vec3(random(uv),random(uv+0.2),random(uv+0.4));

    gl_Position = projectionMatrix * modelViewMatrix * pos; 
}