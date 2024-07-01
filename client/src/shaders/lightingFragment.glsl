#define COUNT_LIGHT 50

struct PointLight{
    vec3 position;
    float intensity;
    float radius;
    vec3 color;
};

uniform PointLight pointLights[COUNT_LIGHT];
uniform sampler2D gNormal;
uniform sampler2D gPosition;
uniform sampler2D gAlbedoSpec;

uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;

varying vec2 vUv;

void main() {
    vec4 pos = texture2D( gPosition, vUv );
    vec3 camToVertexVarying = - pos.rgb;

    vec3 albedo = texture2D( gAlbedoSpec, vUv ).rgb * 0.5;
    vec3 normal = texture2D( gNormal, vUv ).rgb;
    float specular = texture2D( gAlbedoSpec, vUv ).a;

    vec3 lightVec = normalize(vec3(0.0,-0.5,-0.5));

    camToVertexVarying = normalize(camToVertexVarying);

    vec3 reflectVec = normalize(reflect(-lightVec, normal));
    float specContrib = max(dot(-reflectVec, camToVertexVarying),0.0) * 0.005;
    float diffContrib = max(dot(lightVec, normal),0.0) *0.005;
    vec3 fog;

    for(int i = 0; i < COUNT_LIGHT; i++){
        vec3 pointLightVec = pos.rgb - pointLights[i].position;
        float pointDistance = length(pointLightVec);

        /*if(distance > pointLights[i].radius){
            continue;
        }*/

        float distanceToLightRay = length(cross(pointLights[i].position, pos.rgb)) / length(pos.rgb);
        fog += atan(pointDistance/distanceToLightRay)/distanceToLightRay * pointLights[i].color * 0.01;

        float pointIntensity = pointLights[i].intensity / pow(length(pointLightVec),2.0);
        
        diffContrib += max(dot(pointLightVec, normal),0.0) * pointIntensity;

        vec3 pointReflectVec = normalize(reflect(-pointLightVec, normal));
        specContrib += max(dot(-pointReflectVec, camToVertexVarying),0.0) * pointIntensity;

        albedo += pointLights[i].color * pointIntensity * 10.0;
    }

    float viewAngle = pow(max(1.0 - abs(dot(camToVertexVarying,normal)),0.0),20.0);

    vec3 color =  albedo * (viewAngle * 0.2 + specContrib * specular + diffContrib *0.7 + 0.001) + fog;
    //color = albedo * min(pos.a *2.0,1.0) + color * (1.0 - pos.a);

    //float fogValue = min(max(length(pos.rgb) - fogNear, 0.0), fogFar) / fogFar;
    //color = (fogColor * fogValue + (1.0 - fogValue) * color) * 0.5 *  1.5;
    gl_FragColor = vec4(color, 1.0);
    
}