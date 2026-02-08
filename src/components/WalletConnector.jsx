import React, { useState } from 'react';
import { getNFTs } from '../contract/orionWarsContract';
import { Button, Container, LoadingText, Title } from '../styles/StyledComponents';
import NFTDisplay from './NFTDisplay';
import './WalletConnector.css';
import { ethers } from 'ethers';
import { TbHexagon, TbAtom, TbSun, TbAntenna, TbBolt, TbStarFilled, TbWallet } from 'react-icons/tb';
import { IoCheckmarkCircle } from 'react-icons/io5';

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
                    <div style={styles.brandTitleSection}>
                        <div style={styles.brandTitle}>ORION WARS</div>
                        <Title className="neonTitle" style={styles.mainTitle}>NODE TERMINAL</Title>
                    </div>
                    
                    <div style={styles.singleBoxContainer}>
                        <div
                            className="neonButton"
                            onClick={loading ? null : connectWallet}
                            style={styles.connectButton}
                        >
                            {loading ? (
                                <div className="spinner"></div>
                            ) : (
                                <div style={styles.buttonContent}>
                                    <TbWallet style={styles.buttonIcon} />
                                    <span style={styles.buttonText}>CONNECT WALLET</span>
                                </div>
                            )}
                        </div>
                        
                        {errorMessage && <p style={{ color: '#ff0000', marginBottom: '20px', fontSize: '14px', textShadow: '0 0 10px #ff0000' }}>{errorMessage}</p>}
                        
                        <div style={styles.divider}></div>
                        
                        <div style={styles.infoContent}>
                            <p style={styles.description}>
                                Track your Orion Wars Node NFTs and monitor your passive USDC yield in real-time.
                                Connect your wallet to view your nodes, monthly earnings and active loyalty boosts.
                            </p>
                            
                            <h3 style={styles.sectionTitle}>Node Types & Monthly Yield</h3>
                            <div style={styles.nodeTypesTable}>
                                <div style={styles.nodeRow}>
                                    <span style={styles.nodeEmoji}><TbHexagon /></span>
                                    <span style={styles.nodeName}>NANO</span>
                                    <span style={styles.nodeYield}>6.00 USDC</span>
                                </div>
                                <div style={styles.nodeRow}>
                                    <span style={styles.nodeEmoji}><TbAtom /></span>
                                    <span style={styles.nodeName}>ISOTOPE</span>
                                    <span style={styles.nodeYield}>9.00 USDC</span>
                                </div>
                                <div style={styles.nodeRow}>
                                    <span style={styles.nodeEmoji}><TbSun /></span>
                                    <span style={styles.nodeName}>SOLAR</span>
                                    <span style={styles.nodeYield}>12.00 USDC</span>
                                </div>
                                <div style={styles.nodeRow}>
                                    <span style={styles.nodeEmoji}><TbAntenna /></span>
                                    <span style={styles.nodeName}>VOID RELAY</span>
                                    <span style={styles.nodeYield}>16.00 USDC</span>
                                </div>
                                <div style={styles.nodeRow}>
                                    <span style={styles.nodeEmoji}><TbBolt /></span>
                                    <span style={styles.nodeName}>PLASMA RELAY</span>
                                    <span style={styles.nodeYield}>20.00 USDC</span>
                                </div>
                                <div style={styles.nodeRow}>
                                    <span style={styles.nodeEmoji}><TbStarFilled /></span>
                                    <span style={styles.nodeName}>SINGULARITY</span>
                                    <span style={styles.nodeYield}>24.00 USDC</span>
                                </div>
                            </div>
                            
                            <h3 style={styles.sectionTitle}>Loyalty Boost Protocols</h3>
                            <div style={styles.loyaltySection}>
                                <div style={styles.loyaltyItem}>
                                    <strong style={styles.loyaltyTitle}>⏱️ Signal Stability (Uptime Bonus)</strong>
                                    <p style={styles.loyaltyDesc}>
                                        Efficiency increases based on continuous custody duration:
                                        7 days: +5% • 15 days: +10% • 20 days: +15% • 30+ days: +20% (Max)
                                    </p>
                                </div>
                                <div style={styles.loyaltyItem}>
                                    <strong style={styles.loyaltyTitle}>🔗 Hexa-Link (Cluster Bonus)</strong>
                                    <p style={styles.loyaltyDesc}>
                                        Complete sets of 6 distinct node types earn +10% boost per set. Stackable!
                                    </p>
                                </div>
                            </div>
                            
                            <h3 style={styles.sectionTitle}>Features</h3>
                            <div style={styles.featuresSection}>
                                <div style={styles.featureItem}>
                                    <IoCheckmarkCircle style={styles.featureIcon} />
                                    <span style={styles.featureText}>Real-time NFT detection & yield calculation</span>
                                </div>
                                <div style={styles.featureItem}>
                                    <IoCheckmarkCircle style={styles.featureIcon} />
                                    <span style={styles.featureText}>Automatic loyalty bonus tracking</span>
                                </div>
                                <div style={styles.featureItem}>
                                    <IoCheckmarkCircle style={styles.featureIcon} />
                                    <span style={styles.featureText}>Live node activity timer</span>
                                </div>
                                <div style={styles.featureItem}>
                                    <IoCheckmarkCircle style={styles.featureIcon} />
                                    <span style={styles.featureText}>Next payment countdown</span>
                                </div>
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
        padding: '0 20px',
    },
    brandTitleSection: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        marginTop: '60px',
        marginBottom: '50px',
    },
    brandTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#00D9FF',
        textShadow: '0 0 20px rgba(0, 217, 255, 0.6)',
        fontFamily: 'Rajdhani',
        letterSpacing: '6px',
        textTransform: 'uppercase',
    },
    mainTitle: {
        marginBottom: '0',
    },
    singleBoxContainer: {
        width: '100%',
        maxWidth: '800px',
        padding: '50px',
        border: '2px solid rgba(0, 217, 255, 0.4)',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(0, 20, 60, 0.4), rgba(0, 10, 40, 0.6))',
        boxShadow: '0 8px 32px rgba(0, 119, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
    },
    divider: {
        width: '100%',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(0, 217, 255, 0.5), transparent)',
        marginBottom: '40px',
        marginTop: '10px',
    },
    infoContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '35px',
    },
    description: {
        fontSize: '17px',
        color: '#B0E5F0',
        fontFamily: 'Rajdhani',
        lineHeight: '1.7',
        textAlign: 'center',
        marginBottom: '0',
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#00E5FF',
        textShadow: '0 0 10px rgba(0, 229, 255, 0.5)',
        fontFamily: 'Rajdhani',
        marginBottom: '0px',
        textAlign: 'left',
        letterSpacing: '3px',
        textTransform: 'uppercase',
        borderLeft: '4px solid #00E5FF',
        paddingLeft: '15px',
    },
    nodeTypesTable: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    nodeRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        background: 'rgba(0, 136, 221, 0.08)',
        border: '1px solid rgba(0, 217, 255, 0.2)',
        borderRadius: '12px',
        transition: 'all 0.3s ease',
    },
    nodeEmoji: {
        fontSize: '26px',
        color: '#00E5FF',
        minWidth: '45px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    nodeName: {
        fontSize: '15px',
        fontWeight: '600',
        color: '#B0E5F0',
        fontFamily: 'Rajdhani',
        marginLeft: '20px',
        letterSpacing: '1.5px',
    },
    nodeYield: {
        fontSize: '17px',
        fontWeight: 'bold',
        color: '#00FF88',
        fontFamily: 'Rajdhani',
        textShadow: '0 0 8px rgba(0, 255, 136, 0.4)',
        marginLeft: 'auto',
        flexShrink: 0,
    },
    loyaltySection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    loyaltyItem: {
        padding: '20px 24px',
        background: 'rgba(0, 30, 80, 0.3)',
        border: '1px solid rgba(0, 217, 255, 0.2)',
        borderRadius: '12px',
    },
    loyaltyTitle: {
        display: 'block',
        fontSize: '15px',
        color: '#00E5FF',
        marginBottom: '8px',
        fontFamily: 'Rajdhani',
        fontWeight: '600',
        letterSpacing: '1px',
    },
    loyaltyDesc: {
        fontSize: '14px',
        color: '#B0E5F0',
        fontFamily: 'Rajdhani',
        lineHeight: '1.6',
        margin: 0,
        fontWeight: '500',
    },
    featuresSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginTop: '0',
    },
    featureItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        padding: '14px 20px',
        background: 'rgba(0, 136, 221, 0.06)',
        borderRadius: '10px',
        border: '1px solid rgba(0, 217, 255, 0.15)',
    },
    featureIcon: {
        fontSize: '20px',
        color: '#00FF88',
        flexShrink: 0,
    },
    featureText: {
        fontSize: '15px',
        color: '#B0E5F0',
        fontFamily: 'Rajdhani',
        fontWeight: '500',
        letterSpacing: '0.5px',
    },
    connectButton: {
        width: '60%',
        maxWidth: '400px',
        minWidth: '280px',
        margin: '0 auto 40px auto',
        padding: '0',
        height: 'auto',
        minHeight: '85px',
    },
    buttonContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: '100%',
        padding: '16px 20px',
    },
    buttonIcon: {
        fontSize: '32px',
        flexShrink: 0,
    },
    buttonText: {
        fontSize: '15px',
        fontWeight: '700',
        letterSpacing: '2.5px',
    },
};

export default WalletConnector;
