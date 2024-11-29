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
import FlameLight, { FlameLoader } from './shaders/FlameLight';


const scene = new DeferredScene();
const forScene = new THREE.Scene();
const maskScene = new THREE.Scene();
const clock = new THREE.Clock(false);
scene.fog = new THREE.Fog(0xffffff, 10, 115 );
scene.background = new THREE.Color(0x42429a);
const cameraAnker = new THREE.Object3D();
scene.add(cameraAnker);
const camera = new THREE.PerspectiveCamera( 50 + 25*window.innerHeight/window.innerWidth , window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(0,4.5,10);
//.position.set(0,3.5,5);
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

let normal = new THREE.TextureLoader().loadAsync("./sand_nor.png");
let devTex = new THREE.TextureLoader().loadAsync("./dev.png");

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

scene.add( background );

const lights: [THREE.PointLight, FlameLight][] = [];

let floor: TerrainMesh = new TerrainMesh();
const fox = new Fox();




let flameLoader = new FlameLoader();

//set up multithreading for parallel download an generating of textures

async function generateTextures() {
    fox.genTextures(renderer);
    floor.generateTerrain(renderer);
    flameLoader.generateTextures(renderer);
}

//define scene setup when all resources are there
Promise.all([generateTextures(),fox.load(),normal,devTex]).then((reuslts) => {

    scene.add(reuslts[1]);

    fox.setGeneratedTexture();
    scene.add( floor );

    floor.position.y = -3;
    floor.position.x = -256;
    floor.position.z = -240;
    floor.material.normal = reuslts[2];


    for(let i = 0; i < 20; i++){
        let light = new THREE.PointLight(
            new THREE.Color().setHSL((0.85 + Math.random()/5)%1,1,0.5),
            20,
            70
        )
        let flameLight = flameLoader.createLight(light.color);
        (flameLight.flameVolume.material as FlameLightMaterial).transparent = true;
        maskScene.add(flameLight.planeMask);
        forScene.add(flameLight.flameVolume);

        lights.push([light,flameLight]);
        light.position.set((Math.random()-0.5) * 90, Math.random() * 2.0 , (-Math.random()) * 256);
        light.position.y = floor.getHeightAtWorld(light.position) + 1.0;
        scene.add(light);

        flameLight.animationTime = Math.random() * 1000.0;
    }

    
    clock.start();
    animate();
    lights.forEach(([light,flame])=>{
        console.log(flame.animationTime);
    });
    
});




window.addEventListener( 'resize', onWindowResize );

function onWindowResize() {


    let width = window.innerWidth;
    let height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize( width, height );
    composer.setSize( width, height );
}
/*
const cssRender = new CSS3DRenderer();
cssRender.setSize( window.innerWidth, window.innerHeight );
document.getElementById("cssRender")?.appendChild(cssRender.domElement);

const div = document.createElement( 'div' );
div.style.width = '500px';
div.style.height = "550px";
div.style.backgroundColor = "rgba(50, 50, 50, 0.4)";
div.style.backdropFilter = "blur(5px)";
div.style.color = '#ffffff';
div.style.borderRadius = "10px";
div.style.padding = "20px";

const innerDiv = document.createElement( 'div' );
innerDiv.style.width = "100%"
innerDiv.style.height = "calc(100% - 30px)";
innerDiv.style.overflow = "auto"
innerDiv.innerHTML = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.";
div.appendChild(innerDiv);

const back = document.createElement("button");
back.onclick = ()=>{
    window.alert("press");
}
back.style.marginTop = "10px";
back.style.height = "20px";
back.style.width = "80px";
back.style.marginLeft = "calc(50% - 40px)";
back.innerHTML = "return";
back.style.border = "0px"
back.style.borderRadius = "4px";
div.append(back);

const divObj = new CSS3DObject(div);
divObj.scale.set(0.05, 0.05, 0.05);
divObj.position.set(0,3, 50);
scene.add(divObj);*/


const flamePos = new THREE.Vector3();
function updateLights(worldMove: number, deltaTime:number){
    for( let [light, flame] of lights){

        //velocity.applyAxisAngle(upVector, (Math.random() - 0.5) * 0.25);
        //light.position.add(velocity);

        if(light.position.z > 30){
            light.position.setX(Math.pow(Math.random() - 0.5,3)* 360);
            light.position.z = -256;
            light.intensity = 0.0;
            light.position.y = floor.getHeightAtWorld(light.position) + 1.0;
        }

        light.intensity = light.intensity * 0.99 + 30 * 0.01;
        light.position.z += worldMove;

        flamePos.copy(light.position);
        flamePos.y -= 0.5;

        flame.setPosition(flamePos);

        (flame.flameVolume.material as FlameLightMaterial).uniforms.opacity.value = light.intensity/20;

        flame.animationTime += 400*deltaTime;
        //(flame.planeMask.material as FlameLightMaterial).uniforms.time.value += 400*deltaTime;
    }
}
/*
document.addEventListener("mousemove",(ev: MouseEvent)=>{
    let range = 0.4;
    let angle = ((ev.clientX / window.innerWidth ) - 0.5) * 2;
    if(-range < angle && angle < range){
        angle = 0;
    } else{
        angle -= range * Math.sign(angle);
        angle = Math.pow(angle,3);
    }
    cameraAnker.rotation.y = - angle;
});
*/


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

   
    floor.offset.y -= worldMove;

    //torusMask.rotation.y += deltaTime;
    
    updateLights(worldMove, deltaTime);

    renderer.clear();
	composer.render();
    if (fox.animationMixer){
        fox.animationMixer.update(deltaTime);
        //fox.fox!.rotation.y += 0.01;
        //(cube as THREE.Mesh).rotation.y += 0.01;
        (fox.fox!.material as THREE.ShaderMaterial).uniforms.time.value += 400*deltaTime;
        //flameMask.rotation.y += worldMove * 0.01;
    }
    fox.updatePos(floor,lights, deltaTime);
    
    particles.update(deltaTime);

    //lightThing.rotation.y += 0.01;
    //fox.genTextures(renderer);
    //console.log(testLicht!.position.x,testLicht!.position.y,testLicht!.position.z);
    
   //console.log(fox); 
   //cssRender.render(scene, camera);*/
}

//renderer.render(scene,camera);
