import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { analyticsAPI, transactionsAPI } from '../services/api';
import { formatCurrency, getMonthName } from '../utils/formatters';
import { toast } from 'react-toastify';
import CategoryIcon from './CategoryIcon';

function Reports() {
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [exportFormat, setExportFormat] = useState('json');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchMonthlyReport();
  }, [selectedYear]);

  const fetchMonthlyReport = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getMonthly({ year: selectedYear });
      setMonthlyData(response.data.data || response.data);
    } catch (error) {
      toast.error('Failed to load monthly report');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await analyticsAPI.export({ 
        format: exportFormat,
        year: selectedYear 
      });
      
      // Create download link
      const blob = new Blob(
        [exportFormat === 'csv' ? response.data : JSON.stringify(response.data, null, 2)], 
        { type: exportFormat === 'csv' ? 'text/csv' : 'application/json' }
      );
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${selectedYear}.${exportFormat}`;
      a.click();
      
      toast.success('Export completed successfully');
    } catch (error) {
      toast.error('Failed to export data');
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  const totalIncome = monthlyData.reduce((sum, month) => sum + month.income, 0);
  const totalExpense = monthlyData.reduce((sum, month) => sum + month.expense, 0);
  const averageMonthly = totalExpense / (monthlyData.length || 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Financial Reports</h2>
        
        {/* Year Selector */}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Total Income (Year)</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <CategoryIcon iconName="LuTrendingUp" size={24} color="#22c55e" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Total Expense (Year)</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</p>
          </div>
          <div className="p-3 bg-red-100 rounded-full">
            <CategoryIcon iconName="LuTrendingDown" size={24} color="#ef4444" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Average Monthly Expense</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(averageMonthly)}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <CategoryIcon iconName="LuCalculator" size={24} color="#3b82f6" />
          </div>
        </div>
      </div>

      {/* Monthly Bar Chart */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Income vs Expense</h3>
        {loading ? (
          <div className="flex justify-center items-center h-80">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tickFormatter={(month) => getMonthName(month).substring(0, 3)}
              />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                labelFormatter={(month) => getMonthName(month)}
              />
              <Legend />
              <Bar dataKey="income" fill="#22c55e" name="Income" />
              <Bar dataKey="expense" fill="#ef4444" name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Transaction Trend */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Transaction Volume Trend</h3>
        {loading ? (
          <div className="flex justify-center items-center h-80">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tickFormatter={(month) => getMonthName(month).substring(0, 3)}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(month) => getMonthName(month)}
              />
              <Legend />
              <Line type="monotone" dataKey="transactions" stroke="#8b5cf6" name="Number of Transactions" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Export Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Export Data</h3>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="json">JSON Format</option>
            <option value="csv">CSV Format</option>
          </select>
          
          <button
            onClick={handleExport}
            disabled={exporting}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {exporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Exporting...
              </>
            ) : (
              <>
                <CategoryIcon iconName="LuDownload" size={18} />
                Export {selectedYear} Data
              </>
            )}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Download all transactions for {selectedYear} in {exportFormat.toUpperCase()} format
        </p>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Income</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expense</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {monthlyData.map((month) => (
                <tr key={month.month} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {getMonthName(month.month)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    {formatCurrency(month.income)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    {formatCurrency(month.expense)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={month.income - month.expense >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(month.income - month.expense)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {month.transactions}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Reports;