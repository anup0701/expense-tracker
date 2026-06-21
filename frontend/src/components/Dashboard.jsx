import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { analyticsAPI } from '../services/api';
import { formatCurrency, getMonthName, formatDate } from '../utils/formatters';
import { toast } from 'react-toastify';
import CategoryIcon from './CategoryIcon';

function Dashboard({ refreshTrigger }) {
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState({
    summary: { total_income: 0, total_expense: 0, balance: 0, transaction_count: 0 },
    expense_by_category: [],
    income_by_category: [],
    daily_trend: [],
    recent_transactions: []
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const COLORS = ['#22c55e', '#3b82f6', '#f97316', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#eab308'];

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth, selectedYear, refreshTrigger]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getSummary({
        month: selectedMonth,
        year: selectedYear
      });
      setSummaryData(response.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  const { summary, expense_by_category, daily_trend } = summaryData;

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Financial Overview</h2>
        <div className="flex space-x-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {getMonthName(i + 1)}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[2024, 2023, 2022].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Income Card */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.total_income)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CategoryIcon iconName="LuTrendingUp" size={24} color="#22c55e" />
            </div>
          </div>
          <div className="mt-4 text-xs text-green-600">
            ↑ 12% from last month
          </div>
        </div>

        {/* Expense Card */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Expense</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.total_expense)}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <CategoryIcon iconName="LuTrendingDown" size={24} color="#ef4444" />
            </div>
          </div>
          <div className="mt-4 text-xs text-red-600">
            ↓ 8% from last month
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Balance</p>
              <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {formatCurrency(summary.balance)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <CategoryIcon iconName="LuWallet" size={24} color="#3b82f6" />
            </div>
          </div>
        </div>

        {/* Transactions Card */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-800">
                {summary.transaction_count}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <CategoryIcon iconName="LuLayoutDashboard" size={24} color="#8b5cf6" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense by Category Pie Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Expense by Category</h3>
          {expense_by_category.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expense_by_category}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total"
                >
                  {expense_by_category.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No expense data for this period
            </div>
          )}
        </div>

        {/* Daily Trend Line Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Spending Trend</h3>
          {daily_trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={daily_trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#22c55e" name="Income" />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" name="Expense" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No daily data for this period
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h3>
        {summaryData.recent_transactions.length > 0 ? (
          <div className="space-y-3">
            {summaryData.recent_transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <CategoryIcon 
                      iconName={transaction.category_icon} 
                      size={20} 
                      color={transaction.category_color} 
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{transaction.category_name || 'Uncategorized'}</p>
                    <p className="text-sm text-gray-500">{transaction.description || 'No description'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(transaction.transaction_date)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No recent transactions
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;