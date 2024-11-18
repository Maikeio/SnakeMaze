
uniform sampler2D deferredDepth;
uniform sampler2D forwardDepth;
uniform sampler2D forwardTexture;

varying vec2 vUv;

void main() {
    
    if (texture2D( deferredDepth, vUv ).x < texture2D( forwardDepth, vUv ).x){
        discard;
    }

    gl_FragColor = vec4(texture2D( forwardTexture, vUv ).rgb , 1.0);
    //gl_FragColor = vec4(vec3(texture2D( deferredDepth, vUv ).x*0.1),1.0);
}