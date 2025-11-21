import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Dashboard } from './components/Dashboard';
import { HowItWorks } from './components/HowItWorks';

type AuthView = 'login' | 'register' | 'how-it-works';

function AppContent() {
  const [authView, setAuthView] = useState<AuthView>('login');
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (authView === 'how-it-works') {
      return (
        <HowItWorks
          onNavigateToLogin={() => setAuthView('login')}
          onNavigateToRegister={() => setAuthView('register')}
        />
      );
    }

    return authView === 'login' ? (
      <Login
        onToggle={() => setAuthView('register')}
        onShowHowItWorks={() => setAuthView('how-it-works')}
      />
    ) : (
      <Register
        onToggle={() => setAuthView('login')}
        onShowHowItWorks={() => setAuthView('how-it-works')}
      />
    );
  }

  return <Dashboard />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
