"use client";

import { useMemo, useState } from "react";

type TradePanelProps = {
  currentPrice: number;
  ccuBalance: number;
  connected: boolean;
  isBuying: boolean;
  isBurning: boolean;
  onBuy: (amount: number) => Promise<void>;
  onBurn: (amount: number) => Promise<void>;
  setStatusMessage: (message: string) => void;
  setStatusType: (type: "success" | "error" | "") => void;
};

export default function TradePanel({
  currentPrice,
  ccuBalance,
  connected,
  isBuying,
  isBurning,
  onBuy,
  onBurn,
  setStatusMessage,
  setStatusType,
}: TradePanelProps) {
  const [buyAmount, setBuyAmount] = useState("");
  const [burnAmount, setBurnAmount] = useState("");
  const [buyError, setBuyError] = useState("");
  const [burnError, setBurnError] = useState("");

  const estimatedCost = useMemo(() => {
    const amount = Number(buyAmount);
    if (!buyAmount || Number.isNaN(amount) || amount <= 0) return "0.00";
    return (amount * currentPrice).toFixed(4);
  }, [buyAmount, currentPrice]);

  const validateBuy = () => {
    const amount = Number(buyAmount);

    if (!connected) return "Please connect your wallet first.";
    if (isBuying) return "Buy transaction already in progress.";
    if (!buyAmount) return "Please enter a buy amount.";
    if (Number.isNaN(amount) || amount <= 0) return "Amount must be greater than 0.";
    return "";
  };

  const validateBurn = () => {
    const amount = Number(burnAmount);

    if (!connected) return "Please connect your wallet first.";
    if (isBurning) return "Burn transaction already in progress.";
    if (!burnAmount) return "Please enter a burn amount.";
    if (Number.isNaN(amount) || amount <= 0) return "Amount must be greater than 0.";
    if (amount > ccuBalance) return "Insufficient CCU balance.";
    return "";
  };

  const handleBuyClick = async () => {
    const error = validateBuy();
    setBuyError(error);

    if (error) {
      setStatusType("error");
      setStatusMessage(error);
      return;
    }

    try {
      const amount = Number(buyAmount);
      await onBuy(amount);
      setBuyAmount("");
      setBuyError("");
    } catch (error) {
      console.error("Buy action failed:", error);
    }
  };

  const handleBurnClick = async () => {
    const error = validateBurn();
    setBurnError(error);

    if (error) {
      setStatusType("error");
      setStatusMessage(error);
      return;
    }

    const amount = Number(burnAmount);
    const confirmed = window.confirm(
      `Are you sure you want to burn ${amount} CCU? This action is irreversible.`
    );

    if (!confirmed) return;

    try {
      await onBurn(amount);
      setBurnAmount("");
      setBurnError("");
    } catch (error) {
      console.error("Burn action failed:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-2xl font-semibold">Buy CCU</h3>
        <p className="mb-2 text-sm text-gray-500">
          Enter the amount of CCU you want to buy
        </p>

        <input
          type="number"
          min="0"
          step="0.01"
          value={buyAmount}
          onChange={(e) => setBuyAmount(e.target.value)}
          placeholder="e.g. 100"
          disabled={isBuying}
          className="mb-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-green-600 disabled:cursor-not-allowed disabled:bg-gray-100"
        />

        {buyError && <p className="mb-2 text-sm text-red-600">{buyError}</p>}

        <p className="mb-4 text-sm text-gray-500">
          Estimated Cost: {estimatedCost} ETH
        </p>

        <button
          onClick={handleBuyClick}
          disabled={isBuying}
          className={`w-full rounded-xl px-4 py-3 font-medium text-white transition ${
            isBuying
              ? "cursor-not-allowed bg-gray-400"
              : "bg-green-700 hover:bg-green-800"
          }`}
        >
          {isBuying ? "Processing..." : "Buy CCU"}
        </button>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-2xl font-semibold">Burn CCU</h3>
        <p className="mb-2 text-sm text-gray-500">
          Enter the amount of CCU you want to burn
        </p>

        <input
          type="number"
          min="0"
          step="0.01"
          value={burnAmount}
          onChange={(e) => setBurnAmount(e.target.value)}
          placeholder="e.g. 50"
          disabled={isBurning}
          className="mb-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-red-500 disabled:cursor-not-allowed disabled:bg-gray-100"
        />

        {burnError && <p className="mb-2 text-sm text-red-600">{burnError}</p>}

        <p className="mb-4 text-sm text-gray-500">
          Tokens will be permanently removed
        </p>

        <button
          onClick={handleBurnClick}
          disabled={isBurning}
          className={`w-full rounded-xl px-4 py-3 font-medium text-white transition ${
            isBurning
              ? "cursor-not-allowed bg-gray-400"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {isBurning ? "Processing..." : "Burn CCU"}
        </button>
      </div>
    </div>
  );
}