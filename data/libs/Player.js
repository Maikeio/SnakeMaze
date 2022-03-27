import * as THREE from '/libs/three.module.js'

class Player extends THREE.Group {
   constructor(level) {
      super();
      var geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      var material = new THREE.MeshStandardMaterial({ color: "#433F81" });
      var cube = new THREE.Mesh(geometry, material);
      cube.castShadow = true; //default is false
      cube.receiveShadow = true;

      // Add cube to Scene  
      this.add(cube);
      cube.position.set(0.5, 0.25, 0.5);


      this.level = level;
      this.add(cube);
      this.moving = "false";
      this.next_speed = 0;
      this.last_speed = 0;
      this.accaleration = 0;
      this.distance = 0;
      this.position.y = 1;
      this.SlopesUp = [];
      this.SlopesDown = [];
      this.tesseract = [];
      this.next_position = new THREE.Vector3();
   }

   StartMove(direction) {
      this.moving = direction;
      this.distance = this.possibleDistance();
      this.goal = this.getRelativPosition(0,0);
      console.log("to move: " + this.distance);
      this.accaleration = this.distance / ((2 - 1 / this.distance) ** 2 * (-0.5));
      this.last_speed = (-1) * this.accaleration * (2 - 1 / this.distance);
   }

   getRelativPosition(f,h){
      let x = 0;
      let y = 0;
      let z = 0;
      switch (this.moving) {
         case "north":
            x = this.position.x + this.distance + f; 
            y = this.position.y; 
            z = this.position.z;
            break;

         case "east":
            x = this.position.x; 
            y = this.position.y; 
            z = this.position.z + this.distance + f; 
            break;

         case "south":
            x = this.position.x - this.distance - f; 
            y = this.position.y; 
            z = this.position.z;
            break;

         case "west":
            x = this.position.x; 
            y = this.position.y; 
            z = this.position.z - this.distance -f;
            break;
      }
      y += this.SlopesUp.length - this.SlopesDown.length + h;
      this.next_position.set(x,y,z);
      return this.next_position;
   }

   isSlopeUp(){
      return (this.level.getMapTileTypeV(this.getRelativPosition(1,0)) == "Slope" && this.level.getMapTileFacingV(this.getRelativPosition(1,0)) == this.moving);
   }

   isSlopeDown(){
      var invertedFacing = this.level.invertFacing(this.moving);
      return (this.level.getMapTileTypeV(this.getRelativPosition(1,-1)) == "Slope" && this.level.getMapTileFacingV(this.getRelativPosition(1,-1)) == invertedFacing);
   }

   possibleDistance() {
      this.distance = 0;
      console.log("start calculate distance");

      for (; this.distance < 30; this.distance++) {
         if (this.level.getMapTileTypeV(this.getRelativPosition(1,0)) == 'Air') {
         } else if (this.tesseract.length == 0 && this.isSlopeUp()) {
            this.getRelativPosition(1,0);
            this.SlopesUp.push([this.next_position.x, this.next_position.y, this.next_position.z]);
            
         } else if(this.tesseract.length == 0 && this.level.getMapTileTypeV(this.getRelativPosition(1,0)) == "Tesseract"){
            this.getRelativPosition(1,0);
            this.tesseract.push(this.next_position.x);
            this.tesseract.push(this.next_position.y);
            this.tesseract.push(this.next_position.z);
         }else{
            break;
         }
         if (this.level.getMapTileTypeV(this.getRelativPosition(1,-1)) != 'Air'){
            if (this.tesseract.length == 0 && this.isSlopeDown()){
               this.getRelativPosition(1,-1);
               this.SlopesDown.push([this.next_position.x, this.next_position.y, this.next_position.z]);
            } 
         } else {
            break;
         }
      }
      if(this.tesseract.length != 0){
         this.getRelativPosition(0,0);
         this.level.moveTile(this.tesseract[0],this.tesseract[1],this.tesseract[2], this.next_position.x, this.next_position.y, this.next_position.z);
         this.tesseract.push(this.next_position.x );
         this.tesseract.push(this.next_position.y);
         this.tesseract.push(this.next_position.z);
         return(this.distance - 1);
      }
      this.getRelativPosition(0,0);
      return(this.distance);
   }

   movePlayer(f, h){
      switch(this.moving){
         case "north":
            this.position.x += f;
            break;
         
         case "east":
            this.position.z += f;
            break;

         case "south":
            this.position.x -= f;
            break;

         case "west":
            this.position.z -= f;
            break;
      }
   }

   moveTesseract(){
      switch(this.moving){
         case "north":
            if (this.tesseract[0] - this.position.x < 1){
               this.level.setTileVisual(this.tesseract[3], this.tesseract[4], this.tesseract[5], this.position.x + 1.5, this.position.y + 0.5, this.position.z + 0.5);
            }
            break;
         
         case "east":
            if (this.tesseract[2] - this.position.z < 1){
               this.level.setTileVisual(this.tesseract[3], this.tesseract[4], this.tesseract[5], this.position.x + 0.5, this.position.y + 0.5, this.position.z + 1.5);
            }
            break;

         case "south":
            if (this.position.x - this.tesseract[0] < 1){
               this.level.setTileVisual(this.tesseract[3], this.tesseract[4], this.tesseract[5], this.position.x - 0.5, this.position.y + 0.5, this.position.z + 0.5);
            }
            break;

         case "west":
            if (this.position.z - this.tesseract[2] < 1){
               this.level.setTileVisual(this.tesseract[3], this.tesseract[4], this.tesseract[5], this.position.x + 0.5, this.position.y + 0.5, this.position.z - 0.5);
            }
            break;
      }
   }

   distanceSlopeUp(){
      switch(this.moving){
         case "north":
            return this.SlopesUp[0][0] - this.position.x + 1;
         
         case "east":
            return this.SlopesUp[0][2] - this.position.z + 1;

         case "south":
            return this.position.x - this.SlopesUp[0][0];

         case "west":
            return this.position.z - this.SlopesUp[0][2];
      }
   }

   distanceSlopeDown(){
      switch(this.moving){
         case "north":
            return this.SlopesDown[0][0] - this.position.x + 1;
         
         case "east":
            return this.SlopesDown[0][2] - this.position.z + 1;;

         case "south":
            return this.position.x - this.SlopesDown[0][0] + 0.5;

         case "west":
            return this.position.z - this.SlopesDown[0][2] + 0.5;
      }
   }
   
   move(deltaTime) {
      
      if (this.last_speed >= 0) {
         this.next_speed = this.last_speed + this.accaleration * deltaTime;

         let f = 0;
         let h = 0;
         //moves forword
         f += deltaTime * 0.5 * (this.last_speed + this.next_speed);

         //remove already completly used slopes
         if (this.SlopesUp.length !=0 && this.distanceSlopeUp() < 0){
            this.position.y = this.SlopesUp[0][1] + 1;
            this.SlopesUp.shift();
         }

         if (this.SlopesDown.length !=0 && this.distanceSlopeDown() < 0){
            this.position.y = this.SlopesDown[0][1];
            this.SlopesDown.shift();
         }
         
         //move slopes up down
         if (this.SlopesUp.length !=0 && this.distanceSlopeUp() < 1){
            this.position.y = this.SlopesUp[0][1] + 1 - this.distanceSlopeUp();
         }

         //move slopes up dowmn
         if (this.SlopesDown.length !=0 && this.distanceSlopeDown() < 1){
            this.position.y = this.SlopesDown[0][1] + this.distanceSlopeDown();
         }

         this.movePlayer(f,h)
         this.moveTesseract();
         this.last_speed = this.next_speed;
      } else if(this.moving != "false"){

         if(this.tesseract.length != 0){
            this.level.setTileVisual(this.tesseract[3], this.tesseract[4], this.tesseract[5], this.tesseract[3] + 0.5, this.tesseract[4] + 0.5, this.tesseract[5] + 0.5);
            /* this.level.getMapTileMesh(this.tesseract[3], this.tesseract[4], this.tesseract[5]).position.x = this.tesseract[3] + 0.5;
            this.level.getMapTileMesh(this.tesseract[3], this.tesseract[4], this.tesseract[5]).position.y = this.tesseract[4] + 0.5;
            this.level.getMapTileMesh(this.tesseract[3], this.tesseract[4], this.tesseract[5]).position.z = this.tesseract[5] + 0.5; */
            this.tesseract.splice(0,this.tesseract.length);
            
         } 
         this.position.set(this.goal.x, this.goal.y, this.goal.z);
         this.stopMove();
      }
      return;
   }

   round(d) {
      if (d % 1 < 0.5) {
         return(parseInt(d));
      } else {
         return(parseInt(d) + 1);
      }
   }

   stopMove(){
      this.moving = "false";
      this.next_speed = 0;
      this.last_speed = 0;
      if(this.level.getMapTileType(this.position.x, this.position.y - 1, this.position.z) == "Destination"){
         this.destinationFunc();
      }
      this.tesseract.splice(0,this.tesseract.length);
      this.SlopesDown.splice(0,this.SlopesDown.length);
      this.SlopesUp.splice(0,this.SlopesUp.length);
   }

   addDestinationFunc(destinationFunc){
      this.destinationFunc = destinationFunc;
   }
}

export { Player };