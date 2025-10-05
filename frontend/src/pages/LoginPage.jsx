import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const { login, register } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  
  return (
    <section className="bg-gray-900 bg-cover bg-center" >
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="flex items-center mb-6 text-2xl font-semibold text-white">
          <svg className="w-8 h-8 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          OnlineJudge
        </div>
        <div className="w-full bg-white rounded-lg shadow border md:mt-0 sm:max-w-md xl:p-0 bg-opacity-10 backdrop-filter backdrop-blur-lg border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-white md:text-2xl">
              {isSignUp ? 'Create your account' : 'Sign in to your account'}
            </h1>
            <form className="space-y-4 md:space-y-6" method="POST" onSubmit={async (e) => { 
              e.preventDefault(); 
              const formData = new FormData(e.target);
              const email = formData.get('email');
              const password = formData.get('password');
              const username = formData.get('username');
              // const body = isSignUp ? { username, email, password } : { email, password };
              
              
              try {
                if (isSignUp) {
                  await register(username, email, password);
                } else {
                  await login(email, password);
                }
              } catch (err) {
                alert(err.message);
              }
            }}>
              {isSignUp && (
                <div>
                  <label htmlFor="username" className="block mb-2 text-sm font-medium text-white">Username</label>
                  <input type="text" name="username" id="username" className="bg-gray-700 border border-gray-600 text-white sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400" placeholder="johndoe" required />
                </div>
              )}
              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-white">Your email</label>
                <input type="email" name="email" id="email" className="bg-gray-700 border border-gray-600 text-white sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400" placeholder="name@company.com" required />
              </div>
              <div>
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-white">Password</label>
                <input type="password" name="password" id="password" placeholder="••••••••" className="bg-gray-700 border border-gray-600 text-white sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400" required />
              </div>

              <button type="submit" className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center">{isSignUp ? 'Register' : 'Sign in'}</button>
              <p className="text-sm font-light text-gray-400">
                {isSignUp ? 'Already have an account? ' : "Don't have an account yet? "}
                <button type="button" onClick={() => { setIsSignUp(!isSignUp); }} className="font-medium text-blue-500 hover:underline">
                  {isSignUp ? 'Sign in' : 'Sign up'}
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;