type StatsCardsProps = {
  currentPrice: number;
  totalSupply: number;
  volume24h: number;
  tokensBurned: number;
  ethPrice: number;
};

export default function StatsCards({
  currentPrice,
  totalSupply,
  volume24h,
  tokensBurned,
  ethPrice,
}: StatsCardsProps) {
  console.log("StatsCards ethPrice:", ethPrice);

  const hasUsdPrice = Number.isFinite(ethPrice) && ethPrice > 0;

  const priceUsd = hasUsdPrice ? currentPrice * ethPrice : 0;
  const volumeUsd = hasUsdPrice ? volume24h * ethPrice : 0;

  const cards = [
    {
      title: "Current Price",
      value: hasUsdPrice
        ? `${currentPrice.toFixed(6)} ETH ($${priceUsd.toFixed(2)})`
        : `${currentPrice.toFixed(6)} ETH`,
      subtitle: "Live on-chain price",
    },
    {
      title: "Total Supply",
      value: `${totalSupply.toLocaleString()} CCU`,
      subtitle: "CCU in circulation",
    },
    {
      title: "24h Volume",
      value: hasUsdPrice
        ? `${volume24h.toFixed(4)} ETH ($${volumeUsd.toFixed(2)})`
        : `${volume24h.toFixed(4)} ETH`,
      subtitle: "Trading volume",
    },
    {
      title: "Tokens Burned",
      value: `${tokensBurned.toLocaleString()} CCU`,
      subtitle: "Permanently retired",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-2xl border bg-white p-5 shadow-sm"
        >
          <p className="text-sm text-gray-500">{card.title}</p>
          <p className="mt-2 text-3xl font-bold">{card.value}</p>
          <p className="mt-2 text-sm text-gray-500">{card.subtitle}</p>
        </div>
      ))}
    </div>
  );
}