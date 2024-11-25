varying vec2 vUv;
uniform sampler2D inTexture;
uniform float ratio;

void main(){
    vec2 uv = vUv*1.0;
    uv.x *= ratio;
    gl_FragColor = vec4(texture2D(inTexture,fract(uv)).rgb,1.0);
}