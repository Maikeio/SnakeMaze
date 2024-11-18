import * as THREE from 'three';
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass';
import perlinNoiseFrag from './shaders/voronoi.frag';
import vertexShader from './shaders/lightingPass.vert';

export class VoronoiNoise{

    rendererTarget: THREE.WebGLRenderTarget;
    fsq: FullScreenQuad;
    readonly material: THREE.ShaderMaterial;

    constructor(width = 512, height = 512, renderTarget?: THREE.WebGLRenderTarget){
        if(renderTarget){
            this.rendererTarget = renderTarget;
        }else{
            this.rendererTarget = new THREE.WebGLRenderTarget(width, height);
        }
        this.material = new THREE.ShaderMaterial({
            uniforms:{
                uvOffset:{value: new THREE.Vector2()}
            },
            vertexShader: vertexShader,
            fragmentShader: perlinNoiseFrag
        });
        this.fsq = new FullScreenQuad(this.material);
    }

    renderNoise(renderer: THREE.WebGLRenderer){
        //renderer.setRenderTarget(this.rendererTarget);
        renderer.setRenderTarget(null);
        this.fsq.render(renderer);
    }

    get texture():THREE.Texture{
        return this.rendererTarget.texture;
    }

    dispose(){
        this.rendererTarget.dispose();
        this.fsq.dispose();
    }
}