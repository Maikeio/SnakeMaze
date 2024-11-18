import * as THREE from 'three';
import defferedFragment from './shaders/deferredMat.frag';
import particalVert from './shaders/particleMat.vert';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';

export class ParticleSystem extends THREE.Mesh{
    constructor(count = 100){
        let geo = new THREE.PlaneGeometry(0.1,0.1);
        geo.computeVertexNormals();
        geo.computeTangents();
        let geos = [geo];
        for(let i=0; i < count - 1; i++){
            geos.push(geo.clone());
        }
        super(mergeGeometries(geos,false),new ParcticleMaterial({vertexCount:geo.attributes.position.count}));
    }

    update(deltaTime: number){
        (this.material as ParcticleMaterial).lifeTime += deltaTime;
    }
}

export class ParcticleMaterial extends THREE.RawShaderMaterial{

    constructor(config: {vertexCount:number, color?: THREE.ColorRepresentation}){

        if(config.color == undefined){
            config.color = new THREE.Color(10,10,10);
        }

        let uniforms:{ [uniform: string]: THREE.IUniform<any> }[] = [
            THREE.UniformsLib.normalmap,
            { uvOffset: new THREE.Uniform(new THREE.Vector2(0,0))},
            { color: {value: config.color}},
            { lifeTime: {value: 0.001}}
        ];

        let defines: {[k: string]: any}= {VERTEX_COUNT:config.vertexCount};


        super({
            name: "G-Buffer DefferedMat",
            uniforms: THREE.UniformsUtils.merge(uniforms),
            vertexShader: particalVert,
            fragmentShader: defferedFragment,
            glslVersion: THREE.GLSL3,
            defines: defines
        });
    }

    set lifeTime(lifeTime: number){
        this.uniforms.lifeTime.value = lifeTime;
    }

    get lifeTime():number{
        return this.uniforms.lifeTime.value;
    }
    
}