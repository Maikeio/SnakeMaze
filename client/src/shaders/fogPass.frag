#define COUNT_LIGHT 20
#define HEIGHT -3.0
struct PointLight{
    vec3 position;
    float distance;
    vec3 color;
};

uniform PointLight pointLights[COUNT_LIGHT];
uniform sampler2D gPosition;

varying vec2 vUv;

void main() {
    vec4 pos = texture2D( gPosition, vUv );
    vec3 camToVertexVarying = - pos.rgb;

    vec3 lightVec = normalize(vec3(0.0,-0.5,-0.5));

    camToVertexVarying = normalize(camToVertexVarying);

    vec3 fog;

    //float depth_depthMap = texture2D(shadowMap, shadowCoord3.xy).x;
    /*
    float cosTheta = dot(normalize(shadowCameraPosition), normal);
    float bias = 0.005 * tan(acos(cosTheta));*/

    float lightDistance = length(pos.rgb);

    for(int i = 0; i < COUNT_LIGHT; i++){
        vec3 pointLightVec = pos.rgb - pointLights[i].position;
        float pointDistance = length(pointLightVec);

        

        pointLightVec = normalize(pointLightVec);

        vec3 nearestPoint = camToVertexVarying*(dot(pointLights[i].position,camToVertexVarying)/dot(camToVertexVarying,camToVertexVarying));
        //float distanceToLightRay = length(cross(pointLights[i].position, pos.rgb)) / lightDistance;
        vec3 lightToNearestPoint = nearestPoint -pointLights[i].position;
        float distanceToLightRay = length( lightToNearestPoint);

        if(pos.y > HEIGHT){
             continue;
            
        }

        float distanceToFog = lightDistance * HEIGHT/pos.y;

        if(distanceToLightRay < pointLights[i].distance){
        //if(pointDistance < pointLights[i].radius){
            
            float start = sqrt(pow(length(pointLights[i].position), 2.0) - pow(distanceToLightRay,2.0)) * sign(pointLights[i].position.z);
            float end = lightDistance + start;
            start += distanceToFog;
            start = min(start, end);
            
            float invDistToLightRay = 1.0/distanceToLightRay;
            start = atan(start*invDistToLightRay)*invDistToLightRay;
            end = atan(end*invDistToLightRay)*invDistToLightRay;
            fog += (end - start)* pointLights[i].color * 0.008;// * (dot(normalize(lightToNearestPoint), vec3(0.0,1.0,0.0))+1.5);
        }
    }

    gl_FragColor = vec4(fog, 1.0);
    
}