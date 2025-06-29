// src/App.jsx
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Missions from './components/Missions';
import LogEntry from './components/LogEntry';
import API_URL from './config';



function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState({ income: [], expenses: [], projects: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // State for handling errors

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error on new fetch
      const response = await fetch(`${API_URL}/data`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setError("Could not connect to the server. Is it running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderContent = () => {
    if (loading) return <div className="text-center p-10">Loading Your Quest...</div>;
    if (error) return <div className="text-center p-10 text-red-400 font-semibold">{error}</div>; // Display error
    
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard data={data} />;
      case 'missions':
        return <Missions projects={data.projects} refreshData={fetchData} />;
      case 'log':
        return <LogEntry refreshData={fetchData} />;
      default:
        return <Dashboard data={data} />;
    }
  };

  const NavButton = ({ tabName, label }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 w-full sm:w-auto ${
        activeTab === tabName ? 'bg-accent text-base-100' : 'text-text-secondary hover:bg-base-300'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-base-100 text-text-main p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* MODIFIED: Header is now responsive */}
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 sm:gap-0">
          <h1 className="text-3xl font-bold text-accent">Fin-Quest</h1>
          <nav className="p-1 rounded-lg bg-base-200 flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1 w-full sm:w-auto">
            <NavButton tabName="dashboard" label="Dashboard" />
            <NavButton tabName="missions" label="Missions" />
            <NavButton tabName="log" label="Log Entry" />
          </nav>
        </header>
        <main>{renderContent()}</main>
      </div>
    </div>
  );
}

export default App;