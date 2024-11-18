#define M_PI 3.1415926535897932384626433832795
varying vec2 vUv;
uniform vec2 uvOffset;

float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

vec2 randomRot (vec2 st){
    float rot = random(st) * 2.0 * M_PI;
    return(vec2(cos(rot), sin(rot)));
}

float perlin(vec2 uv,float scale){
    vec2 topLeft = floor(uv*scale);
    vec2 frac = fract(uv*scale);
    vec2 smothing = smoothstep(0.0,1.0,frac);
    return mix(
        mix(
            dot(randomRot(topLeft), frac),
            dot(randomRot(topLeft + vec2(1.0,0.0)), frac - vec2(1.0,0.0)),
            smothing.x
        ),
        mix(
            dot(randomRot(topLeft + vec2(0.0,1.0)), frac - vec2(0.0,1.0)),
            dot(randomRot(topLeft + vec2(1.0,1.0)), frac - vec2(1.0,1.0)),
            smothing.x
        ),
        smothing.y
    );
}

void main(){
    vec2 uv = vUv + uvOffset;
    uv *= SCALE;
    float result = perlin(uv, 30.0) + 0.5*perlin(uv ,80.0);
    gl_FragColor = vec4(vec3((result + 1.0)*0.5),1.0);
}