import { useState } from "react";
import { Search, BadgeCheck, FileText, Database, ExternalLink, TrendingUp } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const projects = [
  {
    id: 1,
    name: "Solar Farm Initiative",
    reduction: "5,000 tons CO₂/year",
    status: "Verified",
    image: "https://images.unsplash.com/photo-1774927334511-c2d1cf654b08?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2xhciUyMHBhbmVscyUyMGZhcm0lMjByZW5ld2FibGUlMjBlbmVyZ3l8ZW58MXx8fHwxNzc1MzExODE2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Large-scale solar panel installation providing clean energy to 15,000 homes in California. This project replaces fossil fuel-based energy generation with renewable solar power.",
    dataSource: "EPA Certified",
    ipfsCID: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    ccuGenerated: "10,000 CCU",
  },
  {
    id: 2,
    name: "Wind Energy Expansion",
    reduction: "8,200 tons CO₂/year",
    status: "Audited",
    image: "https://images.unsplash.com/photo-1647137607788-cfe726e8eaed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5kJTIwdHVyYmluZXMlMjBlbmVyZ3klMjBmaWVsZHxlbnwxfHx8fDE3NzU0MzA3OTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Offshore wind turbine farm generating 50MW of clean energy. Located 20 miles off the coast, this project harnesses consistent ocean winds to power coastal communities.",
    dataSource: "Gold Standard Verified",
    ipfsCID: "QmPZ9gcCEpqKTo6aq61g4nXGsmpvRzJLzEPCZ8qyqG15qG",
    ccuGenerated: "16,400 CCU",
  },
  {
    id: 3,
    name: "Hydro Power Project",
    reduction: "12,500 tons CO₂/year",
    status: "Verified",
    image: "https://images.unsplash.com/photo-1733001523587-ad1bc6d025c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoeWRyb2VsZWN0cmljJTIwcG93ZXIlMjBkYW0lMjB3YXRlcnxlbnwxfHx8fDE3NzU0MzA3OTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Small-scale hydroelectric dam producing 100MW of renewable energy. This run-of-river system minimizes environmental impact while providing reliable baseload power.",
    dataSource: "Verra VCS Certified",
    ipfsCID: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
    ccuGenerated: "25,000 CCU",
  },
  {
    id: 4,
    name: "Reforestation Program",
    reduction: "15,800 tons CO₂/year",
    status: "Verified",
    image: "https://images.unsplash.com/photo-1760624683181-7570791efd52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWZvcmVzdGF0aW9uJTIwZm9yZXN0JTIwcGxhbnRpbmclMjB0cmVlc3xlbnwxfHx8fDE3NzU0MzA4Njl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Large-scale reforestation initiative planting 500,000 native trees across 2,000 acres. This project restores degraded forest ecosystems and enhances biodiversity.",
    dataSource: "Plan Vivo Certified",
    ipfsCID: "QmRQwjBCQz8XdJnyBR7qDqZXt8QAKrKXEVXwFQFULfCj3u",
    ccuGenerated: "31,600 CCU",
  },
  {
    id: 5,
    name: "Geothermal Energy Plant",
    reduction: "9,400 tons CO₂/year",
    status: "Audited",
    image: "https://images.unsplash.com/photo-1759934553802-749f348a50b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnZW90aGVybWFsJTIwZW5lcmd5JTIwcG93ZXIlMjBwbGFudHxlbnwxfHx8fDE3NzU0MzA4NzB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Geothermal power facility utilizing Earth's natural heat to generate 75MW of baseload renewable energy. This project provides 24/7 clean power with minimal land footprint.",
    dataSource: "ISO 14064 Verified",
    ipfsCID: "QmS4ustL54uo8FzR9455qaxZwuMiUhyvMcX9BCxmWpEqf6",
    ccuGenerated: "18,800 CCU",
  },
  {
    id: 6,
    name: "Biomass Energy Facility",
    reduction: "6,750 tons CO₂/year",
    status: "Verified",
    image: "https://images.unsplash.com/photo-1714320598373-01a8874cc7a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaW9tYXNzJTIwcmVuZXdhYmxlJTIwZW5lcmd5JTIwZmFjaWxpdHl8ZW58MXx8fHwxNzc1NDMwODcwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Biomass power plant converting agricultural waste into 40MW of clean energy. This project reduces methane emissions from waste decomposition while generating electricity.",
    dataSource: "GHG Protocol Certified",
    ipfsCID: "QmNSUYVKDSvPUnRLKmuxk9diJ6yS96r1TrAXJmNRLcfPrC",
    ccuGenerated: "13,500 CCU",
  },
];

export function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState(projects[0]);

  return (
    <>
      {/* Top Nav */}
      <header className="h-16 bg-white border-b border-border flex items-center justify-between px-8">
        <h2 className="text-[18px] font-semibold text-[#1F2937]">Carbon Reduction Projects</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects..."
              className="pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A7D44] text-[14px] w-64"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        <div className="flex h-full">
          {/* Left Side - Projects Grid */}
          <div className="flex-1 p-8 overflow-auto">
            <div className="grid grid-cols-3 gap-5 max-w-[1100px]">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`bg-white rounded-xl border overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 ${
                    selectedProject.id === project.id ? "border-[#3A7D44] ring-2 ring-[#3A7D44]/20" : "border-border"
                  }`}
                >
                  <ImageWithFallback
                    src={project.image}
                    alt={project.name}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-[15px] font-semibold text-[#1F2937]">{project.name}</h3>
                    </div>
                    <p className="text-[13px] text-[#6B7280] mb-3">{project.reduction}</p>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium ${
                        project.status === "Verified" 
                          ? "bg-[#ECFDF5] text-[#059669]" 
                          : "bg-[#FEF3C7] text-[#92400E]"
                      }`}>
                        <BadgeCheck className="w-3 h-3" />
                        {project.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Detail Panel */}
          <div className="w-[420px] bg-white border-l border-border overflow-auto">
            <div className="p-8 sticky top-0">
              <div className="mb-6">
                <ImageWithFallback
                  src={selectedProject.image}
                  alt={selectedProject.name}
                  className="w-full h-56 object-cover rounded-xl"
                />
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-[20px] font-semibold text-[#1F2937]">{selectedProject.name}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium ${
                      selectedProject.status === "Verified" 
                        ? "bg-[#ECFDF5] text-[#059669]" 
                        : "bg-[#FEF3C7] text-[#92400E]"
                    }`}>
                      <BadgeCheck className="w-3 h-3" />
                      {selectedProject.status}
                    </span>
                  </div>
                  <p className="text-[15px] text-[#6B7280] leading-relaxed">{selectedProject.description}</p>
                </div>

                <div className="border-t border-border pt-6 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-[#6B7280]" />
                      <h4 className="text-[14px] font-semibold text-[#1F2937]">CO₂ Reduction</h4>
                    </div>
                    <p className="text-[16px] font-medium text-[#3A7D44]">{selectedProject.reduction}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <BadgeCheck className="w-4 h-4 text-[#6B7280]" />
                      <h4 className="text-[14px] font-semibold text-[#1F2937]">Data Source</h4>
                    </div>
                    <p className="text-[14px] text-[#6B7280]">{selectedProject.dataSource}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="w-4 h-4 text-[#6B7280]" />
                      <h4 className="text-[14px] font-semibold text-[#1F2937]">IPFS CID</h4>
                    </div>
                    <p className="text-[12px] font-mono text-[#6B7280] break-all bg-[#F9FAFB] p-2 rounded-lg">
                      {selectedProject.ipfsCID}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-[#6B7280]" />
                      <h4 className="text-[14px] font-semibold text-[#1F2937]">CCU Generated</h4>
                    </div>
                    <p className="text-[16px] font-medium text-[#3A7D44]">{selectedProject.ccuGenerated}</p>
                  </div>
                </div>

                <button className="w-full bg-[#3A7D44] text-white py-3 rounded-lg font-medium hover:bg-[#2f6636] transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2">
                  <span>View on Blockchain</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}