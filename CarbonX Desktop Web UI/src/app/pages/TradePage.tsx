import { useState } from "react";
import { ArrowLeft, TrendingUp, Flame, CheckCircle, XCircle, Clock } from "lucide-react";
import { Link } from "react-router";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const bondingCurveData = [
  { supply: 0, price: 0.1 },
  { supply: 10000, price: 0.12 },
  { supply: 20000, price: 0.15 },
  { supply: 30000, price: 0.19 },
  { supply: 40000, price: 0.24 },
  { supply: 50000, price: 0.30 },
  { supply: 60000, price: 0.37 },
  { supply: 70000, price: 0.45 },
];

type TransactionStatus = "idle" | "pending" | "success" | "failed";

export function TradePage() {
  const [buyAmount, setBuyAmount] = useState("");
  const [burnAmount, setBurnAmount] = useState("");
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>("idle");
  const [transactionType, setTransactionType] = useState<"buy" | "burn" | null>(null);

  const currentPrice = 0.299;
  const totalSupply = 58420;

  const estimatedPayment = buyAmount ? (parseFloat(buyAmount) * currentPrice).toFixed(2) : "0.00";
  const estimatedOffset = burnAmount ? (parseFloat(burnAmount) * 0.5).toFixed(2) : "0.00";

  const handleBuy = () => {
    setTransactionType("buy");
    setTransactionStatus("pending");
    setTimeout(() => {
      setTransactionStatus("success");
      setBuyAmount("");
    }, 2000);
  };

  const handleBurn = () => {
    setTransactionType("burn");
    setTransactionStatus("pending");
    setTimeout(() => {
      setTransactionStatus("success");
      setBurnAmount("");
    }, 2000);
  };

  return (
    <>
      {/* Top Nav */}
      <header className="h-16 bg-white border-b border-border flex items-center px-8">
        <Link to="/" className="flex items-center gap-3 text-[#6B7280] hover:text-[#1F2937] transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-[14px] font-medium">Back to Dashboard</span>
        </Link>
        <h2 className="text-[18px] font-semibold text-[#1F2937] ml-8">Carbon Credit Trading</h2>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        <div className="p-8 max-w-[1400px] mx-auto">
          {/* Market Info Row */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-5 h-5 text-[#3A7D44]" />
                <h3 className="text-[16px] font-semibold text-[#1F2937]">Current Price</h3>
              </div>
              <p className="text-[32px] font-semibold text-[#3A7D44]">${currentPrice}</p>
              <p className="text-[13px] text-[#6B7280] mt-1">per CCU</p>
            </div>

            <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-5 h-5 rounded-full bg-[#3A7D44]" />
                <h3 className="text-[16px] font-semibold text-[#1F2937]">Total Supply</h3>
              </div>
              <p className="text-[32px] font-semibold text-[#1F2937]">{totalSupply.toLocaleString()}</p>
              <p className="text-[13px] text-[#6B7280] mt-1">CCU in circulation</p>
            </div>
          </div>

          {/* Trade Cards */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Buy Card */}
            <div className="bg-white rounded-xl border border-border p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[#ECFDF5] flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[#3A7D44]" />
                </div>
                <h3 className="text-[18px] font-semibold text-[#1F2937]">Buy CCU</h3>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                    Amount (CCU)
                  </label>
                  <input
                    type="number"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A7D44] text-[16px]"
                  />
                </div>

                <div className="bg-[#F9FAFB] rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] text-[#6B7280]">Price per CCU</span>
                    <span className="text-[14px] font-medium text-[#1F2937]">${currentPrice}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-medium text-[#1F2937]">Estimated Payment</span>
                    <span className="text-[18px] font-semibold text-[#3A7D44]">${estimatedPayment} USDC</span>
                  </div>
                </div>

                <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-lg p-3">
                  <p className="text-[13px] text-[#92400E]">
                    ⚠️ Price rises after purchase due to bonding curve
                  </p>
                </div>

                <button
                  onClick={handleBuy}
                  disabled={!buyAmount || parseFloat(buyAmount) <= 0}
                  className="w-full bg-[#3A7D44] text-white py-3 rounded-lg font-medium hover:bg-[#2f6636] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  Confirm Purchase
                </button>
              </div>
            </div>

            {/* Burn Card */}
            <div className="bg-white rounded-xl border border-border p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F3F4F6] to-[#E5E7EB] flex items-center justify-center">
                  <Flame className="w-5 h-5 text-[#6B7280]" />
                </div>
                <h3 className="text-[18px] font-semibold text-[#1F2937]">Burn CCU (Offset)</h3>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                    Amount (CCU)
                  </label>
                  <input
                    type="number"
                    value={burnAmount}
                    onChange={(e) => setBurnAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7280] text-[16px]"
                  />
                </div>

                <div className="bg-[#F9FAFB] rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] text-[#6B7280]">Offset Rate</span>
                    <span className="text-[14px] font-medium text-[#1F2937]">0.5 tons/CCU</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-medium text-[#1F2937]">CO₂ Offset</span>
                    <span className="text-[18px] font-semibold text-[#6B7280]">{estimatedOffset} tons</span>
                  </div>
                </div>

                <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg p-3">
                  <p className="text-[13px] text-[#065F46]">
                    ✓ Burning permanently offsets your carbon footprint
                  </p>
                </div>

                <button
                  onClick={handleBurn}
                  disabled={!burnAmount || parseFloat(burnAmount) <= 0}
                  className="w-full bg-gradient-to-r from-[#6B7280] to-[#9CA3AF] text-white py-3 rounded-lg font-medium hover:from-[#4B5563] hover:to-[#6B7280] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  Confirm Burn
                </button>
              </div>
            </div>
          </div>

          {/* Transaction Status */}
          {transactionStatus !== "idle" && (
            <div className="mb-8">
              <div className={`bg-white rounded-xl border p-6 shadow-sm ${
                transactionStatus === "success" ? "border-[#3A7D44]" : 
                transactionStatus === "failed" ? "border-[#EF4444]" : 
                "border-border"
              }`}>
                <div className="flex items-center gap-4">
                  {transactionStatus === "pending" && (
                    <>
                      <Clock className="w-6 h-6 text-[#3A7D44] animate-spin" />
                      <div>
                        <p className="text-[16px] font-semibold text-[#1F2937]">Transaction Pending</p>
                        <p className="text-[14px] text-[#6B7280]">
                          Please wait while we process your {transactionType} transaction...
                        </p>
                      </div>
                    </>
                  )}
                  {transactionStatus === "success" && (
                    <>
                      <CheckCircle className="w-6 h-6 text-[#3A7D44]" />
                      <div>
                        <p className="text-[16px] font-semibold text-[#3A7D44]">Transaction Successful</p>
                        <p className="text-[14px] text-[#6B7280]">
                          Your {transactionType} transaction has been completed successfully!
                        </p>
                      </div>
                    </>
                  )}
                  {transactionStatus === "failed" && (
                    <>
                      <XCircle className="w-6 h-6 text-[#EF4444]" />
                      <div>
                        <p className="text-[16px] font-semibold text-[#EF4444]">Transaction Failed</p>
                        <p className="text-[14px] text-[#6B7280]">
                          Your {transactionType} transaction could not be completed. Please try again.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bonding Curve Chart */}
          <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
            <h3 className="text-[16px] font-semibold text-[#1F2937] mb-4">Bonding Curve Visualization</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={bondingCurveData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="supply" 
                  stroke="#6B7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6B7280"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E5E7EB', 
                    borderRadius: '8px',
                    fontSize: '13px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#3A7D44" 
                  strokeWidth={2.5}
                  dot={{ fill: '#3A7D44', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-[13px] text-[#6B7280] text-center mt-4">
              The bonding curve ensures transparent, algorithmic pricing based on supply and demand
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
