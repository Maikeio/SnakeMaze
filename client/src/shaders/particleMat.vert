in vec3 position;
in vec3 normal;
in vec4 tangent;
in vec2 uv;


uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

uniform float lifeTime;


out vec3 varyibngNormal;
out vec3 varyibngTangent;
out vec3 varyibngBinormal;

out vec3 varyingPosition;
out vec2 varyingUV;

uniform vec2 uvOffset;

in float particleLifeTime;

float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

void main() {
    varyingUV = uv + uvOffset;

    float particleNum = float(gl_VertexID/ int(VERTEX_COUNT));
    vec3 offset = vec3(random(vec2(particleNum)),random(vec2(particleNum+0.1)),random(vec2(particleNum+0.2)));
    offset -= 0.5;
    offset.y += lifeTime*0.2;
    if(offset.y / 0.5 < 1.0){
        offset.y = -10.0;
    }else{
        offset.y = mod(offset.y, 0.5);
    }
    vec4 pos = vec4(position+ offset*20.0,1.0);
    varyingPosition = (modelViewMatrix * pos).xyz;
    varyibngNormal = normalize(normalMatrix * normal);
    varyibngTangent = normalize(normalMatrix * tangent.rgb);
    varyibngBinormal = normalize(normalMatrix * cross(normal, tangent.rgb));


    gl_Position = projectionMatrix * modelViewMatrix * pos; 
}