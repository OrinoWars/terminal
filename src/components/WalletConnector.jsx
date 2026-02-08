import React, { useState } from 'react';
import { getNFTs } from '../contract/etherCityContract';
import { Button, Container, LoadingText, Title } from '../styles/StyledComponents';
import NFTDisplay from './NFTDisplay';
import './WalletConnector.css';

const WalletConnector = ({ onNFTLoad }) => {
    const [walletAddress, setWalletAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [walletConnected, setWalletConnected] = useState(false);
    const [nfts, setNfts] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");

    const handleInputChange = (event) => {
        setWalletAddress(event.target.value);
        setErrorMessage("");
    };

    const fetchNFTs = async () => {
        setLoading(true);
        try {
            setTimeout(async () => {
                if (!walletAddress || !walletAddress.startsWith('0x')) {
                    setErrorMessage("Please enter a valid wallet address starting with 0x.");
                    setLoading(false);
                    return;
                }

                const nftsData = await getNFTs(walletAddress);
                setNfts(nftsData);
                onNFTLoad(nftsData);
                setWalletConnected(true);

                window.scrollTo({ top: 0, behavior: 'smooth' });
                setLoading(false);
            }, 0);

        } catch (error) {
            console.error("Error fetching NFTs:", error);
            setErrorMessage("Failed to fetch NFTs. Please try again.");
            setLoading(false);
        }
    };

    return (
        <Container>
            {!walletConnected ? (
                <>
                    <Title className="neonTitle">Rent Calculator</Title>
                    <input 
                        type="text" 
                        value={walletAddress} 
                        onChange={handleInputChange} 
                        placeholder="Enter Wallet Address" 
                        className="walletInput"
                        style={{
                            padding: '12px 20px',
                            borderRadius: '10px',
                            border: '2px solid rgb(14 158 17)',
                            outline: 'none',
                            fontSize: '18px',
                            fontFamily: 'Font1, sans-serif',
                            textAlign: 'center',
                            width: '80%',
                            boxShadow: 'rgb(85 243 85) 0px 0px 10px',
                            color: '#fff',
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            marginBottom: '10px',
                        }}
                    />
                    <Button 
                        className="neonButton"
                        onClick={fetchNFTs}
                        disabled={loading}
                    >
                        {loading ? <div className="spinner"></div> : "CONNECT"}
                    </Button>
                    {errorMessage && <p style={{ color: 'red', marginTop: '10px', fontSize: '15px' }}>{errorMessage}</p>}
                </>
            ) : (
                <NFTDisplay nfts={nfts} walletAddress={walletAddress} />
            )}
        </Container>
    );
};

export default WalletConnector;
