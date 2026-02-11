import React, { useState, useEffect } from "react";
import blacklistedWallets from "../data/blacklisted-wallets.json";
import resetDates from "../data/reset-dates.json";
import { MdAccessTime, MdShowChart, MdWarning, MdInfo } from "react-icons/md";
import { HiLink } from "react-icons/hi";
import { FaClock, FaCoins, FaChartLine } from "react-icons/fa";
import { TbHexagon, TbAtom, TbSun, TbAntenna, TbBolt, TbStarFilled, TbTrendingUp } from 'react-icons/tb';
import { IoCheckmarkCircle, IoWalletSharp } from 'react-icons/io5';
import { RiMoneyDollarCircleFill } from 'react-icons/ri';

const NFTDisplay = ({ nfts, walletAddress }) => {
  // Mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1200);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Live timer state
  const [liveTimer, setLiveTimer] = useState({
    weeks: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Payment countdown state
  const [paymentCountdown, setPaymentCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const nodeIncomeRates = {
    6: 6,    // NANO
    9: 9,    // ISOTOPE
    12: 12,  // SOLAR (Rare)
    16: 16,  // VOID RELAY
    20: 20,  // PLASMA RELAY
    24: 24,  // SINGULARITY (Mythic)
  };

  const nodeTypeNames = {
    6: "NANO",
    9: "ISOTOPE",
    12: "SOLAR",
    16: "VOID RELAY",
    20: "PLASMA RELAY",
    24: "SINGULARITY",
  };

  const nodeTypeIcons = {
    6: TbHexagon,
    9: TbAtom,
    12: TbSun,
    16: TbAntenna,
    20: TbBolt,
    24: TbStarFilled,
  };

  // Check if user is blacklisted
  const isBlacklisted = blacklistedWallets.blacklistedWallets
    .some(addr => addr.toLowerCase() === walletAddress.toLowerCase());

  // Check if user has a reset date
  const resetInfo = resetDates.resetWallets.find(
    w => w.address && w.address.toLowerCase() === walletAddress.toLowerCase()
  );

  // Calculate days based on reset date OR oldest NFT
  let calculatedOldestDays = 0;
  let calculatedOldestDate = 'N/A';
  let usingResetDate = false;

  if (resetInfo && resetInfo.resetDate && resetInfo.resetDate.trim() !== '') {
    // Use reset date as starting point
    const resetDate = new Date(resetInfo.resetDate);
    calculatedOldestDays = Math.floor((Date.now() - resetDate.getTime()) / (1000 * 60 * 60 * 24));
    calculatedOldestDays = Math.max(0, calculatedOldestDays);
    calculatedOldestDate = resetDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    usingResetDate = true;
  } else {
    // Use oldest NFT transfer date (original logic)
    calculatedOldestDays = nfts.length > 0 
      ? Math.max(...nfts.map(nft => nft.daysInWallet || 0))
      : 0;
    
    const oldestNFT = nfts.length > 0
      ? nfts.reduce((oldest, nft) => 
          (nft.daysInWallet || 0) > (oldest.daysInWallet || 0) ? nft : oldest
        )
      : null;

    calculatedOldestDate = oldestNFT?.transferDate 
      ? new Date(oldestNFT.transferDate).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })
      : 'N/A';
  }

  const oldestNFTDays = calculatedOldestDays;
  const oldestDate = calculatedOldestDate;

  const totalNodePower = nfts.reduce(
    (acc, nft) =>
      acc +
      parseFloat(
        nft.metadata.attributes.find((attr) => attr.trait_type === "Node Type")
          ?.value || 0
      ),
    0
  );

  const averageNodePower = (totalNodePower / nfts.length).toFixed(2);

  // Count node types (ALL NFTs)
  const nodeTypeCounts = {};
  nfts.forEach(nft => {
    const nodeType = parseInt(
      nft.metadata.attributes.find((attr) => attr.trait_type === "Node Type")
        ?.value || 0,
      10
    );
    nodeTypeCounts[nodeType] = (nodeTypeCounts[nodeType] || 0) + 1;
  });

  // Total income per node type (all NFTs)
  const nodeTypeIncomes = {};
  nfts.forEach(nft => {
    const nodeType = parseInt(
      nft.metadata.attributes.find((attr) => attr.trait_type === "Node Type")
        ?.value || 0,
      10
    );
    const income = nodeIncomeRates[nodeType] || 0;
    nodeTypeIncomes[nodeType] = (nodeTypeIncomes[nodeType] || 0) + income;
  });

  // BOOST HESAPLAMALARI
  const allNodeTypes = [6, 9, 12, 16, 20, 24];
  
  const getUptimeBonus = (days) => {
    if (days >= 30) return 20;
    if (days >= 20) return 15;
    if (days >= 15) return 10;
    if (days >= 7) return 5;
    return 0;
  };

  // 1. Signal Stability (Uptime Bonus) - Based on oldest NFT's duration
  const uptimeBonus = isBlacklisted ? 0 : getUptimeBonus(oldestNFTDays);

  // 2. Hexa-Link (Cluster Bonus) - Complete sets (all NFTs included)
  const hasAllTypes = allNodeTypes.every(type => nodeTypeCounts[type] > 0);
  const completeSets = hasAllTypes 
    ? Math.min(...allNodeTypes.map(type => nodeTypeCounts[type] || 0))
    : 0;
  const hexaLinkBonus = isBlacklisted ? 0 : (completeSets * 10);

  // Toplam boost
  const totalBoostPercentage = uptimeBonus + hexaLinkBonus;
  const totalBoostMultiplier = 1 + (totalBoostPercentage / 100);

  // Generate styles with mobile responsiveness
  const styles = getStyles(isMobile);

  // Base income (boost'suz, tüm NFT'ler)
  const baseIncome = nfts.reduce((acc, nft) => {
    const nodeType = parseInt(
      nft.metadata.attributes.find((attr) => attr.trait_type === "Node Type")
        ?.value || 0,
      10
    );
    return acc + (nodeIncomeRates[nodeType] || 0);
  }, 0);

  // Toplam gelir = Base income * boost multiplier
  const totalFinalIncome = baseIncome * totalBoostMultiplier;

  // Live timer update
  useEffect(() => {
    const updateTimer = () => {
      // If blacklisted, show all zeros
      if (isBlacklisted) {
        setLiveTimer({
          weeks: 0,
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        });
        return;
      }

      // Determine start date: reset date OR oldest NFT transfer date
      let startDate;
      if (resetInfo && resetInfo.resetDate && resetInfo.resetDate.trim() !== '') {
        startDate = new Date(resetInfo.resetDate).getTime();
      } else if (nfts.length > 0) {
        const oldestNFT = nfts.reduce((oldest, nft) => 
          (nft.daysInWallet || 0) > (oldest.daysInWallet || 0) ? nft : oldest
        );
        if (oldestNFT?.transferDate) {
          startDate = new Date(oldestNFT.transferDate).getTime();
        }
      }

      if (!startDate) {
        setLiveTimer({
          weeks: 0,
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        });
        return;
      }

      const now = Date.now();
      const diffMs = now - startDate;

      const seconds = Math.floor(diffMs / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const weeks = Math.floor(days / 7);

      setLiveTimer({
        weeks: weeks,
        days: days % 7,
        hours: hours % 24,
        minutes: minutes % 60,
        seconds: seconds % 60
      });
    };

    updateTimer(); // Initial run
    const interval = setInterval(updateTimer, 1000); // Update every second

    return () => clearInterval(interval);
  }, [isBlacklisted, nfts, resetInfo]);

  // Payment countdown update
  useEffect(() => {
    const updatePaymentCountdown = () => {
      const now = Date.now();
      
      // First payment: Feb 18, 2026 15:00 UTC (Wednesday)
      const firstPayment = new Date('2026-02-18T15:00:00.000Z').getTime();
      
      // Calculate which payment cycle we're in
      const weekInMs = 7 * 24 * 60 * 60 * 1000;
      let nextPaymentDate;
      
      if (now < firstPayment) {
        nextPaymentDate = firstPayment;
      } else {
        const weeksPassed = Math.floor((now - firstPayment) / weekInMs);
        nextPaymentDate = firstPayment + ((weeksPassed + 1) * weekInMs);
      }
      
      const diffMs = nextPaymentDate - now;
      
      if (diffMs > 0) {
        const seconds = Math.floor(diffMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        setPaymentCountdown({
          days: days,
          hours: hours % 24,
          minutes: minutes % 60,
          seconds: seconds % 60
        });
      }
    };
    
    updatePaymentCountdown(); // Initial run
    const interval = setInterval(updatePaymentCountdown, 1000); // Update every second
    
    return () => clearInterval(interval);
  }, []);

  console.log(`Wallet: ${walletAddress}`);
  console.log(`Blacklisted: ${isBlacklisted ? '❌ YES' : '✅ NO'}`);
  console.log(`Oldest NFT: ${oldestNFTDays} days (since ${oldestDate})`);
  console.log(`Uptime Bonus: ${uptimeBonus}%, Hexa-Link: ${hexaLinkBonus}%, Total: ${totalBoostPercentage}%`);

  return (
    <div style={styles.container}>
      <div style={styles.titleSection}>
        <div style={styles.brandTitle}>ORION WARS</div>
        <h1 className="neonTitle" style={styles.mainTitle}>NODE TERMINAL</h1>
      </div>
      
      <div style={styles.mainContainer}>
        {/* Node Type Boxes Grid */}
        <div style={styles.nodeGrid}>
          {allNodeTypes.map(nodeType => {
            const count = nodeTypeCounts[nodeType] || 0;
            const income = nodeTypeIncomes[nodeType] || 0;
            const isOwned = count > 0;

            return (
              <div 
                key={nodeType} 
                style={{
                  ...styles.nodeBox,
                  opacity: isOwned ? 1 : 0.4,
                  border: isOwned ? '2px solid #00D9FF' : '2px solid #0088DD',
                }}
              >
                <div style={styles.nodeIcon}>
                  {React.createElement(nodeTypeIcons[nodeType], { 
                    style: { fontSize: isMobile ? '28px' : '48px', color: '#00E5FF' }
                  })}
                </div>
                <div style={styles.nodeTypeName}>
                  {nodeTypeNames[nodeType]}
                </div>
                <div style={styles.nodeCount}>{count}</div>
                <div style={styles.nodeCountLabel}>Nodes</div>
                <div style={styles.nodeIncome}>
                  {income.toFixed(2)} USDC
                </div>
                <div style={styles.nodeIncomeLabel}>Monthly Yield</div>
              </div>
            );
          })}
        </div>

        {/* Summary Panel */}
        <div style={styles.summaryPanel}>
          {/* Modern Yield Summary Box */}
          <div style={styles.modernYieldBox}>
            <div style={styles.yieldContent}>
              <div style={styles.yieldTopSection}>
                <div style={styles.yieldLabelSection}>
                  <RiMoneyDollarCircleFill style={styles.yieldLabelIcon} />
                  <span style={styles.yieldLabel}>MONTHLY YIELD</span>
                </div>
                {!isBlacklisted && totalBoostPercentage > 0 && (
                  <div style={styles.boostBadge}>
                    <TbTrendingUp style={{fontSize: isMobile ? '14px' : '16px', marginRight: '4px'}} />
                    +{totalBoostPercentage}%
                  </div>
                )}
              </div>
              
              <div style={styles.yieldMainValue}>
                {totalFinalIncome.toFixed(2)}<span style={styles.yieldCurrency}>USDC</span>
              </div>
              
              {isBlacklisted ? (
                <div style={styles.yieldWarning}>
                  <MdWarning style={{fontSize: isMobile ? '16px' : '18px', marginRight: '6px'}} />
                  <div style={styles.yieldWarningText}>
                    <strong>LISTING DETECTED - BOOSTS DISABLED</strong>
                    <div style={{fontSize: isMobile ? '11px' : '12px', marginTop: '4px', opacity: 0.9}}>
                      Remove all listings to restore +{getUptimeBonus(oldestNFTDays) + (completeSets * 10)}% boost
                    </div>
                  </div>
                </div>
              ) : (
                totalBoostPercentage > 0 && (
                  <div style={styles.yieldBreakdown}>
                    <div style={styles.yieldBreakdownItem}>
                      <span style={styles.yieldBreakdownLabel}>Base Income:</span>
                      <span style={styles.yieldBreakdownValue}>{baseIncome.toFixed(2)} USDC</span>
                    </div>
                    <div style={styles.yieldBreakdownSeparator}>+</div>
                    <div style={styles.yieldBreakdownItem}>
                      <span style={styles.yieldBreakdownLabel}>Boost ({totalBoostPercentage}%):</span>
                      <span style={styles.yieldBreakdownValue}>+{(totalFinalIncome - baseIncome).toFixed(2)} USDC</span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Boost Protocol Panel */}
          <div style={styles.boostProtocolPanel}>
            <div style={styles.boostProtocolTitle}>
              <MdShowChart style={{fontSize: '24px', verticalAlign: 'middle', marginRight: '8px'}} />
              LOYALTY & EFFICIENCY PROTOCOLS
            </div>

            {/* Canlı Saat */}
            <div style={styles.liveTimerContainer}>
              <div style={styles.liveTimerTitle}>
                <FaClock style={{fontSize: '18px', verticalAlign: 'middle', marginRight: '8px'}} />
                NODES HAVE BEEN ACTIVE FOR
              </div>
              <div style={styles.liveTimer}>
                <div style={styles.timerBlock}>
                  <div style={styles.timerValue}>{liveTimer.weeks}</div>
                  <div style={styles.timerLabel}>WEEKS</div>
                </div>
                <div style={styles.timerSeparator}>:</div>
                <div style={styles.timerBlock}>
                  <div style={styles.timerValue}>{liveTimer.days}</div>
                  <div style={styles.timerLabel}>DAYS</div>
                </div>
                <div style={styles.timerSeparator}>:</div>
                <div style={styles.timerBlock}>
                  <div style={styles.timerValue}>{String(liveTimer.hours).padStart(2, '0')}</div>
                  <div style={styles.timerLabel}>HOURS</div>
                </div>
                <div style={styles.timerSeparator}>:</div>
                <div style={styles.timerBlock}>
                  <div style={styles.timerValue}>{String(liveTimer.minutes).padStart(2, '0')}</div>
                  <div style={styles.timerLabel}>MINUTES</div>
                </div>
                <div style={styles.timerSeparator}>:</div>
                <div style={styles.timerBlock}>
                  <div style={styles.timerValue}>{String(liveTimer.seconds).padStart(2, '0')}</div>
                  <div style={styles.timerLabel}>SECONDS</div>
                </div>
              </div>
            </div>

            <div style={styles.boostGridSingleColumn}>
              {/* Signal Stability - Full Width */}
              <div style={{
                ...styles.boostCardFullWidth,
                opacity: isBlacklisted ? 0.5 : 1,
                border: isBlacklisted ? '3px solid #666' : '3px solid #0088DD',
              }}>
                <div style={styles.boostCardHeaderLarge}>
                  <div style={styles.boostHeaderLeft}>
                    <span style={styles.boostIconLarge}>
                      <MdAccessTime style={{fontSize: '36px', verticalAlign: 'middle'}} />
                    </span>
                    <span style={styles.boostNameLarge}>SIGNAL STABILITY</span>
                  </div>
                  <div style={{
                    ...styles.boostValueLarge,
                    color: isBlacklisted ? '#666' : '#00FF88',
                    textShadow: isBlacklisted ? 'none' : '0 0 15px rgba(0, 255, 136, 0.6)',
                  }}>
                    +{uptimeBonus}%
                  </div>
                </div>
                
                <div style={styles.boostDescriptionLarge}>
                  <span style={{color: '#00E5FF'}}>Holding since:</span> {oldestDate} • 
                  <span style={{color: '#00E5FF'}}> Duration:</span> {oldestNFTDays} days
                  {isBlacklisted && <div style={{color: '#FF4444', marginTop: '8px', fontSize: '14px'}}>❌ Disabled - Wallet blacklisted</div>}
                </div>

                {/* Görsel Progress Bar */}
                <div style={styles.progressContainer}>
                  {/* Milestone Labels - Üstte */}
                  <div style={styles.milestoneLabelsTop}>
                    <div style={{position: 'absolute', left: '0%', transform: 'translateX(0%)'}}>
                      <div style={styles.milestoneDay}>0 DAYS</div>
                    </div>
                    <div style={{position: 'absolute', left: '23.33%', transform: 'translateX(-50%)'}}>
                      <div style={{...styles.milestoneDay, color: oldestNFTDays >= 7 && !isBlacklisted ? '#00FF88' : '#666'}}>7 DAYS</div>
                    </div>
                    <div style={{position: 'absolute', left: '50%', transform: 'translateX(-50%)'}}>
                      <div style={{...styles.milestoneDay, color: oldestNFTDays >= 15 && !isBlacklisted ? '#00FF88' : '#666'}}>15 DAYS</div>
                    </div>
                    <div style={{position: 'absolute', left: '66.67%', transform: 'translateX(-50%)'}}>
                      <div style={{...styles.milestoneDay, color: oldestNFTDays >= 20 && !isBlacklisted ? '#00FF88' : '#666'}}>20 DAYS</div>
                    </div>
                    <div style={{position: 'absolute', left: '100%', transform: 'translateX(-100%)'}}>
                      <div style={{...styles.milestoneDay, color: oldestNFTDays >= 30 && !isBlacklisted ? '#00FF88' : '#666'}}>30+ DAYS</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={styles.progressBarLarge}>
                    {/* Animated fill */}
                    <div style={{
                      ...styles.progressFillLarge,
                      width: `${Math.min((oldestNFTDays / 30) * 100, 100)}%`,
                      opacity: isBlacklisted || nfts.length === 0 ? 0.4 : 1,
                    }}>
                      {nfts.length > 0 && <div style={styles.progressGlow}></div>}
                    </div>
                    
                    {/* Milestone markers - Vertical lines */}
                    <div style={{...styles.milestoneMarker, left: '23.33%'}}></div>
                    <div style={{...styles.milestoneMarker, left: '50%'}}></div>
                    <div style={{...styles.milestoneMarker, left: '66.67%'}}></div>
                  </div>
                  
                  {/* Bonus Labels - Altta */}
                  <div style={styles.milestoneLabelsBottom}>
                    <div style={{position: 'absolute', left: '23.33%', transform: 'translateX(-50%)'}}>
                      <div style={{...styles.milestoneBonus, color: oldestNFTDays >= 7 && !isBlacklisted ? '#00FF88' : '#666'}}>+5%</div>
                    </div>
                    <div style={{position: 'absolute', left: '50%', transform: 'translateX(-50%)'}}>
                      <div style={{...styles.milestoneBonus, color: oldestNFTDays >= 15 && !isBlacklisted ? '#00FF88' : '#666'}}>+10%</div>
                    </div>
                    <div style={{position: 'absolute', left: '66.67%', transform: 'translateX(-50%)'}}>
                      <div style={{...styles.milestoneBonus, color: oldestNFTDays >= 20 && !isBlacklisted ? '#00FF88' : '#666'}}>+15%</div>
                    </div>
                    <div style={{position: 'absolute', left: '100%', transform: 'translateX(-100%)'}}>
                      <div style={{...styles.milestoneBonus, color: oldestNFTDays >= 30 && !isBlacklisted ? '#00FF88' : '#666'}}>+20%</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signal Stability Info Note */}
              <div style={styles.infoNote}>
                <div style={styles.infoNoteText}>
                  Our system scans all Nodes 6 times daily at random intervals. If any marketplace listing is detected during a scan, all boosts will be immediately disabled.
                </div>
              </div>

              {/* Hexa-Link - Full Width */}
              <div style={{
                ...styles.boostCardFullWidth,
                opacity: isBlacklisted ? 0.5 : 1,
                border: isBlacklisted ? '3px solid #666' : '3px solid #0088DD',
                marginTop: '20px',
              }}>
                <div style={styles.boostCardHeaderLarge}>
                  <div style={styles.boostHeaderLeft}>
                    <span style={styles.boostIconLarge}>
                      <HiLink style={{fontSize: '36px', verticalAlign: 'middle'}} />
                    </span>
                    <span style={styles.boostNameLarge}>HEXA-LINK (CLUSTER BONUS)</span>
                  </div>
                  <div style={{
                    ...styles.boostValueLarge,
                    color: isBlacklisted ? '#666' : '#00FF88',
                    textShadow: isBlacklisted ? 'none' : '0 0 15px rgba(0, 255, 136, 0.6)',
                  }}>
                    +{hexaLinkBonus}%
                  </div>
                </div>
                
                <div style={styles.boostDescriptionLarge}>
                  <span style={{color: '#00E5FF'}}>Complete Sets:</span> {completeSets} • 
                  <span style={{color: '#00E5FF'}}> Bonus per set:</span> +10%
                  {isBlacklisted && <div style={{color: '#FF4444', marginTop: '8px', fontSize: '14px'}}>❌ Disabled - Wallet blacklisted</div>}
                </div>

                <div style={styles.hexaLinkGridLarge}>
                  {allNodeTypes.map(type => {
                    const hasType = nodeTypeCounts[type] > 0;
                    const count = nodeTypeCounts[type] || 0;
                    const NodeIcon = nodeTypeIcons[type];
                    return (
                      <div 
                        key={type}
                        style={{
                          ...styles.hexaLinkIconLarge,
                          opacity: hasType && !isBlacklisted ? 1 : 0.3,
                          border: hasType && !isBlacklisted ? '3px solid #00FF88' : '3px solid #444',
                          boxShadow: hasType && !isBlacklisted ? '0 0 12px rgba(0, 255, 136, 0.4)' : 'none',
                        }}
                      >
                        <NodeIcon style={{fontSize: isMobile ? '24px' : '32px', color: hasType && !isBlacklisted ? '#00E5FF' : '#666'}} />
                        <div style={styles.hexaIconName}>{nodeTypeNames[type]}</div>
                        <div style={{
                          ...styles.hexaIconCount,
                          color: hasType && !isBlacklisted ? '#00FF88' : '#666',
                        }}>
                          ×{count}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div style={styles.boostHintLarge}>
                  {hasAllTypes 
                    ? `✓ All 6 node types owned • ${completeSets} complete ${completeSets === 1 ? 'set' : 'sets'} • +${completeSets * 10}% ${isBlacklisted ? 'DISABLED' : 'boost active'}`
                    : `⚠️ Need all 6 node types for Hexa-Link bonus • Currently missing: ${allNodeTypes.filter(t => !nodeTypeCounts[t]).length} types`
                  }
                </div>
              </div>
            </div>

            {/* Critical Warning Box */}
            <div style={styles.warningBox}>
              <div style={styles.warningIcon}>
                <MdWarning style={{fontSize: '36px', color: '#FF6666'}} />
              </div>
              <div style={styles.warningContent}>
                <div style={styles.warningTitle}>CRITICAL NOTICE</div>
                <div style={styles.warningText}>
                  Listing <span style={{fontWeight: 'bold', color: '#FF6666'}}>ANY</span> node will <span style={{fontWeight: 'bold', color: '#FF6666'}}>DISABLE ALL BOOSTS</span> for your <span style={{fontWeight: 'bold', color: '#FF6666'}}>ENTIRE COLLECTION</span> and reset your <span style={{fontWeight: 'bold', color: '#FF6666'}}>SIGNAL STABILITY</span> to <span style={{fontWeight: 'bold', color: '#FF6666'}}>ZERO</span>.
                  <br/><br style={{lineHeight: '0.2', margin: '0', display: 'block', height: '4px'}}/>
                  Your Signal Stability will remain at 0 days until you delist. Upon delisting, Signal Stability starts from day 0 — your previous holding period is <span style={{fontWeight: 'bold', color: '#FF6666'}}>NOT</span> restored.
                </div>
              </div>
            </div>
          </div>

          {/* Next Payment Countdown Section - Separate Box */}
          <div style={styles.paymentSection}>
            <div style={styles.paymentTitle}>
              <FaClock style={{fontSize: '20px', verticalAlign: 'middle', marginRight: '10px'}} />
              NEXT PAYMENT IN
            </div>
            <div style={styles.paymentCountdownContainer}>
              <div style={styles.paymentTimerBlock}>
                <div style={styles.paymentTimerValue}>{paymentCountdown.days}</div>
                <div style={styles.paymentTimerLabel}>DAYS</div>
              </div>
              <div style={styles.paymentTimerSeparator}>:</div>
              <div style={styles.paymentTimerBlock}>
                <div style={styles.paymentTimerValue}>{paymentCountdown.hours}</div>
                <div style={styles.paymentTimerLabel}>HOURS</div>
              </div>
              <div style={styles.paymentTimerSeparator}>:</div>
              <div style={styles.paymentTimerBlock}>
                <div style={styles.paymentTimerValue}>{paymentCountdown.minutes}</div>
                <div style={styles.paymentTimerLabel}>MINUTES</div>
              </div>
              <div style={styles.paymentTimerSeparator}>:</div>
              <div style={styles.paymentTimerBlock}>
                <div style={styles.paymentTimerValue}>{paymentCountdown.seconds}</div>
                <div style={styles.paymentTimerLabel}>SECONDS</div>
              </div>
            </div>
            <div style={styles.paymentInfo}>
              <MdInfo style={{fontSize: '18px', color: '#4DD0E1', marginRight: '8px', verticalAlign: 'middle'}} />
              Your payment will be automatically sent to the wallet address holding your Node NFTs.
            </div>
          </div>

          <div style={styles.statsRow}>
            <div style={styles.statBox}>
              <div style={styles.statLabel}>TOTAL NODES</div>
              <div style={styles.statValue}>{nfts.length}</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statLabel}>AVG NODE POWER</div>
              <div style={styles.statValue}>{nfts.length > 0 ? averageNodePower : '0'}</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statLabel}>BOOST STATUS</div>
              <div style={{
                ...styles.statValue,
                fontSize: '32px',
                color: nfts.length === 0 ? '#888' : (isBlacklisted ? '#FF4444' : '#00FF88'),
                textShadow: nfts.length === 0 ? 'none' : (isBlacklisted ? '0 0 10px rgba(255, 68, 68, 0.5)' : '0 0 12px rgba(0, 255, 136, 0.5)'),
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center',
              }}>
                {nfts.length === 0 ? (
                  '-'
                ) : isBlacklisted ? (
                  <>
                    <MdWarning style={{fontSize: '28px'}} />
                    DISABLED
                  </>
                ) : (
                  <>
                    <IoCheckmarkCircle style={{fontSize: '28px'}} />
                    ACTIVE
                  </>
                )}
              </div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statLabel}>TOTAL BOOST</div>
              <div style={{
                ...styles.statValue,
                color: isBlacklisted ? '#666' : '#00FF88',
                textShadow: isBlacklisted ? 'none' : '0 0 12px rgba(0, 255, 136, 0.5)',
              }}>
                +{totalBoostPercentage}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getStyles = (isMobile) => ({
  container: {
    textAlign: "center",
    color: "white",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: isMobile ? "20px 5px" : "40px 10px",
    minHeight: "100vh",
  },
  titleSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: isMobile ? '6px' : '10px',
    marginBottom: isMobile ? '25px' : '50px',
  },
  brandTitle: {
    fontSize: isMobile ? '14px' : '20px',
    fontWeight: '600',
    color: '#00D9FF',
    textShadow: '0 0 10px rgba(0, 217, 255, 0.5)',
    fontFamily: 'Rajdhani',
    letterSpacing: isMobile ? '3px' : '4px',
    textTransform: 'uppercase',
  },
  mainTitle: {
    marginBottom: '0',
  },
  mainContainer: {
    width: "100%",
    maxWidth: "none",
    display: "flex",
    flexDirection: "column",
    gap: isMobile ? "20px" : "40px",
    padding: isMobile ? "0 10px" : "0 40px",
  },
  nodeGrid: {
    display: "grid",
    gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(6, 1fr)",
    gap: isMobile ? "12px" : "25px",
    width: "100%",
  },
  nodeBox: {
    padding: isMobile ? "15px 8px" : "40px 10px",
    borderRadius: isMobile ? "12px" : "15px",
    background: "linear-gradient(180deg, rgba(0, 30, 80, 0.5), rgba(0, 20, 60, 0.7))",
    boxShadow: "0 0 10px rgba(0, 136, 221, 0.3), inset 0 0 8px rgba(0, 136, 221, 0.05)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: isMobile ? "6px" : "12px",
    transition: "all 0.3s ease",
  },
  nodeIcon: {
    marginBottom: isMobile ? "3px" : "10px",
  },
  nodeTypeName: {
    fontSize: isMobile ? "11px" : "18px",
    fontWeight: "bold",
    color: "#00E5FF",
    textShadow: "0 0 8px rgba(0, 217, 255, 0.5)",
    fontFamily: "Font1, sans-serif",
    marginBottom: isMobile ? "5px" : "15px",
    textAlign: "center",
  },
  nodeCount: {
    fontSize: isMobile ? "24px" : "48px",
    fontWeight: "bold",
    color: "white",
    textShadow: "0 0 12px rgba(0, 217, 255, 0.6)",
    fontFamily: "Font1, sans-serif",
  },
  nodeCountLabel: {
    fontSize: isMobile ? "9px" : "12px",
    color: "#00D9FF",
    textTransform: "uppercase",
    letterSpacing: "1px",
    fontFamily: "Font1, sans-serif",
    marginBottom: isMobile ? "4px" : "10px",
  },
  nodeIncome: {
    fontSize: isMobile ? "13px" : "20px",
    fontWeight: "bold",
    color: "#4DD0E1",
    textShadow: "0 0 6px rgba(77, 208, 225, 0.4)",
    fontFamily: "Font1, sans-serif",
  },
  nodeIncomeLabel: {
    fontSize: isMobile ? "8px" : "10px",
    color: "#0088DD",
    textTransform: "uppercase",
    fontFamily: "Font1, sans-serif",
  },
  summaryPanel: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: isMobile ? "25px" : "40px",
  },
  modernYieldBox: {
    display: "flex",
    alignItems: "stretch",
    padding: isMobile ? "20px" : "30px",
    border: "2px solid rgb(0, 229, 255)",
    borderRadius: isMobile ? "15px" : "20px",
    background: "linear-gradient(135deg, rgba(0, 20, 60, 0.5), rgba(0, 10, 40, 0.7))",
    boxShadow: "0 0 15px rgba(0, 229, 255, 0.25)",
    position: "relative",
    overflow: "hidden",
  },
  yieldContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: isMobile ? "8px" : "12px",
    justifyContent: "center",
    alignItems: "center",
  },
  yieldTopSection: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: isMobile ? "8px" : "10px",
    width: "100%",
  },
  yieldLabelSection: {
    display: "flex",
    alignItems: "center",
    gap: isMobile ? "6px" : "8px",
    marginBottom:"10px"
  },
  yieldLabelIcon: {
    fontSize: isMobile ? "24px" : "32px",
    color: "rgb(0, 255, 136)",
  },
  yieldLabel: {
    fontSize: isMobile ? "20px" : "25px",
    color: "rgb(0, 255, 136)",
    textTransform: "uppercase",
    letterSpacing: isMobile ? "1.5px" : "2px",
    fontFamily: "Font1, sans-serif",
    fontWeight: "700",
  },
  boostBadge: {
    display: "flex",
    alignItems: "center",
    padding: isMobile ? "4px 10px" : "6px 14px",
    background: "linear-gradient(135deg, rgba(0, 229, 255, 0.15), rgba(0, 217, 255, 0.1))",
    border: "2px solid rgba(0, 229, 255, 0.5)",
    borderRadius: isMobile ? "12px" : "15px",
    color: "#00E5FF",
    fontSize: isMobile ? "12px" : "14px",
    fontWeight: "bold",
    fontFamily: "Rajdhani",
    boxShadow: "0 0 8px rgba(0, 229, 255, 0.25)",
  },
  yieldMainValue: {
    fontSize: isMobile ? "36px" : "56px",
    fontWeight: "bold",
    color: "#00FF88",
    textShadow: "0 0 15px rgba(0, 255, 136, 0.6), 0 0 30px rgba(0, 255, 136, 0.3)",
    fontFamily: "Font1, sans-serif",
    lineHeight: "1",
  },
  yieldCurrency: {
    fontSize: isMobile ? "24px" : "36px",
    fontWeight: "600",
    color: "#00FF88",
    marginLeft: isMobile ? "6px" : "10px",
  },
  yieldWarning: {
    display: "flex",
    alignItems: "flex-start",
    gap: isMobile ? "8px" : "10px",
    padding: isMobile ? "12px" : "15px",
    background: "linear-gradient(135deg, rgba(255, 68, 68, 0.15), rgba(255, 136, 136, 0.1))",
    border: "2px solid rgba(255, 68, 68, 0.5)",
    borderRadius: isMobile ? "8px" : "10px",
    color: "#FF6666",
    marginTop: isMobile ? "4px" : "6px",
  },
  yieldWarningText: {
    flex: 1,
    fontSize: isMobile ? "12px" : "14px",
    fontFamily: "Rajdhani",
    fontWeight: "600",
    lineHeight: "1.4",
  },
  yieldBreakdown: {
    display: "flex",
    alignItems: "center",
    gap: isMobile ? "10px" : "15px",
    padding: isMobile ? "10px 12px" : "12px 16px",
    background: "rgba(0, 136, 221, 0.1)",
    borderRadius: isMobile ? "8px" : "10px",
    border: "1px solid rgba(0, 217, 255, 0.3)",
    marginTop: isMobile ? "4px" : "6px",
    flexWrap: isMobile ? "wrap" : "nowrap",
  },
  yieldBreakdownItem: {
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    alignItems: isMobile ? "flex-start" : "center",
    gap: isMobile ? "2px" : "8px",
  },
  yieldBreakdownLabel: {
    fontSize: isMobile ? "11px" : "13px",
    color: "#4DD0E1",
    fontFamily: "Rajdhani",
    fontWeight: "500",
  },
  yieldBreakdownValue: {
    fontSize: isMobile ? "13px" : "15px",
    color: "#00FF88",
    fontFamily: "Rajdhani",
    fontWeight: "700",
  },
  yieldBreakdownSeparator: {
    fontSize: isMobile ? "16px" : "20px",
    color: "#00D9FF",
    fontWeight: "bold",
    fontFamily: "Font1, sans-serif",
  },
  summaryBox: {
    padding: isMobile ? "25px 20px" : "40px",
    border: isMobile ? "2px solid #00FF88" : "3px solid #00FF88",
    borderRadius: isMobile ? "15px" : "20px",
    background: "linear-gradient(135deg, rgba(0, 40, 20, 0.6), rgba(0, 20, 10, 0.8))",
    boxShadow: "0 0 20px rgba(0, 255, 136, 0.3), inset 0 0 15px rgba(0, 255, 136, 0.05)",
  },
  summaryLabel: {
    fontSize: isMobile ? "13px" : "16px",
    color: "#00FF88",
    textTransform: "uppercase",
    letterSpacing: isMobile ? "2px" : "3px",
    fontFamily: "Font1, sans-serif",
    marginBottom: isMobile ? "10px" : "15px",
  },
  summaryValue: {
    fontSize: isMobile ? "36px" : "56px",
    fontWeight: "bold",
    color: "#00FF88",
    textShadow: "0 0 15px rgba(0, 255, 136, 0.6)",
    fontFamily: "Font1, sans-serif",
  },
  summarySubtext: {
    fontSize: isMobile ? "12px" : "14px",
    color: "#00FF88",
    marginTop: isMobile ? "8px" : "10px",
    fontFamily: "Rajdhani",
  },
  boostProtocolPanel: {
    padding: isMobile ? "20px 15px" : "30px",
    border: "2px solid #00E5FF",
    borderRadius: isMobile ? "12px" : "15px",
    background: "linear-gradient(135deg, rgba(0, 20, 60, 0.5), rgba(0, 10, 40, 0.7))",
    boxShadow: "0 0 15px rgba(0, 229, 255, 0.25)",
  },
  boostProtocolTitle: {
    fontSize: isMobile ? "15px" : "18px",
    fontWeight: "bold",
    color: "rgb(0, 229, 255)",
    fontFamily: "Font1, sans-serif",
    marginBottom: isMobile ? "15px" : "25px",
    textAlign: "center",
    letterSpacing: isMobile ? "1.5px" : "2px",
  },
  warningBox: {
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    alignItems: "center",
    gap: isMobile ? "10px" : "15px",
    padding: isMobile ? "15px" : "20px",
    background: "linear-gradient(135deg, rgba(80, 20, 20, 0.6), rgba(60, 10, 10, 0.8))",
    border: "2px solid #FF4444",
    borderRadius: isMobile ? "10px" : "12px",
    marginTop: isMobile ? "15px" : "20px",
    marginBottom: isMobile ? "20px" : "25px",
    boxShadow: "0 0 15px rgba(255, 68, 68, 0.3)",
  },
  warningIcon: {
    fontSize: isMobile ? "32px" : "32px",
    lineHeight: "1",
    flexShrink: 0,
    alignSelf: isMobile ? "center" : "center",
  },
  warningContent: {
    flex: 1,
    width: isMobile ? "100%" : "auto",
  },
  warningTitle: {
    fontSize: isMobile ? "12px" : "14px",
    fontWeight: "bold",
    color: "#FF6666",
    textTransform: "uppercase",
    letterSpacing: isMobile ? "1.5px" : "2px",
    fontFamily: "Font1, sans-serif",
    marginBottom: isMobile ? "6px" : "8px",
    textShadow: "0 0 8px rgba(255, 102, 102, 0.5)",
  },
  warningText: {
    fontSize: isMobile ? "13px" : "16px",
    color: "#FFB3B3",
    lineHeight: "1.6",
    fontFamily: "Rajdhani",
    fontWeight: "600",
  },
  liveTimerContainer: {
    marginBottom: isMobile ? "20px" : "30px",
    padding: isMobile ? "18px 12px" : "25px",
    background: "linear-gradient(135deg, rgba(0, 20, 60, 0.5), rgba(0, 10, 40, 0.7))",
    borderRadius: isMobile ? "12px" : "15px",
    border: "2px solid #00E5FF",
    boxShadow: "0 0 15px rgba(0, 229, 255, 0.25)",
  },
  liveTimerTitle: {
    fontSize: isMobile ? "11px" : "14px",
    color: "#00E5FF",
    textShadow: "0 0 8px rgba(0, 229, 255, 0.4)",
    fontFamily: "Font1, sans-serif",
    letterSpacing: isMobile ? "1.5px" : "2px",
    marginBottom: isMobile ? "10px" : "15px",
    textAlign: "center",
  },
  liveTimer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: isMobile ? "5px" : "15px",
    flexWrap: "nowrap",
  },
  timerBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: isMobile ? "42px" : "80px",
  },
  timerValue: {
    fontSize: isMobile ? "22px" : "48px",
    fontWeight: "bold",
    color: "#00FF88",
    textShadow: "0 0 12px rgba(0, 255, 136, 0.5)",
    fontFamily: "Font1, sans-serif",
    lineHeight: "1",
  },
  timerLabel: {
    fontSize: isMobile ? "7px" : "10px",
    color: "#00D9FF",
    textTransform: "uppercase",
    letterSpacing: isMobile ? "0.5px" : "1px",
    fontFamily: "Rajdhani",
    marginTop: isMobile ? "3px" : "8px",
  },
  timerSeparator: {
    fontSize: isMobile ? "18px" : "42px",
    fontWeight: "bold",
    color: "#0088DD",
    textShadow: "0 0 6px rgba(0, 136, 221, 0.4)",
    fontFamily: "Font1, sans-serif",
    marginBottom: isMobile ? "8px" : "20px",
  },
  boostGridSingleColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "0",
  },
  boostCard: {
    padding: isMobile ? "18px" : "25px",
    border: "2px solid #0088DD",
    borderRadius: isMobile ? "10px" : "12px",
    background: "rgba(0, 0, 0, 0.6)",
    boxShadow: "0 0 15px rgba(0, 136, 221, 0.3)",
  },
  boostCardFullWidth: {
    padding: isMobile ? "22px 18px" : "35px",
    border: "2px solid #00E5FF",
    borderRadius: isMobile ? "12px" : "15px",
    background: "linear-gradient(135deg, rgba(0, 20, 60, 0.5), rgba(0, 10, 40, 0.7))",
    boxShadow: "0 0 15px rgba(0, 229, 255, 0.25)",
  },
  boostCardHeaderLarge: {
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    justifyContent: isMobile ? "center" : "space-between",
    alignItems: "center",
    marginBottom: isMobile ? "18px" : "25px",
    gap: isMobile ? "12px" : "0",
  },
  boostHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: isMobile ? "10px" : "15px",
  },
  boostCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: isMobile ? "8px" : "10px",
    marginBottom: isMobile ? "12px" : "15px",
  },
  boostIcon: {
    fontSize: isMobile ? "20px" : "24px",
  },
  boostIconLarge: {
    fontSize: isMobile ? "28px" : "36px",
  },
  boostName: {
    fontSize: isMobile ? "12px" : "14px",
    fontWeight: "bold",
    color: "#00E5FF",
    fontFamily: "Font1, sans-serif",
    letterSpacing: isMobile ? "0.8px" : "1px",
  },
  boostNameLarge: {
    fontSize: isMobile ? "15px" : "18px",
    fontWeight: "bold",
    color: "#00E5FF",
    fontFamily: "Font1, sans-serif",
    letterSpacing: isMobile ? "1.5px" : "2px",
    textTransform: "uppercase",
  },
  boostValue: {
    fontSize: isMobile ? "32px" : "42px",
    fontWeight: "bold",
    color: "#00FF88",
    textShadow: "0 0 20px #00FF88",
    fontFamily: "Font1, sans-serif",
    marginBottom: isMobile ? "8px" : "10px",
  },
  boostValueLarge: {
    fontSize: isMobile ? "42px" : "64px",
    fontWeight: "bold",
    color: "#00FF88",
    textShadow: "0 0 30px #00FF88, 0 0 50px #00FF88",
    fontFamily: "Font1, sans-serif",
  },
  boostDescription: {
    fontSize: isMobile ? "11px" : "12px",
    color: "#4DD0E1",
    fontFamily: "Rajdhani",
    marginBottom: isMobile ? "12px" : "15px",
  },
  boostDescriptionLarge: {
    fontSize: isMobile ? "13px" : "15px",
    color: "#4DD0E1",
    fontFamily: "Rajdhani",
    marginBottom: isMobile ? "18px" : "25px",
  },
  progressContainer: {
    width: "100%",
    position: "relative",
  },
  milestoneLabelsTop: {
    position: "relative",
    width: "100%",
    height: isMobile ? "20px" : "25px",
    marginBottom: isMobile ? "8px" : "10px",
  },
  milestoneLabelsBottom: {
    position: "relative",
    width: "100%",
    height: isMobile ? "20px" : "25px",
    marginTop: isMobile ? "8px" : "10px",
  },
  progressBarLarge: {
    position: "relative",
    width: "100%",
    height: isMobile ? "20px" : "25px",
    background: "rgba(0, 20, 60, 0.6)",
    borderRadius: isMobile ? "10px" : "12px",
    overflow: "visible",
    border: "2px solid #0088DD",
  },
  progressSegmentBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
    background: "repeating-linear-gradient(90deg, transparent, transparent 24%, rgba(0, 136, 221, 0.1) 24%, rgba(0, 136, 221, 0.1) 25%)",
  },
  progressFillLarge: {
    position: "absolute",
    height: "100%",
    background: "linear-gradient(90deg, #00FF88, #00D9FF, #00FF88)",
    backgroundSize: "200% 100%",
    animation: "shimmer 3s infinite",
    boxShadow: "0 0 15px rgba(0, 255, 136, 0.5), inset 0 0 8px rgba(255, 255, 255, 0.2)",
    transition: "width 0.5s ease",
    borderRadius: isMobile ? "8px" : "10px",
  },
  progressGlow: {
    position: "absolute",
    top: 0,
    right: 0,
    width: isMobile ? "30px" : "50px",
    height: "100%",
    background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6))",
    animation: "glowMove 2s infinite",
  },
  milestoneMarker: {
    position: "absolute",
    top: "-5px",
    width: isMobile ? "2px" : "3px",
    height: "calc(100% + 10px)",
    background: "#00E5FF",
    boxShadow: "0 0 5px rgba(0, 229, 255, 0.5)",
    zIndex: 10,
  },
  milestonesLarge: {
    display: "flex",
    justifyContent: "space-between",
    padding: isMobile ? "0 5px" : "0 10px",
  },
  milestoneItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: isMobile ? "3px" : "5px",
    transition: "all 0.3s ease",
  },
  milestoneDay: {
    fontSize: isMobile ? "10px" : "13px",
    fontFamily: "Rajdhani",
    fontWeight: "700",
    letterSpacing: isMobile ? "0.5px" : "1px",
  },
  milestoneBonus: {
    fontSize: isMobile ? "14px" : "18px",
    fontFamily: "Font1, sans-serif",
    fontWeight: "bold",
  },
  boostProgress: {
    width: "100%",
  },
  boostProgressBar: {
    width: "100%",
    height: isMobile ? "6px" : "8px",
    background: "rgba(0, 136, 221, 0.2)",
    borderRadius: "4px",
    overflow: "hidden",
    marginBottom: isMobile ? "6px" : "8px",
  },
  boostProgressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #00FF88, #00D9FF)",
    boxShadow: "0 0 10px #00FF88",
    transition: "width 0.3s ease",
  },
  boostMilestones: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: isMobile ? "9px" : "10px",
    fontFamily: "Rajdhani",
    fontWeight: "600",
  },
  hexaLinkGrid: {
    display: "grid",
    gridTemplateColumns: isMobile ? "repeat(3, 1fr)" : "repeat(6, 1fr)",
    gap: isMobile ? "6px" : "8px",
    marginBottom: isMobile ? "10px" : "12px",
  },
  hexaLinkGridLarge: {
    display: "grid",
    gridTemplateColumns: isMobile ? "repeat(3, 1fr)" : "repeat(6, 1fr)",
    gap: isMobile ? "12px" : "20px",
    marginBottom: isMobile ? "15px" : "20px",
  },
  hexaLinkIcon: {
    padding: isMobile ? "6px 3px" : "8px 4px",
    borderRadius: "6px",
    background: "rgba(0, 136, 221, 0.1)",
    fontSize: isMobile ? "12px" : "14px",
    textAlign: "center",
    transition: "all 0.3s ease",
  },
  hexaLinkIconLarge: {
    padding: isMobile ? "14px 8px" : "20px 10px",
    borderRadius: isMobile ? "10px" : "12px",
    background: "linear-gradient(135deg, rgba(0, 30, 80, 0.4), rgba(0, 20, 60, 0.6))",
    fontSize: isMobile ? "14px" : "18px",
    textAlign: "center",
    transition: "all 0.3s ease",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: isMobile ? "5px" : "8px",
    minHeight: isMobile ? "90px" : "120px",
    justifyContent: "center",
  },
  hexaIconEmoji: {
    fontSize: isMobile ? "24px" : "32px",
    marginBottom: isMobile ? "3px" : "5px",
  },
  hexaIconName: {
    fontSize: isMobile ? "9px" : "11px",
    color: "#00D9FF",
    fontFamily: "Rajdhani",
    fontWeight: "600",
    letterSpacing: "0.5px",
  },
  hexaIconCount: {
    fontSize: isMobile ? "16px" : "20px",
    fontWeight: "bold",
    fontFamily: "Font1, sans-serif",
    marginTop: isMobile ? "3px" : "5px",
  },
  boostHint: {
    fontSize: isMobile ? "10px" : "11px",
    color: "#888",
    fontFamily: "Rajdhani",
    textAlign: "center",
    marginTop: isMobile ? "8px" : "10px",
  },
  boostHintLarge: {
    fontSize: isMobile ? "12px" : "14px",
    color: "#4DD0E1",
    fontFamily: "Rajdhani",
    textAlign: "center",
    marginTop: isMobile ? "12px" : "15px",
    padding: isMobile ? "12px" : "15px",
    background: "rgba(0, 136, 221, 0.1)",
    borderRadius: isMobile ? "8px" : "10px",
    border: "1px solid rgba(0, 136, 221, 0.3)",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)",
    gap: isMobile ? "12px" : "20px",
  },
  statBox: {
    padding: isMobile ? "20px" : "30px",
    border: "2px solid #0088DD",
    borderRadius: isMobile ? "12px" : "15px",
    background: "#000000",
    boxShadow: "0 0 12px rgba(0, 136, 221, 0.3), inset 0 0 8px rgba(0, 136, 221, 0.05)",
  },
  statLabel: {
    fontSize: isMobile ? "12px" : "14px",
    color: "#00D9FF",
    textTransform: "uppercase",
    letterSpacing: isMobile ? "1.5px" : "2px",
    fontFamily: "Font1, sans-serif",
    marginBottom: isMobile ? "10px" : "12px",
  },
  statValue: {
    fontSize: isMobile ? "32px" : "42px",
    fontWeight: "bold",
    color: "white",
    textShadow: "0 0 12px rgba(0, 217, 255, 0.5)",
    fontFamily: "Font1, sans-serif",
  },
  infoNote: {
    marginTop: isMobile ? "12px" : "15px",
    padding: isMobile ? "10px 12px" : "12px 15px",
    background: "rgba(0, 136, 221, 0.15)",
    border: "1px solid rgba(0, 136, 221, 0.4)",
    borderRadius: isMobile ? "6px" : "8px",
    display: "flex",
    alignItems: "flex-start",
    gap: isMobile ? "8px" : "10px",
  },
  infoNoteText: {
    fontSize: isMobile ? "12px" : "14px",
    color: "#4DD0E1",
    fontFamily: "Rajdhani",
    fontWeight: "500",
    lineHeight: "1.5",
    flex: 1,
  },
  paymentSection: {
    marginTop: isMobile ? "15px" : "20px",
    padding: isMobile ? "20px 15px" : "30px",
    border: "2px solid #00D9FF",
    borderRadius: isMobile ? "12px" : "15px",
    background: "linear-gradient(180deg, rgba(0, 30, 80, 0.5), rgba(0, 20, 60, 0.7))",
    boxShadow: "0 0 10px rgba(0, 136, 221, 0.3), inset 0 0 8px rgba(0, 136, 221, 0.05)",
  },
  paymentTitle: {
    fontSize: isMobile ? "14px" : "20px",
    fontWeight: "bold",
    color: "#00FF88",
    textShadow: "0 0 10px rgba(0, 255, 136, 0.5)",
    fontFamily: "Font1, sans-serif",
    marginBottom: isMobile ? "15px" : "20px",
    textAlign: "center",
    letterSpacing: isMobile ? "1.5px" : "2px",
  },
  paymentCountdownContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: isMobile ? "8px" : "15px",
    marginBottom: isMobile ? "15px" : "20px",
    flexWrap: isMobile ? "wrap" : "nowrap",
  },
  paymentTimerBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: isMobile ? "12px 15px" : "15px 20px",
    background: "rgba(0, 0, 0, 0.4)",
    borderRadius: isMobile ? "8px" : "10px",
    border: "2px solid rgba(0, 217, 255, 0.3)",
    minWidth: isMobile ? "65px" : "90px",
  },
  paymentTimerValue: {
    fontSize: isMobile ? "24px" : "36px",
    fontWeight: "bold",
    color: "#00FF88",
    textShadow: "0 0 12px rgba(0, 255, 136, 0.6)",
    fontFamily: "Font1, sans-serif",
    lineHeight: "1",
  },
  paymentTimerLabel: {
    fontSize: isMobile ? "9px" : "11px",
    color: "#00D9FF",
    textTransform: "uppercase",
    letterSpacing: "1px",
    fontFamily: "Rajdhani",
    marginTop: isMobile ? "6px" : "8px",
  },
  paymentTimerSeparator: {
    fontSize: isMobile ? "20px" : "36px",
    fontWeight: "bold",
    color: "#00D9FF",
    textShadow: "0 0 10px rgba(0, 217, 255, 0.5)",
    fontFamily: "Font1, sans-serif",
  },
  paymentInfo: {
    fontSize: isMobile ? "12px" : "15px",
    color: "#4DD0E1",
    fontFamily: "Rajdhani",
    fontWeight: "500",
    textAlign: "center",
    padding: isMobile ? "10px 15px" : "12px 20px",
    background: "rgba(0, 136, 221, 0.15)",
    border: "1px solid rgba(0, 136, 221, 0.4)",
    borderRadius: isMobile ? "6px" : "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default NFTDisplay;
