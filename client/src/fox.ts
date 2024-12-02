import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import DeferredMaterial from './DeferredMaterial';
import FurrMaterial from './FurrMaterial';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { PerlinNoise } from './PerlinNoise';
import { FlameRenderer } from './FlameRenderer';
import { TextureToScreen } from './TextureToScreen';
import { TerrainGeometry, TerrainMesh } from './Terrain';
import FlameLight from './FlameLight';
let skelet: THREE.Skeleton;

export default class Fox{

    readonly loader = new GLTFLoader();
    animationMixer?: THREE.AnimationMixer;
    private readonly raycaster = new THREE.Raycaster;
    private readonly worldPos = new THREE.Vector3();
    private readonly rayStart = new THREE.Vector3();
    private readonly downVec = new THREE.Vector3(0,-1,0);
    private readonly upVec = new THREE.Vector3(0,1,0);
    private readonly rotationAxis = new THREE.Vector3();
    texture = new THREE.FramebufferTexture(256*6, 256*6);

    noise = new PerlinNoise(128,128);
    fox?: THREE.SkinnedMesh;
    private velocity = 0;
    private light?: THREE.PointLight;
    async load(): Promise<THREE.Object3D>{

        const loader = new GLTFLoader();
        let gltf = await loader.loadAsync("./fox.glb");
        let data = gltf.scene.children[0];
        data.children.forEach((child)=>{
            let skinMesh = child as THREE.SkinnedMesh;
            if(skinMesh.isSkinnedMesh){
                skelet = skinMesh.skeleton;
                skelet.computeBoneTexture();
                this.fox = skinMesh;

                skinMesh.material = new FurrMaterial({color:new THREE.Color(0xffffff), skeleton: skelet, vertexColors: true});
                (skinMesh.material as FurrMaterial).vertexCount = skinMesh.geometry.attributes.position.count; 
                let meshes = [skinMesh.geometry];
                for (let i = 0; i < 20; i++){
                    meshes.push(skinMesh.geometry.clone());
                }
                skinMesh.geometry = mergeGeometries(meshes)
                skinMesh.geometry.computeVertexNormals();
                skinMesh.geometry.computeBoundingSphere();
                skinMesh.geometry.computeTangents();
                skinMesh.frustumCulled = false;
            }
        });
        this.fox!.scale.multiplyScalar(0.5);
        this.fox!.position.z = -4;
        this.fox!.position.x = 0;
        this.fox!.rotation.y = Math.PI;
        this.animationMixer = new THREE.AnimationMixer( gltf.scene );
        console.log(gltf.animations);
        this.animationMixer.clipAction( gltf.animations[ 2 ] ).play();
        this.animationMixer.timeScale = 3;
        return gltf.scene;
    }

    updatePos(floor: TerrainMesh, lights: [THREE.PointLight,FlameLight][], deltaTime: number){
        if(!this.fox){
            return;
        }
        if(this.light && (this.light.position.z > (this.fox!.position.z+4))){
            this.light = undefined;
        }
        let trys = 0;
        while(!this.light && trys < lights.length*4){
            trys++;
            this.light = lights[Math.floor(Math.random()*lights.length)][0];
            if(this.light.position.z > this.fox!.position.z){
                this.light = undefined;
                continue;
            }
            if(Math.abs(this.light.position.x) > 12){
                this.light = undefined;
                continue;
            }
            if(this.light.position.distanceTo(this.fox!.position) > 20){
                this.light = undefined;
                continue;
            }
        }
        if((this.fox!.material as FurrMaterial).glowPercantage <= 2.0){
            (this.fox!.material as FurrMaterial).glowPercantage -= 0.05;
        }
        this.fox!.getWorldPosition(this.worldPos);
        this.worldPos.z += 1.5;

        let newHeight = (floor.getHeightAtWorld(this.worldPos) + 0.35);

        this.fox!.position.y =  this.fox!.position.y * 0.2 + newHeight * 0.8;

        if(this.light){
            this.velocity = Math.max(Math.min(this.velocity + Math.sign(this.light!.position.x - this.fox!.position.x)* 0.003, 0.1),-0.1);
            let distToLight = this.light.position.distanceTo(this.fox!.position);
            if(distToLight < 6){
                this.light.position.lerp(this.fox!.position,(1/(distToLight)**2)*2.0);
                this.light.scale.lerp(new THREE.Vector3(),(1/(distToLight)**2)*2.0);
            }
            if(distToLight < 2){
                this.light.position.z = 120;

                (this.fox!.material as FurrMaterial).glowColor = this.light.color;

                (this.fox!.material as FurrMaterial).glowPercantage = 2.0;
                this.light.scale.set(1,1,1);
                this.light = undefined;
            }
            
        } else {
            this.velocity -= Math.sign(this.velocity)*0.001;
        }
        this.fox!.position.x += this.velocity;
        //console.log(this.light);
        
        let normal = floor.getNormalAtWorld(this.worldPos,new THREE.Vector3());
        
        let angle = Math.atan(normal!.z/normal!.y);

        //angle *= Math.sign(normal!.x);
        this.fox!.rotation.x = angle;
        this.fox!.rotation.y = Math.PI - this.velocity * 4;
        
        //console.log(fox.rotation.x)*/;
    }

    genTextures(renderer: THREE.WebGLRenderer){
        
        let rendererConf = {flameCount:4,innerFlameCount:4,mainFlameWidth:1.5,flameHeight:1,windStrenght:0};
        const flamesRenderer = new FlameRenderer(256,256, this.noise.texture,undefined,rendererConf);
        //this.texture = new THREE.FramebufferTexture(256*6, 256*6);
        this.texture.minFilter = THREE.LinearMipMapLinearFilter;
        this.texture.magFilter = THREE.LinearFilter;
        this.texture.generateMipmaps = true;
        this.texture.needsUpdate = true;
        console.log("hihi",this.texture.image);
        let renders = 0;
        renderer.autoClear = false;
        renderer.clear();
        this.noise.renderNoise(renderer);
        while(renders < (6**2)){

            this.noise.material.uniforms.uvOffset.value.y -= 0.006;
            flamesRenderer.renderFlames(renderer);
            
            renderer.copyFramebufferToTexture(this.texture!, new THREE.Vector2(-Math.floor(renders/6)*256,-(renders%6)*256));
            renderer.clear();
            this.noise.renderNoise(renderer);
            renders += 1;
        }

        this.texture.needsUpdate = true;
        //renderer.autoClear = true;
        renderer.clear();


        let textureToScreen = new TextureToScreen(flamesRenderer.texture);
        this.noise.renderNoise(renderer);
        flamesRenderer.renderFlames(renderer);
        //textureToScreen.render(renderer);

        //this.noise.dispose();
    }

    setGeneratedTexture(){

        (this.fox!.material as FurrMaterial).setFlames(this.texture);
    }
}