import React from 'react';
import AppRouter from './routes/AppRouter';
import { ThemeProvider } from './providers/ThemeProvider';
import { AuthProvider } from './providers/AuthProvider';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppRouter />
        <Toaster position="top-right" reverseOrder={false} />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
