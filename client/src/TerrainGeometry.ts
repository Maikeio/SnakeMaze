import * as THREE from 'three';
import SandMaterial from './SandMaterial';

export default class TerrainGeometry extends THREE.BufferGeometry{
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
    public xyscale = 10;
    public yscale = 0.02;
    public offssetX = 200;

    public offssetZ = 200;

    applyHeight(){
        
        let verticies = this.getAttribute("position");
        
        for(let i = 0; i < verticies.count; i++){
            let currHight = verticies.getY(i);

            let x = (Math.round((verticies.getX(i) + this.offssetX) * this.xyscale)%this.imgWidth! + this.imgWidth! ) % this.imgWidth!;
            let z = (Math.round((verticies.getZ(i) + this.offssetZ) * this.xyscale)%this.imgWidth!  + this.imgWidth! ) % this.imgWidth!;

            let newHight = this.imgData![(x * 4  + this.imgWidth! * 4 * z)] * this.yscale;

            verticies.setY(i, 0.1 * newHight + 0.9* currHight);
        }
        
        this.computeVertexNormals();
        this.attributes.position.needsUpdate = true;
    }

    constructor(heightImage:HTMLImageElement,loaded: ()=>any, rings = 50){
        //const buffMaterial = new THREE.MeshBasicMaterial({wireframe: true});


        let verticies: number[] = [0,0,0];
        let faces: number[] = [];
        let uvs: number[] = [];

        
        let uvscale = 0.1;

        let mapScale = 1.8;

        heightImage.onload = ()=>{
            let canvas = document.createElement("canvas");
            canvas.height = heightImage.height;
            canvas.width = heightImage.width;
            let ctx = canvas.getContext("2d")!;
            ctx.drawImage(heightImage, 0,0);
            this.imgData = ctx.getImageData(0,0, canvas.width, canvas.height).data;
            this.imgWidth = canvas.width;
            
            this.applyHeight();
            this.computeTangents();
            this.attributes.position.needsUpdate = true;
            console.log(this.attributes);
            this._isLoaded = true;
            loaded();
        }
        super();
        uvs.push(0,0);
            for(let i = 1; i <= rings; i++){
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
            }

            for(let i = 1; i <= rings; i++){
                for(let j = 1; j <=6*i; j ++){
                    let down: number;
                    faces.push(this.gaussSum(i-1)*6 + j, Math.max(this.gaussSum(i-2)*6 + ((j-1) - Math.floor((j - 1)/ i))%(6*Math.max(i-1,1)),0) + 1, this.gaussSum(i-1)*6 + (j%(6*i) + 1));
                    if(i == 1){
                        faces[j * 3 - 2] = 0;
                    }
                    if(j%i != 0 ){
                        faces.push(this.gaussSum(i-1)*6 + (j%(6*i) + 1), Math.max(this.gaussSum(i-2)*6 + ((j-1) - Math.floor((j - 1)/ i))%(6*(i-1)),0) + 1, Math.max(this.gaussSum(i-2)*6 + ((j-1) - Math.floor((j - 1)/ i) + 1)%(6*(i-1)),0) + 1);
                    }
                }
            }

            console.log(faces);
            this.setAttribute("position", new THREE.BufferAttribute(new Float32Array(verticies),3));
            this.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uvs),2));

            this.setIndex(faces);
            this.drawRange = { start: 0, count: Infinity };
            
    }
}