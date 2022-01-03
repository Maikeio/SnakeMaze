import * as THREE from '/libs/three.module.js'; 

var scene = new THREE.Scene(); 
var clock = new THREE.Clock();
var deltaTime;

//define Renderer
var renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    antialias:true,
});
renderer.setClearColor("#000000");  
renderer.setSize( window.innerWidth, window.innerHeight );  
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;


//define Camera
var camera = new THREE.PerspectiveCamera( 50, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.set(5, 5, 5);
camera.lookAt(1,0,1);

//define Lights
const DirectLight = new THREE.DirectionalLight(0xFFFFFF, 1);
DirectLight.position.set(5,10,-5);
DirectLight.shadow.camera.zoom = 0.3; // default
DirectLight.castShadow = true;
DirectLight.shadow.mapSize.width = 1024; // default
DirectLight.shadow.mapSize.height = 1024
scene.add(DirectLight)

const AntiDirectLight = new THREE.DirectionalLight(0xFFFFFF, 0.1);
AntiDirectLight.position.set(5,10,-5);
AntiDirectLight.shadow.camera.zoom = 0.3; // default

scene.add(AntiDirectLight);

const light = new THREE.AmbientLight(0xFFFFFF, 0.3);
scene.add(light)

var geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
var material = new THREE.MeshStandardMaterial({ color: "#433F81" });
var cube = new THREE.Mesh(geometry, material);
cube.castShadow = true; //default is false
cube.receiveShadow = true;

var blockGeometry = new THREE.BoxGeometry(1, 1, 1);
var blockMaterial = new THREE.MeshStandardMaterial();
blockMaterial.map = new THREE.TextureLoader().load("models/rock_default.png")
blockMaterial.normalMap = new THREE.TextureLoader().load("models/SandNormal.png")
blockMaterial.normalScale.set(0.3,0.3);
var block = new THREE.Mesh(blockGeometry, blockMaterial);
block.castShadow = true; //default is false
block.receiveShadow = true;
block.position.y = -0.8;

// Add cube to Scene  
scene.add(block);
scene.add(cube);
function render(){
    deltaTime = clock.getDelta();
    cube.rotation.y += deltaTime * 0.5;
    block.rotation.y += deltaTime * 0.5;
    renderer.render(scene, camera);  
    requestAnimationFrame(render);
}


function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize( width, height );
}  

window.addEventListener( 'resize', onWindowResize );
render();