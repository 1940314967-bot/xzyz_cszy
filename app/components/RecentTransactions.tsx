export type TransactionItem = {
  type: "Buy" | "Burn";
  amount: number;
  value: number;
  hash: string;
  time: string;
};

type RecentTransactionsProps = {
  transactions: TransactionItem[];
};

export default function RecentTransactions({
  transactions,
}: RecentTransactionsProps) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-2xl font-semibold">Recent Transactions</h3>

      <div className="space-y-4">
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-500">No transactions yet.</p>
        ) : (
          transactions.map((tx, index) => (
            <div key={`${tx.hash}-${index}`} className="border-b pb-4 last:border-b-0">
              <div className="mb-1 flex items-center justify-between">
                <p
                  className={`font-semibold ${
                    tx.type === "Buy" ? "text-green-700" : "text-red-600"
                  }`}
                >
                  {tx.type}
                </p>
                <p className="text-sm text-gray-400">{tx.time}</p>
              </div>

              <p className="text-lg font-medium">{tx.amount} CCU</p>

              <p className="text-sm text-gray-500">
                {tx.type === "Buy" ? `Cost: ${tx.value} ETH` : `Refund: ${tx.value} ETH`}
              </p>

              <p className="text-sm text-gray-400">
                {tx.hash.slice(0, 10)}...{tx.hash.slice(-6)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}