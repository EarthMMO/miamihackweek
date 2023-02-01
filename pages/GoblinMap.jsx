import Head from 'next/head';
import Map, {Marker} from 'react-map-gl';

const goblinMap = () => {
  return (
    <>
      <Head>
        <link href='https://api.mapbox.com/mapbox-gl-js/v2.8.1/mapbox-gl.css' rel='stylesheet' />
      </Head>
      <Map
        initialViewState={{
          latitude: 25.791437,
          longitude: -80.194324,
          zoom: 14
        }}
        style={{width: '100vw', height: '100vh', margin: 0}}
        mapStyle="mapbox://styles/mapbox/streets-v9"
        mapboxAccessToken="pk.eyJ1IjoianJlZGJveXoiLCJhIjoiY2xka3JvN2s5MHB1ODNybXM1dHJzbnlidyJ9.QgPoymDkVG1RuMlaWo2BPw"
      >
        <Marker
        longitude={-80.1999636}
        latitude={25.799933}>
          <img src={"https://www.svgrepo.com/show/322436/goblin-head.svg"} width="50" height="50" alt="Head of a goblin"/>
      </Marker>
      </Map>
    </>
  )
}

export default goblinMap;