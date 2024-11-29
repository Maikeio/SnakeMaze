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
import {MaskPass, ClearMaskPass} from 'three/examples/jsm/postprocessing/MaskPass';
import {ClearPass} from 'three/examples/jsm/postprocessing/ClearPass';
import {TexturePass} from 'three/examples/jsm/postprocessing/TexturePass';
let camera :THREE.PerspectiveCamera;
let composer : EffectComposer;
let renderer: THREE.WebGLRenderer;
let box:THREE.Mesh, torus : THREE.Mesh;

init();

function init() {

    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.z = 5;

    const scene1 = new THREE.Scene();

    box = new THREE.Mesh( new THREE.BoxGeometry( 4, 4, 4 ) );
    scene1.add( box );
    box.position.z = -5;//


    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor( 0xe0e0e0 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setAnimationLoop( animate );
    renderer.autoClear = false;
    document.body.appendChild( renderer.domElement );

    //

    const clearPass = new ClearPass();

    const clearMaskPass = new ClearMaskPass();

    const maskPass1 = new MaskPass( scene1, camera );

    const texture1 = new THREE.TextureLoader().load( './dev.png' );

    const texturePass1 = new TexturePass( texture1 );

    const outputPass = new OutputPass();

    const parameters = {
        stencilBuffer: true
    };

    const renderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, parameters );

    composer = new EffectComposer( renderer, renderTarget );
    composer.addPass( clearPass );
    composer.addPass( maskPass1 );
    composer.addPass( texturePass1 );
    composer.addPass( clearMaskPass );
    composer.addPass( outputPass );

    window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize( width, height );
    composer.setSize( width, height );

}

function animate() {

    const time = performance.now() * 0.001 + 6000;

    box.position.x = Math.cos( time / 1.5 ) * 2;
    box.position.y = Math.sin( time ) * 2;
    box.rotation.x = time;
    box.rotation.y = time / 2;

    torus.position.x = Math.cos( time ) * 2;
    torus.position.y = Math.sin( time / 1.5 ) * 2;
    torus.rotation.x = time;
    torus.rotation.y = time / 2;

    renderer.clear();
    composer.render( time );

}