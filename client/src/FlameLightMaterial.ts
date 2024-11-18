import * as THREE from 'three';
import flameLightFrag from './shaders/flameLight.frag';
import deferredVert from './shaders/deferredMat.vert';
import { color } from 'three/examples/jsm/nodes/Nodes';

export default class FlameLightMaterial extends THREE.RawShaderMaterial{
    
    constructor(config:{color?: THREE.ColorRepresentation} = {}){

        if(config.color == undefined){
            config.color = new THREE.Color(1,1,1);
        }

        let uniforms:{ [uniform: string]: THREE.IUniform<any> }[] = [
            { uvOffset: new THREE.Uniform(new THREE.Vector2(0,0))},
            { color:{value: config.color}},
            { vertexCount: {value: 0}},
            { viewShadowMatrix: {value: new THREE.Matrix4()}},
            { projectionShadowMatrix: {value: new THREE.Matrix4()}},
            {time: {value:0}}
        ];

        uniforms.push({flameMap: {value: new THREE.Texture()}});
        let defines: {[k: string]: any}= {};

        super({
            vertexShader: deferredVert,
            fragmentShader: flameLightFrag,
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