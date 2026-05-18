import { useState, useRef } from "react";
import { ArrowUpRight, ArrowDownLeft, Download, Filter, X, ChevronDown, FileText } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import "jspdf-autotable";

type TxnType = "Sale" | "Purchase";
type TxnStatus = "Completed" | "Pending";
type FilterTab = "All" | "Sales" | "Purchase" | "Pending";

type Transaction = {
  id: string;
  type: TxnType;
  product: string;
  amount: string;
  buyer?: string;
  seller?: string;
  date: string;
  status: TxnStatus;
};

const allTransactions: Transaction[] = [
  { id: "TXN-001", type: "Sale", product: "Organic Tomatoes", amount: "KES 12,000", buyer: "John Mwangi", date: "April 10, 2026", status: "Completed" },
  { id: "TXN-002", type: "Purchase", product: "Fertilizer", amount: "KES 8,500", seller: "AgriSupply Ltd", date: "April 9, 2026", status: "Completed" },
  { id: "TXN-003", type: "Sale", product: "Fresh Maize", amount: "KES 18,000", buyer: "Sarah Wanjiru", date: "April 8, 2026", status: "Pending" },
  { id: "TXN-004", type: "Sale", product: "Green Cabbage", amount: "KES 6,400", buyer: "David Ochieng", date: "April 7, 2026", status: "Completed" },
  { id: "TXN-005", type: "Purchase", product: "Seeds", amount: "KES 4,200", seller: "Kenya Seeds Co", date: "April 6, 2026", status: "Completed" },
  { id: "TXN-006", type: "Sale", product: "Fresh Milk", amount: "KES 15,000", buyer: "Grace Akinyi", date: "April 5, 2026", status: "Completed" },
  { id: "TXN-007", type: "Sale", product: "Sweet Potatoes", amount: "KES 9,600", buyer: "Peter Kamau", date: "April 4, 2026", status: "Pending" },
  { id: "TXN-008", type: "Purchase", product: "Irrigation Pipes", amount: "KES 12,000", seller: "Farm Tools Ltd", date: "April 3, 2026", status: "Completed" },
];

const parseAmount = (amt: string) => parseInt(amt.replace(/[^0-9]/g, ""));

export default function Transaction() {
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [showFilter, setShowFilter] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [transactions, setTransactions] = useState(allTransactions);
  const filterRef = useRef<HTMLDivElement>(null);

  const filtered = transactions.filter(t => {
    if (activeTab === "Sales") return t.type === "Sale";
    if (activeTab === "Purchase") return t.type === "Purchase";
    if (activeTab === "Pending") return t.status === "Pending";
    return true;
  });

  const totalSales = transactions.filter(t => t.type === "Sale" && t.status === "Completed").reduce((acc, t) => acc + parseAmount(t.amount), 0);
  const totalPurchases = transactions.filter(t => t.type === "Purchase" && t.status === "Completed").reduce((acc, t) => acc + parseAmount(t.amount), 0);
  const pendingAmount = transactions.filter(t => t.status === "Pending").reduce((acc, t) => acc + parseAmount(t.amount), 0);

  const handleExport = () => {
    const rows = [
      ["ID", "Type", "Product", "Party", "Date", "Amount", "Status"],
      ...filtered.map(t => [
        t.id, t.type, t.product,
        t.type === "Sale" ? (t.buyer || "") : (t.seller || ""),
        t.date, t.amount, t.status
      ])
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${activeTab.toLowerCase()}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Transactions exported to CSV!");
  };

  const handleApplyFilter = () => {
    if (!dateFrom && !dateTo) {
      toast.error("Please set at least one date filter");
      return;
    }
    toast.success("Date filter applied!");
    setShowFilter(false);
  };

  const handleClearFilter = () => {
    setDateFrom("");
    setDateTo("");
    setTransactions(allTransactions);
    setShowFilter(false);
    toast.info("Filters cleared");
  };

  const generateReceipt = (txn: Transaction) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(5, 150, 105); // Emerald 600
    doc.text("FBEconnect Receipt", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Receipt ID: ${txn.id}`, 20, 40);
    doc.text(`Date: ${txn.date}`, 20, 48);
    
    doc.text(`Transaction Type: ${txn.type}`, 20, 60);
    doc.text(`Party: ${txn.type === "Sale" ? txn.buyer : txn.seller}`, 20, 68);
    
    // Table
    (doc as any).autoTable({
      startY: 80,
      head: [['Product Description', 'Amount Paid', 'Status']],
      body: [
        [txn.product, txn.amount, txn.status]
      ],
      theme: 'grid',
      headStyles: { fillColor: [5, 150, 105] }, // Emerald 600
      styles: { fontSize: 11, cellPadding: 6 }
    });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Thank you for using the FBEconnect agricultural marketplace.", 105, (doc as any).lastAutoTable.finalY + 30, { align: "center" });

    doc.save(`Receipt_${txn.id}.pdf`);
    toast.success("Receipt downloaded successfully!");
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Transactions</h1>
        <p className="text-emerald-200">View and manage your financial transactions</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight className="w-5 h-5" />
            <p className="text-sm opacity-80">Total Sales</p>
          </div>
          <p className="text-3xl font-bold">KES {totalSales.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownLeft className="w-5 h-5" />
            <p className="text-sm opacity-80">Total Purchases</p>
          </div>
          <p className="text-3xl font-bold">KES {totalPurchases.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <p className="text-sm opacity-80 mb-2">Net Income</p>
          <p className="text-3xl font-bold">KES {(totalSales - totalPurchases).toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl p-6 text-white">
          <p className="text-sm opacity-80 mb-2">Pending</p>
          <p className="text-3xl font-bold">KES {pendingAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {(["All", "Sales", "Purchase", "Pending"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as FilterTab)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "bg-white/10 text-emerald-200 hover:bg-white/20"
              }`}
            >
              {tab}
              {tab !== "All" && (
                <span className="ml-2 text-xs opacity-70">
                  ({tab === "Sales" ? transactions.filter(t => t.type === "Sale").length :
                    tab === "Purchase" ? transactions.filter(t => t.type === "Purchase").length :
                    transactions.filter(t => t.status === "Pending").length})
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex gap-2 relative">
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
            >
              <Filter className="w-4 h-4" />
              Filter
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilter ? "rotate-180" : ""}`} />
            </button>
            {showFilter && (
              <div className="absolute right-0 top-full mt-2 bg-emerald-900 border border-emerald-700/50 rounded-xl p-5 w-72 z-30 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">Filter Transactions</h3>
                  <button onClick={() => setShowFilter(false)} className="text-gray-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-emerald-100 text-sm font-medium mb-2">Date From</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={e => setDateFrom(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-emerald-100 text-sm font-medium mb-2">Date To</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={e => setDateTo(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleApplyFilter}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-medium transition-all"
                    >
                      Apply
                    </button>
                    <button
                      onClick={handleClearFilter}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-sm font-medium transition-all"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleExport}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Results count */}
      <p className="text-emerald-300 text-sm mb-4">
        Showing <span className="text-white font-semibold">{filtered.length}</span> transactions
      </p>

      {/* Transactions Table */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-emerald-900/50 border-b border-white/10">
                <th className="text-left p-4 text-emerald-200 font-semibold">Transaction ID</th>
                <th className="text-left p-4 text-emerald-200 font-semibold">Type</th>
                <th className="text-left p-4 text-emerald-200 font-semibold">Product</th>
                <th className="text-left p-4 text-emerald-200 font-semibold">Party</th>
                <th className="text-left p-4 text-emerald-200 font-semibold">Date</th>
                <th className="text-left p-4 text-emerald-200 font-semibold">Amount</th>
                <th className="text-left p-4 text-emerald-200 font-semibold">Status</th>
                <th className="text-right p-4 text-emerald-200 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((txn) => (
                <tr key={txn.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-white font-mono text-sm">{txn.id}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {txn.type === "Sale" ? (
                        <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4 text-orange-400" />
                      )}
                      <span className={`font-medium ${txn.type === "Sale" ? "text-emerald-400" : "text-orange-400"}`}>
                        {txn.type}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-white">{txn.product}</td>
                  <td className="p-4 text-gray-300">{txn.type === "Sale" ? txn.buyer : txn.seller}</td>
                  <td className="p-4 text-gray-400 text-sm">{txn.date}</td>
                  <td className="p-4 text-white font-bold">{txn.amount}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        txn.status === "Completed"
                          ? "bg-emerald-900/50 text-emerald-300"
                          : "bg-amber-900/50 text-amber-300"
                      }`}
                    >
                      {txn.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {txn.status === "Completed" && (
                      <button
                        onClick={() => generateReceipt(txn)}
                        className="bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-all ml-auto"
                      >
                        <FileText className="w-4 h-4" />
                        Receipt
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-12 text-center text-gray-400">No transactions match the selected filter.</div>
          )}
        </div>
      </div>
    </div>
  );
}