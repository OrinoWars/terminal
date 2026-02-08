import React, { useState } from 'react';
import { getNFTs } from '../contract/orionWarsContract';
import { Button, Container, LoadingText, Title } from '../styles/StyledComponents';
import NFTDisplay from './NFTDisplay';
import './WalletConnector.css';
import { ethers } from 'ethers';

const WalletConnector = ({ onNFTLoad }) => {
    const [walletAddress, setWalletAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [walletConnected, setWalletConnected] = useState(false);
    const [nfts, setNfts] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");

    const connectWallet = async () => {
        setLoading(true);
        setErrorMessage("");
        
        try {
            // Check if MetaMask is installed
            if (!window.ethereum) {
                setErrorMessage("Please install MetaMask to use this feature.");
                setLoading(false);
                return;
            }

            // Request account access
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            const address = accounts[0];
            setWalletAddress(address);

            // Check if on Sepolia network
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            if (chainId !== '0xaa36a7') { // Sepolia chainId
                setErrorMessage("Please switch to Sepolia Testnet in MetaMask.");
                setLoading(false);
                return;
            }

            // NFT'leri fetch et
            const nftsData = await getNFTs(address);
            setNfts(nftsData);
            onNFTLoad(nftsData);
            setWalletConnected(true);

            window.scrollTo({ top: 0, behavior: 'smooth' });
            setLoading(false);

        } catch (error) {
            console.error("Error connecting wallet:", error);
            if (error.code === 4001) {
                setErrorMessage("Connection rejected. Please try again.");
            } else {
                setErrorMessage("Failed to connect wallet. Please try again.");
            }
            setLoading(false);
        }
    };

    return (
        <Container>
            {!walletConnected ? (
                <div style={styles.mainWrapper}>
                    <Title className="neonTitle" style={styles.mainTitle}>NODE TERMINAL</Title>
                    <div style={styles.twoColumnContainer} className="twoColumnContainer">
                        {/* Sol Panel - Connect Button */}
                        <div style={styles.leftPanel} className="leftPanel">
                            <Button 
                                className="neonButton"
                                onClick={connectWallet}
                                disabled={loading}
                                style={{ width: '100%', margin: '0' }}
                            >
                                {loading ? <div className="spinner"></div> : "CONNECT WALLET"}
                            </Button>
                            {errorMessage && <p style={{ color: '#ff0000', marginTop: '15px', fontSize: '14px', textShadow: '0 0 10px #ff0000' }}>{errorMessage}</p>}
                        </div>

                        {/* Sağ Panel - Bilgi Paneli */}
                        <div style={styles.rightPanel}>
                            <h2 style={styles.panelTitle}>FIXED USDC YIELD PROTOCOL</h2>
                            <div style={styles.panelContent}>
                                {/* İçerik buraya gelecek */}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <NFTDisplay nfts={nfts} walletAddress={walletAddress} />
            )}
        </Container>
    );
};

const styles = {
    mainWrapper: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    mainTitle: {
        marginBottom: '40px',
    },
    twoColumnContainer: {
        display: 'flex',
        gap: '20px',
        width: '90%',
        maxWidth: '1400px',
        padding: '30px',
        border: '3px solid #0077FF',
        borderRadius: '25px',
        background: 'linear-gradient(135deg, rgba(0, 20, 60, 0.6), rgba(0, 10, 40, 0.8))',
        boxShadow: '0 0 40px rgba(0, 119, 255, 0.6), inset 0 0 40px rgba(0, 119, 255, 0.1)',
    },
    leftPanel: {
        flex: '0 0 400px',
        padding: '40px',
        border: '2px solid #0088DD',
        borderRadius: '15px',
        background: '#000000',
        boxShadow: '0 0 25px rgba(0, 136, 221, 0.5), inset 0 0 20px rgba(0, 136, 221, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightPanel: {
        flex: '1',
        padding: '30px',
        border: '2px solid #0088DD',
        borderRadius: '15px',
        background: 'linear-gradient(180deg, rgba(0, 30, 80, 0.5), rgba(0, 20, 60, 0.7))',
        boxShadow: '0 0 25px rgba(0, 136, 221, 0.5), inset 0 0 20px rgba(0, 136, 221, 0.08)',
    },
    panelTitle: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#00E5FF',
        textShadow: '0 0 20px #00E5FF, 0 0 40px #00A8CC',
        fontFamily: 'Font1, sans-serif',
        marginBottom: '30px',
        textAlign: 'left',
        letterSpacing: '3px',
    },
    panelContent: {
        minHeight: '300px',
    },
};

export default WalletConnector;
