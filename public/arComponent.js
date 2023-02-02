

AFRAME.registerComponent("spotxcomponent", {

  spawnGoblin(someData) {
    console.log("Spawn Goblin from Server", someData);
    let world = window.state;
    console.log("STATE", world);

    
    
    // Check if client is in combat already.
    if (world.stage_list[world.current_stage].goblin_alive == true && someData.spawn == false){
      // Server states goblin is dead, client is showing goblin. clear goblin and hitbox.
      world.move_stage = true;

    }else if (world.stage_list[world.current_stage].goblin_alive == false && someData.spawn == true){
      // server states goblin is alive, client is not showing goblin start showing.
      world.move_stage = true;
    }

  },
  shootFireball(){
    console.log("shooting fireball")
    // Grab game state
    let world = window.GameState;

    // Play Sound
    var soundName = world.fireball.sounds[
      Math.floor(Math.random() * world.fireball.sounds.length)
    ];

    const fireball_audio = document.querySelector(soundName).components.sound;
    fireball_audio.stopSound();
    fireball_audio.playSound();


    // grab camera
    const camera = document.getElementById("camera");
    const cameraPos = camera.getAttribute('position');

    console.log("camera", cameraPos);

    // Create new entity for the new object
    const fireball = document.createElement('a-entity');

    // Setup fireball attributes
    fireball.setAttribute('position', `${cameraPos.x} ${cameraPos.y -3} ${cameraPos.z}`);
    fireball.setAttribute('scale', '2 2 2');
    fireball.setAttribute(
      'rotation',
      `${Math.random() * 360} ${Math.random() * 360} ${Math.random() * 360}`
    ); // Initial Rotation
    fireball.setAttribute('visible', 'false'); // visible at start.
    // new_coin.setAttribute(
    //   'scale',
    //   `${world.coin.initial_size} ${world.coin.initial_size} ${world.coin.initial_size}`
    // ); // First Size
    fireball.setAttribute('xrextras-spin', {
      speed: 400,
    }); // Rotate / spin
    fireball.setAttribute('gltf-model', '#Fireball');

    // When model is finished loading.
    fireball.addEventListener('model-loaded', () => {
    
      fireball.setAttribute('visible', 'true'); // Make fireball visible

      spread_y= (Math.random() * 2 * world.fireball.spread_y) - world.fireball.spread_y;
      spread_z= (Math.random() * 2 * world.fireball.spread_z) - world.fireball.spread_z;

      console.log("spread y:", spread_y)
      console.log("spread z:", spread_z)


      fireball.setAttribute('animation__first', {
        property: 'position',
        to: `${world.goblin.x} ${world.goblin.y + 8 + spread_y} ${world.goblin.z + spread_z}`,
        dur: '700',
        easing: 'easeInQuad',
        loop: 'false',
        autoplay: 'true',
        dir: 'alternate',
      });

      fireball.setAttribute('animation__second', {
        property: 'scale',
        to: '.5 .5 .5',
        easing: 'easeOutElastic',
        dur: 750,
      });

      fireball.addEventListener('animationcomplete__first', () => {

        // Play goblin hit 1/5 chance
        if (Math.floor(Math.random() * 3) == 1){
          // Play Sound
          var soundName = world.goblin.onhit_sounds[
            Math.floor(Math.random() * world.goblin.onhit_sounds.length)
          ];

          const goblinHit_audio = document.querySelector(soundName).components.sound;
          goblinHit_audio.stopSound();
          goblinHit_audio.playSound();
        }
        

        // remove fireball after animation.
        fireball.setAttribute('visible', 'false');
        fireball.parentNode.removeChild(fireball);
      });
    });




    this.el.sceneEl.appendChild(fireball); // Add coin to scene
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

    // Play goblin spawn
    // Play Sound
    var soundName = world.goblin.onspawn_sounds[
      Math.floor(Math.random() * world.goblin.onspawn_sounds.length)
    ];

    const goblinSpawn_audio = document.querySelector(soundName).components.sound;
    goblinSpawn_audio.stopSound();
    goblinSpawn_audio.playSound();

    

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

      // shoot fireball
      this.shootFireball();

      // Send attack from the player.
      this.gameUpdate();
      
    });
  },
  processDeath() {
    /* 
      Server has said 
    */
    console.log("process Death");

    // Grab game state
    let world = window.GameState;

    // Play goblin death
    // Play Sound
    var soundName = world.goblin.ondeath_sounds[
      Math.floor(Math.random() * world.goblin.ondeath_sounds.length)
    ];

    const goblinDeath_audio = document.querySelector(soundName).components.sound;
    goblinDeath_audio.stopSound();
    goblinDeath_audio.playSound();

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
      fireball:{
        sounds: ['#fireball_sound1'],
        spread_y: 1.5,
        spread_z: 1.5,
      },
      goblin:{
        onhit_sounds: ['#goblin_hit1'],
        ondeath_sounds: ['#goblin_death1'],
        onspawn_sounds: ['#goblin_spawn1'],
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

    //const fireball = document.getElementById("fireball");
    //fireball.setAttribute("visible", "false");

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