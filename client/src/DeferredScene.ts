import * as THREE from 'three';
import DeferredMaterial from './DeferredMaterial';

export default class DeferredScene extends THREE.Scene {
    readonly lightMap: Map<THREE.Light, THREE.Light> = new Map();
    readonly meshes: THREE.Mesh[] = [];
    readonly clonedLights = new THREE.Group();
    readonly shadowCamera: THREE.Camera;

    constructor() {
        super();
        this.shadowCamera = new THREE.OrthographicCamera(-20,20,20,-20,0,30);

        this.shadowCamera.position.set(0,10,10);
        this.shadowCamera.rotation.x = -0.5* Math.PI;
        this.add(this.shadowCamera);
      }
    
      add(...objects: THREE.Object3D[]) {
        objects.forEach(object => {
          this._traverseAndAdd(object);
        });
        return super.add(...objects);
      }
    
      remove(...objects: THREE.Object3D[]) {
        objects.forEach(object => {
          this._traverseAndRemove(object);
        });
        return super.remove(...objects);
      }
    
      _traverseAndAdd(object: THREE.Object3D, recusive = false) {
        if (object instanceof THREE.Light) {
          let lightClone = object.clone();
          this.clonedLights.add(lightClone);
          this.lightMap.set(object, lightClone);
        } else if ((object as THREE.Mesh).isMesh){
          let mesh = object as THREE.Mesh;
          this.meshes.push(mesh);
          (mesh.material as DeferredMaterial).uniforms.viewShadowMatrix.value = this.shadowCamera.matrixWorldInverse;
          (mesh.material as DeferredMaterial).uniforms.projectionShadowMatrix.value = this.shadowCamera.projectionMatrix;
        }

        for(let child of object.children){
          this._traverseAndAdd(child, true);
        }
      }
    
      _traverseAndRemove(object: THREE.Object3D) {
        if (object instanceof THREE.Light) {
          let lightClone = this.lightMap.get(object);
          if (lightClone) {
            this.clonedLights.remove(lightClone);
            this.lightMap.delete(object);
          }
        } else if( object instanceof THREE.Mesh){
          let meshIndex = this.meshes.indexOf(object);
          if(meshIndex > -1){
            this.meshes.splice(meshIndex,1);
          }
        }
        if (object.children) {
          object.children.forEach(child => this._traverseAndRemove(child));
        }
      }
    
      updateLightTransforms(camera: THREE.Camera) {
        this.lightMap.forEach((targetLight, sourceLight) => {
          sourceLight.updateMatrixWorld(true);
          sourceLight.getWorldPosition(targetLight.position);
          sourceLight.getWorldQuaternion(targetLight.quaternion);
          sourceLight.getWorldScale(targetLight.scale);
          targetLight.applyMatrix4(camera.matrixWorldInverse);
          targetLight.intensity = sourceLight.intensity;
        });
      }
    }
