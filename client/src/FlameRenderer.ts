import * as THREE from 'three';
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass';
import flamesFrag from './shaders/flames.frag';
import vertexShader from './shaders/lightingPass.vert';

export interface flameConfig{
    flameCount:number,
    innerFlameCount:number,
    mainFlameWidth:number
    flameHeight:number,
    windStrenght: number
};

const defaultFlaemConfig=
{
    flameCount:4,
    innerFlameCount:4,
    mainFlameWidth:1.5,
    flameHeight:1,
    windStrenght: 0
}

export class FlameRenderer{

    rendererTarget: THREE.WebGLRenderTarget;
    fsq: FullScreenQuad;
    noise: THREE.Texture;

    constructor(width = 512, height = 512, noise: THREE.Texture, renderTarget?: THREE.WebGLRenderTarget,config:flameConfig= defaultFlaemConfig){
        this.noise = noise;
        if(renderTarget){
            this.rendererTarget = renderTarget;
        }else{
            this.rendererTarget = new THREE.WebGLRenderTarget(width, height);
        }

        let defines: {[k: string]: any}= {
            "FLAMECOUNT": "float("+config.flameCount+")",
            "INNERFLAMECOUNT" : "float("+config.innerFlameCount+")",
            "MAINFLAMEWIDTH" : "float("+config.mainFlameWidth+")",
            "FLAMEHEIGHT": "float("+config.flameHeight+")",
            "WINDSTRENGHT":"float("+config.windStrenght+")",
        };

        let noiseMat = new THREE.ShaderMaterial({
            uniforms:{
                    uvOffset:{value: new THREE.Vector2()},
                    noise:{value:this.noise}
            },
            defines:defines,
            vertexShader: vertexShader,
            fragmentShader: flamesFrag
        });

        this.fsq = new FullScreenQuad(noiseMat);
    }

    renderFlames(renderer: THREE.WebGLRenderer){
        renderer.setRenderTarget(this.rendererTarget);
        //renderer.setRenderTarget(null);
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