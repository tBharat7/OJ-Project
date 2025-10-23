import React, {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {problemService} from '../services/problemService';
import {submissionService} from '../services/submissionService';

const Dashboard = () => {
  const { logout, user } = useAuth();

  const [items, setItems] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [problems, userSubmissions] = await Promise.all([
          problemService.getProblems(),
          submissionService.getSubmissions()
        ]);
        setItems(problems);
        setSubmissions(userSubmissions);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getUserSubmission = (problemId) => {
    if (!user) return null;

    const candidates = submissions.filter(
      (sub) => sub.userID === user._id && sub.problemID === problemId
    );

    if (candidates.length === 0) return null;

    const getTime = (s) => {
      const t = s.timestamp || s.createdAt || s.updatedAt || s.time;
      if (t) {
        const parsed = Date.parse(t);
        if (!isNaN(parsed)) return parsed;
      }

      try {
        const id = s._id || s.id || '';
        if (typeof id === 'string' && id.length >= 8) {
          const secondsHex = id.substring(0, 8);
          const seconds = parseInt(secondsHex, 16);
          if (!isNaN(seconds)) return seconds * 1000;
        }
      } catch (e) {
        // ignore parsing errors
      }

      return 0;
    };

    return candidates.reduce((latest, cur) => (getTime(cur) > getTime(latest) ? cur : latest), candidates[0]);
  };

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
                  <Link 
                    to={`/problems/${item._id}`} 
                    state={{ submission: getUserSubmission(item._id) }}
                    className="hover:text-blue-400 flex items-center"
                  >
                    <svg className="w-3.5 h-3.5 me-2 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill={getUserSubmission(item._id)?.status === 'Accepted' ? '#10b981' : 'white'} viewBox="0 0 20 20">
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