import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { problemService } from '../services/problemService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-java';
import 'prismjs/themes/prism.css';
import ReactMarkdown from 'react-markdown';

import Editor from 'react-simple-code-editor';


const ProblemPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const submission = location.state?.submission;
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [input, setInput] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [reviewOutput, setReviewOutput] = useState('');
  const [hasRun, setHasRun] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [language, setLanguage] = useState('cpp');

  const codeTemplates = {
    cpp: `#include <iostream>
using namespace std;

int main() {
    return 0;
}`,
    java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
    }
}`
  };

  const [code, setCode] = useState(submission?.sourceCode || codeTemplates.cpp);

  useEffect(() => {
    const fetchProblemById = async () => {
      try {
        const problemData = await problemService.getProblemById(id);
        setProblem(problemData);
      } catch (error) {
        console.error('Error fetching problem:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblemById();
  }, [id]);

  const runCode = async () => {
    setRunning(true);
    setOutput('');

    try {
      const response = await fetch(`${API_URL}/api/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ code, input, language })
      });

      const result = await response.json();

      if (result.success) {
        setOutput(result.output || 'No output');
        setHasRun(true);
      } else {
        setOutput(`Error: ${result.error}`);
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setRunning(false);
    }
  };

  const reviewCode = async () => {
    setReviewing(true);
    setReviewOutput('');

    try {
      const response = await fetch(`${API_URL}/api/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          code, 
          problemDescription: problem?.description,
          language 
        })
      });

      const result = await response.json();

      if (result.success) {
        setReviewOutput(result.review);
      } else {
        setReviewOutput(`Error: ${result.error}`);
      }
    } catch (error) {
      setReviewOutput(`Error: ${error.message}`);
    } finally {
      setReviewing(false);
    }
  };

  const submitCode = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          problemID: id,
          sourceCode: code,
          status: 'Accepted',
          score: 100
        })
      });
      
      if (response.ok) {
        alert('Code submitted successfully!');
      } else {
        alert('Submission failed');
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">

        {problem ? (
          <div>
            <h2 className="mb-4 text-lg font-semibold">Problem Statement:</h2>
            <div className="bg-gray-800 p-6 rounded-lg">
              <p className="text-gray-300">{problem.description}</p>
            </div>
            <div>
              <div className="mt-8 mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Code Editor:</h2>
                <select
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value);
                    if (code === codeTemplates[language]) {
                      setCode(codeTemplates[e.target.value]);
                    }
                  }}
                  className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white"
                >
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                </select>
              </div>
              <Editor
                value={code}
                onValueChange={setCode}
                highlight={code => highlight(code, language === 'java' ? languages.java : (languages.cpp || languages.clike))}

                padding={10}
                style={{
                  fontFamily: '"Fira code", "Fira Mono", monospace',
                  fontSize: 14,
                  backgroundColor: '#1a202c',
                  borderRadius: '8px',
                  minHeight: '300px',
                  color: 'white',
                  border: '1px solid #4A5568'
                }}
              />

              <div className="mt-4 flex gap-4">
                <div className="flex-1">
                  <h3 className="mb-2 text-sm font-semibold">Input:</h3>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full h-20 p-2 bg-gray-800 border border-gray-600 rounded text-white"
                    placeholder="Enter input for your program..."
                  />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-sm font-semibold">Outpuut:</h3>
                  <div className="w-full h-20 p-2 bg-gray-800 border border-gray-600 rounded text-white overflow-auto">
                    <pre className="text-sm">{output}</pre>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-4">
                <button
                  onClick={runCode}
                  disabled={running}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-2 rounded-lg font-medium"
                >
                  {running ? 'Running...' : ' Run Code'}
                </button>
                <button
                  onClick={reviewCode}
                  disabled={reviewing}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-2 rounded-lg font-medium"
                >
                  {reviewing ? 'Reviewing...' : 'AI Review'}
                </button>
                <button
                  onClick={submitCode}
                  disabled={submitting}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-6 py-2 rounded-lg font-medium"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
              
              {reviewOutput && (
                <div className="mt-4">
                  <h3 className="mb-2 text-sm font-semibold">AI Review:</h3>
                  <div className="w-full p-4 bg-gray-800 border border-gray-600 rounded text-white">
                    <ReactMarkdown>{reviewOutput}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-red-400">Problem not found</p>
        )}
      </div>
    </div>
  );
};

export default ProblemPage;