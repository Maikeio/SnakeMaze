struct DirectionalLight {
    vec3 direction;
    vec3 color;
};
uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];

in vec3 position;
in vec3 normal;
in vec4 tangent;
in vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

out vec3 varyibngNormal;
out vec3 varyibngTangent;
out vec3 varyibngBinormal;

out vec3 varyingPosition;
out vec2 varyingUV;
out vec3 varyingColor;

uniform vec2 uvOffset;


void main() {
    varyingUV = uv + uvOffset;
    varyingPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    varyibngNormal = normalize(normalMatrix * normal);
    varyibngTangent = normalize(normalMatrix * tangent.rgb);
    varyibngBinormal = normalize(normalMatrix * cross(normal, tangent.rgb));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position , 1.0); 
}