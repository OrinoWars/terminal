// src/App.js
import React, { useState } from 'react';
import WalletConnector from './components/WalletConnector';
import NFTDisplay from './components/NFTDisplay';
import { GlobalStyle } from './styles/StyledComponents';
import ReactGA from "react-ga4";

ReactGA.initialize("G-N45FD4FT87");

const App = () => {
    const [nfts, setNfts] = useState([]);

    return (
        <>
            <GlobalStyle />
            <WalletConnector onNFTLoad={setNfts} />
        </>
    );
};

export default App;
