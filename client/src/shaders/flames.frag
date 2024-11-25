#define M_PI 3.1415926535897932384626433832795
varying vec2 vUv;
uniform vec2 uvOffset;
uniform sampler2D noise;
#define FLAMECOUNT 4.0
#define INNERFLAMECOUNT 4.0

float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

vec2 getDir(float degree){
    return vec2(cos(degree * M_PI), sin(degree*M_PI));
}

void main(){
    vec2 uv = vUv + uvOffset;
    vec3 result = vec3(0.0);
    vec2 pos = vec2(0.0);
    for(float c = 0.0; c < 1.0; c+= 1.0/(pow(FLAMECOUNT,2.0))){
        float mainFlameHeight = mix(0.5,1.0,random(vec2(c + 0.5)));

        float flameWidth = mix(0.5,1.5,random(vec2(c)));// - pow(d,3.0);
        for(float d = 0.0; d < 1.0; d+= 1.0/(pow(INNERFLAMECOUNT,2.0))){
            pos = vec2(random(vec2(c))*2.0-0.5,random(vec2(c+0.5))*2.0-0.5);
            float flameHeight = max(mainFlameHeight - pow(d,0.5),0.0);
            for(float i = 0.0; i < flameHeight; i += 0.01){

                pos +=0.01 * getDir(texture2D(noise, pos/FLAMECOUNT + vec2(mod(c ,FLAMECOUNT),floor(c/FLAMECOUNT)) + vec2(mix(0.0,(random(vec2(d)-0.5)*0.1),pow(i/flameHeight,3.0)),0.0)).x) *vec2(0.2 + 2.0* pow(i/mainFlameHeight,4.0),1.0);//* vec2(1.5 + 20.0*mix(0.0,d,pow(i,2.0)),1.0);//*pow(d,3.0),1.0);
                //pos +=0.001 * getDir(texture2D(noise, pos*0.1 /(1.0-0.1*d) ).x) * vec2(1.0 + 50.0*d,1.0+d*10.0);//*pow(d,3.0),1.0);
                float radius = 0.1*(flameHeight-i)*flameWidth;
                float dist = length(fract(pos) - uv);
                if(dist < radius){
                    result = max(result,vec3(i/mix(flameHeight, mainFlameHeight,0.3)*1.2));//(1.0-(dist/radius))*10.0
                }
            }
        }
    }
    gl_FragColor = vec4(result,1.0);
}