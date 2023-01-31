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

const ArPage = () => {
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [seconds, setSeconds] = useState(15);
  const [isActive, setIsActive] = useState(false);
  const [gamerOver, setGameOver] = useState(false);
  const IFRAME_ID = "my-iframe";

  //useEffect(() => {
  //  async function fetchQuests() {
  //    try {
  //      console.log("WTFISH");
  //      const quests = await GET(`quest/${"6387a5c341cd13aacec4a646"}`);
  //      console.log("QUESTS", quests);
  //    } catch (error) {
  //      console.log("ERROR", error);
  //    }
  //  }

  //  fetchQuests();
  //}, []);

  useEffect(() => {
    window.io = io(BACKEND_API_URL);
    window.io.emit("identity", "633fa6aff39768bdb85d0414");
    window.io.on("connect", () => {
      console.log(`${"633fa6aff39768bdb85d0414"} connected to WebSocket!`);
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
      let pts = Math.min(event.detail.coinPoints * 100, 4500);
      console.log("react coinPoints", event.detail.coinPoints);
      setEarnedPoints(pts);
    };

    const gameStart = () => {
      console.log("GAME STARTED!");
      setIsActive(true);
    };

    //iFrame to React communication event listener
    window.addEventListener("points", handler);
    window.addEventListener("gameStart", gameStart);

    //iFrame to React communication handler cleanup
    return () => {
      window.removeEventListener("points", handler);
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

  return (
    <>
      <Link href="/">
        <IconButton size={"md"} icon={<ArrowBackIcon />}>
          {"<--"}
        </IconButton>
      </Link>
      <Container fluid mt={8}>
        <Grid fluid justifyItems={"center"}>
          <Button
            size={"md"}
            icon={<ArrowBackIcon />}
            onPress={() => {
              console.log("YEET");
            }}
          >
            {"LOG"}
          </Button>
          <GridItem>
            Time Remaining: {seconds}
            <br />
            Points: {earnedPoints}
          </GridItem>
        </Grid>
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
