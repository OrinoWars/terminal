import axios from "axios";
import metadataList from "../data/metadata.json";

const ALCH_API_KEY = "Jp-feQgo9puqkhqfBKTzJDv99zMK1n3g";
const contractAddress = "0xDc6340a481E0cFA096e37fE7a280fC0E526D8673";

export const getNFTs = async (walletAddress) => {
  try {
    if (
      !walletAddress ||
      walletAddress.length !== 42 ||
      !walletAddress.startsWith("0x")
    ) {
      throw new Error("Invalid wallet address provided.");
    }

    if (!Array.isArray(metadataList) || metadataList.length === 0) {
      console.warn("Warning: metadataList is empty or invalid.");
    }

    let allNFTs = [];
    let pageKey = null;

    do {
      const url = `https://eth-mainnet.g.alchemy.com/nft/v2/${ALCH_API_KEY}/getNFTs/`;

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
          };
        });

        allNFTs = [...allNFTs, ...nftData];
      }

      pageKey = response.data.pageKey || null;
    } while (pageKey);

    return allNFTs;
  } catch (error) {
    console.error("Error fetching NFTs from Alchemy:", error.message);
    return [];
  }
};
