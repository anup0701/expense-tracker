import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Categories from './components/Categories';
import Reports from './components/Reports';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { analyticsAPI } from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshData, setRefreshData] = useState(0);
  const [balanceData, setBalanceData] = useState({
    total_income: 0,
    total_expense: 0,
    balance: 0
  });

  const triggerRefresh = () => {
    setRefreshData(prev => prev + 1);
  };

  const fetchBalanceData = async () => {
    try {
      const response = await analyticsAPI.getBalance();
      const { data } = response.data;
      setBalanceData({
        total_income: data.total_income,
        total_expense: data.total_expense,
        balance: data.balance
      });
    } catch (error) {
      console.error('Failed to fetch balance data:', error);
    }
  };

  // Fetch total balance data for Header
  useEffect(() => {
    fetchBalanceData();
  }, [refreshData]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'transactions', label: 'Transactions', icon: '💰' },
    { id: 'categories', label: 'Categories', icon: '🏷️' },
    { id: 'reports', label: 'Reports', icon: '📈' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        balance={balanceData.balance} 
        refreshTrigger={refreshData}
        onRefresh={fetchBalanceData}
      />
      
      {/* Tab Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard refreshTrigger={refreshData} />}
        {activeTab === 'transactions' && <Transactions onTransactionUpdate={triggerRefresh} />}
        {activeTab === 'categories' && <Categories />}
        {activeTab === 'reports' && <Reports />}
      </main>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}

export default App;