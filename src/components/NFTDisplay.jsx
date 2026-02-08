import React from "react";

const NFTDisplay = ({ nfts, walletAddress }) => {
  const tierIncomeRates = {
    1: 0.006,
    2: 0.008,
    3: 0.01,
    4: 0.012,
    5: 0.014,
    6: 0.016,
    7: 0.018,
    8: 0.023,
  };

  const walletBoosts = {};

  const normalizedWalletAddress = Object.keys(walletBoosts).find(
    (key) => key.toLowerCase() === walletAddress.toLowerCase()
  );

  const boostMultiplier = walletBoosts[normalizedWalletAddress] || 1;

  const boostPercentage = ((boostMultiplier - 1) * 100).toFixed(0);

  const totalIncome =
    nfts.reduce((acc, nft) => {
      const tier = parseInt(
        nft.metadata.attributes.find((attr) => attr.trait_type === "Tier")
          ?.value || 0,
        10
      );
      return acc + (tierIncomeRates[tier] || 0);
    }, 0) * boostMultiplier;

  const totalTierPower = nfts.reduce(
    (acc, nft) =>
      acc +
      parseFloat(
        nft.metadata.attributes.find((attr) => attr.trait_type === "Tier")
          ?.value || 0
      ),
    0
  );

  const averageTierPower = (totalTierPower / nfts.length).toFixed(2);

  return (
    <div style={styles.container}>
      <div className="card">
        <table className="infoTable">
          <tbody>
            <tr>
              <td style={styles.infoLabel}>Wallet Address</td>
              <td style={styles.infoValue}>{walletAddress}</td>
            </tr>
          </tbody>
        </table>
        {boostMultiplier > 1 && (
          <h3 style={styles.boostDesc}>Boost Applied</h3>
        )}
        <h3 style={styles.totalIncome}>Total Monthly Rent Income</h3>
        <h3 style={styles.totalIncomeSub}>{totalIncome.toFixed(3)} ETH</h3>

        {boostMultiplier > 1 && (
          <p style={styles.boostMessage}>
            You have a <strong>{boostPercentage}%</strong> Boost!
          </p>
        )}

        {nfts.length > 0 ? (
          <>
            <h2 style={styles.heading}>Your Ether City NFTs</h2>
            <div className="tableContainer">
              <table className="table">
                <thead>
                  <tr>
                    <th>Token ID</th>
                    <th>Tier</th>
                    <th>Monthly Rent Income</th>
                  </tr>
                </thead>
                <tbody>
                  {nfts.map((nft, index) => {
                    const tier = parseInt(
                      nft.metadata.attributes.find(
                        (attr) => attr.trait_type === "Tier"
                      )?.value || 0,
                      10
                    );
                    const income = tierIncomeRates[tier] || 0;
                    return (
                      <tr key={index}>
                        <td>{nft.tokenId}</td>
                        <td>{tier}</td>
                        <td>{income.toFixed(3)} ETH</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p style={styles.noNFTMessage}>
            You don't have any Ether City NFTs in your wallet.
          </p>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center",
    color: "white",
    maxHeight: "100vh",
    overflowX: "hidden",
    overflowY: "auto",
    boxSizing: "border-box",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  infoLabel: {
    color: "white",
    fontSize: "13px",
    fontWeight: "normal",
    padding: "8px",
    fontFamily: "Font1, sans-serif",
    textAlign: "left",
  },
  infoValue: {
    color: "white",
    fontSize: "13px",
    padding: "8px",
    fontFamily: "Font1, sans-serif",
    textAlign: "right",
  },
  heading: {
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "10px",
    marginTop: "20px",
    color: "#fff",
    fontFamily: "Font1, sans-serif",
    borderTop: "2px solid #ffffffb0",
    paddingTop: "20px",
  },
  boostMessage: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "#FFD700",
    textShadow: "0 0 10px #FFD700, 0 0 20px #FFD700",
    marginBottom: "20px",
    fontFamily: "Font1, sans-serif",
  },
  totalIncome: {
    fontSize: "30px",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "white",
    textShadow: "0 0 15px #00ff00, 0 0 30px #00ff00",
    fontFamily: "Font1, sans-serif",
  },
  boostDesc: {
    fontSize: "25px",
    fontWeight: "bold",
    color: "white",
    textShadow: "0 0 15px #00ff00, 0 0 30px #00ff00",
    fontFamily: "Font1, sans-serif",
  },
  totalIncomeSub: {
    fontSize: "30px",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "white",
    textShadow: "0 0 15px red, 0 0 30px red",
    fontFamily: "Font1, sans-serif",
  },
  totalTierPower: {
    fontSize: "35px",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "white",
    textShadow: "0 0 10px blue, 0 0 20px blue",
    fontFamily: "Font1, sans-serif",
  },
  averageTierPower: {
    fontSize: "35px",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "white",
    textShadow: "0 0 10px purple, 0 0 20px purple",
    fontFamily: "Font1, sans-serif",
  },
  noNFTMessage: {
    fontSize: "20px",
    color: "white",
    textShadow: "0 0 10px #ff0000, 0 0 20px #ff0000",
    marginTop: "20px",
    fontFamily: "Font1, sans-serif",
  },
  "@media (max-width: 768px)": {
    container: {
      padding: "10px",
    },
    card: {
      padding: "15px",
    },
    table: {
      fontSize: "18px",
    },
  },
};

export default NFTDisplay;
