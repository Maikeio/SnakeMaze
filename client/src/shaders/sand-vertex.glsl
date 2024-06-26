struct DirectionalLight {
    vec3 direction;
    vec3 color;
};
uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];

varying vec3 varyibngNormal;
varying vec3 varyibngTangent;
varying vec3 varyibngBinormal;

varying vec3 varyingPosition;
varying vec2 varyingUV;
varying vec3 varyingColor;

uniform vec2 uvOffset;

attribute vec4 tangent;

void main() {
    varyingUV = uv + uvOffset;
    varyingPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    varyibngNormal = normalize(normalMatrix * normal);
    varyibngTangent = normalize(normalMatrix * tangent.rgb);
    varyibngBinormal = normalize(normalMatrix * cross(normal, tangent.rgb));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position , 1.0); 
}