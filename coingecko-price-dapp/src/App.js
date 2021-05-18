import logo from './logo.svg';
import './App.css';
import React, { useState } from 'react';

import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
require('dotenv').config();
const cors = require('cors');

async function getTokenPrice(coinId, setPrice, setLoading){
  if(coinId !== undefined){    
    setLoading(true);
    let url = "http://localhost:3000/tokenPrice/" + coinId;
    let res = await fetch(url);
    let response = await res.json();
    console.log(response)
    console.log(response.price)
    setLoading(false);
    setPrice(response.price);
  }
  
}



function App() {
  const [coinID, setCoinID] = useState();
  const [price, setPrice] = useState();
  const [loading, setLoading] = useState(false);
  
  const options = [
    'ethereum', 'api3', 'uniswap', 'aave', 
  ];
  const defaultOption = options[0];
  return (
    <div className="App">
    
      
      <div className="App-header">
      <h1> Airnode Price Retrieval Tool </h1>
      <Dropdown options={options} onChange={function(event) {
        
        setCoinID(event.value);
        }} value={coinID} placeholder="Select a Token"  style={{margin: "10px"}}/>
      <button onClick={function() {
        getTokenPrice(coinID, setPrice, setLoading)}
      } style={{margin: "20px"}}> Click To get Token Price</button>
      
        {price !== undefined ? (
          
          <div>
          <h3>Token Price: 
          <p>
            ${price} USD
          </p>
          </h3>
          
          </div>
        ):(
          <>
           
           </>
        )}
        {loading === true ? (
          <>
           <div>
           <h3>
             Loading Token Price.....
           </h3>
           </div>
           </>
        ): (
          <></>
        ) }
      
      </div>
    </div>
  );
}

export default App;
