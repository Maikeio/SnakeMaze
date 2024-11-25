import * as THREE from 'three';
import { TextureToScreen } from './TextureToScreen';


export class FlipBookRenderer{

    renderFunc: (renderer: THREE.WebGLRenderer)=>void;

    readonly texture: THREE.FramebufferTexture;
    readonly widthCount: number;
    readonly targetResolution: number;

    constructor(renderFunc:(renderer: THREE.WebGLRenderer)=>void, widthCount:number, targetResolution:number){
        this.renderFunc = renderFunc;
        this.widthCount = widthCount;
        this.targetResolution = targetResolution;
        this.texture = new THREE.FramebufferTexture(widthCount*targetResolution, widthCount*targetResolution);
    }

    render(renderer: THREE.WebGLRenderer, toScreen = false){
        this.texture.minFilter = THREE.LinearMipMapLinearFilter;
        this.texture.magFilter = THREE.LinearFilter;
        this.texture.generateMipmaps = true;
        this.texture.needsUpdate = true;
        let renders = 0;

        renderer.autoClear = false;

        let res = this.targetResolution;
        let count = this.widthCount;

        while(renders < (count**2)){
            
            this.renderFunc(renderer);

            renderer.copyFramebufferToTexture(this.texture, new THREE.Vector2(-Math.floor(renders/count)*res,-(renders%count)*res));
            renders += 1;
        }

        this.texture.needsUpdate = true;

        if(toScreen){
            let textureToScreen = new TextureToScreen(this.texture);
            textureToScreen.render(renderer);
        }
    }
}