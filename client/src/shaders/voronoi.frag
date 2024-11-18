#define M_PI 3.1415926535897932384626433832795
#define SCALE vec2(20.0,20.0)
varying vec2 vUv;
uniform vec2 uvOffset;

float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}


void main(){
    vec2 uv = vUv + uvOffset;
    vec2 nearestPoint = vec2(100.0,100.0);
    vec2 topLeftOrigin = floor(uv*SCALE);
    vec2 pos = fract(uv*SCALE);
    float strenght = 0.0;
    for(float y = -1.0; y <= 1.0; y++){
        for(float x = -1.0; x <= 1.0; x++){

            vec2 currPoint =vec2(x,y)+random( topLeftOrigin + vec2(x,y));
            float curDistance = length(pos-currPoint);
            //curDistance *= abs(dot(pos-currPoint, vec2(1.0,0.0)));
            if(curDistance < length(pos-nearestPoint)){
                nearestPoint = currPoint;
            }
            strenght += abs(dot(normalize(pos-currPoint), vec2(1.0,0.0)));
        }
    }
    //float strenght =1.0-min(abs(dot(normalize(pos-nearestPoint), vec2(1.0,0.0))) * pow(length(pos-nearestPoint), 8.0),1.0);
    //strenght = (abs(dot(normalize(pos-nearestPoint), vec2(1.0,0.0))));//*0.5;
   // gl_FragColor = vec4(vec3( mix(strenght,length(pos-nearestPoint),length(pos-nearestPoint))),1.0);
    gl_FragColor = vec4(vec3( length(pos-nearestPoint)*pow(strenght*0.15,5.0)),1.0);
}