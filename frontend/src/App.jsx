import React from 'react';
import AppRouter from './routes/AppRouter';
import { ThemeProvider } from './providers/ThemeProvider';
import { AuthProvider } from './providers/AuthProvider';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppRouter />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
