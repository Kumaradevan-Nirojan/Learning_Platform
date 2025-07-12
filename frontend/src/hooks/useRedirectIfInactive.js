// frontend/hooks/useRedirectIfInactive.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useRedirectIfInactive = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const isActive = localStorage.getItem('isActive');
    // Redirect if the flag is explicitly 'false'
    if (isActive === 'false') {
      navigate('/inactive');
    }
  }, [navigate]);
};

export default useRedirectIfInactive;