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

const ArPage = () => {
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [seconds, setSeconds] = useState(15);
  const [isActive, setIsActive] = useState(false);
  const [gamerOver, setGameOver] = useState(false);
  const IFRAME_ID = "my-iframe";

  const [name, setName] = useState("");
  const [rooms, setRooms] = useState(null);
  const [characters, setCharacters] = useState({});
  const [entities, setEntities] = useState({});

  const { address, isConnecting, isDisconnected } = useAccount();
  const { w3aAddress, w3aUserInfo, w3aAuthenticatedUser } = useWeb3AuthHook();

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
      document
        .querySelector("#my-iframe")
        .contentWindow.AFRAME.components.spotxcomponent.Component.prototype.spawnGoblin(
          false
        );
    });

    const randomFirstName = randomName.first();
    window.io.emit("identity", randomFirstName);
    window.io.emit("subscribe", "ONE", [randomFirstName]);
    window.io.emit("sync-gamestate", (response) => {
      console.log("CHARACTERS", response.characters);
      console.log("ENTITIES", response.entities);
      setCharacters(response.characters);
      setEntities(response.entities);
    });
  }, []);

  useEffect(() => {
    window.XRIFrame.registerXRIFrame(IFRAME_ID);
    return () => {
      window.XRIFrame.deregisterXRIFrame();
    };
  }, []);

  useEffect(() => {
    //iFrame to React communication handler
    const handler = (event) => {
      //let pts = Math.min(event.detail.coinPoints * 100, 4500);
      console.log("react attack recieved!", event.detail.attack);
      attackEntity();
      //setEarnedPoints(pts);
    };

    const gameStart = () => {
      console.log("GAME STARTED!");
      setIsActive(true);
    };

    //iFrame to React communication event listener
    window.addEventListener("attack", handler);
    window.addEventListener("gameStart", gameStart);

    //iFrame to React communication handler cleanup
    return () => {
      window.removeEventListener("attack", handler);
      window.removeEventListener("gameStart", gameStart);
    };
  }, []);

  useEffect(() => {
    console.log("tracking the game");
    const endGame = async (timer) => {
      alert("game over!");
      setGameOver(true);
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

  function attackEntity() {
    const entityId = 0;
    const CHARACTER_DAMAGE = 86;
    window.io.emit("attackEntity", entityId, CHARACTER_DAMAGE);
    //setEntities((prevEntities) => {
    //  const optimisticUpdate = { ...prevEntities };
    //  optimisticUpdate[entityId].health -= CHARACTER_DAMAGE;
    //  return optimisticUpdate;
    //});
  }

  return (
    <>
      <Link href="/">
        <IconButton size={"md"} icon={<ArrowBackIcon />}>
          {"<--"}
        </IconButton>
      </Link>
      <Container fluid mt={8}>
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
        */}
        <Button
          label={"Print rooms"}
          onClick={() => window.io.emit("print-rooms")}
        />
        <Button label={"Log gamestate"} onClick={() => window.io.emit("log")} />
        <Button
          label={"Reset gamestate"}
          onClick={() => window.io.emit("reset-gamestate")}
        />
        <Button label={"Attack character"} onClick={attackCharacter} />
        {/*
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
        <span className={`flex flex-row mt-4 justify-between`}>
          <div className={`w-full flex justify-start`}>
            <HealthBar character={characters[0]} />
            {Object.keys(characters)
              .slice(1)
              .map((playerId) => (
                <HealthBar character={characters[playerId]} partyMember />
              ))}
          </div>
          <div className={`w-full flex justify-end`}>
            {Object.keys(entities).map((entityId) => (
              <HealthBar character={entities[entityId]} enemy />
            ))}
          </div>
        </span>
        <Center>
          <Box
            // style={{ height: "75vh", width: "100vw" }}
            dangerouslySetInnerHTML={{
              __html: `<iframe
            id="my-iframe"
            style="border: 0; width: 75vh; height: 75vh"
            allow="camera;microphone;gyroscope;accelerometer;"
            src="demoARexperience.html">
            </iframe>`,
            }}
          />
        </Center>
      </Container>
    </>
  );
};

export default ArPage;
