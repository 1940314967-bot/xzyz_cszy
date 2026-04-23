import { useState } from "react";
import { Wallet, Copy, TrendingUp, Flame, ExternalLink, Settings, LogOut } from "lucide-react";

const transactionHistory = [
  { id: "1", type: "buy", date: "Apr 5, 2026", amount: "150 CCU", price: "$45.00", hash: "0x1a2b3c4d5e6f" },
  { id: "2", type: "burn", date: "Apr 4, 2026", amount: "75 CCU", price: "-", hash: "0x4d5e6f7g8h9i" },
  { id: "3", type: "buy", date: "Apr 3, 2026", amount: "300 CCU", price: "$89.70", hash: "0x7g8h9i0j1k2l" },
  { id: "4", type: "burn", date: "Apr 2, 2026", amount: "200 CCU", price: "-", hash: "0xj0k1l2m3n4o5" },
  { id: "5", type: "buy", date: "Apr 1, 2026", amount: "500 CCU", price: "$147.50", hash: "0xm3n4o5p6q7r8" },
  { id: "6", type: "buy", date: "Mar 31, 2026", amount: "100 CCU", price: "$29.80", hash: "0xp6q7r8s9t0u1" },
  { id: "7", type: "burn", date: "Mar 30, 2026", amount: "150 CCU", price: "-", hash: "0xs9t0u1v2w3x" },
];

const offsetCertificates = [
  {
    id: "1",
    amount: "75 CCU",
    co2Offset: "37.5 tons",
    date: "Apr 4, 2026",
    chainProof: "0x4d5e6f7g8h9i...abc123",
  },
  {
    id: "2",
    amount: "200 CCU",
    co2Offset: "100 tons",
    date: "Apr 2, 2026",
    chainProof: "0xj0k1l2m3n4o5...def456",
  },
  {
    id: "3",
    amount: "150 CCU",
    co2Offset: "75 tons",
    date: "Mar 30, 2026",
    chainProof: "0xs9t0u1v2w3x...ghi789",
  },
];

export function MyAccountPage() {
  const [activeTab, setActiveTab] = useState<"buy" | "burn">("buy");
  const [copied, setCopied] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState("sepolia");

  const walletAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f3A4F";
  const ccuBalance = 1234.56;
  const totalHeld = 1234.56;
  const totalBurned = 425;

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredTransactions = transactionHistory.filter(
    (tx) => tx.type === activeTab
  );

  return (
    <>
      {/* Top Nav */}
      <header className="h-16 bg-white border-b border-border flex items-center px-8">
        <h2 className="text-[18px] font-semibold text-[#1F2937]">My Account</h2>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        <div className="p-8 max-w-[1600px] mx-auto">
          <div className="flex gap-8">
            {/* Left Column */}
            <div className="w-[400px] space-y-6">
              {/* Wallet Card */}
              <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-[#ECFDF5] flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-[#3A7D44]" />
                  </div>
                  <h3 className="text-[16px] font-semibold text-[#1F2937]">Wallet</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[13px] text-[#6B7280] mb-2">Address</p>
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-mono text-[#1F2937] bg-[#F9FAFB] px-3 py-2 rounded-lg flex-1 truncate">
                        {walletAddress}
                      </p>
                      <button
                        onClick={handleCopy}
                        className="p-2 hover:bg-[#F9FAFB] rounded-lg transition-colors"
                        title="Copy address"
                      >
                        {copied ? (
                          <span className="text-[12px] text-[#3A7D44] font-medium">Copied!</span>
                        ) : (
                          <Copy className="w-4 h-4 text-[#6B7280]" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <p className="text-[13px] text-[#6B7280] mb-2">CCU Balance</p>
                    <p className="text-[32px] font-semibold text-[#3A7D44]">{ccuBalance.toLocaleString()}</p>
                    <p className="text-[13px] text-[#6B7280] mt-1">Carbon Credit Units</p>
                  </div>
                </div>
              </div>

              {/* Asset Stats */}
              <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
                <h3 className="text-[16px] font-semibold text-[#1F2937] mb-5">Asset Statistics</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-[#3A7D44]" />
                      <div>
                        <p className="text-[13px] text-[#6B7280]">Total Held</p>
                        <p className="text-[18px] font-semibold text-[#1F2937]">{totalHeld.toLocaleString()} CCU</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Flame className="w-5 h-5 text-[#6B7280]" />
                      <div>
                        <p className="text-[13px] text-[#6B7280]">Total Burned</p>
                        <p className="text-[18px] font-semibold text-[#1F2937]">{totalBurned} CCU</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <p className="text-[13px] text-[#6B7280] mb-1">CO₂ Offset</p>
                    <p className="text-[24px] font-semibold text-[#3A7D44]">{(totalBurned * 0.5).toFixed(1)} tons</p>
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <Settings className="w-5 h-5 text-[#6B7280]" />
                  <h3 className="text-[16px] font-semibold text-[#1F2937]">Settings</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-medium text-[#1F2937] mb-2">
                      Network
                    </label>
                    <select
                      value={selectedNetwork}
                      onChange={(e) => setSelectedNetwork(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A7D44] text-[14px] bg-white"
                    >
                      <option value="sepolia">Sepolia Testnet</option>
                      <option value="arbitrum">Arbitrum One</option>
                    </select>
                  </div>

                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-[#EF4444] text-[#EF4444] rounded-lg hover:bg-[#FEF2F2] transition-colors text-[14px] font-medium">
                    <LogOut className="w-4 h-4" />
                    Disconnect Wallet
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex-1 space-y-6">
              {/* Transaction History */}
              <div className="bg-white rounded-xl border border-border shadow-sm">
                <div className="p-6 border-b border-border">
                  <h3 className="text-[16px] font-semibold text-[#1F2937] mb-4">Transaction History</h3>
                  
                  {/* Tabs */}
                  <div className="flex gap-1 bg-[#F9FAFB] p-1 rounded-lg">
                    <button
                      onClick={() => setActiveTab("buy")}
                      className={`flex-1 px-4 py-2 rounded-lg text-[14px] font-medium transition-all ${
                        activeTab === "buy"
                          ? "bg-white text-[#1F2937] shadow-sm"
                          : "text-[#6B7280] hover:text-[#1F2937]"
                      }`}
                    >
                      Buy
                    </button>
                    <button
                      onClick={() => setActiveTab("burn")}
                      className={`flex-1 px-4 py-2 rounded-lg text-[14px] font-medium transition-all ${
                        activeTab === "burn"
                          ? "bg-white text-[#1F2937] shadow-sm"
                          : "text-[#6B7280] hover:text-[#1F2937]"
                      }`}
                    >
                      Burn
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left px-6 py-3 text-[13px] font-medium text-[#6B7280]">Date</th>
                        <th className="text-left px-6 py-3 text-[13px] font-medium text-[#6B7280]">Amount</th>
                        <th className="text-left px-6 py-3 text-[13px] font-medium text-[#6B7280]">Price</th>
                        <th className="text-left px-6 py-3 text-[13px] font-medium text-[#6B7280]">Transaction Hash</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-border last:border-b-0 hover:bg-[#F9FAFB] transition-colors">
                          <td className="px-6 py-4 text-[14px] text-[#1F2937]">{tx.date}</td>
                          <td className="px-6 py-4 text-[14px] font-medium text-[#1F2937]">{tx.amount}</td>
                          <td className="px-6 py-4 text-[14px] text-[#6B7280]">{tx.price}</td>
                          <td className="px-6 py-4">
                            <a
                              href="#"
                              className="text-[13px] font-mono text-[#3A7D44] hover:underline flex items-center gap-1"
                            >
                              {tx.hash}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Offset Certificates */}
              <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
                <h3 className="text-[16px] font-semibold text-[#1F2937] mb-5">Offset Certificates</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {offsetCertificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="border border-border rounded-xl p-5 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#ECFDF5] to-[#D1FAE5] flex items-center justify-center">
                          <Flame className="w-5 h-5 text-[#059669]" />
                        </div>
                        <div>
                          <p className="text-[13px] text-[#6B7280]">Certificate</p>
                          <p className="text-[15px] font-semibold text-[#1F2937]">{cert.amount}</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] text-[#6B7280]">CO₂ Offset</span>
                          <span className="text-[14px] font-medium text-[#3A7D44]">{cert.co2Offset}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] text-[#6B7280]">Date</span>
                          <span className="text-[13px] text-[#1F2937]">{cert.date}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border">
                        <p className="text-[11px] text-[#6B7280] mb-1">Blockchain Proof</p>
                        <div className="flex items-center gap-2">
                          <p className="text-[11px] font-mono text-[#9CA3AF] truncate flex-1">
                            {cert.chainProof}
                          </p>
                          <ExternalLink className="w-3 h-3 text-[#6B7280] flex-shrink-0" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
