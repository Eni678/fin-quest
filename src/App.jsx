import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Missions from './components/Missions';
import LogEntry from './components/LogEntry';

const API_URL = 'http://localhost:3001/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState({ income: [], expenses: [], projects: [] });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/data`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderContent = () => {
    if (loading) return <div className="text-center p-10">Loading Your Quest...</div>;
    
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
      className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
        activeTab === tabName ? 'bg-accent text-base-100' : 'text-text-secondary hover:bg-base-300'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-base-100 text-text-main p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-accent">Fin-Quest</h1>
          <nav className="p-1 rounded-lg bg-base-200 flex space-x-1">
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