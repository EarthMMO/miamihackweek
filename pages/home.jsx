import Head from "next/head";
import Map, { Marker } from "react-map-gl";
import { Container, Spinner, Grid, GridItem } from "@chakra-ui/react";
import { useAccount } from "wagmi";
import { useEffect } from "react";

import Layout from "../Components/Layout";
import { useWeb3AuthHook } from "../utils/web3AuthContext";

const Homepage = () => {
  //hook to access wallet connect user address
  const { address, isConnecting, isDisconnected } = useAccount();

  //hook to access web3auth user address
  const { w3aAddress, w3aUserInfo, w3aAuthenticatedUser } = useWeb3AuthHook();

  //force update and do cool things when we have an address
  useEffect(() => {}, [address, w3aAddress]);

  if (isConnecting) {
    return (
      <Container fluid mt={8}>
        <Grid justifyItems={"center"}>
          <GridItem>
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
            />
          </GridItem>
        </Grid>
      </Container>
    );
  }

  return (
    <Layout>
      <Head>
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v2.8.1/mapbox-gl.css"
          rel="stylesheet"
        />
      </Head>
      <Map
        initialViewState={{
          latitude: 25.791437,
          longitude: -80.194324,
          zoom: 14,
        }}
        style={{ width: 800, height: 600 }}
        mapStyle="mapbox://styles/mapbox/streets-v9"
        mapboxAccessToken="pk.eyJ1IjoianJlZGJveXoiLCJhIjoiY2xka3JvN2s5MHB1ODNybXM1dHJzbnlidyJ9.QgPoymDkVG1RuMlaWo2BPw"
      >
        <Marker longitude={-80.1999636} latitude={25.799933}>
          <img
            src={"https://www.svgrepo.com/show/322436/goblin-head.svg"}
            width="50"
            height="50"
          />
        </Marker>
      </Map>
    </Layout>
  );
};

export default Homepage;
