/*struct Fog{
    
};*/

uniform vec3 fogColor;
uniform float fogDensity;
uniform float fogNear;
uniform float fogFar;

varying vec3 varyibngNormal;
varying vec3 varyibngTangent;
varying vec3 varyibngBinormal;

varying vec3 varyingPosition;
uniform vec3 lightDir;
uniform sampler2D normalMap;
varying vec2 varyingUV;

void main() {
    vec2 uv = fract(varyingUV); 
    vec3 normal = normalize(mat3(varyibngTangent, varyibngBinormal, varyibngNormal) * normalize(texture2D(normalMap, uv).rgb * 2.0 -1.0));
    vec3 lightVec = normalize(vec3(0.0,-0.5,-0.5));

    vec3 camToVertexVarying = - varyingPosition;
    float fogValue = min(max(length(camToVertexVarying) - fogNear, 0.0), fogFar) / fogFar;
    camToVertexVarying = normalize(camToVertexVarying);

    vec3 reflectVec = normalize(reflect(-lightVec, normal));
    float specContrib = max(dot(-reflectVec, camToVertexVarying),0.0);
    float diffContrib = max(dot(lightVec, normal),0.0);
    float viewAngle = pow(1.0 - abs(dot(camToVertexVarying,normal)),3.0);
    vec3 color = vec3(1.0, 0.921, 0.418) * (viewAngle *0.8 + specContrib *0.4 + diffContrib * 1.2  + 0.1);

    color = (fogColor * fogValue + (1.0 - fogValue) * color) * 0.5 *  1.5;

    gl_FragColor = vec4(color,1.0);
}