import React from 'react';
import Head from 'next/head';
import Map, {Marker, GeolocateControl, Popup} from 'react-map-gl';
import { useRouter } from 'next/navigation';
import GameModal from './GameModal'

const { useRef, useEffect, useState } = React;


const goblinMap = () => {
  const router = useRouter();
  const geolocateControlRef = useRef(null);
  const [showModal, setShowModal] = useState(false);

  // uncomment to find user position on load
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     console.log('This will run after 1 second!')
  //     if (geolocateControlRef.current.trigger) {
  //       geolocateControlRef.current.trigger()
  //     }
  //   }, 500)
  //   return () => clearTimeout(timer)
  // }, [])

  // const openModal = () => {
  //   // e.preventDefault();
  //   setShowModal(true);
  // }

  // const closeModal = () => {
  //   // e.preventDefault();
  //   setShowModal(false);
  // }

  // const openARpage = () => {
  //   router.push('/ar-page')
  // }

  const getDistance = (lat1, lat2, lon1, lon2) => {
    lon1 = (lon1 * Math.PI) / 180;
    lon2 = (lon2 * Math.PI) / 180;
    lat1 = (lat1 * Math.PI) / 180;
    lat2 = (lat2 * Math.PI) / 180;
    // Haversine formula
    let dlon = lon2 - lon1;
    let dlat = lat2 - lat1;
    let a =
      Math.pow(Math.sin(dlat / 2), 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);

    let c = 2 * Math.asin(Math.sqrt(a));
    let r = 6371;
    return c * r * 1000;
  };

  const promptMessage = () => {
    let person = prompt("Please enter your name");
    if (person != null) {
      console.log( "Hello " + person + "! How are you today?")
      router.push('/ar-page')
    }
  }

  const checkWithinRange = (position) => {
    console.log(position.coords.latitude, position.coords.longitude);
    console.log(getDistance(position.coords.latitude, 25.791437, position.coords.longitude, -80.194324))
  }

  return (
    <div >
      <Head>
        <link href='https://api.mapbox.com/mapbox-gl-js/v2.8.1/mapbox-gl.css' rel='stylesheet' />
      </Head>
      {/* {showModal && <GameModal />} */}
      <Map
        className="z-0"
        initialViewState={{
          latitude: 25.791437,
          longitude: -80.194324,
          zoom: 14
        }}
        style={{width: '100vw', height: '100vh', margin: 20}}
        mapStyle="mapbox://styles/mapbox/streets-v9"
        mapboxAccessToken="pk.eyJ1IjoianJlZGJveXoiLCJhIjoiY2xka3JvN2s5MHB1ODNybXM1dHJzbnlidyJ9.QgPoymDkVG1RuMlaWo2BPw"
      >
        <GeolocateControl
          // ref={geolocateControlRef} uncomment to find user position on load
          positionOptions={{ enableHighAccuracy: true }}
          trackUserLocation={true}
          position='bottom-left'
          onGeolocate={(position) => {checkWithinRange(position)}}
        />
        <Marker
          onClick={()=> promptMessage()}
          longitude={-80.1999636}
          latitude={25.799933}>
            <img src={"https://www.svgrepo.com/show/322436/goblin-head.svg"} width="50" height="50"  alt="Head of a goblin"/>
        </Marker>
      </Map>
    </div>
  )
}

export default goblinMap;