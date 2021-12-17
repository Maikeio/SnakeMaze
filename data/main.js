document.getElementById("test").innerHTML = "lädt...";
import * as THREE from '/libs/three.module.js'; 
import {Player} from '/libs/Player.js'
import { LevelObjects, Level } from './libs/Level.js';

var scene;

var camera;

var p;

var level;

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

var previewCurr = new THREE.Vector2();
var previewPoints;

var renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    antialias:true,
});


async function init(params) {
     
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

    //Load Objects
    let LevelTiles = new LevelObjects();
    await LevelTiles.load("ObjectList.json");

    //Create Level
    level = new Level(LevelTiles);
    await level.loadLvl("levels/lvl1.json");
    scene.add(level);
    previewPoints = level.previewPoints;

    //create Player
    p = new Player(camera, level);
    p.addDestinationFunc(()=>{
        document.getElementById("test").innerHTML = "finish";
        document.getElementById("test").style.opacity = "100";
        LockMove = true;
        console.log("finish");
    });
    scene.add(p);
    arrow =  new THREE.Mesh(LevelTiles.get("objects").get("Arrow").get("mesh"));
    arrow.position.set(0,1.6,0);
    arrow.scale.set(0.4,0.4,0.4);
    displayArrow = false;
    arrow.name = "arrow";

    //define Lights
    const DirectLight = new THREE.DirectionalLight(0xFFFFFF, 1);
    DirectLight.position.set(5,10,-5);
    DirectLight.shadow.camera.zoom = 0.3; // default
    DirectLight.castShadow = true;
    DirectLight.shadow.mapSize.width = 1024; // default
    DirectLight.shadow.mapSize.height = 1024
    scene.add(DirectLight)

    const AntiDirectLight = new THREE.DirectionalLight(0xFFFFFF, 0.1);
    AntiDirectLight.position.set(5,10,-5);
    AntiDirectLight.shadow.camera.zoom = 0.3; // default

    scene.add(AntiDirectLight);

    const light = new THREE.AmbientLight(0xFFFFFF, 0.3);
    scene.add(light)


    var between;
    var i = 0;
    //End Loading Animation 
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

    previewCurr = previewPoints[0].clone();
    
    previewCurr.x -= camera.position.x -5;
    previewCurr.y -= camera.position.z -5;
    console.log(previewCurr);
    previewCurr.normalize();
    previewCurr.multiplyScalar(4);
    previewPoints.push(new THREE.Vector2(camera.x, camera.z));
    preview();

}


function preview() {
    deltaTime = clock.getDelta();
    //console.log(previewPoints[0]);
    if(((previewPoints[0].x + 5 * previewCurr.x / Math.abs(previewCurr.x)) - camera.position.x * previewCurr.x / Math.abs(previewCurr.x)) < 0 || ((previewPoints[0].y + 5 * previewCurr.y / Math.abs(previewCurr.y)) - camera.position.z * previewCurr.y / Math.abs(previewCurr.y)) < 0){
        previewPoints.shift();
        if(previewPoints.length == 0){
            afterPrrview();
            return;
        } 
        console.log(previewCurr);
     
        previewCurr = previewPoints[0].clone();

        previewCurr.x -= camera.position.x - 5;
        previewCurr.y -= camera.position.z - 5;
        previewCurr.normalize();
        previewCurr.multiplyScalar(4);
        setTimeout(requestAnimationFrame( preview ), 1000);
        return;
    }

    let distance_left = distance(camera.position.x - 5, camera.position.z - 5, previewPoints[0].x, previewPoints[0].y) + 3;
    camera.position.x += previewCurr.x * distance_left * 0.15 * deltaTime;
    camera.position.z += previewCurr.y * deltaTime * distance_left * 0.15;
    renderer.render(scene, camera);  
    requestAnimationFrame( preview );

    
};

function distance(xa, ya, xb, yb){
    return(Math.sqrt((yb-ya)**2 + (xb-xa)**2));
}

async function afterPrrview(){
    LockMove = false;
    document.querySelector('.gameUI').style.opacity = 100;
    render();
}

function render () {
    deltaTime = clock.getDelta();
    p.move(deltaTime);
    renderer.render(scene, camera);  
    requestAnimationFrame( render );
};

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

init();
 
     