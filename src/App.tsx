import { ThemeProvider, CssBaseline } from '@mui/material';
import './App.css';
import HomePage from './HomePage';
import darkTheme from './theme';


function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <HomePage />
    </ThemeProvider>
  );
}

export default App;
