import * as THREE from 'three';
import sandVertex from './shaders/new-sand-vertex.glsl';
import snadFragment from './shaders/new-sand-fragment.glsl';

export default class SandMaterial extends THREE.RawShaderMaterial{

    private _color: THREE.Color;

    constructor(config: {normalmap?: THREE.Texture, color?: THREE.Color}){

        if(config.color == undefined){
            config.color = new THREE.Color(1,1,1);
        }

        let uniforms = THREE.UniformsUtils.merge([
            THREE.UniformsLib.normalmap,
            { hasNormalMap: {value: config.normalmap != undefined}},
            { uvOffset: new THREE.Uniform(new THREE.Vector2(0,0))},
            {color: {value: config.color}}
        ]);
        
        super({
            name: "G-Buffer Sand",
            uniforms: uniforms,
            vertexShader: sandVertex,
            fragmentShader: snadFragment,
            glslVersion: THREE.GLSL3
        });
        
        if(config.normalmap){
            this.uniforms.normalMap.value = config.normalmap;
            console.log("added Map");
        }
        
        this._color = config.color;
    }

    get color(){
        return this._color;
    }

    set color(color: THREE.Color){
        this._color.copy(color);
        this.uniforms.color.value = this._color;
    }
}