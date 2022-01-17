import * as THREE from '/libs/three.module.js'

class Player extends THREE.Group {
   constructor(camera, level) {
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
      this.add(camera);
      this.moving = "false";
      this.next_speed = 0;
      this.last_speed = 0;
      this.accaleration = 0;
      this.distance = 0;
      this.position.y = 1;
      this.slopes = [];
      this.tesseract = [];
      this.next_position = new THREE.Vector3();
   }

   StartMove(direction) {
      this.moving = direction;
      this.distance = this.possibleDistance();
      this.accaleration = this.distance / ((2 - 1 / this.distance) ** 2 * (-0.5));
      this.last_speed = (-1) * this.accaleration * (2 - 1 / this.distance);
   }

   possibleDistance() {
      this.next_position.x = this.position.x;
      this.next_position.y = this.position.y;
      this.next_position.z = this.position.z;

      switch (this.moving) {
         case "north":
            console.log("start calculate distance");
            for (; (this.next_position.x - this.position.x) < 30; this.next_position.x++) {
               if (this.level.getMapTileType(this.next_position.x + 1, this.next_position.y, this.next_position.z) == 'Air') {
               } else if (this.tesseract.length == 0 && this.level.getMapTileType(this.next_position.x + 1, this.next_position.y, this.next_position.z) == "Slope" && (this.level.getMapTileFacing(this.next_position.x + 1, this.next_position.y, this.next_position.z) == "north")) {
                  this.slopes.push([this.next_position.x + 1, this.next_position.y, this.next_position.z]);
                  this.next_position.y += 1;
                  
               } else if(this.tesseract.length == 0 && this.level.getMapTileType(this.next_position.x + 1, this.next_position.y, this.next_position.z) == "Tesseract"){
                  this.tesseract.push(this.next_position.x + 1);
                  this.tesseract.push(this.next_position.y);
                  this.tesseract.push(this.next_position.z);
               }else{
                  break;
               }
               if (this.level.getMapTileType(this.next_position.x + 1, this.next_position.y - 1, this.next_position.z) != 'Air'){
                  if (this.tesseract.length == 0 && this.level.getMapTileType(this.next_position.x + 1, this.next_position.y - 1, this.next_position.z) == "Slope" && this.level.getMapTileFacing(this.next_position.x + 1, this.next_position.y - 1, this.next_position.z) == "south"){
                     this.slopes.push([this.next_position.x + 1, this.next_position.y - 1, this.next_position.z]);
                     this.next_position.y -= 1;
                  } 
               } else {
                  break;
               }
            }
            if(this.tesseract.length != 0){
               this.level.moveTile(this.tesseract[0],this.tesseract[1],this.tesseract[2], this.next_position.x, this.next_position.y, this.next_position.z);
               this.tesseract.push(this.next_position.x );
               this.tesseract.push(this.next_position.y);
               this.tesseract.push(this.next_position.z);
               this.next_position.x -= 1;
               return(this.next_position.x - this.position.x);
            }
            return(this.next_position.x - this.position.x);


         case "east":
            for (; (this.next_position.z - this.position.z) < 30; this.next_position.z++) {
               if (this.level.getMapTileType(this.next_position.x, this.next_position.y, this.next_position.z + 1) == 'Air') {
               } else if (this.tesseract.length == 0 && this.level.getMapTileType(this.next_position.x, this.next_position.y, this.next_position.z + 1) == "Slope" && (this.level.getMapTileFacing(this.next_position.x, this.next_position.y, this.next_position.z + 1) == "east")) {
                  this.slopes.push([this.next_position.x, this.next_position.y, this.next_position.z + 1]);
                  this.next_position.y += 1;
                  
               } else if(this.tesseract.length == 0 && this.level.getMapTileType(this.next_position.x, this.next_position.y, this.next_position.z + 1) == "Tesseract"){
                  this.tesseract.push(this.next_position.x);
                  this.tesseract.push(this.next_position.y);
                  this.tesseract.push(this.next_position.z + 1);
               }else{
                  break;
               }
               if (this.level.getMapTileType(this.next_position.x, this.next_position.y - 1, this.next_position.z + 1) != 'Air'){
                  if ((this.level.getMapTileType(this.next_position.x, this.next_position.y - 1, this.next_position.z + 1) == "Slope" && this.level.getMapTileFacing(this.next_position.x, this.next_position.y - 1, this.next_position.z + 1) == "west")){
                     this.slopes.push([this.next_position.x, this.next_position.y - 1, this.next_position.z + 1]);
                     this.next_position.y -= 1;
                  } 
               } else {
                  break;
               }
            }
            if(this.tesseract.length != 0){
               this.level.moveTile(this.tesseract[0],this.tesseract[1],this.tesseract[2], this.next_position.x, this.next_position.y, this.next_position.z);
               this.tesseract.push(this.next_position.x );
               this.tesseract.push(this.next_position.y);
               this.tesseract.push(this.next_position.z);
               this.next_position.z -= 1;
               return(this.next_position.z - this.position.z);
            }
            return(this.next_position.z - this.position.z);

         case "south":
               console.log("start calculate distance");
               for (; (this.next_position.x - this.position.x) > -30; this.next_position.x--) {
                  if (this.level.getMapTileType(this.next_position.x - 1, this.next_position.y, this.next_position.z) == 'Air') {
                  } else if (this.tesseract.length == 0 && this.level.getMapTileType(this.next_position.x - 1, this.next_position.y, this.next_position.z) == "Slope" && (this.level.getMapTileFacing(this.next_position.x - 1, this.next_position.y, this.next_position.z) == "south")) {
                     this.slopes.push([this.next_position.x - 1, this.next_position.y, this.next_position.z]);
                     this.next_position.y += 1;
                     
                  } else if(this.tesseract.length == 0 && this.level.getMapTileType(this.next_position.x - 1, this.next_position.y, this.next_position.z) == "Tesseract"){
                     this.tesseract.push(this.next_position.x - 1);
                     this.tesseract.push(this.next_position.y);
                     this.tesseract.push(this.next_position.z);
                  }else{
                     break;
                  }
                  if (this.level.getMapTileType(this.next_position.x - 1, this.next_position.y - 1, this.next_position.z) != 'Air'){
                     if ((this.level.getMapTileType(this.next_position.x - 1, this.next_position.y - 1, this.next_position.z) == "Slope" && this.level.getMapTileFacing(this.next_position.x - 1, this.next_position.y - 1, this.next_position.z) == "north")){
                        this.slopes.push([this.next_position.x - 1, this.next_position.y - 1, this.next_position.z]);
                        this.next_position.y -= 1;
                     } 
                  } else {
                     break;
                  }
               }
               if(this.tesseract.length != 0){
                  this.level.moveTile(this.tesseract[0],this.tesseract[1],this.tesseract[2], this.next_position.x, this.next_position.y, this.next_position.z);
                  this.tesseract.push(this.next_position.x);
                  this.tesseract.push(this.next_position.y);
                  this.tesseract.push(this.next_position.z);
                  this.next_position.x += 1;
                  return((this.next_position.x - this.position.x) * (-1));
               }
               return((this.next_position.x - this.position.x) * (-1));

         case "west":
            console.log("start calculate distance");
            for (; (this.next_position.z - this.position.z) > -30; this.next_position.z--) {
               if (this.level.getMapTileType(this.next_position.x, this.next_position.y, this.next_position.z - 1) == 'Air') {
               } else if ( this.tesseract.length == 0 && this.level.getMapTileType(this.next_position.x, this.next_position.y, this.next_position.z - 1) == "Slope" && (this.level.getMapTileFacing(this.next_position.x, this.next_position.y, this.next_position.z - 1) == "west")) {
                  this.slopes.push([this.next_position.x, this.next_position.y, this.next_position.z - 1]);
                  this.next_position.y += 1;
                  
               } else if(this.tesseract.length == 0 && this.level.getMapTileType(this.next_position.x, this.next_position.y, this.next_position.z - 1) == "Tesseract"){
                  this.tesseract.push(this.next_position.x);
                  this.tesseract.push(this.next_position.y);
                  this.tesseract.push(this.next_position.z - 1);
               }else{
                  break;
               }
               if (this.level.getMapTileType(this.next_position.x, this.next_position.y - 1, this.next_position.z -1) != 'Air'){
                  if ((this.level.getMapTileType(this.next_position.x, this.next_position.y - 1, this.next_position.z - 1) == "Slope" && this.level.getMapTileFacing(this.next_position.x, this.next_position.y - 1, this.next_position.z - 1) == "east")){
                     this.slopes.push([this.next_position.x, this.next_position.y - 1, this.next_position.z - 1]);
                     this.next_position.y -= 1;
                  } 
               } else {
                  break;
               }
            }
            if(this.tesseract.length != 0){
               this.level.moveTile(this.tesseract[0],this.tesseract[1],this.tesseract[2], this.next_position.x, this.next_position.y, this.next_position.z);
               this.tesseract.push(this.next_position.x);
               this.tesseract.push(this.next_position.y);
               this.tesseract.push(this.next_position.z);
               this.next_position.z += 1;
               return((this.next_position.z - this.position.z) * (-1));
            }
            return((this.next_position.z - this.position.z) * (-1));

         default:
            return(0);
      }
   }


   
   move(deltaTime) {
      
      if (this.last_speed >= 0) {
         this.next_speed = this.last_speed + this.accaleration * deltaTime;
         switch (this.moving) {
            case "north":
               //moves forword
               this.position.x += deltaTime * 0.5 * (this.last_speed + this.next_speed);

               //moves Tesseract
               if(this.position.x + 1 > this.tesseract[0]){
                  this.level.setTileVisual(this.tesseract[3], this.tesseract[4], this.tesseract[5], this.position.x + 1.5, this.position.y + 0.5, this.position.z + 0.5);
               }

               //move slopes up dowm
               if(typeof this.slopes[0] != 'undefined' && parseInt(this.position.x + 0.5) == this.slopes[0][0] && this.level.getMapTileFacing(this.slopes[0][0],this.slopes[0][1], this.slopes[0][2]) == "north"){
                  this.position.y = ((this.position.x - 0.5) % 1) + this.slopes[0][1];
               }else if(typeof this.slopes[0] != 'undefined' && parseInt(this.position.x + 0.3) == this.slopes[0][0] && this.level.getMapTileFacing(this.slopes[0][0],this.slopes[0][1], this.slopes[0][2]) == "south"){
                  this.position.y = 1 - ((this.position.x + 0.3) % 1) + this.slopes[0][1];
               }else if(typeof this.slopes[0] != 'undefined' && parseInt(this.position.x + 0.3) > this.slopes[0][0] && this.level.getMapTileFacing(this.slopes[0][0],this.slopes[0][1], this.slopes[0][2]) == "north"){
                  this.position.y = this.slopes[0][1] + 1;
                  this.slopes.shift();
               }else if(typeof this.slopes[0] != 'undefined' && parseInt(this.position.x + 0.3) > this.slopes[0][0] && this.level.getMapTileFacing(this.slopes[0][0],this.slopes[0][1], this.slopes[0][2]) == "south"){
                  this.position.y = this.slopes[0][1] ;
                  this.slopes.shift();
               }
               break;

            case "east":
               this.position.z += deltaTime * 0.5 * (this.last_speed + this.next_speed);

               if(this.position.z + 1 > this.tesseract[2]){
                  this.level.setTileVisual(this.tesseract[3], this.tesseract[4], this.tesseract[5], this.position.x + 0.5, this.position.y + 0.5, this.position.z + 1.5);
               }

               if(typeof this.slopes[0] != 'undefined' && parseInt(this.position.z + 0.5) == this.slopes[0][2] && this.level.getMapTileFacing(this.slopes[0][0],this.slopes[0][1], this.slopes[0][2]) == "east"){
                  this.position.y = ((this.position.z - 0.5) % 1) + this.slopes[0][1];
               }else if(typeof this.slopes[0] != 'undefined' && parseInt(this.position.z + 0.3) == this.slopes[0][2] && this.level.getMapTileFacing(this.slopes[0][0],this.slopes[0][1], this.slopes[0][2]) == "west"){
                  this.position.y = 1 - ((this.position.z + 0.3) % 1) + this.slopes[0][1];
               }else if(typeof this.slopes[0] != 'undefined' && parseInt(this.position.z + 0.3) > this.slopes[0][2] && this.level.getMapTileFacing(this.slopes[0][0],this.slopes[0][1], this.slopes[0][2]) == "east"){
                  this.position.y = this.slopes[0][1] + 1;
                  this.slopes.shift();
               }else if(typeof this.slopes[0] != 'undefined' && parseInt(this.position.z + 0.3) > this.slopes[0][2] && this.level.getMapTileFacing(this.slopes[0][0],this.slopes[0][1], this.slopes[0][2]) == "west"){
                  this.position.y = this.slopes[0][1] ;
                  this.slopes.shift();
               }
               break;

            case "west":
                  this.position.z -= deltaTime * 0.5 * (this.last_speed + this.next_speed);

                  if(this.position.z - 1 < this.tesseract[2]){
                     this.level.setTileVisual(this.tesseract[3], this.tesseract[4], this.tesseract[5], this.position.x + 0.5, this.position.y + 0.5, this.position.z - 0.5);
                  }

                  if(typeof this.slopes[0] != 'undefined' && parseInt(this.position.z + 0.5) == this.slopes[0][2] && this.level.getMapTileFacing(this.slopes[0][0],this.slopes[0][1], this.slopes[0][2]) == "west"){
                     this.position.y = (1 - (this.position.z + 0.5) % 1) + this.slopes[0][1];
                  }else if(typeof this.slopes[0] != 'undefined' && parseInt(this.position.z + 0.5) == this.slopes[0][2] && this.level.getMapTileFacing(this.slopes[0][0],this.slopes[0][1], this.slopes[0][2]) == "east"){
                     this.position.y = ((this.position.z + 0.5) % 1) + this.slopes[0][1];
                  }else if(typeof this.slopes[0] != 'undefined' && parseInt(this.position.z + 0.5) < this.slopes[0][2] && this.level.getMapTileFacing(this.slopes[0][0],this.slopes[0][1], this.slopes[0][2]) == "west"){
                     this.position.y = this.slopes[0][1] + 1;
                     this.slopes.shift();
                  }else if(typeof this.slopes[0] != 'undefined' && parseInt(this.position.z + 0.5 ) < this.slopes[0][2] && this.level.getMapTileFacing(this.slopes[0][0],this.slopes[0][1], this.slopes[0][2]) == "east"){
                     this.position.y = this.slopes[0][1];
                     this.slopes.shift();
                  }
                  break;

            case "south":

               this.position.x -= deltaTime * 0.5 * (this.last_speed + this.next_speed);
               if(this.position.x - 1 < this.tesseract[0]){
                  this.level.setTileVisual(this.tesseract[3], this.tesseract[4], this.tesseract[5], this.position.x - 0.5, this.position.y + 0.5, this.position.z + 0.5);
               }

               if(typeof this.slopes[0] != 'undefined' && parseInt(this.position.x + 0.5) == this.slopes[0][0] && this.level.getMapTileFacing(this.slopes[0][0],this.slopes[0][1], this.slopes[0][2]) == "south"){
                  this.position.y = (1 - (this.position.x + 0.5) % 1) + this.slopes[0][1];
               }else if(typeof this.slopes[0] != 'undefined' && parseInt(this.position.x + 0.5) == this.slopes[0][0] && this.level.getMapTileFacing(this.slopes[0][0],this.slopes[0][1], this.slopes[0][2]) == "north"){
                  this.position.y = ((this.position.x + 0.5) % 1) + this.slopes[0][1];
               }else if(typeof this.slopes[0] != 'undefined' && parseInt(this.position.x + 0.5) < this.slopes[0][0] && this.level.getMapTileFacing(this.slopes[0][0],this.slopes[0][1], this.slopes[0][2]) == "south"){
                  this.position.y = this.slopes[0][1] + 1;
                  this.slopes.shift();
               }else if(typeof this.slopes[0] != 'undefined' && parseInt(this.position.x + 0.5 ) < this.slopes[0][0] && this.level.getMapTileFacing(this.slopes[0][0],this.slopes[0][1], this.slopes[0][2]) == "north"){
                  this.position.y = this.slopes[0][1];
                  this.slopes.shift();
               }
               break;
   
         }
         this.last_speed = this.next_speed;
      } else if(this.moving != "false"){

         this.position.x = this.next_position.x;
         this.position.y = this.next_position.y;
         this.position.z = this.next_position.z;

         if(this.tesseract.length != 0){
            this.level.setTileVisual(this.tesseract[3], this.tesseract[4], this.tesseract[5], this.tesseract[3] + 0.5, this.tesseract[4] + 0.5, this.tesseract[5] + 0.5);
            /* this.level.getMapTileMesh(this.tesseract[3], this.tesseract[4], this.tesseract[5]).position.x = this.tesseract[3] + 0.5;
            this.level.getMapTileMesh(this.tesseract[3], this.tesseract[4], this.tesseract[5]).position.y = this.tesseract[4] + 0.5;
            this.level.getMapTileMesh(this.tesseract[3], this.tesseract[4], this.tesseract[5]).position.z = this.tesseract[5] + 0.5; */
            this.tesseract.splice(0,this.tesseract.length);
         }
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
      this.slopes.splice(0,this.slopes.length);
   }

   addDestinationFunc(destinationFunc){
      this.destinationFunc = destinationFunc;
   }
}

export { Player };