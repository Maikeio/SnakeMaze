import * as THREE from 'three';
import vertexShader from "./shaders/shadowMat.vert";
import fragmentShader from "./shaders/shadowMat.frag";

export default class ShadowMaterial extends THREE.RawShaderMaterial{
    constructor(skeleton?: THREE.Skeleton){
        let uniforms:{[uniform: string]: THREE.IUniform<any>}[] = [];
        let defines: {[k: string]: any}= {};
        if(skeleton){
            console.log(skeleton?.boneTexture);
            uniforms.push({ boneTexture: {value: skeleton?.boneTexture}});
            defines.IS_SKINNED = undefined;
            defines.BONE_TEXTURE_SIZE = 12.000000000001;
        }
        super({
            name: "Shader Buffer",
            vertexShader:vertexShader,
            fragmentShader: fragmentShader,
            glslVersion: THREE.GLSL3,
            defines: defines,
            uniforms: THREE.UniformsUtils.merge(uniforms),
            colorWrite: false,
            side: THREE.BackSide
        });
    }
}