import * as THREE from 'three';
import SandMaterial from './SandMaterial';
import TerrainGeometry from './TerrainGeometry';

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xffffff, 10, 115 );
scene.background = new THREE.Color(0xa4feff);
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(window.devicePixelRatio * 1.2);
document.body.appendChild( renderer.domElement );

let normal = new THREE.TextureLoader().load("./sand_nor.png")
let devTex = new THREE.TextureLoader().load("./dev.png")

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshStandardMaterial( { color: 0x00ff00, normalMap: normal, opacity:0, transparent: true });
const cube = new THREE.Mesh( geometry, material );

const buffMaterial = new SandMaterial({
    normalmap: normal
  });
buffMaterial.side = THREE.BackSide;

let image = new Image();
image.src = "./heightmap.png"


const bufferGeometry = new TerrainGeometry(image,()=>{

    const floor = new THREE.Mesh(bufferGeometry, buffMaterial);
    floor.position.y = -2.5;
    //floor.scale.set(2,1,2);

    scene.add( floor );
});


const light = new THREE.DirectionalLight(0xffffff);
scene.add( cube );
scene.add(light);
scene.add(new THREE.AmbientLight(0xff55ff));

camera.position.set(0,3,75);

function animate() {

	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;
    if(bufferGeometry.isLoaded){
        bufferGeometry.offssetZ -= 0.3;
        bufferGeometry.applyHeight();
        buffMaterial.uniforms.uvOffset.value.y -= 0.03;
    }

    requestAnimationFrame(animate);
	renderer.render( scene, camera );
}

renderer.render(scene,camera);
animate();