import * as THREE from '/libs/three.module.js'
import {OBJLoader} from '/libs/OBJLoader.js'; 

class Level extends THREE.Group{
    constructor(MapTiles){
        super();
        this.level=[];
        this.MapTiles = MapTiles;
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
                }
            }
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
            delete this.level[x][y][z];
        }
        let tile =  new THREE.Mesh(this.MapTiles.get("objects").get(type).get("mesh"),this.MapTiles.get("objects").get(type).get("material"));
        this.add(tile);
        tile.receiveShadow = true;
        tile.position.set(x + 0.5, y+ 0.5, z + 0.5);
        let scale = this.MapTiles.get("propaties").get(type).get("scale");
        tile.scale.set(scale, scale, scale);
        switch(facing){
            case "north":
                break;

            case "east":
                tile.rotation.y = 1.5 * Math.PI;
                break;

            case "south":
                tile.rotation.y = Math.PI;
                break;

            case "west":
                tile.rotation.y = 0.5 * Math.PI;
                break;
        }
        this.level[x][y][z] = [tile, type, facing];

        if(type == "Tesseract"){
            this.level[x][y][z].push([x,y,z]);
        }
    }

    resetTesseracts(){
        this.level.forEach((x, x2)=> {
            var x2 = x2;
            x.forEach((y, y2) => {
                var y2 = y2;
                y.forEach((z, z2) => {
                    if(z[1] == "Tesseract"){
                        console.log(x2,y2,z2);
                        this.moveTile(x2,y2,z2,z[3][0],z[3][1],z[3][2],true);
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
         } else return this.level[x][y][z][0];;
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
            this.level[x2][y2][z2][0].position.set(x2 + 0.5,y2 + 0.5,z2 + 0.5);
        }
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
            this.get("objects").set(TileName, new Map());
            if(TileMap.has("obj")){
                let obj = await  new Promise((resolve, reject) => {
                    loader.load(TileMap.get("obj"), data=> resolve(data), null, reject);
                });
                this.get("objects").get(TileName).set("material", obj.children[0].material);
                this.get("objects").get(TileName).set("mesh", obj.children[0].geometry);
            } else{
                this.get("objects").get(TileName).set("material", new THREE.MeshStandardMaterial());
            }
            if(TileMap.has("default")){
                this.get("objects").get(TileName).get("material").map = this.get("textures").get(TileMap.get("default"));
            }
            if(TileMap.has("normal")){
                this.get("objects").get(TileName).get("material").normalMap = this.get("textures").get(TileMap.get("normal"));
                this.get("objects").get(TileName).get("material").normalScale = new THREE.Vector2(0.5,0.5,0.5);
            }
            if(TileMap.has("mesh")){
                if(TileMap.get("mesh") == "cube"){
                    this.get("objects").get(TileName).set("mesh", new THREE.BoxGeometry( 1,1,1));
                }
            }
        }
        this.get("propaties").forEach((TileMap, TileName)=>{
            promises.push(processor(TileMap, TileName));
        });
        await Promise.all(promises);
        return;
        
    }

    
}
export{LevelObjects, Level};