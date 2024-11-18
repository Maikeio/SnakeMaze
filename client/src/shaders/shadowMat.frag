precision highp float;
/*out vec4 outPut;

uniform sampler2D boneTexture;*/

void main(){
    // gl_FragCoord.z contains depth values from 0 to 1 in the viewing frustum range of the shadow camera.
    // 0 for near clip, 1 for far clip
    //outPut = vec4(vec3(gl_FragCoord.z),1.0);
    return;
}