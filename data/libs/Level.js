import * as THREE from '/libs/three.module.js'
import {OBJLoader} from '/libs/OBJLoader.js'; 

class Level extends THREE.Group{
    constructor(MapTiles){
        super();
        this.level=[];
        this.MapTiles = MapTiles;
        this.previewPoints = [];
        this.dummy = new THREE.Object3D();
        this.zeromatrix = new THREE.Matrix4();
        this.zeromatrix.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
        
    }

    init(){
        for(var i of this.MapTiles.get("objects").values()){
            this.add(i[0]);
            i[0].receiveShadow = true;
            i[0].castShadow = true;
            i[0].instanceMatrix.needsUpdate = true;
        }
    }

    async loadLvl(level){
       
        await fetch(level).then((response)=>{
            if (response.ok) { // if HTTP-status is 200-299
                // get the response body (the method explained below)
                return response.json()
            } else {
            alert("HTTP-Error: " + response.status);
            }
        }).then((obj) =>{
            for (let MapTile in obj){
                if (typeof obj[MapTile]["fill"] != 'undefined'){
                    for(let x = obj[MapTile]["fill"][0][0]; x <= obj[MapTile]["fill"][1][0]; x++){
                        for(let y = obj[MapTile]["fill"][0][1]; y <= obj[MapTile]["fill"][1][1]; y++){
                            for(let z = obj[MapTile]["fill"][0][2]; z <= obj[MapTile]["fill"][1][2]; z++){
                                this.newTile(x,y,z,obj[MapTile]["type"]);
                            }
                        }
                    }
                } else if(typeof obj[MapTile]["set"] != 'undefined'){
                    if(typeof obj[MapTile]["facing"] == 'undefined'){
                        this.newTile(obj[MapTile]["set"][0],obj[MapTile]["set"][1],obj[MapTile]["set"][2],obj[MapTile]["type"]);
                    } else{
                        this.newTile(obj[MapTile]["set"][0],obj[MapTile]["set"][1],obj[MapTile]["set"][2],obj[MapTile]["type"], obj[MapTile]["facing"]);
                    }
                    if(obj[MapTile]["type"] == "Start"){
                        this.start = [obj[MapTile]["set"][0],obj[MapTile]["set"][1],obj[MapTile]["set"][2]];
                    }
                } else if(typeof obj[MapTile]["previewPoint"] != 'undefined'){
                    this.previewPoints.push(new THREE.Vector3(obj[MapTile]["previewPoint"][0],obj[MapTile]["previewPoint"][1],obj[MapTile]["previewPoint"][2]));
                }
            }
            //this.MapTiles.get("objects").get("Sand")[0].count = 5;
        });
        
    }

    newTile(x, y, z, type, facing = "north"){
        x = parseInt(x);
        y = parseInt(y);
        z = parseInt(z);
        if (typeof this.level[x] == 'undefined') {
            this.level[x] = [];
        }
        if (typeof this.level[x][y] == 'undefined') {
            this.level[x][y] = [];
        }
        if(this.getMapTileType(x,y,z) != "Air") {
            this.MapTiles.get("objects").get(this.getMapTileType(x,y,z))[0].setMatrixAt(this.level[x][y][z][0],this.zeromatrix);
            this.MapTiles.get("objects").get(this.getMapTileType(x,y,z))[0].instanceMatrix.needsUpdate = true;
            this.MapTiles.get("objects").get(this.getMapTileType(x,y,z))[0].dispose();
            delete this.level[x][y][z];
        }

        
        this.dummy.position.set(x + 0.5, y+ 0.5, z + 0.5);
        this.dummy.scale.set(this.MapTiles.get("propaties").get(type).get("scale"), this.MapTiles.get("propaties").get(type).get("scale"), this.MapTiles.get("propaties").get(type).get("scale"));
        switch(facing){
            case "north":
                this.dummy.rotation.y = 0;
                break;

            case "east":
                this.dummy.rotation.y = 1.5 * Math.PI;
                break;

            case "south":
                this.dummy.rotation.y = Math.PI;
                break;

            case "west":
                this.dummy.rotation.y = 0.5 * Math.PI;
                break;
        }
        this.dummy.updateMatrix();
        this.MapTiles.get("objects").get(type)[0].count = this.MapTiles.get("objects").get(type)[1] + 1;
        this.MapTiles.get("objects").get(type)[0].setMatrixAt(this.MapTiles.get("objects").get(type)[1],this.dummy.matrix);
       
        this.level[x][y][z] = [this.MapTiles.get("objects").get(type)[1], type, facing];
        this.MapTiles.get("objects").get(type)[1]++;

        if(type == "Tesseract"){
            this.level[x][y][z].push([x,y,z]);
        }
        if(type == "Destination"){
            this.Destination = [x,y,z];
        }
    }

    resetTesseracts(){
        this.level.forEach((x, x2)=> {
            let x3 = x2;
            x.forEach((y, y2) => {
                let y3 = y2;
                y.forEach((z, z2) => {
                    if(z[1] == "Tesseract"){
                        this.moveTile(x3,y3,z2,z[3][0],z[3][1],z[3][2],true);
                    }
                })
            })
        });
    }

    getMapTileType(x,y,z){
        x = parseInt(x);
        y = parseInt(y);
        z = parseInt(z);
        if (typeof this.level[x] == 'undefined') {
            return "Air";
         } else if (typeof this.level[x][y] == 'undefined') {
            return "Air";
         } else if (typeof this.level[x][y][z] == 'undefined') {
            return "Air";
         } else return this.level[x][y][z][1];;
    }
    getMapTileFacing(x,y,z){
        x = parseInt(x);
        y = parseInt(y);
        z = parseInt(z);
        if (typeof this.level[x] == 'undefined') {
            return "none";
         } else if (typeof this.level[x][y] == 'undefined') {
            return "none";
         } else if (typeof this.level[x][y][z] == 'undefined') {
            return "none";
         } else return this.level[x][y][z][2];;
    }
    getMapTileMesh(x,y,z){
        x = parseInt(x);
        y = parseInt(y);
        z = parseInt(z);
        if (typeof this.level[x] == 'undefined') {
            return "none";
         } else if (typeof this.level[x][y] == 'undefined') {
            return "none";
         } else if (typeof this.level[x][y][z] == 'undefined') {
            return "none";
         } else return this.level[x][y][z][0];
    }

    setTileVisual(x,y,z, x1,y1,z1){
        x = parseInt(x);
        y = parseInt(y);
        z = parseInt(z);
        if (typeof this.level[x] == 'undefined') {
        return "none";
        } else if (typeof this.level[x][y] == 'undefined') {
        return "none";
        } else if (typeof this.level[x][y][z] == 'undefined') {
        return "none";
        }
        let type = this.getMapTileType(x,y,z);
        this.dummy.position.set(x1 ,y1 ,z1 );
        this.dummy.scale.set(this.MapTiles.get("propaties").get(type).get("scale"), this.MapTiles.get("propaties").get(type).get("scale"), this.MapTiles.get("propaties").get(type).get("scale"));
        this.dummy.updateMatrix();
        
        this.MapTiles.get("objects").get(type)[0].setMatrixAt(this.level[x][y][z][0],this.dummy.matrix);
        this.MapTiles.get("objects").get(type)[0].instanceMatrix.needsUpdate = true;
    }

    moveTile(x1,y1,z1,x2,y2,z2, moveMesh = false){
        x1 = parseInt(x1);
        y1 = parseInt(y1);
        z1 = parseInt(z1);
        x2 = parseInt(x2);
        y2 = parseInt(y2);
        z2 = parseInt(z2);
        if (this.getMapTileType(x2,y2,z2) != "Air"){
            return;
        }
        if (typeof this.level[parseInt(x2)] == 'undefined') {
            this.level[parseInt(x2)] = [];
        }
        if (typeof this.level[parseInt(x2)][parseInt(y2)] == 'undefined') {
            this.level[parseInt(x2)][parseInt(y2)] = [];
        }
        this.level[x2][y2][z2] = this.level[x1][y1][z1];
        delete this.level[x1][y1][z1];

        if(moveMesh){
            this.setTileVisual(x2,y2,z2, x2 + 0.5,y2 + 0.5, z2 +0.5);
            //this.level[x2][y2][z2][0].position.set(x2 + 0.5,y2 + 0.5,z2 + 0.5);
        }
    }

    clearMap(){
        console.log("clear Map");
        let m = new THREE.Matrix4();
        for(var i of this.MapTiles.get("objects").values()){
            i[0].instanceMatrix.needsUpdate = true;
            for(let l = 0; l < i[1]; l++){
                i[0].setMatrixAt(l,this.zeromatrix);
            }
            i[0].dipose;
            i[1] = 0;
        }
        this.level.splice(0,this.level.length);
        this.clear();
    }
  
}

class LevelObjects extends Map{
    constructor(){
        super();
    }

    async load(ObjectList){
        this.set("propaties", new Map());
        await fetch(ObjectList).then((response)=>{
            if (response.ok) { 
                return response.json()
            } else {
            alert("HTTP-Error: " + response.status);
            }
        }).then((obj) =>{
            for (let MapTile in obj){
                this.get("propaties").set(MapTile, new Map());
                for (let propatie in obj[MapTile]){
                    this.get("propaties").get(MapTile).set(propatie, obj[MapTile][propatie]);
                }
            }
        });

        let loader = new OBJLoader();
        this.set("textures", new Map());
        this.get("propaties").get("Textures").forEach((url,Name)=>{
            this.get("textures").set(Name,new THREE.TextureLoader().load(url));
        });
        this.set("objects", new Map());
        let promises = [];
        let processor = async (TileMap,TileName)=>{
            if(TileName == "Textures"){
                return;
            }
            
            let BufferMaterial = new THREE.MeshPhongMaterial();
            BufferMaterial.shininess = 0;
            let BufferGeometry;
            
            if(TileMap.has("default")){
                BufferMaterial.map = this.get("textures").get(TileMap.get("default"));
            }
            if(TileMap.has("normal")){
                BufferMaterial.normalMap = this.get("textures").get(TileMap.get("normal"));
                BufferMaterial.normalScale.set(0.5,0.1);
            }
            if(TileMap.has("normalscale")){
                BufferMaterial.normalScale.set(TileMap.get("normalscale")[0],TileMap.get("normalscale")[1]);
            }
            if(TileMap.has("obj")){
                let obj = await  new Promise((resolve, reject) => {
                    loader.load(TileMap.get("obj"), data=> resolve(data), null, reject);
                });
                BufferGeometry = obj.children[0].geometry;
                BufferMaterial.normalScale.set(0.1,0.3);
            }
            if(TileMap.has("mesh")){
                if(TileMap.get("mesh") == "cube"){
                    BufferGeometry = new THREE.BoxGeometry( 1,1,1);
                }
            }
            this.get("objects").set(TileName, [new THREE.InstancedMesh(BufferGeometry, BufferMaterial, TileMap.get("count")),0]);
            this.get("objects").get(TileName)[0].instanceMatrix.setUsage( THREE.DynamicDrawUsage );
        }
        this.get("propaties").forEach((TileMap, TileName)=>{
            promises.push(processor(TileMap, TileName));
        });
        await Promise.all(promises);
        return;
        
    }

    
}
export{LevelObjects, Level};