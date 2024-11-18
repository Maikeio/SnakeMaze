import * as THREE from 'three';
import sandVertex from './shaders/deferredMat.vert';
import snadFragment from './shaders/deferredMat.frag';

export default class DeferredMaterial extends THREE.RawShaderMaterial{

    private _color: THREE.ColorRepresentation;

    constructor(config: {normalmap?: THREE.Texture, color?: THREE.ColorRepresentation, skeleton?: THREE.Skeleton, vertexColors?: boolean} = {}){

        if(config.color == undefined){
            config.color = new THREE.Color(1,1,1);
        }

        let uniforms:{ [uniform: string]: THREE.IUniform<any> }[] = [
            THREE.UniformsLib.normalmap,
            { uvOffset: new THREE.Uniform(new THREE.Vector2(0,0))},
            { color: {value: config.color}},
            { viewShadowMatrix: {value: new THREE.Matrix4()}},
            { projectionShadowMatrix: {value: new THREE.Matrix4()}},

        ];

        if(config.skeleton) uniforms.push({ boneTexture: {value: config.skeleton?.boneTexture}});

        let defines: {[k: string]: any}= {};

        if(config.normalmap) defines.HAS_NORMALMAP = undefined;
        if(config.skeleton){
            defines.IS_SKINNED = undefined;
            defines.BONE_TEXTURE_SIZE = 12.000000000001;
        }
        if(config.vertexColors) defines.HAS_VERTEX_COLORS = undefined;

        super({
            name: "G-Buffer DefferedMat",
            uniforms: THREE.UniformsUtils.merge(uniforms),
            vertexShader: sandVertex,
            fragmentShader: snadFragment,
            glslVersion: THREE.GLSL3,
            defines: defines
        });
        
        if(config.normalmap){
            this.uniforms.normalMap.value = config.normalmap;
        }
        
        this._color = config.color;
    }

    get color(){
        return this._color;
    }

    set color(color: THREE.ColorRepresentation){
        this.color = color;
        this.uniforms.color.value = this._color;
    }
}