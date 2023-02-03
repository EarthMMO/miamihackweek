AFRAME.registerComponent("spotxcomponent", {
  onCharacterDeath(characterId) {
    console.log(`${characterId} is dead!`);
  },
  spawnGoblin(someData) {
    console.log("SPAWN: Goblin from Server", someData);
    let world = window.GameState;
    console.log("STATE", world);

    // Check if client is in combat already.
    if (
      world.stage_list[world.current_stage].goblin_alive == true && someData == false
    ) {
      // Server states goblin is dead, client is showing goblin. clear goblin and hitbox.
      console.log("SPAWN: Goblin is dead.");
      world.move_stage = true;

    } else if (
      world.stage_list[world.current_stage].goblin_alive == false && someData == true
    ) {
      // server states goblin is alive, client is not showing goblin start showing.
      console.log("SPAWN: Goblin is spawned.");
      world.move_stage = true;
    }else {
      console.log("SPAWN: nothing...");
    }
  },
  // otherPlayerAttack(data){
  //   /*
  //     data = {
  //       0: true, // Boss
  //       1: false,
  //       2: false,
  //       3: false,
  //       4: false
  //     }

  //   */
  //   let world = window.GameState;
    
  //   world.processOtherAttack = data;
  //   world.doProcessOther = true;
  // },
  attackPoints(points){
    let world = window.GameState;
    world.textbox_value = points;
  },
  innerSpawnGoblinMinions(){

    console.log("INNER SPAWN GOBLIN MINIONS")
    this.processMinions();

    // Grab game state
    let world = window.GameState;
    

    if (world.anyAlive){
      if (world.goblin.init_shield == false){
        // Let game know that this is first time for sheilds.
        world.goblin.init_shield = true;

        // remove boss hitbox.
        const hitbox = document.getElementById("goblin_hitbox");
        hitbox.setAttribute("visible", "false");
        hitbox.parentNode.removeChild(hitbox);
        
        // Add Shield
        const shield = document.getElementById("goblin_shield");
        shield.setAttribute("visible", "true");
        shield.setAttribute(
          "position",
          `${world.goblin.x} ${world.goblin.y + 8} ${world.goblin.z}`
        );
      }
      

    }else{

      // Check that init_shield stage was hit.
      if(world.goblin.init_shield){
        world.goblin.init_shield = false;
        // Add boss hitbox.
        // Create hitbox for goblin.
        const hitbox2 = document.createElement("a-entity");
        const geometry = `primitive: sphere; radius: ${world.goblin.hitbox_radius}`;
        var material = "";

        if (world.debug) {
          material = "color:#196F3D;transparent:true;opacity:0.3";
        } else {
          material = "color:#196F3D;transparent:true;opacity:0";
        }

        hitbox2.setAttribute("geometry", geometry);
        hitbox2.setAttribute("material", material);
        hitbox2.setAttribute(
          "position",
          `${world.goblin.x} ${world.goblin.y + 8} ${world.goblin.z}`
        );
        hitbox2.setAttribute("class", "cantap");
        hitbox2.setAttribute("visible", "true");
        hitbox2.setAttribute("id", "goblin_hitbox");

        // Add items to the mine object.
        this.el.sceneEl.appendChild(hitbox2);

        // Add Click listener to hitbox.
        hitbox2.addEventListener("click", (event) => {

          // grab camera
          const camera = document.getElementById("camera");
          const cameraPos = camera.getAttribute("position");

          // shoot fireball
          this.shootFireball(cameraPos, world.goblin);

          // Send attack from the player.
          this.gameUpdate();
        });

        // Add Shield
        const shield = document.getElementById("goblin_shield");
        shield.setAttribute("visible", "false");
        shield.parentNode.removeChild(shield);
      }
      

    }
  },
  spawnGoblinMinions(someData) {
    // REACT CALL
    /*
      excepting data:
      someData = {
        1: true,
        2: false,
        3: false,
        4: true
      }
    */
    console.log("SPAWN Minions: Goblin from Server", someData);
    let world = window.GameState;
    
    world.anyAlive = false;

    // Spawn living, despawn dead.
    for (let gn = 1; gn <= Object.keys(world.goblin_mins).length; gn++){

      // Check if going from Alive to dead.
      if (world.goblin_mins[gn].alive == true && someData[gn] == false){
        // kill goblin minion
        world.toKillMinions[gn] = true;
        //this.processDeathMinion(gn);
      }
      if (someData[gn]){
        world.anyAlive = true;
      }
      world.goblin_mins[gn].alive = someData[gn];
    }
    world.spawnGoblinMinions = true;

    
  },

  shootFireball(A, B) {
    console.log("shooting fireball");
    // Grab game state
    let world = window.GameState;


    spread_y =
        Math.random() * 2 * world.fireball.spread_y - world.fireball.spread_y;
      spread_z =
        Math.random() * 2 * world.fireball.spread_z - world.fireball.spread_z;

    // Add the textbox to the attack
    const new_TextBox = document.createElement('a-entity');
    new_TextBox.setAttribute(
      'text',
      `anchor:center;baseline:center;align:center;wrapCount:20;transparent:true;opacity:0.7;color:#D0021B;value:-${world.textbox_value}`
    );
    new_TextBox.setAttribute(
      'geometry',
      'primitive:plane;width:3;height:auto'
    );
    new_TextBox.setAttribute(
      'material',
      'color:#444444;transparent:true;opacity:0'
    );
    
    new_TextBox.setAttribute('position', `${B.x} ${B.y + 8 + spread_y} ${B.z + spread_z}`);
    new_TextBox.setAttribute('visible', 'false');
    new_TextBox.setAttribute('scale', '5 5 5');

    // Add text box to scene.
    this.el.sceneEl.appendChild(new_TextBox);


    // Play Sound
    var soundName =
      world.fireball.sounds[
        Math.floor(Math.random() * world.fireball.sounds.length)
      ];

    const fireball_audio = document.querySelector(soundName).components.sound;
    fireball_audio.stopSound();
    fireball_audio.playSound();

    // grab camera
    // const camera = document.getElementById("camera");
    // const cameraPos = camera.getAttribute("position");

    // console.log("camera", cameraPos);

    // Create new entity for the new object
    const fireball = document.createElement("a-entity");

    // Setup fireball attributes
    fireball.setAttribute(
      "position",
      //`${cameraPos.x} ${cameraPos.y - 3} ${cameraPos.z}`
      `${A.x} ${A.y - 3} ${A.z}`
    );
    fireball.setAttribute("scale", "2 2 2");
    fireball.setAttribute(
      "rotation",
      `${Math.random() * 360} ${Math.random() * 360} ${Math.random() * 360}`
    ); // Initial Rotation
    fireball.setAttribute("visible", "false"); // visible at start.
    // new_coin.setAttribute(
    //   'scale',
    //   `${world.coin.initial_size} ${world.coin.initial_size} ${world.coin.initial_size}`
    // ); // First Size
    fireball.setAttribute("xrextras-spin", {
      speed: 400,
    }); // Rotate / spin
    fireball.setAttribute("gltf-model", "#Fireball");

    // When model is finished loading.
    fireball.addEventListener("model-loaded", () => {
      fireball.setAttribute("visible", "true"); // Make fireball visible

      

      

      fireball.setAttribute("animation__first", {
        property: "position",
        //to: `${world.goblin.x} ${world.goblin.y + 8 + spread_y} ${world.goblin.z + spread_z}`,
        to: `${B.x} ${B.y + 8 + spread_y} ${B.z + spread_z}`,
        dur: "700",
        easing: "easeInQuad",
        loop: "false",
        autoplay: "true",
        dir: "alternate",
      });

      fireball.setAttribute("animation__second", {
        property: "scale",
        to: ".5 .5 .5",
        easing: "easeOutElastic",
        dur: 750,
      });

      fireball.addEventListener("animationcomplete__first", () => {

        // Play goblin hit 1/5 chance
        if (Math.floor(Math.random() * 3) == 1) {
          // Play Sound
          var soundName =
            world.goblin.onhit_sounds[
              Math.floor(Math.random() * world.goblin.onhit_sounds.length)
            ];

          const goblinHit_audio =
            document.querySelector(soundName).components.sound;
          goblinHit_audio.stopSound();
          goblinHit_audio.playSound();
        }
        

        // Display text points
        new_TextBox.setAttribute('visible', 'true');

        // Add Animation
        new_TextBox.setAttribute('animation__textFirst', {
          property: 'position',
          to: `${B.x} ${B.y + 16 + spread_y} ${B.z + spread_z + 8}`,
          dur: '1000',
          easing: 'easeInOutQuad',
          loop: 'false',
          autoplay: 'true',
          dir: 'alternate',
        });

        // Remove After animation
        new_TextBox.addEventListener('animationcomplete__textFirst', () => {
          new_TextBox.setAttribute('visible', 'false'); // remove from display
          new_TextBox.parentNode.removeChild(new_TextBox); // Remove from Aframe
        });


        // remove fireball after animation.
        fireball.setAttribute("visible", "false");
        fireball.parentNode.removeChild(fireball);
      });
    });

    this.el.sceneEl.appendChild(fireball); // Add fireball to scene
  },
  processMinions(){
    /* 
      Setup Minions

    */

    // Grab game state
    let world = window.GameState;
    console.log("Process Goblin Minions")

    /* show Goblin by default */
    // const gm1 = document.getElementById("goblin_min1");
    // const gm2 = document.getElementById("goblin_min2");
    // const gm3 = document.getElementById("goblin_min3");
    // const gm4 = document.getElementById("goblin_min4");

    for (let gn = 1; gn <= Object.keys(world.goblin_mins).length; gn++){
      console.log("goblin ", gn, " is alive? ",world.goblin_mins[gn].alive )
      if(world.goblin_mins[gn].alive && world.goblin_mins[gn].onboard == false){
        world.goblin_mins[gn].onboard = true;

        // min alive
        gm = document.getElementById(`goblin_min${gn}`);
        gm.setAttribute("visible", "true");

        // Create hitbox for goblin.
        const hitbox = document.createElement("a-entity");
        const geometry = `primitive: sphere; radius: ${world.goblin_mins[gn].hitbox_radius}`;
        var material = "";

        if (world.debug) {
          material = "color:#196F3D;transparent:true;opacity:0.3";
        } else {
          material = "color:#196F3D;transparent:true;opacity:0";
        }

        hitbox.setAttribute("geometry", geometry);
        hitbox.setAttribute("material", material);
        hitbox.setAttribute(
          "position",
          `${world.goblin_mins[gn].x} ${world.goblin_mins[gn].y + 6} ${world.goblin_mins[gn].z}`
        );
        hitbox.setAttribute("class", "cantap");
        hitbox.setAttribute("visible", "true");
        hitbox.setAttribute("id", `goblin_min${gn}_hb`);

        // Add items to the mine object.
        this.el.sceneEl.appendChild(hitbox);

        // Add Click listener to hitbox.
        hitbox.addEventListener("click", (event) => {
          // grab camera
          const camera = document.getElementById("camera");
          const cameraPos = camera.getAttribute("position");

          // shoot fireball
          this.shootFireball(cameraPos, world.goblin_mins[gn]);

          // Send attack from the player.
          this.gameMinUpdate(gn);
        });
        
      }else if(world.goblin_mins[gn].alive == false && world.goblin_mins[gn].onboard == true){
          world.goblin_mins[gn].onboard = false;
          // min dead
          this.process_Death_Minion(gn);
        
      }
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

    // Play goblin spawn
    // Play Sound
    var soundName =
      world.goblin.onspawn_sounds[
        Math.floor(Math.random() * world.goblin.onspawn_sounds.length)
      ];

    const goblinSpawn_audio =
      document.querySelector(soundName).components.sound;
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
    hitbox.setAttribute(
      "position",
      `${world.goblin.x} ${world.goblin.y + 8} ${world.goblin.z}`
    );
    hitbox.setAttribute("class", "cantap");
    hitbox.setAttribute("visible", "true");
    hitbox.setAttribute("id", "goblin_hitbox");

    // Add items to the mine object.
    this.el.sceneEl.appendChild(hitbox);

    // Add Click listener to hitbox.
    hitbox.addEventListener("click", (event) => {

      // grab camera
      const camera = document.getElementById("camera");
      const cameraPos = camera.getAttribute("position");

      // shoot fireball
      this.shootFireball(cameraPos, world.goblin);

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
    var soundName =
      world.goblin.ondeath_sounds[
        Math.floor(Math.random() * world.goblin.ondeath_sounds.length)
      ];

    const goblinDeath_audio =
      document.querySelector(soundName).components.sound;
    goblinDeath_audio.stopSound();
    goblinDeath_audio.playSound();

    // Remove hitbox and goblin
    const hitbox = document.getElementById("goblin_hitbox");
    hitbox.setAttribute("visible", "false");
    hitbox.parentNode.removeChild(hitbox);
    //this.el.sceneEl.removeChild(hitbox);

    const goblin = document.getElementById("goblin_boss");
    goblin.setAttribute("visible", "false");
    
  },
  process_Death_Minion(gn) {
    /* 
      Server has said 
    */
    console.log("process Minion Death!!!!!!!!!!!!!!!!!!!!!!!!!: ", gn);
    

    // Grab game state
    let world = window.GameState;
    console.log("");
    // Remove hitbox and goblin
    const hitbox = document.getElementById(`goblin_min${gn}_hb`);
    hitbox.setAttribute("visible", "false");
    hitbox.parentNode.removeChild(hitbox);

    

    // Play goblin death
    // Play Sound
    var soundName =
      world.goblin.ondeath_sounds[
        Math.floor(Math.random() * world.goblin.ondeath_sounds.length)
      ];

    const goblinDeath_audio =
      document.querySelector(soundName).components.sound;
    goblinDeath_audio.stopSound();
    goblinDeath_audio.playSound();

    
    //this.el.sceneEl.removeChild(hitbox);

    const goblin = document.getElementById(`goblin_min${gn}`);
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

    if (world.spawnGoblinMinions){
      world.spawnGoblinMinions = false;
      this.innerSpawnGoblinMinions()
    }

    // if (world.toKillMinions[1] || world.toKillMinions[2] || world.toKillMinions[3] || world.toKillMinions[4]  )
    // {
      
    // }
    

    // Singleton in a async process
    if (world.move_stage) {
      console.log("StageController: ", "moving...")
      if (world.moving_timer > 0) {
        world.moving_timer -= td;
        return;
      }
      world.moving_timer = world.moving_time;
      world.move_stage = false;

      console.log("current_stage:", world.current_stage);
      console.log("mod: ",(Object.keys(window.GameState.stage_list).length + 1));
      world.current_stage = ((world.current_stage + 1) % (Object.keys(window.GameState.stage_list).length + 1));
      console.log("current_stage:", world.current_stage);
      if (world.current_stage <= 0){
        world.current_stage = 1;
      }

      console.log("current stage", world.current_stage);
      console.log("world", world.stage_list[world.current_stage]);

      if (world.stage_list[world.current_stage].goblin_alive == true) {
        // Goblin alive.
        this.processCombat();
        this.processMinions();
      } else if (world.stage_list[world.current_stage].goblin_alive == false) {
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
  gameMinUpdate(n) {
    let message = {
      attack: n,
    };
    console.log(`client sending attack! to min ${n}`);
    let evtObj = new CustomEvent("attackMin", { detail: message });
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
      spawn_minions: false,
      anyAlive: false,
      current_stage: 0,
      moving_timer: 0,
      moving_time: 0.5,
      move_stage: true,
      textbox_value: "86",
      doProcessOther: false,
      toKillMinions: {
        1: false,
        2: false,
        3: false,
        4: false
      },
      processOtherAttack : {
        0: false,
        1: false,
        2: false,
        3: false,
        4: false
      },
      stage_list: {
        1: {
          goblin_alive: true,
        },
        2: {
          goblin_alive: false,
        },
      },
      fireball: {
        sounds: ["#fireball_sound1"],
        spread_y: 1.5,
        spread_z: 1.5,
      },
      goblin_mins : {
        1: {
          alive: false,
          onboard: false,
          hitbox_radius: 5,
          x:-12,
          y:0,
          z:-20
        },
        2: {
          alive: false,
          onboard: false,
          hitbox_radius: 5,
          x:-4,
          y:0,
          z:-15
        },
        3: {
          alive: false,
          onboard: false,
          hitbox_radius: 5,
          x:4,
          y:0,
          z:-15
        },
        4: {
          alive: false,
          onboard: false,
          hitbox_radius: 5,
          x:12,
          y:0,
          z:-20
        }
      },
      goblin: {
        init_shield: false,
        onhit_sounds: ["#goblin_hit1"],
        ondeath_sounds: ["#goblin_death1"],
        onspawn_sounds: ["#goblin_spawn1"],
        hitbox_radius: 7,
        x: 0,
        y: 2,
        z: -30,
      },
    };

    console.log(
      "number of stages:",
      Object.keys(window.GameState.stage_list).length
    );
    console.log("current stage", window.GameState.current_stage);

    /* Hide Goblin by default */
    const goblin = document.getElementById("goblin_boss");
    goblin.setAttribute("visible", "false");

    // hide Shield
    const shield = document.getElementById("goblin_shield");
    shield.setAttribute("visible", "false");

    const gm1 = document.getElementById("goblin_min1");
    const gm2 = document.getElementById("goblin_min2");
    const gm3 = document.getElementById("goblin_min3");
    const gm4 = document.getElementById("goblin_min4");

    gm1.setAttribute("visible", "false");
    gm2.setAttribute("visible", "false");
    gm3.setAttribute("visible", "false");
    gm4.setAttribute("visible", "false");

    //const fireball = document.getElementById("fireball");
    //fireball.setAttribute("visible", "false");

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
