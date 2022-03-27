import * as THREE from '/libs/three.module.js'; 
import {Player} from '/libs/Player.js'
import { LevelObjects, Level } from './libs/Level.js';

var scene;

var camera;

var camerapoint = new THREE.Vector3();

var p;

var level;

var levelCount = 5;
var levelLast = 5;

var startx;
var starty;

var distx;
var disty;

var wouldMove;

var arrow;
var displayArrow;

var startetNotInMove;

var LockMove = true;

var clock = new THREE.Clock();
var deltaTime;

var previewPoints;

var preview;

var renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    antialias:true,
});

let distance_left;

var MusicFade = new Audio("Schlangentempel_fade-in.mp3");

var MusicLoop = new Audio("Schlangentempel_loop.mp3");

async function init() {

    scene = new THREE.Scene(); 

    //define Renderer
    
    renderer.setClearColor("#000000");  
    renderer.setSize( window.innerWidth, window.innerHeight );  
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;


    //define Camera
    camera = new THREE.PerspectiveCamera( 50, window.innerWidth/window.innerHeight, 0.1, 1000 );
    camera.position.set(5, 5, 5);
    camera.lookAt(1,0,1);
    scene.add(camera);

    //Load Objects
    let LevelTiles = new LevelObjects();
    await LevelTiles.load("ObjectList.json");

    //Create Level
    level = new Level(LevelTiles);
    

    scene.add(level);

    //create Player
    p = new Player(level);
    //function called if player is on the destination tile
    p.addDestinationFunc(()=>{
        levelCount += 1;
        document.getElementById("test").innerHTML = "finish";
        document.getElementById("test").style.opacity = "100";
        LockMove = true;
        level.clearMap();
        console.log("finish");
        
        if(levelCount > levelLast){
            setTimeout(()=>(location.href = "wonToOpen.html"), 3000);
        } else {
            setTimeout(()=>(document.getElementById("test").style.opacity = "0"),3000);
            setTimeout(prepareLevel, 3000);
        }
        
    });
    scene.add(p);

    //add arrow, showing diraction player would move
    arrow =  new THREE.Mesh(LevelTiles.get("objects").get("Arrow")[0].geometry);
    arrow.position.set(0,1.6,0);
    arrow.scale.set(0.4,0.4,0.4);
    displayArrow = false;
    arrow.name = "arrow";

    //define Lights
    const DirectLight = new THREE.DirectionalLight(0xFFFFFF, 1);
    DirectLight.position.set(5,10,-5);
    DirectLight.shadow.camera.zoom = 0.3; // default
    DirectLight.castShadow = true;
    DirectLight.shadow.mapSize.width = 512; // default
    DirectLight.shadow.mapSize.height = 512
    DirectLight.shadow.radius = 3;
    scene.add(DirectLight);

    //add light from opposit side, so normals don't show of by only one side
    /* const AntiDirectLight = new THREE.DirectionalLight(0xFFFFFF, 0.1);
    AntiDirectLight.position.set(5,10,-5);
    AntiDirectLight.shadow.camera.zoom = 0.3; // default

    scene.add(AntiDirectLight); */

    const light = new THREE.AmbientLight(0xFFFFFF, 0.3);
    scene.add(light);


    //transition from loading to game
    document.getElementById("test").innerHTML = "start";
    setTimeout(()=>{
        document.getElementById("test").style.opacity = 0;
    }, 500);
    renderer.render(scene, camera); 
    setTimeout(()=>{
        document.getElementById("bg").style.opacity = 100;
    }, 1500);
    await new Promise(resolve => setTimeout(resolve, 3000));
    document.getElementById("bg").style.transition = "0s";

    MusicFade.play();
    prepareLevel();
}

//function for loading next lvl
async function prepareLevel(){
    await level.loadLvl("levels/lvl" + levelCount + ".json");
    //set player to start position
    p.position.set(level.start[0],level.start[1] + 1,level.start[2]);
    previewPoints = level.previewPoints;
    previewPoints.push(new THREE.Vector3(camera.position.x,camera.position.y,camera.position.z));
    preview = true;
    document.getElementById("levelCounter").innerHTML = levelCount + "/" + levelLast;
    level.init();
    render();
}

function distance(xa, ya, xb, yb){
    return(Math.sqrt((yb-ya)**2 + (xb-xa)**2));
}

async function afterPrrview(){
    LockMove = false;
    for(let i of document.getElementsByClassName("gameUI")){
        i.style.opacity = 100;
    }
    
    preview = false;
}

function render() {
    deltaTime = clock.getDelta();
    if(preview){    
        if(previewPoints[0].distanceTo(camera.position) < 1){
            previewPoints.shift();
            if(previewPoints.length == 0){
                afterPrrview();
                requestAnimationFrame( render );
                return;
            } 
            requestAnimationFrame( render );
            return;
        }
        /* console.log("Scene polycount:", renderer.info.render.triangles)
        console.log("Active Drawcalls:", renderer.info.render.calls)
        console.log("Textures in Memory", renderer.info.memory.textures)
        console.log("Geometries in Memory", renderer.info.memory.geometries) */

    
        camera.position.lerp(previewPoints[0], deltaTime)
    } else{
        camerapoint.set(p.position.x + 5, p.position.y + 5, p.position.z + 5)
        camera.position.lerp(camerapoint, deltaTime * 9);
    }
    p.move(deltaTime);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);  
    requestAnimationFrame( render );
}

function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize( width, height );
}  

window.addEventListener( 'resize', onWindowResize );

document.getElementById('reload_button').addEventListener("click",function(eve){
    if(LockMove){
        return;
    }
    console.log("reset Map");
    level.resetTesseracts();
    p.stopMove();
    p.position.set(level.start[0],level.start[1] + 1,level.start[2]);
});

document.getElementById('play_but').onclick = (eve)=>{
    eve.target.childNodes[0].remove();
    eve.target.remove();
    init()
};

MusicFade.onended = (eve)=>{
    MusicLoop.loop = true;
    MusicLoop.play()
}

document.querySelector('#main').addEventListener("touchstart", function(eve){
    if(p.moving == "false" && !LockMove){
        let touchobj = eve.changedTouches[0]; // erster Finger
        startx = (touchobj.clientX); // X/Y-Koordinaten relativ zum Viewport
        starty = (touchobj.clientY);
        arrow.position.set(p.position.x + 0.5, p.position.y + 1, p.position.z + 0.5);
        startetNotInMove = true;
    }
    
    eve.preventDefault();
});

document.querySelector('#main').addEventListener("touchmove", function(eve){
     if(startetNotInMove && p.moving == "false"){
        let touchobj = eve.changedTouches[0]; // erster Finger
        distx = startx - (touchobj.clientX);
        disty = starty - (touchobj.clientY);
        if (Math.sqrt(distx**2 + disty**2) < 100){
            wouldMove = "none";
            if (displayArrow){
                let selectedObject = scene.getObjectByName(arrow.name);
                scene.remove( selectedObject );
                displayArrow = false;
            }
        } else if(distx > 0 && disty <= 0){
            wouldMove = "east"
            if (!displayArrow){
                scene.add(arrow);
                displayArrow = true;
            }
            arrow.rotation.y = Math.PI * 1.5;
        }else if(distx <= 0 && disty <= 0){
            wouldMove = "north"
            if (!displayArrow){
                scene.add(arrow);
                displayArrow = true;
            }
            arrow.rotation.y = 0;
        }else if(distx <= 0 && disty > 0){
            wouldMove = "west"
            if (!displayArrow){
                scene.add(arrow);
                displayArrow = true;
            }
            arrow.rotation.y = Math.PI * 0.5;
        }else if (distx > 0 && disty > 0){
            wouldMove = "south"
            if (!displayArrow){
                scene.add(arrow);
                displayArrow = true;
            }
            arrow.rotation.y = Math.PI;
        }
     }
    
    eve.preventDefault();
 });
 
 document.querySelector('#main').addEventListener("touchend", function(eve){
    if(wouldMove != "none" && startetNotInMove && p.moving == "false"){
        p.StartMove(wouldMove);
    }
    if (displayArrow){
        let selectedObject = scene.getObjectByName(arrow.name);
        scene.remove( selectedObject );
    }
    displayArrow = false;
    startetNotInMove = false;
    eve.preventDefault();
    
 });

 
     