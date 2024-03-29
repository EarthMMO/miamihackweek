import {
  Container,
  Grid,
  GridItem,
  Box,
  IconButton,
  Center,
} from "@chakra-ui/react";
import Link from "next/link";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { BACKEND_API_URL } from "../config";
import { io } from "socket.io-client";
import { useState, useEffect } from "react";
import Button from "../Components/Button";
import HealthBar from "../Components/HealthBar";
import randomName from "random-name";
import { useAccount } from "wagmi";
import { useWeb3AuthHook } from "../utils/web3AuthContext";
import Layout from "../Components/Layout";
import GoblinMap from "./GoblinMap";
import Head from "next/head";
import Map, { Marker } from "react-map-gl";
import axios from "axios";
import { Web3Button } from "@web3modal/react";

const ArPage = () => {
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [seconds, setSeconds] = useState(15);
  const [isActive, setIsActive] = useState(false);
  const [gamerOver, setGameOver] = useState(false);
  const IFRAME_ID = "my-iframe";

  const [userId, setUserId] = useState("");
  const [rooms, setRooms] = useState(null);
  const [characters, setCharacters] = useState({});
  const [entities, setEntities] = useState({});
  const [delayedSpawn, setDelayedSpawn] = useState(false);

  const { address, isConnecting, isDisconnected } = useAccount();
  const {
    w3aAddress,
    w3aUserInfo,
    web3authLogin,
    web3AuthLogout,
    web3authProvider,
    gettingAccount,
  } = useWeb3AuthHook();

  useEffect(() => {
    window.io = io(BACKEND_API_URL);

    window.io.on("connect", () => {
      console.log(`${"633fa6aff39768bdb85d0414"} connected to WebSocket!`);
    });
    window.io.on("log", (arg) => {
      console.log("LOG RESPONSE", arg);
    });
    window.io.on("characters-update", (characters) => {
      console.log("characters-update", characters);
      setCharacters(characters);
    });
    window.io.on("entities-update", (entities) => {
      console.log("entities-update", entities);
      setEntities(entities);
      document
        .querySelector("#my-iframe")
        .contentWindow.AFRAME.components.spotxcomponent.Component.prototype.spawnGoblin(
          !entities[0].isDead
        );
      document
        .querySelector("#my-iframe")
        .contentWindow.AFRAME.components.spotxcomponent.Component.prototype.spawnGoblinMinions(
          {
            1: !entities[1].isDead,
            2: !entities[2].isDead,
            3: !entities[3].isDead,
            4: !entities[4].isDead,
          }
        );
    });
    window.io.on("characters-death", (deadCharacterId, characters) => {
      console.log(`${characters[deadCharacterId].name} is dead!`);
      setCharacters(characters);
      document
        .querySelector("#my-iframe")
        .contentWindow.AFRAME.components.spotxcomponent.Component.prototype.onCharacterDeath(
          deadCharacterId
        );
    });
    window.io.on("entities-death", (deadEntityId, entities) => {
      console.log(`${entities[deadEntityId].name} is dead!`);
      setEntities(entities);
      if (deadEntityId === 0) {
        document
          .querySelector("#my-iframe")
          .contentWindow.AFRAME.components.spotxcomponent.Component.prototype.spawnGoblin(
            false
          );
      } else {
        document
          .querySelector("#my-iframe")
          .contentWindow.AFRAME.components.spotxcomponent.Component.prototype.spawnGoblinMinions(
            {
              1: !entities[1].isDead,
              2: !entities[2].isDead,
              3: !entities[3].isDead,
              4: !entities[4].isDead,
            }
          );
      }
    });
    window.io.on("spawn-adds", (entities) => {
      console.log("spawn-adds", entities);
      setEntities(entities);
      document
        .querySelector("#my-iframe")
        .contentWindow.AFRAME.components.spotxcomponent.Component.prototype.spawnGoblinMinions(
          {
            1: true,
            2: true,
            3: true,
            4: true,
          }
        );
    });
    window.io.on("reset-gamestate", (entities) => {
      console.log("reset-gamestate", entities);
      setEntities(entities);
      document
        .querySelector("#my-iframe")
        .contentWindow.AFRAME.components.spotxcomponent.Component.prototype.spawnGoblin(
          true
        );
      document
        .querySelector("#my-iframe")
        .contentWindow.AFRAME.components.spotxcomponent.Component.prototype.spawnGoblinMinions(
          {
            1: false,
            2: false,
            3: false,
            4: false,
          }
        );
    });

    let userId = prompt("What should we call you, adventurer?");
    if (!userId) {
      userId = randomName.first();
    }
    setUserId(userId);
    window.io.emit("identity", userId);
    window.io.emit("subscribe", "ONE", [userId]);
    window.io.emit("sync-gamestate");

    //iFrame to React communication handler
    const attackBossHandler = (event) => {
      console.log("Grakk'thul was attacked!", event.detail.attack);
      attackEntity(userId, 0);
    };
    const attackMinionHandler = (event) => {
      const entityId = event.detail.attack;
      console.log(`Minion ${entityId} was attacked!`);
      attackEntity(userId, entityId);
    };

    const gameStart = () => {
      console.log("GAME STARTED!");
      setIsActive(true);
    };

    //iFrame to React communication event listener
    window.addEventListener("attack", attackBossHandler);
    window.addEventListener("attackMin", attackMinionHandler);
    window.addEventListener("gameStart", gameStart);

    //iFrame to React communication handler cleanup
    return () => {
      window.removeEventListener("attack", attackBossHandler);
      window.removeEventListener("attackMin", attackMinionHandler);
      window.removeEventListener("gameStart", gameStart);
    };
  }, []);

  useEffect(() => {
    window.XRIFrame.registerXRIFrame(IFRAME_ID);
    return () => {
      window.XRIFrame.deregisterXRIFrame();
    };
  }, []);

  useEffect(() => {
    console.log("tracking the game");
    const endGame = async (timer) => {
      //alert("game over!");
      //setGameOver(true);
    };
    let interval = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((seconds) => seconds - 1);
      }, 1000);
    } else if (isActive && seconds < 1) {
      endGame();
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  function attackCharacter() {
    const characterId = 0;
    const ENTITY_DAMAGE = 20;
    window.io.emit("attackCharacter", characterId, ENTITY_DAMAGE);
    //setCharacters((prevCharacters) => {
    //  const optimisticUpdate = { ...prevCharacters };
    //  optimisticUpdate[characterId].health -= ENTITY_DAMAGE;
    //  return optimisticUpdate;
    //});
  }

  function attackEntity(userId, entityId) {
    const CHARACTER_DAMAGE = 86;
    window.io.emit("attackEntity", userId, entityId, CHARACTER_DAMAGE);
    //setEntities((prevEntities) => {
    //  const optimisticUpdate = { ...prevEntities };
    //  optimisticUpdate[entityId].health -= CHARACTER_DAMAGE;
    //  return optimisticUpdate;
    //});
  }

  function sendNFT(web3Address) {
    let options = {
      method: "POST",
      url: "https://www.crossmint.com/api/2022-06-09/collections/default-polygon/nfts",
      headers: {
        "content-type": "application/json",
        "x-client-secret": "sk_live.cb3lQN9Q.cONyod8OmYRwcpy4PmAjCWLIyLAudvtJ",
        "x-project-id": "17b7b34b-712d-4469-93ae-e653e8cf8938",
      },
      data: {
        recipient: `polygon:${web3Address}`,
        metadata: {
          name: "Staff of Grakk'thul",
          image:
            "https://bafybeieezdqjulcgtjpnsc3gsipwnnlle2shxetzxqrq7ulipejgesegia.ipfs.nftstorage.link/",
          description: "Staff dropped after defeating Grakk'thul",
        },
      },
    };

    axios
      .request(options)
      .then(function (response) {
        console.log(response.data);
        alert(`CONGRATS! NFT sent to ${web3Address}`);
      })
      .catch(function (error) {
        console.error(error);
        alert(
          "NFT NOT SENT! NFT's may have run out or there may be a problem with your wallet."
        );
      });
  }

  useEffect(() => {
    if (address) {
      console.log(address, "WEB3 ADDRESS");
      sendNFT(address);
    }
  }, [address]);

  return (
    <div>
      {/*
      <Link href="/">
        <IconButton size={"md"} icon={<ArrowBackIcon />}>
          {"<--"}
        </IconButton>
      </Link>
      */}
      {/*
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Button
          label={"Identity"}
          onClick={() => window.io.emit("identity", name)}
        />
        <Button
          label={"Join room ONE"}
          onClick={() => window.io.emit("subscribe", "ONE", [name])}
        />
        <Button
          label={"Clear"}
          onClick={() => window.io.emit("clear", "ONE")}
        />
        <Button label={"Log gamestate"} onClick={() => window.io.emit("log")} />
            <Button
              label={"Print rooms"}
              onClick={() => window.io.emit("print-rooms")}
            />
        */}
      {/* {w3aAddress ? (
          <Button onClick={web3AuthLogout}>Logout</Button>
        ) : (
          <div className="float-right" >
            <Web3Button />
          </div>
        )
      } */}
      <Center className="flex-col w-full">
        <div className="flex-col">
          <Center className="mb-2">
            <b>
              Hey {userId}, tap goblins to shoot em, and bring your friends!
            </b>
          </Center>
          <Center className="mb-2">
            {/*
            <Button
              label={"Give Grakk'thul a Max Potion 🧪"}
              onClick={() => window.io.emit("reset-gamestate")}
            />
            */}
            <a
              href={"https://discord.gg/earthmmo"}
              style={{
                color: "white",
                fontWeight: "bold",
                borderRadius: 8,
                display: "inline-flex",
                alignItems: "center",
                padding: "7px 12px",
                backgroundColor: "#5865F2",
                textDecoration: "none",
              }}
              target="_blank"
            >
              <div style={{ width: 25, height: 25, marginRight: 10 }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 127.14 96.36"
                  style={{
                    paddingTop: "4px",
                  }}
                >
                  <path
                    fill="#fff"
                    class="cls-1"
                    d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"
                  />
                </svg>
              </div>
              <span>{"EarthMMO Discord"}</span>
            </a>
          </Center>
        </div>
        <div
          className={`${
            entities[0]?.isDead ? "" : "hidden"
          } flex float-right mb-2`}
        >
          <Web3Button />
        </div>
        {entities[0]?.isDead && (
          <b>
            {userId}, you defeated the mischievous Grakk'thul and saved Miami!
            <br />
            Claim the [Staff of Grakk'thul] NFT by connecting your wallet!
          </b>
        )}
      </Center>
      <div className="absolute w-full justify-between pointer-events-none">
        {/*
        <Button label={"Attack character"} onClick={attackCharacter} />
        <Button
          label={"IFrame Event"}
          onClick={() => {
            console.log(
              "CONTENTWINDOW",
              document.querySelector("#my-iframe").contentWindow
            );
            document
              .querySelector("#my-iframe")
              .contentWindow.AFRAME.components.spotxcomponent.Component.prototype.spawnGoblin(
                { spawn: true }
              );
            console.log("DONEZO");
          }}
        />
        */}
        <span className={`flex flex-row mt-4 w-full justify-between`}>
          <div className={`w-fit flex flex-col`}>
            {Object.keys(characters).map((characterId) => {
              const character = characters[characterId];
              return (
                <HealthBar
                  character={character}
                  percentage={character.health / character.maxHealth}
                />
              );
            })}
          </div>
          <div className={`w-fit flex flex-col`}>
            {Object.keys(entities).map((entityId) => {
              const entity = entities[entityId];
              return (
                <HealthBar
                  character={entity}
                  percentage={entity.health / entity.maxHealth}
                  enemy
                />
              );
            })}
          </div>
        </span>
      </div>
      <div
        // style={{ height: "75vh", width: "100vw" }}
        dangerouslySetInnerHTML={{
          __html: `<iframe
            id="my-iframe"
            style="border: 0; width: 100vw; height: 90vh"
            allow="camera;microphone;gyroscope;accelerometer;"
            src="demoARexperience.html">
            </iframe>`,
        }}
      />
    </div>
  );
};

export default ArPage;
