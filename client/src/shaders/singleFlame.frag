#define M_PI 3.1415926535897932384626433832795
#define STEPCOUNT 32
#define FLAMEHEIGHT 0.2
#define STARTRADIUS 0.2
#define ENDRADIUS 0.05
varying vec2 vUv;
uniform vec2 uvOffset;
uniform sampler2D noise;

float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

vec2 getDir(float degree){
    return vec2(cos(degree * M_PI), sin(degree*M_PI));
}

vec2 cfract(vec2 vec){
    if (vec.x>=0.){
        vec.x = vec.x-floor(vec.x);
    }else{
        vec.x = vec.x-ceil(vec.x);
    }
    if (vec.y>=0.){
        vec.y = vec.y-floor(vec.y);
    }else{
        vec.y = vec.y-ceil(vec.y);
    }
    return vec;
}

void main(){
    vec2 uv = vUv + uvOffset;
    vec3 result = vec3(0.0);
    vec2 pos = vec2(0.5,STARTRADIUS);

    float heightPerStep = FLAMEHEIGHT/ float(STEPCOUNT);
    float radiusPerStep = (STARTRADIUS - ENDRADIUS)/ float(STEPCOUNT);
    float radius = STARTRADIUS;
    for(int flames = 0; flames < 3; flames++){

        for(int step = 0; step < STEPCOUNT; step++){
            vec2 uvOffset = vec2(0.0,texture2D(noise,uv*0.8).x)*pos.y*1.5;
            
            if(length(uv - uvOffset - pos) < radius){
                result[flames] = 1.0;
            }
            radius -= radiusPerStep;
            pos += getDir(0.6-texture2D(noise,pos*0.5).x*0.2)*heightPerStep;
        }

        radius = STARTRADIUS / pow(1.5,float(flames+1));
        pos = vec2(0.5,radius);

        heightPerStep *= 0.5;
        radiusPerStep *= 0.5;
        
    }

/*
    for(float c = 0.0; c < 1.0; c+= 1.0/(pow(FLAMECOUNT,2.0))){
        float mainFlameHeight = mix(FLAMEHEIGHT*0.5,FLAMEHEIGHT,random(vec2(c + 0.5)));

        float flameWidth = mix(MAINFLAMEWIDTH*0.3333,MAINFLAMEWIDTH,random(vec2(c)));// - pow(d,3.0);
        for(float d = 0.0; d < 1.0; d+= 1.0/(pow(INNERFLAMECOUNT,2.0))){
            vec2 randomOffset = vec2(random(vec2(d))*2.0-1.0,random(vec2(d+1.0))*2.0-1.0)*pow(flameWidth*0.05,2.0);
            pos = vec2(random(vec2(c))*2.0-0.5,random(vec2(c+0.5))*2.0-0.5)+  randomOffset;
            float flameHeight = max(mainFlameHeight - pow(d,0.5),0.2);
            
            for(float i = 0.0; i < flameHeight; i += 0.01){

                vec2 mainPosition = pos/FLAMECOUNT + vec2(mod(c ,FLAMECOUNT),floor(c/FLAMECOUNT));
                vec2 heightFactor = vec2(0.2 + 2.0* pow(i/flameHeight,4.0) * pow(flameWidth*0.9,2.0) + WINDSTRENGHT,1.0);
                vec2 innerFlameOffset = vec2(mix(0.0,(random(vec2(d)-0.5)*0.1),pow(i/flameHeight,3.0)),0.0);

                pos +=0.01 * getDir(texture2D(noise,fract( mainPosition + innerFlameOffset)).x) * heightFactor ;//* vec2(1.5 + 20.0*mix(0.0,d,pow(i,2.0)),1.0);//*pow(d,3.0),1.0);
                //pos +=0.001 * getDir(texture2D(noise, pos*0.1 /(1.0-0.1*d) ).x) * vec2(1.0 + 50.0*d,1.0+d*10.0);//*pow(d,3.0),1.0);
                float radius = 0.1*(flameHeight-i)*flameWidth;
                vec2 renderDisk[4] = vec2[](
                    vec2(0.0,0.0),
                    vec2(1.0,0.0),
                    vec2(0.0,1.0),
                    vec2(1.0,1.0));
                //pos = vec2(-1.0,-1.0);
                for(int disk = 0; disk < 4; disk++){
                    float dist = length(cfract(pos) - uv + renderDisk[disk]);
                    if(dist < radius){
                        result = vec3(1.0);//vec3(max(result,i/mix(flameHeight, mainFlameHeight,0.3)*1.2));//(1.0-(dist/radius))*10.0
                    }
                }
            }
        }
    }*/
    gl_FragColor = vec4(result,1.0);
}