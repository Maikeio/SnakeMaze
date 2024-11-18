import * as THREE from 'three';
import {Pass, FullScreenQuad} from 'three/examples/jsm/postprocessing/Pass';
import ShadowMaterial from './ShadowMaterial';
import lightingFragment from './shaders/forwardMerge.frag';
import lightingVertex from './shaders/lightingPass.vert';

export default class DeferredForwardPass extends Pass {

    camera: THREE.Camera;
    scene: THREE.Scene;
    private readonly fsQuad: FullScreenQuad;
    private readonly deferredRenderPassTarget: THREE.WebGLRenderTarget;

    constructor(scene: THREE.Scene, camera: THREE.Camera, deferredRenderPassTarget: THREE.WebGLRenderTarget){
        super();
        this.camera = camera;
        this.scene = scene;
		this.needsSwap = false;
        this.deferredRenderPassTarget = deferredRenderPassTarget;

        this.fsQuad = new FullScreenQuad(new THREE.ShaderMaterial({
            uniforms:{
                deferredDepth: {value: deferredRenderPassTarget.depthTexture},
                forwardDepth: {value: deferredRenderPassTarget.depthTexture},
                forwardTexture: {value:deferredRenderPassTarget.depthTexture}
            },
            vertexShader:lightingVertex,
            fragmentShader: lightingFragment
        }));
    }

    drawEmptyStencil(renderer: THREE.WebGLRenderer){
        const state = renderer.state;
		const context = renderer.getContext();

        state.buffers.color.setMask( false );
		state.buffers.depth.setMask( false );

        state.buffers.stencil.setTest( true );
		state.buffers.stencil.setOp( context.REPLACE, context.REPLACE, context.REPLACE );
		state.buffers.stencil.setFunc( context.ALWAYS, 1, 0xffffffff );
		state.buffers.stencil.setClear( 0 );
		state.buffers.stencil.setLocked( true );


		renderer.setRenderTarget( this.deferredRenderPassTarget );
		renderer.render( new THREE.Object3D(), this.camera );


        state.buffers.color.setLocked( false );
		state.buffers.depth.setLocked( false );

		state.buffers.color.setMask( true );
		state.buffers.depth.setMask( true );

		// only render where stencil is set to 1

		state.buffers.stencil.setLocked( false );
		state.buffers.stencil.setFunc( context.EQUAL, 1, 0xffffffff ); // draw if == 1
		state.buffers.stencil.setOp( context.KEEP, context.KEEP, context.KEEP );
		state.buffers.stencil.setLocked( true );
    }

    render( renderer: THREE.WebGLRenderer, writeBuffer: THREE.WebGLRenderTarget, readBuffer: THREE.WebGLRenderTarget){
        //this.drawEmptyStencil(renderer);
        //console.log(this.deferredRenderPassTarget.depthTexture);
        //writeBuffer.depthTexture = new THREE.DepthTexture(1024,1024);
        renderer.setRenderTarget(this.deferredRenderPassTarget);
        //renderer.clearDepth();
        let context = renderer.getContext();
        //readBuffer.depthBuffer = false;
        /*const readBufferProps = renderer.properties.get(readBuffer);
        let depthReadBuffer = readBufferProps.__webglDepthRenderbuffer || readBufferProps.__webglDepthbuffer;
        if ( depthReadBuffer ) {
            context.framebufferRenderbuffer( context.FRAMEBUFFER, context.STENCIL_ATTACHMENT, context.RENDERBUFFER, depthReadBuffer );
        }*/

        renderer.setRenderTarget(readBuffer);
        const renderBufferProps = renderer.properties.get(this.deferredRenderPassTarget);
        let depthRenderBuffer = renderBufferProps.__webglDepthRenderbuffer || renderBufferProps.__webglDepthbuffer;

        if ( depthRenderBuffer ) {
            context.framebufferRenderbuffer( context.FRAMEBUFFER, context.DEPTH_STENCIL_ATTACHMENT, context.RENDERBUFFER, depthRenderBuffer );
        }
        
        renderer.render(this.scene,this.camera);

        if ( depthRenderBuffer ) {
            context.framebufferRenderbuffer( context.FRAMEBUFFER, context.DEPTH_STENCIL_ATTACHMENT, context.RENDERBUFFER, null );
        }

        //renderer.autoClearColor = false;
        //renderer.autoClearDepth = false;

        /*(this.fsQuad.material as THREE.ShaderMaterial).uniforms.forwardDepth.value = writeBuffer.depthTexture;

        renderer.setRenderTarget(readBuffer);
        //console.log(this.deferredRenderPassTarget.depthTexture);
        (this.fsQuad.material as THREE.ShaderMaterial).uniforms.deferredDepth.value = this.deferredRenderPassTarget.depthTexture;
        (this.fsQuad.material as THREE.ShaderMaterial).uniforms.forwardTexture.value = writeBuffer.texture;
        this.fsQuad.render(renderer);
        //writeBuffer.depthTexture = null;
        /*let _gl = renderer.getContext();

        renderer.autoClearColor = false;

        (this.fsQuad.material as THREE.MeshBasicMaterial).map = readBuffer.texture;
        
        renderer.setRenderTarget( writeBuffer );
        this.fsQuad.render(renderer);

        let renderBufferProps = renderer.properties.get( readBuffer );
        let depthRenderBuffer = renderBufferProps.__webglDepthRenderbuffer || renderBufferProps.__webglDepthbuffer;

        if ( depthRenderBuffer ) 
            _gl.framebufferRenderbuffer( _gl.FRAMEBUFFER, _gl.DEPTH_ATTACHMENT, _gl.RENDERBUFFER, depthRenderBuffer );

        renderer.autoClearDepth = false;

        renderer.render(this.scene,this.camera);

        if ( depthRenderBuffer ) 
            _gl.framebufferRenderbuffer( _gl.FRAMEBUFFER, _gl.DEPTH_ATTACHMENT, _gl.RENDERBUFFER, null );
        */
        //renderer.autoClearDepth = true;
        //renderer.autoClearColor = true;
    }
}