AFRAME.registerComponent("spotxcomponent", {

  spawnGoblin(someData) {
    console.log("Spawn Goblin from Server", someData);
    let world = window.state;
    console.log("STATE", world);

    
    
    // Check if client is in combat already.
    if (world.stage_list[world.current_stage].goblin_alive == true && someData.spawn == true){
      // Serve states goblin is alive, client is already showing it we good!

    }else if (world.stage_list[world.current_stage].goblin_alive == true && someData.spawn == false){
      // Server states goblin is dead, client is showing goblin. clear goblin and hitbox.
      // const goblin = document.getElementById("goblin_boss");
      // goblin.setAttribute("visible", "false");
      // const hitbox = document.getElementById("goblin_hitbox");
      // hitbox.setAttribute("visible", "false");
      world.move_stage = true;


    }else if (world.stage_list[world.current_stage].goblin_alive == false && someData.spawn == true){
      // server states goblin is alive, client is not showing goblin start showing.
      // const goblin = document.getElementById("goblin_boss");
      // goblin.setAttribute("visible", "false");
      // const hitbox = document.getElementById("goblin_hitbox");
      // hitbox.setAttribute("visible", "false");
      world.move_stage = true;
    }

  },
  processCombat() {
    /*

      Stage 1 combat correlates to the combat stage and does the setup for the hitbox,
      and calls aux functions to handle different aspects.

      This Function will be ran once
    */


    console.log("AR Combat");

    // Grab game state
    let world = window.GameState;

    /* show Goblin by default */
    const goblin = document.getElementById("goblin_boss");
    goblin.setAttribute("visible", "true");



    // Create hitbox for goblin.
    const hitbox = document.createElement("a-entity");
    const geometry = `primitive: sphere; radius: ${world.goblin.hitbox_radius}`;
    var material = "";

    if (world.debug) {
      material = "color:#196F3D;transparent:true;opacity:0.3";
    } else {
      material = "color:#196F3D;transparent:true;opacity:0";
    }

    hitbox.setAttribute("geometry", geometry);
    hitbox.setAttribute("material", material);
    hitbox.setAttribute("position", `${world.goblin.x} ${world.goblin.y + 8} ${world.goblin.z}`);
    hitbox.setAttribute("class", "cantap");
    hitbox.setAttribute("visible", "true");
    hitbox.setAttribute("id", "goblin_hitbox");

    // Add items to the mine object.
    this.el.sceneEl.appendChild(hitbox);

    // Add Click listener to hitbox.
    hitbox.addEventListener("click", (event) => {

      // Send attack from the player.
      this.gameUpdate();
      
    });
  },
  processDeath() {
    /* 
      Server has said 
    */
    console.log("process Death");

    // Remove hitbox and goblin
    const hitbox = document.getElementById("goblin_hitbox");
    hitbox.setAttribute("visible", "false");

    const goblin = document.getElementById("goblin_boss");
    goblin.setAttribute("visible", "false");

  },
  StageController(td) {
    /* 
      Handle Stage switches here.
      This will controller the switching the scene idle, play, etc
      Goblin Combat,
      or Goblin dead waiting to respond

    */
    //console.log("StageController FUNC");
    let world = window.GameState;

    // Singleton in a async process
    if (world.move_stage) {
      if (world.moving_timer > 0) {
        world.moving_timer -= td;
        return;
      }
      world.moving_timer = world.moving_time;
      world.move_stage = false;

      world.current_stage = world.current_stage + 1 % Object.keys(window.GameState.stage_list).length;

      console.log("current stage", world.current_stage);
      console.log("world", world.stage_list[world.current_stage]);

      if (world.stage_list[world.current_stage].goblin_alive == true){
        // Goblin alive.
        this.processCombat();
      }else if(world.stage_list[world.current_stage].goblin_alive == false){
        // Goblin Dead
        //const mine_high = document.getElementById("mine_high");
        this.processDeath();
      }
    }
    
    
  },
  gameStart() {
    /*
      Player has started their interaction with the stage 1 goblin. Tell React that they are enaging

    */
    console.log("gameStart FUNC");
    let startEvent = new Event("gameStart");
    window.parent.dispatchEvent(startEvent);
  },
  gameUpdate() {
    let message = {
      //coinPoints: window.state.coin_points,
      attack: true,
    };
    console.log("client sending attack!");
    let evtObj = new CustomEvent("attack", { detail: message });
    window.parent.dispatchEvent(evtObj);
  },
  init() {
    console.log("INIT FUNC");

    /*
      Send that the client is in the AR experience.
    */
    // start of game
    this.gameStart();


    window.GameState = {
      debug: true,
      current_stage: 0,
      moving_timer: 0,
      moving_time: 0.5,
      move_stage: true,
      stage_list: {
        1: {
          goblin_alive: true,
        },
        2: {
          goblin_alive: false,
        }
      },
      goblin:{
        hitbox_radius: 7,
        x: 0,
        y: 2,
        z: -16,
      }
    };

    console.log("number of stages:", Object.keys(window.GameState.stage_list).length);
    console.log("current stage", window.GameState.current_stage);

    /* Hide Goblin by default */
    const goblin = document.getElementById("goblin_boss");
    goblin.setAttribute("visible", "false");

    const mine_high = document.getElementById("mine_high");
    const mine_medium = document.getElementById("mine_medium");
    const mine_low = document.getElementById("mine_low");
    const mine_empty = document.getElementById("mine_empty");

    mine_high.setAttribute("visible", "false");
    mine_medium.setAttribute("visible", "false");
    mine_low.setAttribute("visible", "false");
    mine_empty.setAttribute("visible", "false");
    //});
  },
  tick(time, timeDelta) {
    /*
      Update every tick of the AR.

    */
    // normalize timeDelta (ms)
    var td = timeDelta / 1000;
    this.StageController(td);
  },
});