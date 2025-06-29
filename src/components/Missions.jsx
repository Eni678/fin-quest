// src/components/Missions.jsx
import React, { useState } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Confetti from 'react-confetti';
import { API_URL } from '../config';


// --- NEW Task Checklist Component ---
const TaskChecklist = ({ project, refreshData }) => {
    const [newTaskDesc, setNewTaskDesc] = useState('');

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTaskDesc.trim()) return;
        await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId: project.id, description: newTaskDesc }),
        });
        setNewTaskDesc('');
        refreshData();
    };

    const handleToggleTask = async (task) => {
        const newStatus = task.status === 'todo' ? 'done' : 'todo';
        await fetch(`${API_URL}/tasks/${task.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        });
        refreshData();
    };

    return (
        <div className="mt-6">
            <h4 className="font-semibold text-text-secondary mb-3">Action Plan</h4>
            <div className="space-y-2">
                {project.tasks.map(task => (
                    <div key={task.id} onClick={() => handleToggleTask(task)} className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-base-300">
                        <input type="checkbox" readOnly checked={task.status === 'done'} className="form-checkbox h-5 w-5 rounded bg-base-100 border-base-300 text-accent focus:ring-accent" />
                        <span className={`flex-1 ${task.status === 'done' ? 'line-through text-text-secondary' : 'text-text-main'}`}>
                            {task.description}
                        </span>
                    </div>
                ))}
            </div>
            <form onSubmit={handleAddTask} className="mt-4 flex space-x-2">
                <input
                    type="text"
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                    placeholder="Add a new planning step..."
                    className="flex-1 bg-base-300 text-text-main px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button type="submit" className="bg-accent text-base-100 font-semibold px-4 py-1 rounded-md hover:opacity-90 transition-opacity">Add</button>
            </form>
        </div>
    );
};


// --- MODIFIED MissionCard Component ---
const MissionCard = ({ project, refreshData }) => {
    const [saveAmount, setSaveAmount] = useState('');
    const [showConfetti, setShowConfetti] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false); // State for expanding the card

    const percentage = Math.min(100, Math.round((project.saved / project.goal) * 100));
    const isCompleted = percentage >= 100;

    const handleSave = async (e) => {
        e.preventDefault();
        const amount = parseFloat(saveAmount);
        if (!amount || amount <= 0) return;

        await fetch(`${API_URL}/projects/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId: project.id, amount }),
        });

        if (!isCompleted && project.saved + amount >= project.goal) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
        }
        
        setSaveAmount('');
        refreshData();
    };

    return (
        <div className="bg-base-200 p-6 rounded-xl shadow-lg relative overflow-hidden transition-all duration-300">
            {showConfetti && <Confetti recycle={false} width={400} height={400} />}
            <div className="flex items-center space-x-6">
                <div className="flex-shrink-0" style={{ width: 100, height: 100 }}>
                    <CircularProgressbar
                        value={percentage}
                        text={`${percentage}%`}
                        styles={buildStyles({
                            pathColor: isCompleted ? '#34D399' : '#4299E1',
                            textColor: '#E5E7EB', trailColor: '#4A5568',
                        })}
                    />
                </div>
                <div className="flex-1">
                    <h3 className="text-xl font-bold">{project.name}</h3>
                    <p className="text-text-secondary">
                        <span className={isCompleted ? "text-accent" : "text-blue-400"}>₦{project.saved.toLocaleString('en-NG')}</span> / ₦{project.goal.toLocaleString('en-NG')}
                    </p>
                    {isCompleted ? (
                        <p className="mt-4 text-accent font-bold">Mission Complete! 🎉</p>
                    ) : (
                        <form onSubmit={handleSave} className="mt-4 flex items-center space-x-2">
                            <input
                                type="number" step="0.01" value={saveAmount} onChange={(e) => setSaveAmount(e.target.value)}
                                placeholder="Amount"
                                className="bg-base-300 text-text-main px-3 py-1 rounded-md w-28 focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                            <button type="submit" className="bg-blue-500 text-white font-semibold px-4 py-1 rounded-md hover:opacity-90 transition-opacity">Save</button>
                        </form>
                    )}
                </div>
                <button onClick={() => setIsExpanded(!isExpanded)} className="absolute top-4 right-4 text-text-secondary hover:text-accent">
                    {/* Chevron Icon for expand/collapse */}
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
            </div>

            {/* EXPANDABLE AREA */}
            {isExpanded && <TaskChecklist project={project} refreshData={refreshData} />}
        </div>
    );
};


// --- MODIFIED AddMissionForm and Missions Component ---
const AddMissionForm = ({ refreshData }) => {
    const [name, setName] = useState('');
    const [goal, setGoal] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !goal) return;
        await fetch(`${API_URL}/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, goal: parseFloat(goal) }),
        });
        setName('');
        setGoal('');
        refreshData();
    };
    
    return (
        <form onSubmit={handleSubmit} className="bg-base-200 p-6 rounded-xl shadow-lg flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-1 w-full">
                <label className="text-sm text-text-secondary">New Mission Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full mt-1 bg-base-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"/>
            </div>
             <div className="flex-1 w-full">
             <label className="text-sm text-text-secondary">Goal (₦)</label>
                <input type="number" step="0.01" value={goal} onChange={e => setGoal(e.target.value)} required className="w-full mt-1 bg-base-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"/>
            </div>
            <button type="submit" className="w-full sm:w-auto bg-accent text-base-100 font-bold px-6 py-2 rounded-md hover:opacity-90 transition-opacity">Add Mission</button>
        </form>
    );
}

const Missions = ({ projects, refreshData }) => {
  return (
    <div className="space-y-6">
      <AddMissionForm refreshData={refreshData} />
      <div className="space-y-6">
        {projects.length > 0 ? (
            projects.map((p) => (
              <MissionCard key={p.id} project={p} refreshData={refreshData} />
            ))
        ) : (
            <div className="text-center py-10 text-text-secondary">
                <p>No missions yet. Add one to start your quest!</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Missions;