import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function InvoiceLandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.setItem('lastVisitedPath', '/student/tuition');
    navigate('/', { replace: true });
  }, [navigate]);

  return null;
}
