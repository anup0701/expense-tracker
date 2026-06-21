import React, { useEffect, useState } from 'react';
import { formatCurrency } from '../utils/formatters';

function Header({ balance = 0, refreshTrigger = 0, onRefresh }) {
  const [currentBalance, setCurrentBalance] = useState(balance);

  useEffect(() => {
    if (onRefresh) {
      onRefresh();
    }
  }, [refreshTrigger]);

  useEffect(() => {
    setCurrentBalance(balance);
  }, [balance]);

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl animate-bounce">💰</span>
            <div>
              <h1 className="text-2xl font-bold">Smart Expense Tracker</h1>
              <p className="text-sm text-blue-100">Take control of your finances</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-xs text-blue-200">Total Balance</p>
              <p className={`text-xl font-semibold ${currentBalance >= 0 ? 'text-white' : 'text-orange-300'}`}>
                {formatCurrency(currentBalance)}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-xl">👤</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
