
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, ArrowUpDown } from "lucide-react";

const TransactionTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock transaction data
  const transactions = [
    { id: "TXN001", merchant: "Starbucks Coffee", amount: -4.50, category: "Food & Dining", status: "completed", date: "2024-06-21" },
    { id: "TXN002", merchant: "Amazon Prime", amount: -12.99, category: "Shopping", status: "completed", date: "2024-06-21" },
    { id: "TXN003", merchant: "Salary Deposit", amount: 3500.00, category: "Income", status: "completed", date: "2024-06-20" },
    { id: "TXN004", merchant: "Uber Ride", amount: -15.25, category: "Transportation", status: "pending", date: "2024-06-20" },
    { id: "TXN005", merchant: "Netflix", amount: -15.99, category: "Entertainment", status: "completed", date: "2024-06-19" },
    { id: "TXN006", merchant: "Grocery Store", amount: -67.43, category: "Food & Dining", status: "completed", date: "2024-06-19" },
    { id: "TXN007", merchant: "Gas Station", amount: -45.20, category: "Transportation", status: "completed", date: "2024-06-18" },
    { id: "TXN008", merchant: "Online Transfer", amount: 1200.00, category: "Transfer", status: "completed", date: "2024-06-18" },
  ];

  const filteredTransactions = transactions.filter(transaction =>
    transaction.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Food & Dining": "bg-blue-100 text-blue-800",
      "Shopping": "bg-purple-100 text-purple-800",
      "Transportation": "bg-orange-100 text-orange-800",
      "Entertainment": "bg-pink-100 text-pink-800",
      "Income": "bg-green-100 text-green-800",
      "Transfer": "bg-indigo-100 text-indigo-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Recent Transactions</h3>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64 bg-white/80"
            />
          </div>
          <Button variant="outline" size="sm" className="bg-white/80">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 font-medium text-gray-600">
                <Button variant="ghost" size="sm" className="p-0 h-auto font-medium text-gray-600">
                  Transaction ID
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </th>
              <th className="text-left py-3 px-2 font-medium text-gray-600">Merchant</th>
              <th className="text-right py-3 px-2 font-medium text-gray-600">Amount</th>
              <th className="text-left py-3 px-2 font-medium text-gray-600">Category</th>
              <th className="text-left py-3 px-2 font-medium text-gray-600">Status</th>
              <th className="text-left py-3 px-2 font-medium text-gray-600">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-2">
                  <span className="text-sm font-mono text-gray-600">{transaction.id}</span>
                </td>
                <td className="py-4 px-2">
                  <span className="font-medium text-gray-900">{transaction.merchant}</span>
                </td>
                <td className="py-4 px-2 text-right">
                  <span className={`font-semibold ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                  </span>
                </td>
                <td className="py-4 px-2">
                  <Badge variant="secondary" className={getCategoryColor(transaction.category)}>
                    {transaction.category}
                  </Badge>
                </td>
                <td className="py-4 px-2">
                  <Badge variant="secondary" className={getStatusColor(transaction.status)}>
                    {transaction.status}
                  </Badge>
                </td>
                <td className="py-4 px-2">
                  <span className="text-sm text-gray-600">{transaction.date}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default TransactionTable;
