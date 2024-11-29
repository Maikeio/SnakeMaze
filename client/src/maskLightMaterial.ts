import * as THREE from 'three';
import maskLightFrag from './shaders/maskLight.frag';
import deferredVert from './shaders/deferredMat.vert';

export default class MaskLightMaterial extends THREE.RawShaderMaterial{
    
    constructor(){


        let uniforms:{ [uniform: string]: THREE.IUniform<any> }[] = [
            { uvOffset: new THREE.Uniform(new THREE.Vector2(0,0))},
            { uvScale: new THREE.Uniform(new THREE.Vector2(1,1))},
            { viewShadowMatrix: {value: new THREE.Matrix4()}},
            {time: {value:0}}
        ];

        uniforms.push({flameMap: {value: new THREE.Texture()}});
        let defines: {[k: string]: any}= {};

        super({
            vertexShader: deferredVert,
            fragmentShader: maskLightFrag,
            glslVersion: THREE.GLSL3,
            uniforms: THREE.UniformsUtils.merge(uniforms),
            defines: defines
        }
        );
    }

    set vertexCount(count:number){
        this.uniforms.vertexCount.value = count;
    }

    setFlames(texture: THREE.Texture){
        this.uniforms.flameMap.value = texture;
    }
}