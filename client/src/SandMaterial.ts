import * as THREE from 'three';
import sandVertex from './shaders/sand-vertex.glsl';
import snadFragment from './shaders/sand-fragment.glsl';

export default class SandMaterial extends THREE.ShaderMaterial{
    constructor(config: {normalmap: THREE.Texture}){
        let uniforms = THREE.UniformsUtils.merge([
            THREE.UniformsLib.lights,
            THREE.UniformsLib.normalmap,
            THREE.UniformsLib.fog,
            { uvOffset: new THREE.Uniform(new THREE.Vector2(0,0))}
        ]);
        
        super({
            uniforms: uniforms,
            vertexShader: sandVertex,
            fragmentShader: snadFragment,
            lights: true,
            fog: true
        });
        
        if(config.normalmap){
            this.uniforms.normalMap.value = config.normalmap;
            console.log("added Map");
        }
        
    }
}