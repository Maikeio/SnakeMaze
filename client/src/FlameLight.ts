import * as THREE from 'three';
import { PerlinNoise } from './PerlinNoise';
import { SingleFlameRenderer } from './SingleFlameRenderer';
import { FlipBookRenderer } from './FlipBook';
import { FlameRenderer } from './FlameRenderer';
import FlameLightMaterial from './FlameLightMaterial';
import MaskLightMaterial from './maskLightMaterial';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export default class FlameLight{

    protected static points = [
        0,-1,0,
        -1,0,-1,
        0,3,0,

        0,-1,0,
        -1,0,1,
        0,3,0,

        0,-1,0,
        1,0,1,
        0,3,0,
        
        0,-1,0,
        1,0,-1,
        0,3,0,
    
        -1,0,-1
    ];

    protected static colorMix = [
        0,
        0.5,
        1,

        0,
        0.5,
        1,

        0,
        0.5,
        1,
        
        0,
        0.5,
        1,
    
        0.5
    ];

    protected static uvs = [
        0.125,0,
        0,0.25,
        0.125,1,

        0.375,0,
        0.25,0.25,
        0.375,1,

        0.625,0,
        0.5,0.25,
        0.625,1,

        0.875,0,
        0.75,0.25,
        0.875,1,

        1,0.25
    ];

    protected static faces = [
        0,1,4,
        1,2,4,

        3,4,7,
        4,5,7,

        6,7,10,
        7,8,10,

        9,10,12,
        10,11,12

    ];

    readonly planeMask: THREE.Mesh;
    readonly flameVolume: THREE.Mesh;

    protected static heightOffset: number = 1;

    constructor(color: THREE.ColorRepresentation, silhouette: THREE.Texture, flameTexture: THREE.Texture){
        let geometry = new THREE.BufferGeometry();

        geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(FlameLight.points),3));
        geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(FlameLight.uvs),2));
        geometry.setAttribute("colorMix", new THREE.BufferAttribute(new Float32Array(FlameLight.colorMix),1));

        geometry.setIndex(FlameLight.faces);
        geometry.drawRange = { start: 0, count: Infinity };
        geometry.computeVertexNormals();
        geometry.computeTangents();

        let flameMaterial = new FlameLightMaterial({color:color});
        flameMaterial.uniforms.flameMap.value = flameTexture;
        (flameMaterial.uniforms.uvScale.value as THREE.Vector2).set(3,3);
        this.flameVolume = new THREE.Mesh(geometry,flameMaterial);
        (this.flameVolume.material as FlameLightMaterial).side = THREE.BackSide;
        //(lightThing.material as DeferredMaterial).transparent = true;

        let maskPlaneSize = 4.7;

        let flameMaksPlane= [new THREE.PlaneGeometry(maskPlaneSize,maskPlaneSize),new THREE.PlaneGeometry(maskPlaneSize,maskPlaneSize)];
        flameMaksPlane[1].rotateY(Math.PI*0.5);
        
        let maskMaterial  = new MaskLightMaterial();
        maskMaterial.uniforms.flameMap.value = silhouette;
        //maskMaterial.uniforms.flameMap = (fox.fox!.material as FurrMaterial).uniforms.flameMap;
        maskMaterial.side = THREE.DoubleSide;
        this.planeMask = new THREE.Mesh(mergeGeometries(flameMaksPlane),maskMaterial);
    }

    getPosition(target: THREE.Vector3): THREE.Vector3{
        target.copy(this.flameVolume.position);
        return target;
    }

    setPosition(newPos: THREE.Vector3){
        this.flameVolume.position.copy(newPos);
        this.planeMask.position.copy(newPos);
        this.planeMask.position.y += FlameLight.heightOffset;
    }

    setScale(target: THREE.Vector3){
        this.flameVolume.scale.copy(target);
        this.planeMask.scale.copy(target);
    }

    set animationTime(time:number){
        (this.flameVolume.material as FlameLightMaterial).uniforms.time.value = time;
        (this.planeMask.material as FlameLightMaterial).uniforms.time.value = time;
    }

    get animationTime():number{
        return (this.flameVolume.material as FlameLightMaterial).uniforms.time.value;
    }

}

export class FlameLoader{

    multiFlame?: THREE.FramebufferTexture;
    silhouetteFlame?: THREE.FramebufferTexture;

    generateTextures(renderer: THREE.WebGLRenderer){
        let perlin = new PerlinNoise(undefined,undefined,undefined,0.2);

        let flameRenderer = new SingleFlameRenderer(256,256,perlin.texture,undefined,{
            flameCount:1,
            innerFlameCount:10,
            mainFlameWidth:10,
            flameHeight:1.2,
            windStrenght:0.0
        });

        let flipBook = new FlipBookRenderer((renderer)=>{
            perlin.renderNoise(renderer);
    
            perlin.material.uniforms.uvOffset.value.y -= 0.3 * 0.08;
            
            flameRenderer.renderFlames(renderer);
        },6,256);
    
        flipBook.render(renderer, true);

        this.silhouetteFlame = flipBook.texture;

        perlin.material.defines["SCALE"] = "float("+1+")";
        perlin.material.needsUpdate = true;
        let multiFlameRenderer = new FlameRenderer(256,256,perlin.texture);

        let multiFlipBook = new FlipBookRenderer((renderer)=>{

            perlin.renderNoise(renderer);
            perlin.material.uniforms.uvOffset.value.y -= 0.006;
            multiFlameRenderer.renderFlames(renderer);
        
        },6,256);

        multiFlipBook.render(renderer);

        this.multiFlame = multiFlipBook.texture;
    }

    createLight(color: THREE.ColorRepresentation): FlameLight{
        if(!(this.multiFlame && this.silhouetteFlame)){
            throw new Error("need to generate textures first");
        }
        return new FlameLight(color, this.silhouetteFlame!, this.multiFlame!);
    }
}