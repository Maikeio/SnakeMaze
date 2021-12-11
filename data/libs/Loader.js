import * as THREE from 'libs/three.module.js';
import {OBJLoader} from '/libs/OBJLoader.js'; 

class Loader extends OBJLoader{
    constructor(finished){
        super();
        this.loadingObs = [];
        this.finished = finished;
    }

    AddFBX(url){
        let i = this.loadingObs.length();
        this.loadingObs[i] = [];
        this.loadingObs[i][0] = "FBX";
        this.loadingObs[i][1] = false;
        this.loadingObs[i][2] = url;
    }

    AddFunction(LoadMethod){
        let i = this.loadingObs.length();
        this.loadingObs[i] = [];
        this.loadingObs[i][0] = "Function";
        this.loadingObs[i][1] = false;
        this.loadingObs[i][2] = LoadMethod;
        
    }

    load(){
        for (let i = 0; i < this.loadingObs.length; i++){
            if (this.loadingObs[i][0] == "FBX"){
                this.load(
                    // resource URL
                    this.loadingObs[i][2],
                    // called when resource is loaded
                    function ( object ) {
                        scene.add( object );
                        this.testIfFinished();
                    },
                    // called when loading is in progresses
                    function ( xhr ) {
            
                
                    },
                    // called when loading has errors
                    function ( error ) {
                
                        console.log( 'An error happened' );
                
                    }
                );
            } else if (this.loadingObs[i][0] == "Function"){
                async function execute(method) {
                    method();
                }
                execute(this.loadingObs[2]).then(this.testIfFinished());
            }
        }
    }

    testIfFinished(){
        for (let i = 0; i < this.loadingObs.length; i++){
            if (this.loadingObs[i][1] == false) {
                return;
            }
        }
        this.finished();
    }

}
export{Loader};