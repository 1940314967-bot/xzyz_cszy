type WalletCardProps = {
  walletAddress: string;
  connected: boolean;
  ccuBalance: number;
  onCopyAddress: () => void;
};

export default function WalletCard({
  walletAddress,
  connected,
  ccuBalance,
  onCopyAddress,
}: WalletCardProps) {
  return (
    <div className="rounded-2xl border bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-start justify-between">
        <h3 className="text-2xl font-semibold">Your Wallet</h3>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            connected
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {connected ? "Connected" : "Disconnected"}
        </span>
      </div>

      <div className="mb-6">
        <p className="text-sm text-gray-500">Address</p>
        <div className="mt-2 flex items-center gap-3">
          <p className="text-lg font-medium">{walletAddress}</p>
          <button
            onClick={onCopyAddress}
            className="rounded-lg border px-3 py-1 text-sm text-gray-600 hover:bg-gray-50"
          >
            Copy
          </button>
        </div>
      </div>

      <hr className="my-6" />

      <div>
        <p className="text-sm text-gray-500">CCU Balance</p>
        <p className="mt-2 text-4xl font-bold text-green-700">
          {ccuBalance.toFixed(2)} CCU
        </p>
      </div>
    </div>
  );
}