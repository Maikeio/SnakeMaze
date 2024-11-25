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
//camera.position.set(0,4.5,60);
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
const fox = new Fox();
fox.load().then(async (result)=>{

    fox.genTextures(renderer);
    scene.add(result);

   //buffMaterial.side = THREE.DoubleSide;

    /*let image = new Image();

    image.src = "./heightmap.png";
    await image.decode();*/

    

    //console.log("hi",noise.texture.image);
    floor = new TerrainMesh(normal);
    floor.position.y = -3;
    floor.position.x = -256;
    floor.position.z = -240;
    //floor.position.z = 40;
    //floor.rotation.x = -0.5*Math.PI;
    //floor.scale.set(10,1,10);
    floor.generateTerrain(renderer);

    //scene.add( floor );

    const cubeGeo = new THREE.PlaneGeometry(1.5,100,100);
    cubeGeo.computeTangents();
    cubeGeo.computeVertexNormals();
    const cubeMat = new DeferredMaterial();
    cube = new THREE.Mesh(cubeGeo, fox!.fox!.material);
    cube.position.set(0,3,50);
    //scene.add(cube);

    /*let points = [
        0,-1,0,
        -1,0,-1,
        -1,0,1,
        1,0,1,
        1,0,-1,
        0,3,0];
        
    let uvs = [
        0.5,0,
        0,0.5,
        0.333,0.5,
        0.666,0.5,
        1.0,0.5,
        0.5,1
    ];

    let faces = [
        0,2,1,
        0,3,2,
        0,4,3,
        0,1,4,

        2,5,1,
        3,5,2,
        4,5,3,
        1,5,4];*/

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

    let geometry = new THREE.BufferGeometry();

    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(points),3));
    geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uvs),2));
    geometry.setAttribute("colorMix", new THREE.BufferAttribute(new Float32Array(colorMix),1));

    geometry.setIndex(faces);
    geometry.drawRange = { start: 0, count: Infinity };
    geometry.computeVertexNormals();
    geometry.computeTangents();

    let flameMaterial = new FlameLightMaterial({color:new THREE.Color(0xff0000)});
    flameMaterial.uniforms.flameMap.value = (fox.fox!.material as FurrMaterial).uniforms.flameMap.value;
    (flameMaterial.uniforms.uvScale.value as THREE.Vector2).set(4,4);
    lightThing = new THREE.Mesh(geometry,flameMaterial);
    (lightThing.material as DeferredMaterial).side = THREE.BackSide;
    //(lightThing.material as DeferredMaterial).transparent = true;

    

    let flameMaksPlane= [new THREE.PlaneGeometry(4,4),new THREE.PlaneGeometry(4,4)];
    flameMaksPlane[1].rotateY(Math.PI*0.5);
    
    let maskMaterial  = new FlameLightMaterial({color:new THREE.Color(0xff0000)});
    maskMaterial.uniforms.flameMap.value = flipBook.texture;
    //maskMaterial.uniforms.flameMap = (fox.fox!.material as FurrMaterial).uniforms.flameMap;
    maskMaterial.side = THREE.DoubleSide;
    flameMask = new THREE.Mesh(mergeGeometries(flameMaksPlane),maskMaterial);
    flameMask.position.y = 1;
    maskScene.add(flameMask);

    //let torusMask = new THREE.Mesh( new THREE.TorusGeometry( 3, 1, 16, 32 ) );
    torusMask = new THREE.Mesh(new THREE.BoxGeometry(2,2,2));
    torusMask.position.z = -5;
    //maskScene.add(torusMask);

    forScene.add(lightThing);


    clock.start();

    //onWindowResize();
    animate();
});
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

    torusMask.rotation.y += deltaTime;
    
    updateLights(worldMove);

    renderer.clear();
	composer.render();
    if (fox.animationMixer){
        fox.animationMixer.update(deltaTime);
        //fox.fox!.rotation.y += 0.01;
        //(cube as THREE.Mesh).rotation.y += 0.01;
        (fox.fox!.material as THREE.ShaderMaterial).uniforms.time.value += 400*deltaTime;
        (lightThing.material as FlameLightMaterial).uniforms.time.value += 400*deltaTime;
        (flameMask.material as FlameLightMaterial).uniforms.time.value += 400*deltaTime;
        flameMask.rotation.y += worldMove * 0.01;
    }
    fox.updatePos(floor,lights, deltaTime);
    
    particles.update(deltaTime);

    lightThing.rotation.y += 0.01;
    //fox.genTextures(renderer);
    //console.log(testLicht!.position.x,testLicht!.position.y,testLicht!.position.z);
    
   //console.log(fox); 
   //cssRender.render(scene, camera);*/
}

//renderer.render(scene,camera);
