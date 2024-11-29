import * as THREE from 'three';
import DeferredMaterial from './DeferredMaterial';
import fragmentShader from './shaders/deferredMat.frag'
import vertexShader from './shaders/terrainMat.vert'
import { TerrainNoise } from './TerrainNoise';

export class TerrainGeometry extends THREE.BufferGeometry{
    private gaussSum(x:number):number{
        x = Math.max(x,0);
        return (x*x + x)/2; 
    }

    get isLoaded(){
        return this._isLoaded;
    }

    private _isLoaded = false;

    private imgData?: Uint8ClampedArray;
    private imgWidth?: number;
    public offssetX = 0;

    public offssetZ = 0;

    applyHeight( filterSize:number = 18, filterPresicion = 3){
        
        /*let verticies = this.getAttribute("position");

        let divider = 1/(filterPresicion**2);

        
        for(let i = 0; i < verticies.count; i++){
            let currHight = verticies.getY(i);

           
            verticies.setY(i, this.getHeightAt(x,z));
        }
        
        //this.computeTangents();
            //this.computeVertexNormals();
        this.attributes.position.needsUpdate = true;*/
    }

    constructor(){
        //const buffMaterial = new THREE.MeshBasicMaterial({wireframe: true});


        let verticies: number[] = [];
        let uvs: number[] = [];
        let faces: number[] = [];

        
        let uvscale = 1;

        let mapScale = 4;

        super();
        
        /*for(let i = 1; i <= rings; i++){
            for(let j = 0; j <= 5; j++){
                let angle = 2 * Math.PI / 6 * j;
                let vert = [Math.sin(angle) * i * mapScale,0, Math.cos(angle) * i * mapScale];
                //console.log(Math.abs(Math.round(vert[2] * 4 * xyscale + 4096 * xyscale * 4 * vert[0])));
                //vert[1] = getHeight(this.imgData, canvas.width, vert[0], vert[2]);
                verticies.push(vert[0], vert[1], vert[2]);
                uvs.push(vert[0]* uvscale, vert[2] * uvscale);
                angle = 2 * Math.PI / 6 * (1+j);
                let vec = [Math.sin(angle) * i * mapScale - vert[0], 0, Math.cos(angle) * i * mapScale - vert[2]];
                for(let l = 1; l < i; l++){
                    let stopVert = [vert[0] + vec[0] * l/i, 0, vert[2] + vec[2] * l/i];
                    //stopVert[1] = getHeight(imgData, canvas.width, stopVert[0], stopVert[2]);
                    verticies.push(stopVert[0], stopVert[1], stopVert[2]);
                    uvs.push(stopVert[0] * uvscale, stopVert[2]* uvscale);
                }
            }
        }*/
       let size =  128;
       let ratio = 0;
        for(let density = 0; density < 4; density++){
            for(let z = size * ratio; z < size * 0.5 - 1/(2**density); z += 1/(2**density)){
                for(let x = size * ratio; x < size * (1-ratio) - 1/(2**density); x += 1/(2**density)){
                    let index = 0;
                    while(((verticies[index] < x && verticies[index + 2] == z) || (verticies[index + 2] < z)) && index < verticies.length ){
                        index += 3;
                    }
                    if(!(verticies[index] == x && verticies[index+2] == z)){
                        verticies.splice(index,0,x,0,z);
                    }
                }
            }
            ratio += 1/(2**(density+2));
        }
        verticies.forEach((x,i)=>{verticies[i] =  x * mapScale});
        for(let index = 0; index < verticies.length; index +=3){
            uvs.push(verticies[index], verticies[index+2]);
            if(verticies[index+2] != verticies[index+5]){
                continue;
            }

            let getVertecieAbove = (verteIndex: number)=>{
                let counter = verteIndex + 3;
                while((verticies[counter] != verticies[verteIndex]) && counter < verticies.length){
                    counter += 3;
                }
                return counter;
            };

            let topLeftIndex = getVertecieAbove(index);
            let topRightIndex = getVertecieAbove(index+3);
            
            if(topLeftIndex >= verticies.length - 2){
                continue;
            }

            if(verticies[topLeftIndex+2] - verticies[index + 2] > verticies[topRightIndex + 2] - verticies[index + 5]){
                //edge to highdensity Mesh on Left
                let aboveTopRight = getVertecieAbove(topRightIndex);
                faces.push(topRightIndex / 3,index/3 + 1,index/3);
                faces.push(topLeftIndex/3,topRightIndex / 3, index/3);
                faces.push(topLeftIndex / 3,aboveTopRight/3,topRightIndex/3);
            } else if(verticies[topLeftIndex+2] - verticies[index + 2] < verticies[topRightIndex + 2] - verticies[index + 5]){
                //edge to highdensity Mesh on Right
                let aboveTopLeft = getVertecieAbove(topLeftIndex);
                faces.push(topLeftIndex / 3,index/3 + 1,index/3);
                faces.push(index/3 + 1,topLeftIndex / 3, topRightIndex/3);
                faces.push(topRightIndex / 3,topLeftIndex/3,aboveTopLeft/3);
            } else if(verticies[topLeftIndex+3] - verticies[topLeftIndex] < verticies[index+3] - verticies[index]){
                //Edge to Hightdensity Mesh on Bottom
                faces.push(topLeftIndex/3,topLeftIndex/3 + 1,index/3);
                faces.push(topLeftIndex / 3 +1,index/3 + 1,index/3);
                faces.push(topLeftIndex / 3 +1,topLeftIndex/3 + 2,index/3 + 1);
            } else if(verticies[topLeftIndex+3] - verticies[topLeftIndex] > verticies[index+3] - verticies[index]){
                //edge to highdensity Mesh on Top
                faces.push(topLeftIndex / 3,index/3 + 1,index/3);
                faces.push(topLeftIndex/3,topLeftIndex/3 + 1,index/3 + 1);
                faces.push(topLeftIndex / 3 +1,index/3 + 2,index/3 +1);
            } else{
                faces.push(topRightIndex/3,index/3 + 1,index/3);
                faces.push(topLeftIndex/3,topRightIndex/3,index/3);
            }
        }
        console.log(faces);
        let count = 0;
        for(let index = 0; index < verticies.length; index+=3){
            if(verticies[index] == 2 && verticies[index + 2] == 2){
                count++;
            }
        }
        console.log(count);

        /*if((x<(512-1)) && (z < (512-1))){
            let start = x+z*512;
            faces.push(start,start+1,start+512+1);
            faces.push(start+512+1,start+1,start+512);
        }*/

        /*for(let i = 1; i <= rings; i++){
            for(let j = 1; j <=6*i; j ++){
                let down: number;
                faces.push( this.gaussSum(i-1)*6 + (j%(6*i) + 1), Math.max(this.gaussSum(i-2)*6 + ((j-1) - Math.floor((j - 1)/ i))%(6*Math.max(i-1,1)),0) + 1,this.gaussSum(i-1)*6 + j);
                if(i == 1){
                    faces[j * 3 - 2] = 0;
                }
                if(j%i != 0 ){
                    faces.push(Math.max(this.gaussSum(i-2)*6 + ((j-1) - Math.floor((j - 1)/ i) + 1)%(6*(i-1)),0) + 1, Math.max(this.gaussSum(i-2)*6 + ((j-1) - Math.floor((j - 1)/ i))%(6*(i-1)),0) + 1, this.gaussSum(i-1)*6 + (j%(6*i) + 1));
                }
            }
        }*/

        console.log(verticies);
        this.setAttribute("position", new THREE.BufferAttribute(new Float32Array(verticies),3));
        this.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uvs),2));

        this.setIndex(faces);
        this.drawRange = { start: 0, count: Infinity };

        this.computeVertexNormals();
        this.computeTangents();
            

        
        
        //this.applyHeight();
        //this.attributes.position.needsUpdate = true;
        //console.log(this.attributes);
        //this._isLoaded = true;
    }
}

export class TerrainMesh extends THREE.Mesh{

    material: TerrainMaterial;
    private imgData?: Uint8ClampedArray;
    private imgWidth: number;
    isTerrainMesh = true;

    private xyscale = 10;
    private yscale = 0.03;

    set offset(offset: THREE.Vector2){
        if ((this.material.uniforms.uvOffset.value as THREE.Vector2).isVector2){
            (this.material.uniforms.uvOffset.value as THREE.Vector2).copy(offset);
        }
    }

    get offset(): THREE.Vector2{
        return this.material.uniforms.uvOffset.value;
    }

    constructor(width = 4096, height = 4096){


        let material = new TerrainMaterial({color: new THREE.Color(1.0, 0.921, 0.418), poissonDisk: TerrainMesh.genPersisionDisk(width) });
        let geometry = new TerrainGeometry();
        super(geometry,material);
        this.material = material;
        this.imgWidth =width;

        /*let canvas = document.createElement("canvas");
        canvas.height = terrainHeightImage.height;
        canvas.width = terrainHeightImage.width;
        let ctx = canvas.getContext("2d")!;
        ctx.drawImage(terrainHeightImage, 0,0);
        this.imgData = ctx.getImageData(0,0, canvas.width, canvas.height,).data;*/
    }

    generateTerrain(renderer: THREE.WebGLRenderer){
        let noise = new TerrainNoise(this.imgWidth,this.imgWidth);
        noise.renderNoise(renderer);

        let terrainHeightTexture = new THREE.FramebufferTexture(this.imgWidth,this.imgWidth);
        renderer.copyFramebufferToTexture(terrainHeightTexture);
        terrainHeightTexture.generateMipmaps = false;
        terrainHeightTexture.flipY = false;
        terrainHeightTexture.minFilter = THREE.LinearFilter;

        this.material.uniforms.terrainImage.value= terrainHeightTexture;
        this.material.defines.TERRAIN_IMAGE_SIZE = this.imgWidth;

        this.imgData = new Uint8ClampedArray(this.imgWidth*this.imgWidth*4);
        renderer.readRenderTargetPixels(noise.rendererTarget,0,0,this.imgWidth,this.imgWidth, this.imgData!);
    }

    private static genPersisionDisk(texSize:number, size:number = 5): string{
        let perssion = "";
        let texelSize = 1.0/texSize;
        for(let x = -(size - 1) / 2; x <= (size - 1) / 2; x++){
            for(let y = -(size - 1) / 2; y <= (size - 1) / 2; y++){
                perssion += "vec2(" + (x*texelSize).toString() + "," + (y*texelSize).toString() +"),";
            }
        }
        perssion = perssion.substring(0,perssion.length - 1);
        console.log(perssion);
        return perssion;
    }

    getHeightAtLocal(x:number,z:number):number{
        let pixelX = ((Math.round((x + this.offset.x ) * this.xyscale )%this.imgWidth! + this.imgWidth! ) % this.imgWidth!);
        let pixelY = ((Math.round((z + this.offset.y )*this.xyscale )%this.imgWidth!  + this.imgWidth! ) % this.imgWidth!);

        return this.imgData![(pixelX * 4  + (this.imgWidth! * 4) * pixelY)] * this.yscale;
    }

    getNormalAtLocal(position: THREE.Vector3, target: THREE.Vector3):THREE.Vector3{
        let xNormalEnd = new THREE.Vector3(1,0.0,0.0).add(position);
        xNormalEnd.y = this.getHeightAtLocal(xNormalEnd.x, xNormalEnd.z);
    
        let zNormalEnd = new THREE.Vector3(0.0,0.0,1).add(position);
        zNormalEnd.y = this.getHeightAtLocal(zNormalEnd.x, zNormalEnd.z);
    
        let normalStart = new THREE.Vector3(position.x, this.getHeightAtLocal(position.x, position.z), position.z);
    
        target.crossVectors(zNormalEnd.sub(normalStart),(xNormalEnd.sub(normalStart)));
        target.normalize();
        return target;
    }

    getHeightAtWorld(point: THREE.Vector3):number{
        let localPos = this.worldToLocal(point.clone());
        localPos.y = this.getHeightAtLocal(localPos.x, localPos.z);
        return this.localToWorld(localPos).y;
    }

    getNormalAtWorld(point: THREE.Vector3, target: THREE.Vector3):THREE.Vector3{
        let localPos = this.worldToLocal(point.clone());
        return this.getNormalAtLocal(localPos,target);
    }
}

export class TerrainMaterial extends THREE.RawShaderMaterial{
    private _color: THREE.ColorRepresentation;

    constructor(config: {normalmap?: THREE.Texture, terrainImage?: THREE.Texture, color?: THREE.ColorRepresentation,poissonDisk:string, vertexColors?: boolean}){

        if(config.color == undefined){
            config.color = new THREE.Color(1,1,1);
        }

        let uniforms:{ [uniform: string]: THREE.IUniform<any> }[] = [
            THREE.UniformsLib.normalmap,
            { uvOffset: new THREE.Uniform(new THREE.Vector2(0,0))},
            { color: {value: config.color}},
            { viewShadowMatrix: {value: new THREE.Matrix4()}},
            { projectionShadowMatrix: {value: new THREE.Matrix4()}},
            { terrainImage: {value: config.terrainImage}}
        ];

        let defines: {[k: string]: any}= {
            TERRAIN_IMAGE_SIZE: undefined,
            POISSON_DISK: config.poissonDisk
        };

        if(config.normalmap) defines.HAS_NORMALMAP = undefined;
        if(config.vertexColors) defines.HAS_VERTEX_COLORS = undefined;

        super({
            name: "G-Buffer DefferedMat",
            uniforms: THREE.UniformsUtils.merge(uniforms),
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            glslVersion: THREE.GLSL3,
            defines: defines
        });
        
        
        this._color = config.color;
    }

    get color(){
        return this._color;
    }

    set normal(texuture: THREE.Texture){
        this.defines.HAS_NORMALMAP = undefined;
        this.uniforms.normalMap.value = texuture;
        this.needsUpdate = true;
    }

    set color(color: THREE.ColorRepresentation){
        this.color = color;
        this.uniforms.color.value = this._color;
    }
}