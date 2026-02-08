import axios from "axios";
import metadataList from "../data/metadata.json";

const ALCH_API_KEY = "Jp-feQgo9puqkhqfBKTzJDv99zMK1n3g";
const contractAddress = "0xBD29d460a390B4Da8C1b7FAD160f2587E8AEB811";

// Calculate NFT holding duration in wallet
export const getNFTTransferHistory = async (tokenId, ownerAddress, allTransfers) => {
  try {
    const tokenIdShortHex = `0x${parseInt(tokenId).toString(16)}`;
    const tokenIdLongHex = `0x${parseInt(tokenId).toString(16).padStart(64, '0')}`;
    
    const tokenTransfers = allTransfers.filter(t => {
      const apiTokenId = (t.erc721TokenId || t.tokenId || '').toLowerCase();
      return apiTokenId === tokenIdShortHex.toLowerCase() || 
             apiTokenId === tokenIdLongHex.toLowerCase();
    });

    const lastTransferToOwner = tokenTransfers.find(t => 
      t.to && t.to.toLowerCase() === ownerAddress.toLowerCase()
    );

    if (lastTransferToOwner && lastTransferToOwner.metadata && lastTransferToOwner.metadata.blockTimestamp) {
      const transferDate = new Date(lastTransferToOwner.metadata.blockTimestamp);
      const daysInWallet = Math.floor((Date.now() - transferDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        daysInWallet: Math.max(0, daysInWallet),
        transferDate: transferDate
      };
    }
    
    return {
      daysInWallet: 0,
      transferDate: null
    };
  } catch (error) {
    return {
      daysInWallet: 0,
      transferDate: null
    };
  }
};

export const getNFTs = async (walletAddress) => {
  try {
    if (
      !walletAddress ||
      walletAddress.length !== 42 ||
      !walletAddress.startsWith("0x")
    ) {
      throw new Error("Invalid wallet address provided.");
    }

    let allNFTs = [];
    let pageKey = null;

    // 1. Fetch NFTs from wallet
    do {
      const url = `https://eth-sepolia.g.alchemy.com/nft/v2/${ALCH_API_KEY}/getNFTs/`;

      const response = await axios.get(url, {
        params: {
          owner: walletAddress.toLowerCase(),
          contractAddresses: [contractAddress],
          pageKey: pageKey,
          pageSize: 100,
        },
      });

      if (response.data.ownedNfts) {
        const nftData = response.data.ownedNfts.map((nft) => {
          const tokenId = parseInt(nft.id.tokenId, 16);
          const matchingMetadata = metadataList.find(
            (meta) => meta.edition === tokenId
          );

          return {
            tokenId,
            metadata: matchingMetadata || null,
            daysInWallet: 0,
            transferDate: null,
          };
        });

        allNFTs = [...allNFTs, ...nftData];
      }

      pageKey = response.data.pageKey || null;
    } while (pageKey);

    // 2. Fetch transfer history (single call for entire contract)
    const transferUrl = `https://eth-sepolia.g.alchemy.com/v2/${ALCH_API_KEY}`;
    const transferResponse = await axios.post(transferUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "alchemy_getAssetTransfers",
      params: [{
        fromBlock: "0x0",
        toBlock: "latest",
        contractAddresses: [contractAddress],
        category: ["erc721"],
        withMetadata: true,
        excludeZeroValue: false,
        order: "desc"
      }]
    });

    const allTransfers = transferResponse.data.result?.transfers || [];

    // 3. Calculate hold duration for each NFT
    for (let nft of allNFTs) {
      const transferInfo = await getNFTTransferHistory(nft.tokenId, walletAddress, allTransfers);
      nft.daysInWallet = transferInfo.daysInWallet;
      nft.transferDate = transferInfo.transferDate;
    }

    return allNFTs;
  } catch (error) {
    console.error("Error fetching NFTs from Alchemy:", error.message);
    return [];
  }
};
