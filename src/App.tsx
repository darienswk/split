import { ThemeProvider, CssBaseline } from '@mui/material';
import '@fontsource/roboto';

import './App.css';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import TripPage from './TripPage';
import darkTheme from './theme';

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<TripPage />} />
          <Route path="/:id" element={<HomePage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
