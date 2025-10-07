import React, {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {problemService} from '../services/problemService';

const Dashboard = () => {
  const { logout } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const problems = await problemService.getProblems();
        setItems(problems);
        
      } catch (error) {
        console.error('Error fetching problems:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <button 
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium"
          >
            Logout
          </button>
        </div>
        <p className="mb-8">Welcome to OnlineJudge!</p>
        
        <div>
          <h2 className="mb-2 text-lg font-semibold text-white">Problems Statement:</h2>
          {items.length === 0 && <p className="text-gray-400">No items available.</p>}
          {items.length > 0 && (
            <ul className="max-w-md space-y-1 text-gray-300 list-inside">
              {items.map((item) => (
                <li key={item._id}>
                  <Link to={`/problems/${item._id}`} className="hover:text-blue-400 flex items-center">
                    <svg className="w-3.5 h-3.5 me-2 text-green-400 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                    </svg>
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;