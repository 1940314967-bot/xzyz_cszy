"use client";

import { getContract } from "../lib/contract";
import { formatEther, formatUnits } from "ethers";
import { useMemo, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import WalletCard from "./WalletCard";
import StatsCards from "./StatsCards";
import TradePanel from "./TradePanel";
import RecentTransactions, { TransactionItem } from "./RecentTransactions";
import BondingCurveChart from "./BondingCurveChart";
import toast, { Toaster } from "react-hot-toast";

//npm install
//npm run dev

type PageKey = "dashboard" | "trade" | "projects" | "account";

type DashboardContentProps = {
  currentPage: PageKey;
};



export default function DashboardContent({
  currentPage,
}: DashboardContentProps) {
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("Not connected");
  const [ccuBalance, setCcuBalance] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [totalSupply, setTotalSupply] = useState(0);
  const [volume24h, setVolume24h] = useState(0);
  const [tokensBurned, setTokensBurned] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [curveData, setCurveData] = useState<number[]>([]);
  const [ethPrice, setEthPrice] = useState<number>(0);
  const [isBuying, setIsBuying] = useState(false);
  const [isBurning, setIsBurning] = useState(false);

  const shortAddress = useMemo(() => {
    if (!connected || walletAddress === "Not connected") return "Connect Wallet";
    return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
  }, [connected, walletAddress]);

  const clearStatus = () => {
    setTimeout(() => {
      setStatusMessage("");
      setStatusType("");
    }, 2500);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const loadTransactions = async (userAddress?: string) => {
    try {
      const { contract, provider } = await getContract();
      const addressToUse = userAddress || walletAddress;

      if (!addressToUse || addressToUse === "Not connected") {
        return;
      }

      const mintedFilter = contract.filters.Minted(addressToUse);
      const burnedFilter = contract.filters.Burned(addressToUse);

      const mintedEvents = await contract.queryFilter(mintedFilter);
      const burnedEvents = await contract.queryFilter(burnedFilter);

      const buyTransactions = await Promise.all(
        mintedEvents.map(async (event: any) => {
          const block = await provider.getBlock(event.blockNumber);

          return {
            type: "Buy" as const,
            amount: Number(event.args.amount),
            value: Number(formatEther(event.args.cost)),
            hash: event.transactionHash,
            time: block ? formatTimestamp(block.timestamp) : "Unknown time",
            timestamp: block ? block.timestamp : 0,
          };
        })
      );

      const burnTransactions = await Promise.all(
        burnedEvents.map(async (event: any) => {
          const block = await provider.getBlock(event.blockNumber);

          return {
            type: "Burn" as const,
            amount: Number(event.args.amount),
            value: Number(formatEther(event.args.refund)),
            hash: event.transactionHash,
            time: block ? formatTimestamp(block.timestamp) : "Unknown time",
            timestamp: block ? block.timestamp : 0,
          };
        })
      );

      const combined = [...buyTransactions, ...burnTransactions]
        .sort((a, b) => b.timestamp - a.timestamp)
        .map(({ timestamp, ...tx }) => tx);

      setTransactions(combined);
    } catch (error) {
      console.error("Failed to load transactions:", error);
    }
  };

  const loadCurrentPrice = async () => {
    try {
      const { contract } = await getContract();

      const rawPrice = await contract.getCurrentPrice();
      const price = Number(formatEther(rawPrice));

      setCurrentPrice(price);
    } catch (error) {
      console.error("Failed to load current price:", error);
    }
  };

  const loadTokensBurned = async () => {
  try {
    const { contract } = await getContract();
    const decimals = await contract.decimals();

    const burnedFilter = contract.filters.Burned();
    const burnedEvents = await contract.queryFilter(burnedFilter);

    let totalBurned = 0;

    for (const event of burnedEvents) {
      totalBurned += Number(event.args.amount);
    }

    console.log("burned events count:", burnedEvents.length);
    console.log("total burned:", totalBurned);

    setTokensBurned(totalBurned);
  } catch (error) {
    console.error("Failed to load tokens burned:", error);
  }
};

const loadVolume24h = async () => {
  try {
    const { contract, provider } = await getContract();

    const latestBlock = await provider.getBlockNumber();
    const latestBlockData = await provider.getBlock(latestBlock);

    if (!latestBlockData) return;

    const now = latestBlockData.timestamp;
    const secondsIn24h = 24 * 60 * 60;
    const cutoff = now - secondsIn24h;

    const mintedFilter = contract.filters.Minted();
    const burnedFilter = contract.filters.Burned();

    const mintedEvents = await contract.queryFilter(mintedFilter);
    const burnedEvents = await contract.queryFilter(burnedFilter);

    let totalVolume = 0;

    for (const event of mintedEvents) {
      const block = await provider.getBlock(event.blockNumber);
      if (block && block.timestamp >= cutoff) {
        totalVolume += Number(formatEther(event.args.cost));
      }
    }

    for (const event of burnedEvents) {
      const block = await provider.getBlock(event.blockNumber);
      if (block && block.timestamp >= cutoff) {
        totalVolume += Number(formatEther(event.args.refund));
      }
    }

    setVolume24h(totalVolume);
  } catch (error) {
    console.error("Failed to load 24h volume:", error);
  }
};

const loadEthPrice = async () => {
  try {
    console.log("Fetching ETH price...");

    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    );

    const data = await res.json();
    console.log("CoinGecko response:", data);

    const usdPrice = Number(data?.ethereum?.usd);
    console.log("Extracted usdPrice:", usdPrice);

    if (!Number.isNaN(usdPrice) && usdPrice > 0) {
      setEthPrice(usdPrice);
    } else {
      console.warn("Invalid ETH price");
      setEthPrice(0);
    }
  } catch (error) {
    console.error("Failed to load ETH price:", error);
    setEthPrice(0);
  }
};

const loadCurveData = async () => {
  try {
    const { contract } = await getContract();

    const rawSupply = await contract.totalSupply();
    const decimals = await contract.decimals();
    const currentSupply = Number(formatUnits(rawSupply, decimals));

    const maxSupply = Math.max(currentSupply + 10, 20);
    const points: number[] = [];

    for (let supply = 1; supply <= maxSupply; supply++) {
      const totalCost = await contract.getMintCost(BigInt(supply));
      const averagePrice = Number(formatEther(totalCost)) / supply;
      points.push(averagePrice);
    }

    setCurveData(points);
  } catch (error) {
    console.error("Failed to load curve data:", error);
  }
};

const loadWalletData = async (userAddress?: string) => {
  try {
    const { contract } = await getContract();
    const addressToUse = userAddress || walletAddress;

    if (!addressToUse || addressToUse === "Not connected") return;

    const balance = await contract.balanceOf(addressToUse);
    const supply = await contract.totalSupply();
    const decimals = await contract.decimals();

    setCcuBalance(Number(formatUnits(balance, decimals)));
    setTotalSupply(Number(formatUnits(supply, decimals)));
  } catch (error) {
    console.error("Failed to load wallet data:", error);
  }
};



  const handleConnectWallet = async () => {
    try {
      if (!window.ethereum) {
        setStatusType("error");
        setStatusMessage("MetaMask not found.");
        clearStatus();
        return;
      }

      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x7A69" }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x7A69",
                chainName: "Hardhat Local",
                rpcUrls: ["http://127.0.0.1:8545"],
                nativeCurrency: {
                  name: "ETH",
                  symbol: "ETH",
                  decimals: 18,
                },
              },
            ],
          });
        } 
      }

      await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const { signer, contract } = await getContract();
      const address = await signer.getAddress();

      setConnected(true);
      setWalletAddress(address);

      const balance = await contract.balanceOf(address);
      const supply = await contract.totalSupply();
      const decimals = await contract.decimals();

      setCcuBalance(Number(formatUnits(balance, decimals)));
      setTotalSupply(Number(formatUnits(supply, decimals)));
      
      await loadWalletData(address);
      await loadTransactions(address);
      await loadCurrentPrice();
      await loadCurveData();
      await loadTokensBurned();
      await loadVolume24h();
      await loadEthPrice();


      setStatusType("success");
      setStatusMessage("Wallet connected successfully.");
      clearStatus();
    } catch (error) {
      console.error(error);
      setStatusType("error");
      setStatusMessage("Failed to connect wallet.");
      clearStatus();
    }
  };

  const handleCopyAddress = async () => {
    if (!connected || walletAddress === "Not connected") {
      setStatusType("error");
      setStatusMessage("No wallet address to copy.");
      clearStatus();
      return;
    }

    try {
      await navigator.clipboard.writeText(walletAddress);
      setStatusType("success");
      setStatusMessage("Wallet address copied.");
      clearStatus();
    } catch {
      setStatusType("error");
      setStatusMessage("Failed to copy address.");
      clearStatus();
    }
  };

const handleBuy = async (amount: number) => {
  if (!amount || amount <= 0) return;

  try {
    setIsBuying(true);

    const { contract } = await getContract();

    const txAmount = BigInt(Math.floor(amount));
    const cost = await contract.getMintCost(txAmount);
    const tx = await contract.mint(txAmount, { value: cost });

    await tx.wait();

    await loadWalletData();
    await loadTransactions();
    await loadCurrentPrice();
    await loadCurveData();
    await loadTokensBurned();
    await loadVolume24h();

    setStatusType("success");
    setStatusMessage("Successfully bought CCU!");
  } catch (error) {
    console.error("Buy failed:", error);
    setStatusType("error");
    setStatusMessage("Buy transaction failed");
  } finally {
    setIsBuying(false);

    setTimeout(() => {
      setStatusMessage("");
      setStatusType("");
    }, 3000);
  }
};

const handleBurn = async (amount: number) => {
  if (!amount || amount <= 0) return;

  try {
    setIsBurning(true);

    const { contract } = await getContract();

    const txAmount = BigInt(Math.floor(amount));
    const tx = await contract.burn(txAmount);

    await tx.wait();

    await loadWalletData();
    await loadTransactions();
    await loadCurrentPrice();
    await loadCurveData();
    await loadTokensBurned();
    await loadVolume24h();

    setStatusType("success");
    setStatusMessage("Successfully burned CCU!");
  } catch (error) {
    console.error("Burn failed:", error);
    setStatusType("error");
    setStatusMessage("Burn transaction failed");
  } finally {
    setIsBurning(false);

    setTimeout(() => {
      setStatusMessage("");
      setStatusType("");
    }, 3000);
  }
};

  const pageTitleMap: Record<PageKey, string> = {
    dashboard: "Dashboard",
    trade: "Trade",
    projects: "Projects",
    account: "My Account",
  };

  const renderMainSection = () => {
    if (currentPage === "dashboard") {
      return (
        <>
          <WalletCard
            walletAddress={walletAddress}
            connected={connected}
            ccuBalance={ccuBalance}
            onCopyAddress={handleCopyAddress}
          />

          <StatsCards
            currentPrice={currentPrice}
            totalSupply={totalSupply}
            volume24h={volume24h}
            tokensBurned={tokensBurned}
            ethPrice={ethPrice}
          />

          <TradePanel
            currentPrice={currentPrice}
            ccuBalance={ccuBalance}
            connected={connected}
            isBuying={isBuying}
            isBurning={isBurning}
            onBuy={handleBuy}
            onBurn={handleBurn}
            setStatusMessage={setStatusMessage}
            setStatusType={setStatusType}
          />

          <BondingCurveChart data={curveData} />
        </>
      );
    }

    if (currentPage === "trade") {
      return (
        <>
          <StatsCards
            currentPrice={currentPrice}
            totalSupply={totalSupply}
            volume24h={volume24h}
            tokensBurned={tokensBurned}
            ethPrice={ethPrice}
          />

          <TradePanel
            currentPrice={currentPrice}
            ccuBalance={ccuBalance}
            connected={connected}
            isBuying={isBuying}
            isBurning={isBurning}
            onBuy={handleBuy}
            onBurn={handleBurn}
            setStatusMessage={setStatusMessage}
            setStatusType={setStatusType}
          />

          <BondingCurveChart data={curveData} />
        </>
      );
    }

    if (currentPage === "projects") {
      return (
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <h3 className="mb-4 text-2xl font-semibold">Carbon Credit Overview</h3>
          <p className="mb-3 text-gray-600">
            This section can later show credit issuance categories, total retired
            credits, audit summaries, and marketplace activity.
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border p-5">
              <p className="text-sm text-gray-500">Issued Credits</p>
              <p className="mt-2 text-2xl font-bold">{totalSupply}</p>
            </div>
            <div className="rounded-xl border p-5">
              <p className="text-sm text-gray-500">Burned Credits</p>
              <p className="mt-2 text-2xl font-bold">{tokensBurned}</p>
            </div>
            <div className="rounded-xl border p-5">
              <p className="text-sm text-gray-500">Current Price</p>
              <p className="mt-2 text-2xl font-bold">
                {currentPrice.toFixed(6)} ETH
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <h3 className="mb-4 text-2xl font-semibold">Account Details</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Wallet Status</p>
            <p className="mt-1 text-lg font-medium">
              {connected ? "Connected" : "Disconnected"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Wallet Address</p>
            <p className="mt-1 text-lg font-medium">{walletAddress}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">CCU Balance</p>
            <p className="mt-1 text-lg font-medium">{ccuBalance.toFixed(2)} CCU</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#f7f7f7] text-gray-900">
      <div className="flex min-h-screen">
        <Sidebar currentPage={currentPage} />

        <section className="flex-1">
          <Header
            title={pageTitleMap[currentPage]}
            connected={connected}
            buttonLabel={shortAddress}
            onConnect={handleConnectWallet}
          />

          <div className="space-y-6 p-8">
            {statusMessage && (
              <div
                className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                  statusType === "success"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {statusMessage}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="space-y-6 xl:col-span-2">{renderMainSection()}</div>
              <div>
                <RecentTransactions transactions={transactions} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}