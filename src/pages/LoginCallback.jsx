import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const LoginCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    
    const handleCallback = async () => {
      hasProcessed.current = true;
      
      const urlParams = new URLSearchParams(location.search);
      const token = urlParams.get('token');
      const userStr = urlParams.get('user');
      const error = urlParams.get('error');

      if (error) {
        console.error('OAuth error:', error);
        navigate('/login?error=' + encodeURIComponent(error));
        return;
      }

      if (token && userStr) {
        try {
          const userData = JSON.parse(decodeURIComponent(userStr));
          
          // Store token and user data
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Update auth context
          updateUser(userData);
          
          // Redirect to dashboard
          navigate('/dashboard');
        } catch (error) {
          console.error('Error parsing user data:', error);
          navigate('/login?error=invalid_user_data');
        }
      } else {
        navigate('/login?error=missing_data');
      }
    };

    handleCallback();
  }, [location.search, navigate, updateUser]);

  return (
    <div className="login-callback-page">
      <div className="container">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <h3 className="mt-3">Completing sign-in...</h3>
          <p className="text-muted">Please wait while we set up your account.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginCallback;
