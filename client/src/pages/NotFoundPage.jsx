import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button } from '../components/common/Button.jsx';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-orbit-soft flex items-center justify-center text-orbit-primary mb-4 shadow-warm">
        <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: '10s' }} />
      </div>
      <h1 className="text-4xl font-black text-orbit-text tracking-tight mb-2">404</h1>
      <h2 className="text-xl font-bold text-orbit-text mb-2">Orbit lost in deep space</h2>
      <p className="text-sm text-orbit-textMuted max-w-sm mb-6">
        The page you are looking for does not exist or may have shifted out of orbit.
      </p>
      <Button onClick={() => navigate('/')} variant="primary" size="md">
        Back to Home Feed
      </Button>
    </div>
  );
};
