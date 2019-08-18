import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { MuseClient } from 'muse-js';

function App() {
  let client = new MuseClient();

  const serializeJSON = data => Object.keys(data).map(keyName => `${encodeURIComponent(keyName)}=${encodeURIComponent(data[keyName])}`).join('&');
  const send = async data => {
    await fetch('http://localhost:3020/send', {
method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
      body: serializeJSON( data )
    })
    .catch(e => console.log(e));
  };

  const start = async () => {
    await client.connect();
    await client.start();
    console.log(client);
    let fullData = {};
    client.eegReadings.subscribe(  reading => {
      Object.assign(fullData, reading);
      fullData.deviceName = client.deviceName;
     // send(fullData);
      console.log(fullData);
    });
  };

  const stop = async () =>  {
    client.pause();
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <button onClick={start}>start</button>
        <button onClick={stop}>stop</button>
      </header>
    </div>
  );
}

export default App;
