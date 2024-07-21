import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './pages/Home/Home';
import { createTheme, ThemeProvider } from '@mui/material';

function App() {

  return (
    <div className='App'>
        <Home />
    </div>
  );
}

export default App;
