#define COUNT_LIGHT 20
#define SUNCOLOR vec3(1.0,0.7686,0.5372);
struct PointLight{
    vec3 position;
    float distance;
    vec3 color;
};

uniform PointLight pointLights[COUNT_LIGHT];
uniform sampler2D gNormal;
uniform sampler2D gPosition;
uniform sampler2D gShadowPosition;
uniform sampler2D gAlbedoSpec;
uniform sampler2D fogTex;

uniform mat4 cameraWorldMatrix;
uniform mat4 uShadowCameraProject;
uniform mat4 uShadowCameraView;
uniform vec3 shadowCameraPosition;

uniform sampler2D shadowMap;


varying vec2 vUv;

void main() {
    
    vec4 pos = texture2D( gPosition, vUv );
    vec3 camToVertexVarying = - pos.rgb;

    vec3 albedo = texture2D( gAlbedoSpec, vUv ).rgb;
    
    vec3 normal =texture2D( gNormal, vUv ).rgb;
    float specular = texture2D( gAlbedoSpec, vUv ).a;
    float lightDistance = length(pos.rgb);
    vec3 fog = texture2D( fogTex, vUv ).rgb;

    if(pos.a > 0.9){
        vec3 color = albedo.rgb;
        color = mix(color, fog, min(1.0,length(fog)+0.0+lightDistance*0.004));
        gl_FragColor = vec4(color,1.0);
        return;
    }

    vec3 lightVec = normalize(vec3(0.0,-0.5,0.5));

    camToVertexVarying = normalize(camToVertexVarying);

    vec3 reflectVec = normalize(reflect(lightVec, normal));
    vec3 specContrib;// = pow(max(dot(reflectVec, camToVertexVarying),0.0),16.0) * 0.02 * SUNCOLOR;

    vec3 diffContrib;// = max(dot(-lightVec, normal),0.0) * 0.02 * SUNCOLOR;
    vec3 frasContrib;

    //vec4 shadowCoord = uShadowCameraProject * uShadowCameraView * cameraWorldMatrix * vec4(pos.rgb,1.0);
    vec4 shadowCoord = texture2D(gShadowPosition,vUv); 
    vec3 shadowCoord3 = shadowCoord.xyz / shadowCoord.w* 0.5 + 0.5;
    //float depth_depthMap = texture2D(shadowMap, shadowCoord3.xy).x;
    /*
    float cosTheta = dot(normalize(shadowCameraPosition), normal);
    float bias = 0.005 * tan(acos(cosTheta));*/

    float shadowFac = 1.0;// = step(shadowCoord3.z - bias, depth_depthMap)*0.5 + 0.5;
    vec2 poissonDisk[8] = vec2[](
        vec2( -0.94201624, -0.39906216 ),
        vec2( 0.94558609, -0.76890725 ),
        vec2( -0.094184101, -0.92938870 ),
        vec2( 0.34495938, 0.29387760 ),
        vec2( 0.94201624, 0.39906216 ),
        vec2( -0.94558609, 0.76890725 ),
        vec2( 0.094184101, 0.92938870 ),
        vec2( -0.34495938, -0.29387760 )
    );
    for (int i=0;i<8;i++){
        float shadowDepth = texture( shadowMap, shadowCoord3.xy + poissonDisk[i]*0.004 ).x;
        float cameraDepth = shadowCoord3.z;
        if ( shadowDepth < cameraDepth ){
            shadowFac -= 0.1;
        }
    }

    for(int i = 0; i < COUNT_LIGHT; i++){
        vec3 pointLightVec = pos.rgb - pointLights[i].position;
        float pointDistance = length(pointLightVec);

        

        pointLightVec = normalize(pointLightVec);

        /*float distanceToLightRay = length(cross(pointLights[i].position, pos.rgb)) / lightDistance;
        if(distanceToLightRay < pointLights[i].distance){
        //if(pointDistance < pointLights[i].radius){
            
            float start = sqrt(pow(length(pointLights[i].position), 2.0) - pow(distanceToLightRay,2.0)) * sign(pointLights[i].position.z);
            float end = lightDistance + start;
            
            float invDistToLightRay = 1.0/distanceToLightRay;
            start = atan(start*invDistToLightRay)*invDistToLightRay;
            end = atan(end*invDistToLightRay)*invDistToLightRay;
            fog += (end - start)* pointLights[i].color * 0.03;
        }*/

        if(pointDistance < pointLights[i].distance){
            float pointIntensity = 1.0/ pow(pointDistance,2.0);
        
            diffContrib += max(dot(-pointLightVec, normal),0.0) * pointIntensity * pointLights[i].color;

            vec3 pointReflectVec = reflect(pointLightVec, normal);
            specContrib += pow(max(dot(pointReflectVec, camToVertexVarying),0.0),16.0) * pointIntensity * pointLights[i].color;

            frasContrib += pow(1.0 - dot(camToVertexVarying, normal), 8.0) * pointIntensity * pointLights[i].color;
        }
    }

    //float viewAngle = pow(max(1.0 - abs(dot(camToVertexVarying,normal)),0.0),20.0);

    vec3 color = albedo * shadowFac * (frasContrib * 1.0 + specContrib * specular *1.0 + diffContrib*1.0 +0.001)*1.0;
    //color = albedo * min(pos.a *2.0,1.0) + color * (1.0 - pos.a);

    //float fogValue = min(max(length(pos.rgb) - fogNear, 0.0)w, fogFar) / fogFar;
    //color = (fogColor * fogValue + (1.0 - fogValue) * color) * 0.5 *  1.5;

    //color = vec3(specContrib, specContrib, specContrib);
    color = mix(color, fog, min(1.0,length(fog)+0.5+lightDistance*0.004));
    //float len = length(fog) * 0.8;
    //color = vec3(diffContrib,diffContrib,diffContrib);
    //color = (normal +1.0) *0.5;
    //color = vec3((texture2D( shadowMap, vUv ).r));

    gl_FragColor = vec4(color , 1.0);
    
}