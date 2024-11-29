import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module'
import DeferredMaterial from './DeferredMaterial';
import {TerrainGeometry, TerrainMaterial, TerrainMesh} from './Terrain';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
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
import { ClearMaskPass} from 'three/examples/jsm/postprocessing/MaskPass';
import {ClearPass} from 'three/examples/jsm/postprocessing/ClearPass';
import {TexturePass} from 'three/examples/jsm/postprocessing/TexturePass';
import { MaskPass } from './CustomMaskPass';
import { SingleFlameRenderer } from './SingleFlameRenderer';
import { FlipBookRenderer } from './FlipBook';
import MaskLightMaterial from './maskLightMaterial';


const scene = new DeferredScene();
const forScene = new THREE.Scene();
const maskScene = new THREE.Scene();
const clock = new THREE.Clock(false);
scene.background = new THREE.Color(0x42429a);
const cameraAnker = new THREE.Object3D();
scene.add(cameraAnker);
const camera = new THREE.PerspectiveCamera( 50 + 25*window.innerHeight/window.innerWidth , window.innerWidth / window.innerHeight, 0.1, 1000 );
//camera.position.set(0,4.5,10);
camera.position.set(0,3.5,5);
//const camera = new THREE.OrthographicCamera(-40,40,40,-40,0.0,30);

//camera.position.set(0,20,30);
//camera.rotation.x = -0.5* Math.PI;
cameraAnker.add(camera);

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

const defPass = new DeferredRenderPass(scene, camera);
const forPass = new DeferredForwardPass(forScene, camera,defPass.renderTarget);

let normal = new THREE.TextureLoader().load("./sand_nor.png");
let devTex = new THREE.TextureLoader().load("./dev.png");

const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1024,1024,{stencilBuffer: true,depthBuffer:true}));
composer.setSize(window.innerWidth, window.innerHeight);

composer.addPass(defPass);
composer.addPass(new MaskPass(maskScene, camera, defPass.renderTarget));
//composer.addPass(new TexturePass(devTex));
composer.addPass(forPass);
composer.addPass(new ClearMaskPass());
composer.addPass(new OutputPass());

const stats = new Stats()
document.body.appendChild(stats.dom)

const particles = new ParticleSystem(100);
particles.position.z = 40;
//scene.add(particles);


const backgroundGeometry = new THREE.SphereGeometry( 900);
const backgroundMaterial = new DeferredMaterial( { color: new THREE.Color(0x42429a)});
const background = new THREE.Mesh( backgroundGeometry, backgroundMaterial );
backgroundMaterial.side = THREE.BackSide;



let lightThing: THREE.Mesh;
let bufferGeometry: undefined | TerrainGeometry = undefined;
let floor: TerrainMesh;
let buffMaterial: undefined | TerrainMaterial = undefined;
let torusMask: THREE.Mesh;
let cube: THREE.Mesh;
let flameMask: THREE.Mesh;


let points = [
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

    -1,0,-1];

    let colorMix = [
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
    
        0.5];

let uvs = [
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

    1,0.25];

let faces = [
    0,1,4,
    1,2,4,

    3,4,7,
    4,5,7,

    6,7,10,
    7,8,10,

    9,10,12,
    10,11,12

];

    
    let perlin = new PerlinNoise(128,128,undefined,0.2);


    let flameRenderer = new SingleFlameRenderer(256,256,perlin.texture);


    let flipBook = new FlipBookRenderer((renderer)=>{
        perlin.renderNoise(renderer);

        perlin.material.uniforms.uvOffset.value.y -= 0.3 * 0.08;
        
        flameRenderer.renderFlames(renderer);
    },6,256);

    flipBook.render(renderer, true);

    perlin = new PerlinNoise(128,128,undefined,1);
    let multiFlameRenderer = new FlameRenderer(256,256,perlin.texture);

    let multiFlipBook = new FlipBookRenderer((renderer)=>{

        perlin.renderNoise(renderer);
        perlin.material.uniforms.uvOffset.value.y -= 0.006;
        multiFlameRenderer.renderFlames(renderer);
        
    },6,256);

    multiFlipBook.render(renderer);

    let geometry = new THREE.BufferGeometry();

    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(points),3));
    geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uvs),2));
    geometry.setAttribute("colorMix", new THREE.BufferAttribute(new Float32Array(colorMix),1));

    geometry.setIndex(faces);
    geometry.drawRange = { start: 0, count: Infinity };
    geometry.computeVertexNormals();
    geometry.computeTangents();

    let flameMaterial = new FlameLightMaterial({color:new THREE.Color(0xff0000)});
    flameMaterial.uniforms.flameMap.value = multiFlipBook.texture;
    (flameMaterial.uniforms.uvScale.value as THREE.Vector2).set(3,3);
    lightThing = new THREE.Mesh(geometry,flameMaterial);
    (lightThing.material as DeferredMaterial).side = THREE.BackSide;
    //(lightThing.material as DeferredMaterial).transparent = true;
    lightThing.position.y = 2;

    let maskPlaneSize = 4.7;

    let flameMaksPlane= [new THREE.PlaneGeometry(maskPlaneSize,maskPlaneSize),new THREE.PlaneGeometry(maskPlaneSize,maskPlaneSize)];
    flameMaksPlane[1].rotateY(Math.PI*0.5);
    
    let maskMaterial  = new MaskLightMaterial();
    maskMaterial.uniforms.flameMap.value = flipBook.texture;
    //maskMaterial.uniforms.flameMap = (fox.fox!.material as FurrMaterial).uniforms.flameMap;
    maskMaterial.side = THREE.DoubleSide;
    flameMask = new THREE.Mesh(mergeGeometries(flameMaksPlane),maskMaterial);
    flameMask.position.y = 3;
    maskScene.add(flameMask);

    //let torusMask = new THREE.Mesh( new THREE.TorusGeometry( 3, 1, 16, 32 ) );
    torusMask = new THREE.Mesh(new THREE.BoxGeometry(2,2,2));
    torusMask.position.z = -5;
    //maskScene.add(torusMask);

    forScene.add(lightThing);


    clock.start();

    //onWindowResize();
    
const lights: [THREE.PointLight, THREE.Vector3][] = [];

let testLicht;
for(let i = 0; i < 20; i++){
    let light = new THREE.PointLight(
        new THREE.Color().setHSL((0.85 + Math.random()/5)%1,1,0.5),
        0,
        70
    )
    lights.push([light,new THREE.Vector3(Math.random() - 0.5,0,Math.random() - 0.5).normalize().multiplyScalar(0.2)]);
    light.position.set((Math.random()-0.5) * 90, Math.random() * 2.0 , (-Math.random()) * 256);
    scene.add(light);
    if(i == 19){
        testLicht = light;
    }
}


window.addEventListener( 'resize', onWindowResize );

function onWindowResize() {


    let width = window.innerWidth;
    let height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize( width, height );
    composer.setSize( width, height );
}

const light = new THREE.DirectionalLight(0x000000);
scene.add( background );
scene.add(light);
scene.add(new THREE.AmbientLight(0xff55ff));
const upVector = new THREE.Vector3(0,1,0);
function updateLights(worldMove: number){
    for( let [light, velocity] of lights){
        //velocity.applyAxisAngle(upVector, (Math.random() - 0.5) * 0.25);
        //light.position.add(velocity);

        if(light.position.z > 30){
            light.position.setX(Math.pow(Math.random() - 0.5,3)* 360);
            light.position.z = -256;
            light.intensity = 0.0;
        }

        light.intensity = light.intensity * 0.99 + 60 * 0.01;
        light.position.z += worldMove;
    }
}

document.addEventListener("mousemove",(ev: MouseEvent)=>{

    if(ev.buttons == 1){
    lightThing.rotation.y +=  ev.movementX * 0.01;
    flameMask.rotation.y +=  ev.movementX * 0.01;
    lightThing.rotation.x +=  ev.movementY * 0.01;
    flameMask.rotation.x +=  ev.movementY * 0.01;
    flameMask.rotation.x = Math.max(Math.min(0.15 * Math.PI, flameMask.rotation.x), -0.25 * Math.PI);
    lightThing.rotation.x = Math.max(Math.min(0.15 * Math.PI, lightThing.rotation.x), -0.25 * Math.PI);
    }
});



function animate() {

    let deltaTime = clock.getDelta();

    let worldMove = deltaTime * 60 * 0.3;

    //cube.rotation.y += 0.01;
    //cube.rotation.x += 0.01;
    /*if(bufferGeometry && bufferGeometry.isLoaded){
        bufferGeometry.offssetZ -= 0.3;

        buffMaterial!.uniforms.uvOffset.value.y -= 0.3;
        //bufferGeometry.applyHeight();
    }*/
    requestAnimationFrame(animate);

    


    stats.update();

   

    torusMask.rotation.y += deltaTime;
    
    updateLights(worldMove);

    renderer.clear();
	composer.render();
    (lightThing.material as FlameLightMaterial).uniforms.time.value += 400*deltaTime;
    (flameMask.material as FlameLightMaterial).uniforms.time.value += 400*deltaTime;
    //flameMask.rotation.y += worldMove * 0.01;
    lightThing.rotation.y += worldMove * 0.02;
    flameMask.rotation.y += worldMove * 0.02;
    
    particles.update(deltaTime);

    //lightThing.rotation.y += worldMove * 0.01;
    //fox.genTextures(renderer);
    //console.log(testLicht!.position.x,testLicht!.position.y,testLicht!.position.z);
    
   //console.log(fox); 
   //cssRender.render(scene, camera);*/
}

animate();
//renderer.render(scene,camera);
