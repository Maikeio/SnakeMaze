#define M_PI 3.1415926535897932384626433832795
#define SCALE vec2(20.0,20.0)
varying vec2 vUv;
uniform vec2 uvOffset;

float random (in vec2 st) {
    return (0.5-fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123))*2.0;
}

// Based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 st,float scale) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(mod(i + vec2(1.0, 0.0),scale));
    float c = random(mod(i + vec2(0.0, 1.0),scale));
    float d = random(mod(i + vec2(1.0, 1.0),scale));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define OCTAVES 4
float fbm (in vec2 st,float scale) {
    // Initial values
    float value = 0.0;
    float amplitude = .5;
    float frequency = 0.;
    //
    // Loop of octaves
    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * abs(noise(st*scale,scale));
        scale *= 2.;
        amplitude *= .5;
    }
    return value;
}


void main(){
    vec2 uv = vUv + uvOffset;

    vec3 color = vec3(1.0);
    color -= fbm(uv,4.0);
    color =color*color*color;
    gl_FragColor = vec4(color*1.2,1.0);
}