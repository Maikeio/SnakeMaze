import * as THREE from 'three';
import {Pass, FullScreenQuad} from 'three/examples/jsm/postprocessing/Pass';
import lightingFragment from './shaders/lightingPass.frag';
import lightingVertex from './shaders/lightingPass.vert';
import fogFragment from './shaders/fogPass.frag';
import DeferredScene from './DeferredScene';
import ShadowMaterial from './ShadowMaterial';
import DeferredMaterial from './DeferredMaterial';
import { TerrainMesh } from './Terrain';

export default class DeferredRenderPass extends Pass {

    camera: THREE.Camera;
    scene: DeferredScene;
    readonly shadowTarget: THREE.WebGLRenderTarget;
    readonly renderTarget: THREE.WebGLRenderTarget;
    readonly fogRenderTarget: THREE.WebGLRenderTarget;
    private readonly fsQuad: FullScreenQuad;
    private readonly lightingMaterial: THREE.ShaderMaterial;
    private readonly fogMaterial: THREE.ShaderMaterial;
    private readonly webGlRendererSize = new THREE.Vector2();
    private readonly renderTargetSize = new THREE.Vector2(1,1);
    private static readonly upVector = new THREE.Vector3(0,1,0);
    private clock = new THREE.Clock();

    constructor(scene: DeferredScene, camera: THREE.Camera){
        super();
        this.camera = camera;
        this.scene = scene;

		this.needsSwap = false;

        this.renderTarget = new THREE.WebGLRenderTarget(1,1,{
            count: 4,
            type: THREE.HalfFloatType,
            samples:0,
            depthBuffer: true,
            stencilBuffer: true
        });
        //this.renderTarget.depthTexture = new THREE.DepthTexture(this.renderTarget.width,this.renderTarget.height);

        this.renderTarget.textures[ 0 ].name = 'albedoSpec';
		this.renderTarget.textures[ 1 ].name = 'normal';
        this.renderTarget.textures[ 2 ].name = 'position';
        this.renderTarget.textures[ 3 ].name = 'shadowPosition';

        this.fogRenderTarget = new THREE.WebGLRenderTarget(1,1);

        let shadowTexute = new THREE.DepthTexture(512,512);
        this.shadowTarget = new THREE.WebGLRenderTarget(512,512, {
            //magFilter: THREE.NearestFilter,
            //minFilter: THREE.NearestFilter,
            //format: THREE.RGBAFormat,
            //type: THREE.HalfFloatType,
            depthTexture: shadowTexute
            });
        //this.shadowCamera.position.y = 10;


        (this.camera as THREE.OrthographicCamera).updateProjectionMatrix();
        let lightingUniforms = THREE.UniformsUtils.merge([
                {fogColor: {value: new THREE.Color(0x997799)}},
                {fogFar: {value: 200}},
                {fogNear: {value: 50}},
                THREE.UniformsLib.lights
            ]);

        let lightingTexUniforms = {
            gAlbedoSpec: {value: this.renderTarget.textures[0]},
            gNormal: {value: this.renderTarget.textures[1]},
            gPosition: {value: this.renderTarget.textures[2]},  
            gShadowPosition: {value: this.renderTarget.textures[3]},
            fogTex: {value: this.fogRenderTarget.texture},
            shadowMap: {value: this.shadowTarget.depthTexture},
            cameraWorldMatrix: {value:this.camera.matrixWorld}
            /*uShadowCameraView: {value: this.shadowCamera.matrixWorldInverse},
            uShadowCameraProject: {value: this.shadowCamera.projectionMatrix},
            shadowCameraPosition: {value: this.shadowCamera.position}*/
        }

        this.lightingMaterial = new THREE.ShaderMaterial({
            uniforms: {...lightingUniforms, ...lightingTexUniforms},
            vertexShader: lightingVertex,
            fragmentShader: lightingFragment,
            lights: true
        });
        //this.material.uniforms.cameraModelViewMatrix.value = this.camera.matrixWorldInverse;
        let fogUniforms = THREE.UniformsUtils.merge([
            THREE.UniformsLib.lights
        ]);

        let fogTexUniforms = {
            gPosition: {value: this.renderTarget.textures[2]},
        }
        this.fogMaterial = new THREE.ShaderMaterial({
            vertexShader: lightingVertex,
            fragmentShader: fogFragment,
            uniforms: {...fogUniforms, ...fogTexUniforms},
            lights: true
        })
        this.fsQuad = new FullScreenQuad(this.fogMaterial);
        (this.fsQuad as any)["_mesh"].add(this.scene.clonedLights);
        console.log(this,this.lightingMaterial.uniforms);
    }

    private checkWindowSize(renderer: THREE.WebGLRenderer){
        renderer.getSize(this.webGlRendererSize);
        this.webGlRendererSize.multiplyScalar(renderer.getPixelRatio());
        if(!renderer.getSize(this.webGlRendererSize).equals(this.renderTargetSize)){
            this.renderTarget.setSize(this.webGlRendererSize.x * renderer.getPixelRatio(), this.webGlRendererSize.y * renderer.getPixelRatio());
            this.fogRenderTarget.setSize(this.webGlRendererSize.x*0.5, this.webGlRendererSize.y*0.5);
            this.renderTargetSize.copy(this.webGlRendererSize);
            //this.renderTarget.depthTexture = new THREE.DepthTexture(this.webGlRendererSize.x, this.webGlRendererSize.y);
            console.log(renderer.getPixelRatio());
        }
    }

    render( renderer: THREE.WebGLRenderer, writeBuffer: THREE.WebGLRenderTarget, readBuffer: THREE.WebGLRenderTarget){
        this.clock.getDelta();

        this.checkWindowSize(renderer);
        for (let mesh of this.scene.meshes){
            let an = mesh as any;

            an.origMaterial = an.material;
            if(!an.shadowMaterial){
                an.shadowMaterial = new ShadowMaterial(an.skeleton);
            }
            an.material = an.shadowMaterial;
        }
        //console.log(this.scene)

        renderer.setRenderTarget(this.shadowTarget);
        renderer.render(this.scene, this.scene.shadowCamera);

        for (let mesh of this.scene.meshes){
            let an = mesh as any;
            an.material = an.origMaterial;
        }

        this.scene.updateLightTransforms(this.camera);

        renderer.setRenderTarget(this.fogRenderTarget);
        this.fsQuad.material = this.fogMaterial;
        this.fsQuad.render(renderer);


        renderer.setRenderTarget(this.renderTarget);
        renderer.render(this.scene, this.camera);

        //let context = renderer.getContext();

        let timeForFor = this.clock.getDelta();
        
        renderer.setRenderTarget( readBuffer );
        this.fsQuad.material = this.lightingMaterial;
        this.fsQuad.render(renderer);
        //console.log(this.clock.getDelta(),timeForFor);
    }
}