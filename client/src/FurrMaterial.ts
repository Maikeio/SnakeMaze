import * as THREE from 'three';
import furrMatFrag from './shaders/furrMat.frag';
import furrMatVert from './shaders/furrMat.vert';
import { color } from 'three/examples/jsm/nodes/Nodes';

export default class FurrMaterial extends THREE.RawShaderMaterial{
    
    constructor(config:{normalmap?: THREE.Texture, skeleton?: THREE.Skeleton,color?: THREE.ColorRepresentation, vertexColors?: boolean} = {}){

        if(config.color == undefined){
            config.color = new THREE.Color(1,1,1);
        }

        let uniforms:{ [uniform: string]: THREE.IUniform<any> }[] = [
            { uvOffset: new THREE.Uniform(new THREE.Vector2(0,0))},
            {color:{value: config.color}},
            { vertexCount: {value: 0}},
            { glowPercantage: {value: -2}},
            { glowColor: {value: new THREE.Color(1,1,1)}},
            { viewShadowMatrix: {value: new THREE.Matrix4()}},
            { projectionShadowMatrix: {value: new THREE.Matrix4()}},
            {time: {value:0}}
        ];

        if(config && config.skeleton) uniforms.push({ boneTexture: {value: config.skeleton?.boneTexture}});
        uniforms.push({flameMap: {value: new THREE.Texture()}});
        let defines: {[k: string]: any}= {};

        if(config.normalmap) defines.HAS_NORMALMAP = undefined;
        if(config.skeleton){
            defines.IS_SKINNED = undefined;
            defines.BONE_TEXTURE_SIZE = 12.000000000001;
        }
        if(config.vertexColors) defines.HAS_VERTEX_COLORS = undefined;

        super({
            vertexShader: furrMatVert,
            fragmentShader: furrMatFrag,
            glslVersion: THREE.GLSL3,
            uniforms: THREE.UniformsUtils.merge(uniforms),
            defines: defines
        }
        );
    }

    set vertexCount(count:number){
        this.uniforms.vertexCount.value = count;
    }

    set glowPercantage(count:number){
        this.uniforms.glowPercantage.value = count;
    }

    set glowColor(color:THREE.ColorRepresentation){
        this.uniforms.glowColor.value = color;
    }

    get glowPercantage():number{
        return this.uniforms.glowPercantage.value;
    }

    setFlames(texture: THREE.Texture){
        this.uniforms.flameMap.value = texture;
    }
}