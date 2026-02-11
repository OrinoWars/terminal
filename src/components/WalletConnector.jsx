import React, { useState, useEffect } from 'react';
import { getNFTs } from '../contract/orionWarsContract';
import { Button, Container, LoadingText, Title } from '../styles/StyledComponents';
import NFTDisplay from './NFTDisplay';
import './WalletConnector.css';
import { ethers } from 'ethers';
import { TbHexagon, TbAtom, TbSun, TbAntenna, TbBolt, TbStarFilled, TbWallet } from 'react-icons/tb';
import { IoCheckmarkCircle } from 'react-icons/io5';
import { MdAccessTime } from 'react-icons/md';
import { HiLink } from 'react-icons/hi';

// DEVELOPMENT MODE - Set to true for manual wallet address input
const DEVELOPMENT_MODE = false; // Change to false before production deploy

const WalletConnector = ({ onNFTLoad }) => {
    const [walletAddress, setWalletAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [walletConnected, setWalletConnected] = useState(false);
    const [nfts, setNfts] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    
    // Mobile detection
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1200);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 1200);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Production: MetaMask Wallet Connect
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

            // Check if on Ethereum Mainnet
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            if (chainId !== '0x1') { // Ethereum Mainnet chainId
                setErrorMessage("Please switch to Ethereum Mainnet in MetaMask.");
                setLoading(false);
                return;
            }

            // Fetch NFTs
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

    // Development: Manual Wallet Address Input
    const connectWithAddress = async () => {
        setLoading(true);
        setErrorMessage("");
        
        try {
            // Validate address format
            if (!walletAddress || walletAddress.length !== 42 || !walletAddress.startsWith("0x")) {
                setErrorMessage("Invalid wallet address format.");
                setLoading(false);
                return;
            }

            // Fetch NFTs
            const nftsData = await getNFTs(walletAddress);
            setNfts(nftsData);
            onNFTLoad(nftsData);
            setWalletConnected(true);

            window.scrollTo({ top: 0, behavior: 'smooth' });
            setLoading(false);

        } catch (error) {
            console.error("Error fetching NFTs:", error);
            setErrorMessage("Failed to fetch NFTs. Please check the address and try again.");
            setLoading(false);
        }
    };

    // Generate styles with mobile responsiveness
    const styles = getStyles(isMobile);

    return (
        <Container>
            {!walletConnected ? (
                <div style={styles.mainWrapper}>
                    <div style={styles.brandTitleSection}>
                        <div style={styles.brandTitle}>ORION WARS</div>
                        <Title className="neonTitle" style={styles.mainTitle}>NODE TERMINAL</Title>
                    </div>
                    
                    <div style={styles.singleBoxContainer}>
                        {DEVELOPMENT_MODE ? (
                            // Development Mode: Manual Address Input
                            <>
                                <div style={styles.devModeLabel}>
                                    🔧 DEVELOPMENT MODE - Manual Address Input
                                </div>
                                <input
                                    type="text"
                                    placeholder="Enter wallet address (0x...)"
                                    value={walletAddress}
                                    onChange={(e) => setWalletAddress(e.target.value)}
                                    style={styles.addressInput}
                                    disabled={loading}
                                />
                                <div
                                    className="neonButton"
                                    onClick={loading ? null : connectWithAddress}
                                    style={styles.connectButton}
                                >
                                    {loading ? (
                                        <div className="spinner"></div>
                                    ) : (
                                        <div style={styles.buttonContent}>
                                            <TbWallet style={styles.buttonIcon} />
                                            <span style={styles.buttonText}>LOAD WALLET</span>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            // Production Mode: MetaMask Connect
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
                        )}
                        
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
                                    <strong style={styles.loyaltyTitle}><MdAccessTime style={{verticalAlign: 'middle', marginRight: '8px'}} /> Signal Stability (Uptime Bonus)</strong>
                                    <p style={styles.loyaltyDesc}>
                                        Efficiency increases based on continuous custody duration:
                                        7 days: +5% • 15 days: +10% • 20 days: +15% • 30+ days: +20% (Max)
                                    </p>
                                </div>
                                <div style={styles.loyaltyItem}>
                                    <strong style={styles.loyaltyTitle}><HiLink style={{verticalAlign: 'middle', marginRight: '8px'}} /> Hexa-Link (Cluster Bonus)</strong>
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

const getStyles = (isMobile) => ({
    mainWrapper: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: isMobile ? '0 10px' : '0 20px',
    },
    brandTitleSection: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: isMobile ? '8px' : '12px',
        marginTop: isMobile ? '30px' : '60px',
        marginBottom: isMobile ? '25px' : '50px',
    },
    brandTitle: {
        fontSize: isMobile ? '14px' : '18px',
        fontWeight: '700',
        color: '#00D9FF',
        textShadow: '0 0 20px rgba(0, 217, 255, 0.6)',
        fontFamily: 'Rajdhani',
        letterSpacing: isMobile ? '4px' : '6px',
        textTransform: 'uppercase',
    },
    mainTitle: {
        marginBottom: '0',
    },
    singleBoxContainer: {
        width: '100%',
        maxWidth: '800px',
        padding: isMobile ? '25px 20px' : '50px',
        border: '2px solid rgba(0, 217, 255, 0.4)',
        borderRadius: isMobile ? '15px' : '20px',
        background: 'linear-gradient(135deg, rgba(0, 20, 60, 0.4), rgba(0, 10, 40, 0.6))',
        boxShadow: '0 8px 32px rgba(0, 119, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
    },
    divider: {
        width: '100%',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(0, 217, 255, 0.5), transparent)',
        marginBottom: isMobile ? '25px' : '40px',
        marginTop: isMobile ? '8px' : '10px',
    },
    infoContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '25px' : '35px',
    },
    description: {
        fontSize: isMobile ? '15px' : '17px',
        color: '#B0E5F0',
        fontFamily: 'Rajdhani',
        lineHeight: '1.7',
        textAlign: 'center',
        marginBottom: '0',
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: isMobile ? '16px' : '18px',
        fontWeight: '700',
        color: '#00E5FF',
        textShadow: '0 0 10px rgba(0, 229, 255, 0.5)',
        fontFamily: 'Rajdhani',
        marginBottom: '0px',
        textAlign: 'left',
        letterSpacing: isMobile ? '2px' : '3px',
        textTransform: 'uppercase',
        borderLeft: isMobile ? '3px solid #00E5FF' : '4px solid #00E5FF',
        paddingLeft: isMobile ? '10px' : '15px',
    },
    nodeTypesTable: {
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '8px' : '10px',
    },
    nodeRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '12px 16px' : '16px 24px',
        background: 'rgba(0, 136, 221, 0.08)',
        border: '1px solid rgba(0, 217, 255, 0.2)',
        borderRadius: isMobile ? '10px' : '12px',
        transition: 'all 0.3s ease',
    },
    nodeEmoji: {
        fontSize: isMobile ? '22px' : '26px',
        color: '#00E5FF',
        minWidth: isMobile ? '35px' : '45px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    nodeName: {
        fontSize: isMobile ? '14px' : '15px',
        fontWeight: '600',
        color: '#B0E5F0',
        fontFamily: 'Rajdhani',
        marginLeft: isMobile ? '12px' : '20px',
        letterSpacing: isMobile ? '1px' : '1.5px',
    },
    nodeYield: {
        fontSize: isMobile ? '15px' : '17px',
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
        gap: isMobile ? '10px' : '12px',
    },
    loyaltyItem: {
        padding: isMobile ? '16px 18px' : '20px 24px',
        background: 'rgba(0, 30, 80, 0.3)',
        border: '1px solid rgba(0, 217, 255, 0.2)',
        borderRadius: isMobile ? '10px' : '12px',
    },
    loyaltyTitle: {
        display: 'block',
        fontSize: isMobile ? '14px' : '15px',
        color: '#00E5FF',
        marginBottom: isMobile ? '6px' : '8px',
        fontFamily: 'Rajdhani',
        fontWeight: '600',
        letterSpacing: isMobile ? '0.8px' : '1px',
    },
    loyaltyDesc: {
        fontSize: isMobile ? '13px' : '14px',
        color: '#B0E5F0',
        fontFamily: 'Rajdhani',
        lineHeight: '1.6',
        margin: 0,
        fontWeight: '500',
    },
    featuresSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '8px' : '10px',
        marginTop: '0',
    },
    featureItem: {
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '12px' : '15px',
        padding: isMobile ? '12px 16px' : '14px 20px',
        background: 'rgba(0, 136, 221, 0.06)',
        borderRadius: isMobile ? '8px' : '10px',
        border: '1px solid rgba(0, 217, 255, 0.15)',
    },
    featureIcon: {
        fontSize: isMobile ? '20px' : '20px',
        color: '#00FF88',
        flexShrink: 0,
    },
    featureText: {
        fontSize: isMobile ? '14px' : '15px',
        color: '#B0E5F0',
        fontFamily: 'Rajdhani',
        fontWeight: '500',
        letterSpacing: isMobile ? '0.3px' : '0.5px',
    },
    connectButton: {
        width: isMobile ? '90%' : '60%',
        maxWidth: isMobile ? '350px' : '400px',
        minWidth: isMobile ? '250px' : '280px',
        margin: isMobile ? '0 auto 25px auto' : '0 auto 40px auto',
        padding: '0',
        height: 'auto',
        minHeight: isMobile ? '75px' : '85px',
    },
    buttonContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isMobile ? '6px' : '8px',
        width: '100%',
        padding: isMobile ? '14px 18px' : '16px 20px',
    },
    buttonIcon: {
        fontSize: isMobile ? '28px' : '32px',
        flexShrink: 0,
    },
    buttonText: {
        fontSize: isMobile ? '13px' : '15px',
        fontWeight: '700',
        letterSpacing: isMobile ? '2px' : '2.5px',
    },
    devModeLabel: {
        fontSize: isMobile ? '11px' : '13px',
        color: '#FFB366',
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        fontFamily: 'Rajdhani',
        fontWeight: '700',
        marginBottom: '20px',
        textAlign: 'center',
        padding: '8px 16px',
        background: 'rgba(255, 136, 0, 0.15)',
        border: '1px solid rgba(255, 136, 0, 0.4)',
        borderRadius: '8px',
    },
    addressInput: {
        width: '100%',
        padding: isMobile ? '14px 16px' : '16px 20px',
        fontSize: isMobile ? '13px' : '15px',
        fontFamily: 'Rajdhani',
        fontWeight: '600',
        color: '#00E5FF',
        background: 'rgba(0, 20, 60, 0.6)',
        border: '2px solid rgba(0, 217, 255, 0.4)',
        borderRadius: '12px',
        outline: 'none',
        textAlign: 'center',
        letterSpacing: '0.5px',
        marginBottom: '20px',
        transition: 'all 0.3s ease',
    },
});

export default WalletConnector;
