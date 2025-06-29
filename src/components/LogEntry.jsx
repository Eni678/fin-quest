import React, { useState } from 'react';
import API_URL from '../config';


const GenericForm = ({ title, fields, endpoint, refreshData }) => {
    const [formData, setFormData] = useState({});
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            amount: parseFloat(formData.amount),
            date: new Date().toISOString()
        };
        
        await fetch(`${API_URL}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        e.target.reset();
        setFormData({});
        refreshData();
    };

    return (
        <div className="bg-base-200 p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4">{title}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                {fields.map(field => (
                     <input
                        key={field.name}
                        type={field.type}
                        name={field.name}
                        placeholder={field.placeholder}
                        onChange={handleChange}
                        required
                        className="w-full bg-base-300 text-text-main px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                ))}
                <button type="submit" className="w-full bg-accent text-base-100 font-bold py-2 rounded-md hover:opacity-90 transition-opacity">Log Entry</button>
            </form>
        </div>
    );
};


const LogEntry = ({ refreshData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <GenericForm 
        title="Log New Income"
        endpoint="income"
        fields={[
            { name: 'source', type: 'text', placeholder: 'Source (e.g., Salary)'},
            { name: 'amount', type: 'number', placeholder: 'Amount (₦)'}
        ]}
        refreshData={refreshData}
      />
      <GenericForm 
        title="Log New Expense"
        endpoint="expenses"
        fields={[
            { name: 'description', type: 'text', placeholder: 'Description (e.g., Groceries)'},
            { name: 'amount', type: 'number', placeholder: 'Amount (₦)'}
        ]}
        refreshData={refreshData}
      />
    </div>
  );
};

export default LogEntry;