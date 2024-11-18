import * as THREE from 'three';
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass';
import textureToScreen from './shaders/textureToScreen.frag';
import vertexShader from './shaders/lightingPass.vert';

export class TextureToScreen{
    matieral: THREE.ShaderMaterial;
    fsq = new FullScreenQuad();

    constructor(texture: THREE.Texture){
        this.matieral = new THREE.ShaderMaterial({
            uniforms:{
                inTexture:{value:texture},
                ratio:{value:0.5}
            },
            fragmentShader: textureToScreen,
            vertexShader: vertexShader
        });
        this.fsq.material = this.matieral;
    }

    render(renderer: THREE.WebGLRenderer){
        let size = renderer.getSize(new THREE.Vector2());
        this.matieral.uniforms.ratio.value = size.x / size.y;
        renderer.setRenderTarget(null);
        this.fsq.render(renderer);
    }
}