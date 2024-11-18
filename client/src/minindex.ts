import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module'
import DeferredMaterial from './DeferredMaterial';
import {TerrainGeometry, TerrainMaterial, TerrainMesh} from './Terrain';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import {Pass, FullScreenQuad} from 'three/examples/jsm/postprocessing/Pass';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass';
import DeferredRenderPass from './DeferredRenderPass';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { mix } from 'three/examples/jsm/nodes/Nodes';
import Fox from './fox';
import DeferredScene from './DeferredScene';
import FurrMaterial from './FurrMaterial';
import { PerlinNoise } from './PerlinNoise';
import {FlameRenderer} from './FlameRenderer';
import { ParticleSystem } from './ParticleSystem';
import { VoronoiNoise } from './VoronoiNoise';
import { TerrainNoise } from './TerrainNoise';
import { TextureToScreen } from './TextureToScreen';
import FlameLightMaterial from './FlameLightMaterial';
import DeferredForwardPass from './DeferredForwardPass';
import {MaskPass, ClearMaskPass} from 'three/examples/jsm/postprocessing/MaskPass';
import {ClearPass} from 'three/examples/jsm/postprocessing/ClearPass';
import {TexturePass} from 'three/examples/jsm/postprocessing/TexturePass';


class testPass extends Pass{
    readonly scene: THREE.Scene;
    readonly camera: THREE.Camera;
    inverse: boolean;
    constructor(scene: THREE.Scene, camera: THREE.Camera){
        
		super();

		this.scene = scene;
		this.camera = camera;

		this.clear = true;
		//this.needsSwap = false;

		this.inverse = false;
        let image = new Image();
        image.src = "https://madeio.net/dev.png";
        image.decode().then(()=>{
            console.log(image);
        })
    }
    render(renderer: THREE.WebGLRenderer, writeBuffer: THREE.WebGLRenderTarget, readBuffer: THREE.WebGLRenderTarget, deltaTime: number, maskActive: boolean): void {
        
		const state = renderer.state;
		const context = renderer.getContext();

		// don't update color or depth

		state.buffers.color.setMask( false );
		//state.buffers.depth.setMask( false );

		// lock buffers

		state.buffers.color.setLocked( true );
		//state.buffers.depth.setLocked( true );

		// set up stencil

		let writeValue, clearValue;

		if ( this.inverse ) {

			writeValue = 0;
			clearValue = 1;

		} else {

			writeValue = 1;
			clearValue = 0;

		}
        

		state.buffers.stencil.setTest( true );
		state.buffers.stencil.setOp( context.REPLACE, context.REPLACE, context.REPLACE );
		state.buffers.stencil.setFunc( context.ALWAYS, writeValue, 0xffffffff );
		state.buffers.stencil.setClear( clearValue );
		state.buffers.stencil.setLocked( true );

        let readDepthTextuure = readBuffer.depthTexture;
        let writeDepthTextuure = readBuffer.depthTexture;
        //readBuffer.depthTexture = null;
        writeBuffer.depthTexture = null;
        writeBuffer.depthBuffer = true;

		// draw into the stencil buffer

		renderer.setRenderTarget( readBuffer );
		if ( this.clear ) renderer.clear();
		renderer.render( this.scene, this.camera );

		renderer.setRenderTarget( writeBuffer );
		if ( this.clear ) renderer.clear();
		renderer.render( this.scene, this.camera );

        //readBuffer.depthTexture = readDepthTextuure;
        //writeBuffer.depthTexture = writeDepthTextuure;

		// unlock color and depth buffer and make them writable for subsequent rendering/clearing

		state.buffers.color.setLocked( false );
		//state.buffers.depth.setLocked( false );

		state.buffers.color.setMask( true );
		//state.buffers.depth.setMask( true );

		// only render where stencil is set to 1

		state.buffers.stencil.setLocked( false );
		state.buffers.stencil.setFunc( context.EQUAL, 1, 0xffffffff ); // draw if == 1
		state.buffers.stencil.setOp( context.KEEP, context.KEEP, context.KEEP );
		state.buffers.stencil.setLocked( true );
    }
}
class testPassIn extends Pass{
    constructor(){
        super();
        this.needsSwap = false;
    }
    render(renderer: THREE.WebGLRenderer, writeBuffer: THREE.WebGLRenderTarget, readBuffer: THREE.WebGLRenderTarget, deltaTime: number, maskActive: boolean): void {
        
		const state = renderer.state;
		const context = renderer.getContext();
        state.buffers.depth.setFunc(THREE.LessDepth);
    }
}
const maskScene = new THREE.Scene();
const clock = new THREE.Clock(false);
const camera = new THREE.PerspectiveCamera( 50 + 25*window.innerHeight/window.innerWidth , window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(0,4.5,10);
//camera.position.set(0,4.5,60);
//const camera = new THREE.OrthographicCamera(-40,40,40,-40,0.0,30);

//camera.position.set(0,20,30);
//camera.rotation.x = -0.5* Math.PI;
maskScene.add(camera);

const renderer = new THREE.WebGLRenderer();
renderer.autoClear = false;
renderer.setSize( window.innerWidth, window.innerHeight );
let ration = 1.5 * Math.min((window.outerHeight/window.innerHeight + window.outerWidth/window.innerHeight)*0.5,1)
renderer.setPixelRatio(ration* window.devicePixelRatio);
//renderer.setPixelRatio(1.0);
console.log("fukedRadio", ration);
console.log("pixelRation:",ration* window.devicePixelRatio);
console.log("resolution:", window.innerHeight*ration* window.devicePixelRatio, window.innerWidth*ration* window.devicePixelRatio);
document.getElementById("canvasRender")?.appendChild( renderer.domElement );
renderer.toneMapping = THREE.NeutralToneMapping;
//renderer.toneMapping = THREE.NoToneMapping;
//renderer.outputColorSpace = THREE.NoColorSpace;

renderer.setClearColor( 0xe0e0e0 );


let normal = new THREE.TextureLoader().load("./sand_nor.png");
let devTex = new THREE.TextureLoader().load("./dev.png");

const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1024,1024,{stencilBuffer: true,depthBuffer:false}));
composer.renderTarget1.depthTexture = new THREE.DepthTexture(1,1);
composer.renderTarget2.depthTexture = new THREE.DepthTexture(1,1);

composer.setSize(window.innerWidth, window.innerHeight);
//composer.addPass(defPass);

composer.addPass(new ClearPass());
composer.addPass(new testPass(maskScene, camera));
composer.addPass(new TexturePass(devTex));
//composer.addPass(new testPassIn);
//composer.addPass(forPass);
composer.addPass(new ClearMaskPass());
composer.addPass(new OutputPass());

const stats = new Stats()
document.body.appendChild(stats.dom)


let torusMask = new THREE.Mesh( new THREE.TorusGeometry( 3, 1, 16, 32 ) );
    torusMask.position.z = -5;
    maskScene.add(torusMask);



window.addEventListener( 'resize', onWindowResize );

function onWindowResize() {


    let width = window.innerWidth;
    let height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize( width, height );
    composer.setSize( width, height );
}

function animate() {


    //cube.rotation.y += 0.01;
    //cube.rotation.x += 0.01;
    /*if(bufferGeometry && bufferGeometry.isLoaded){
        bufferGeometry.offssetZ -= 0.3;

        buffMaterial!.uniforms.uvOffset.value.y -= 0.3;
        //bufferGeometry.applyHeight();
    }*/
    
    //updateLights(worldMove);

    renderer.clear();
    requestAnimationFrame(animate);
	composer.render();
    /*stats.update();
    if (fox.animationMixer){
        fox.animationMixer.update(deltaTime);
        //fox.fox!.rotation.y += 0.01;
        //(cube as THREE.Mesh).rotation.y += 0.01;
        (fox.fox!.material as THREE.ShaderMaterial).uniforms.time.value += 400*deltaTime;
        (lightThing.material as THREE.ShaderMaterial).uniforms.time.value += 400*deltaTime;
    }
    fox.updatePos(floor,lights, deltaTime);
    
    particles.update(deltaTime);

    lightThing.rotation.y += 0.01;
    //fox.genTextures(renderer);
    //console.log(testLicht!.position.x,testLicht!.position.y,testLicht!.position.z);
    
   //console.log(fox); 
   //cssRender.render(scene, camera);*/
}
animate();
//renderer.render(scene,camera);
