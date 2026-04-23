import { Wallet, ArrowUpRight, ArrowDownRight, TrendingUp, Flame } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

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

const recentTransactions = [
  { id: "1", type: "Buy", amount: "150 CCU", price: "$45.00", time: "2 mins ago", hash: "0x1a2b3c..." },
  { id: "2", type: "Burn", amount: "75 CCU", price: "-", time: "15 mins ago", hash: "0x4d5e6f..." },
  { id: "3", type: "Buy", amount: "300 CCU", price: "$89.70", time: "1 hour ago", hash: "0x7g8h9i..." },
  { id: "4", type: "Burn", amount: "200 CCU", price: "-", time: "2 hours ago", hash: "0xj0k1l2..." },
  { id: "5", type: "Buy", amount: "500 CCU", price: "$147.50", time: "5 hours ago", hash: "0xm3n4o5..." },
];

const projects = [
  {
    id: 1,
    name: "Solar Farm Initiative",
    reduction: "5,000 tons CO₂/year",
    image: "https://images.unsplash.com/photo-1774927334511-c2d1cf654b08?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2xhciUyMHBhbmVscyUyMGZhcm0lMjByZW5ld2FibGUlMjBlbmVyZ3l8ZW58MXx8fHwxNzc1MzExODE2fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: 2,
    name: "Wind Energy Expansion",
    reduction: "8,200 tons CO₂/year",
    image: "https://images.unsplash.com/photo-1647137607788-cfe726e8eaed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5kJTIwdHVyYmluZXMlMjBlbmVyZ3klMjBmaWVsZHxlbnwxfHx8fDE3NzU0MzA3OTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: 3,
    name: "Hydro Power Project",
    reduction: "12,500 tons CO₂/year",
    image: "https://images.unsplash.com/photo-1733001523587-ad1bc6d025c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoeWRyb2VsZWN0cmljJTIwcG93ZXIlMjBkYW0lMjB3YXRlcnxlbnwxfHx8fDE3NzU0MzA3OTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
];

export function Dashboard() {
  return (
    <>
      {/* Top Nav */}
      <header className="h-16 bg-white border-b border-border flex items-center justify-between px-8">
        <h2 className="text-[18px] font-semibold text-[#1F2937]">Dashboard</h2>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-[#3A7D44] text-white rounded-lg hover:bg-[#2f6636] transition-all shadow-sm">
            Connect Wallet
          </button>
          <div className="w-10 h-10 rounded-full bg-[#E5E7EB] flex items-center justify-center">
            <Wallet className="w-5 h-5 text-[#6B7280]" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-[1600px] mx-auto">
          <div className="flex gap-8">
            {/* Left Column */}
            <div className="flex-1 space-y-6">
              {/* Wallet Card */}
              <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[16px] font-semibold text-[#1F2937]">Your Wallet</h3>
                  <Wallet className="w-5 h-5 text-[#6B7280]" />
                </div>
                <div className="space-y-2">
                  <p className="text-[14px] text-[#6B7280]">Address</p>
                  <p className="text-[16px] font-medium text-[#1F2937] font-mono">0x742d...3A4F</p>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-[14px] text-[#6B7280] mb-1">CCU Balance</p>
                    <p className="text-[28px] font-semibold text-[#3A7D44]">1,234.56 CCU</p>
                  </div>
                </div>
              </div>

              {/* Market Stats Row */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-[#3A7D44]" />
                    <p className="text-[14px] text-[#6B7280]">Current Price</p>
                  </div>
                  <p className="text-[24px] font-semibold text-[#1F2937]">$0.299</p>
                  <p className="text-[13px] text-[#3A7D44] flex items-center gap-1 mt-1">
                    <ArrowUpRight className="w-3 h-3" /> +5.2% today
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full bg-[#3A7D44]" />
                    <p className="text-[14px] text-[#6B7280]">Total Supply</p>
                  </div>
                  <p className="text-[24px] font-semibold text-[#1F2937]">58,420</p>
                  <p className="text-[13px] text-[#6B7280] mt-1">CCU in circulation</p>
                </div>

                <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowDownRight className="w-4 h-4 text-[#EF4444]" />
                    <p className="text-[14px] text-[#6B7280]">24h Volume</p>
                  </div>
                  <p className="text-[24px] font-semibold text-[#1F2937]">$12,450</p>
                  <p className="text-[13px] text-[#6B7280] mt-1">Trading volume</p>
                </div>
              </div>

              {/* Bonding Curve Chart */}
              <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
                <h3 className="text-[16px] font-semibold text-[#1F2937] mb-6">Bonding Curve</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={bondingCurveData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="supply" 
                      stroke="#6B7280"
                      style={{ fontSize: '12px' }}
                      label={{ value: 'Supply (CCU)', position: 'insideBottom', offset: -5, style: { fill: '#6B7280', fontSize: '13px' } }}
                    />
                    <YAxis 
                      stroke="#6B7280"
                      style={{ fontSize: '12px' }}
                      label={{ value: 'Price (USDC)', angle: -90, position: 'insideLeft', style: { fill: '#6B7280', fontSize: '13px' } }}
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
                      dot={{ fill: '#3A7D44', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-[13px] text-[#6B7280] text-center mt-4">
                  Price increases exponentially with supply according to the bonding curve algorithm
                </p>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4">
                <button className="bg-[#3A7D44] text-white rounded-xl p-6 hover:bg-[#2f6636] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[18px] font-semibold">Buy CCU</span>
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                  <p className="text-[13px] opacity-90 text-left">Purchase carbon credits</p>
                </button>

                <button className="bg-gradient-to-br from-[#6B7280] to-[#9CA3AF] text-white rounded-xl p-6 hover:from-[#4B5563] hover:to-[#6B7280] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[18px] font-semibold">Burn CCU</span>
                    <Flame className="w-5 h-5" />
                  </div>
                  <p className="text-[13px] opacity-90 text-left">Offset your carbon footprint</p>
                </button>
              </div>

              {/* Projects Preview */}
              <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-[16px] font-semibold text-[#1F2937]">Carbon Reduction Projects</h3>
                  <a href="/projects" className="text-[14px] text-[#3A7D44] hover:underline">View all</a>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {projects.map((project) => (
                    <div key={project.id} className="border border-border rounded-lg overflow-hidden hover:shadow-md transition-all">
                      <ImageWithFallback 
                        src={project.image} 
                        alt={project.name}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-4">
                        <h4 className="text-[14px] font-semibold text-[#1F2937] mb-1">{project.name}</h4>
                        <p className="text-[12px] text-[#6B7280]">{project.reduction}</p>
                        <div className="mt-3">
                          <span className="inline-block px-2 py-1 bg-[#ECFDF5] text-[#059669] text-[11px] rounded-md font-medium">
                            Verified
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar - Recent Transactions */}
            <div className="w-80">
              <div className="bg-white rounded-xl border border-border p-6 shadow-sm sticky top-8">
                <h3 className="text-[16px] font-semibold text-[#1F2937] mb-4">Recent Transactions</h3>
                <div className="space-y-3">
                  {recentTransactions.map((tx) => (
                    <div key={tx.id} className="pb-3 border-b border-border last:border-b-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[13px] font-medium ${tx.type === 'Buy' ? 'text-[#3A7D44]' : 'text-[#6B7280]'}`}>
                          {tx.type}
                        </span>
                        <span className="text-[13px] text-[#6B7280]">{tx.time}</span>
                      </div>
                      <p className="text-[14px] font-medium text-[#1F2937] mb-1">{tx.amount}</p>
                      {tx.price !== "-" && (
                        <p className="text-[13px] text-[#6B7280]">{tx.price}</p>
                      )}
                      <p className="text-[12px] text-[#9CA3AF] font-mono mt-1">{tx.hash}</p>
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
