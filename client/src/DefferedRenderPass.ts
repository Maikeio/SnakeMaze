import * as THREE from 'three';
import {Pass, FullScreenQuad} from 'three/examples/jsm/postprocessing/Pass';
import lightingFragment from './shaders/lightingFragment.glsl';
import lightingVertex from './shaders/lightingVertex.glsl';

export default class DefferedRenderPass extends Pass {

    camera: THREE.Camera;
    scene: THREE.Scene;
    readonly renderTarget: THREE.WebGLRenderTarget;
    private readonly fsQuad: FullScreenQuad;
    private readonly material: THREE.ShaderMaterial;
    private readonly webGlRendererSize = new THREE.Vector2();
    private readonly renderTargetSize = new THREE.Vector2(1,1);

    constructor(scene: THREE.Scene, camera: THREE.Camera){
        super();
        this.camera = camera;
        this.scene = scene;

		this.needsSwap = false;

        this.renderTarget = new THREE.WebGLRenderTarget(1,1,{
            count: 3,
            type: THREE.HalfFloatType,
            samples:0
        });

        this.renderTarget.textures[ 0 ].name = 'albedoSpec';
		this.renderTarget.textures[ 1 ].name = 'normal';
        this.renderTarget.textures[ 2 ].name = 'position';

        let uniforms = THREE.UniformsUtils.merge([
            THREE.UniformsLib.lights,
            THREE.UniformsLib.fog,
        ]);

        let lights: {position: THREE.Vector3, intensity: number, radius: number, color: THREE.Color}[] = [];

        for(let i = 0; i < 70; i++){
            lights.push({
                position: new THREE.Vector3((Math.random()-0.5) * 90, -Math.random() * 2.0, -Math.random() * 180),
                intensity: 0.4,
                radius: 5,
                color: (new THREE.Color()).setHSL((0.85 + Math.random()/5)%1,1,0.5)
            });
        }

        this.material = new THREE.ShaderMaterial({
            uniforms: {
                gAlbedoSpec: {value: this.renderTarget.textures[0]},
                gNormal: {value: this.renderTarget.textures[1]},
                gPosition: {value: this.renderTarget.textures[2]},
                pointLights: {value: lights},
                fogColor: {value: new THREE.Color(0x997799)},
                fogFar: {value: 200},
                fogNear: {value: 50}
            },
            vertexShader: lightingVertex,
            fragmentShader: lightingFragment
        });

        this.fsQuad = new FullScreenQuad(this.material);
    }

    private checkWindowSize(renderer: THREE.WebGLRenderer){
        if(!renderer.getSize(this.webGlRendererSize).equals(this.renderTargetSize)){
            this.renderTarget.setSize(this.webGlRendererSize.x, this.webGlRendererSize.y);
            this.renderTargetSize.copy(this.webGlRendererSize);
        }
    }

    render( renderer: THREE.WebGLRenderer, writeBuffer: THREE.WebGLRenderTarget, readBuffer: THREE.WebGLRenderTarget){
        this.checkWindowSize(renderer);
        renderer.setRenderTarget(this.renderTarget);
        renderer.render(this.scene, this.camera);

        renderer.setRenderTarget( readBuffer );

        this.fsQuad.render(renderer);
    }
}