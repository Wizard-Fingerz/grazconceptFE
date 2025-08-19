import { ThemeProvider } from '@mui/material';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { theme } from './theme';
import { publicRoutes, protectedRoutes } from './routes';
import { AuthProvider } from './context/AuthContext';

const AppRoutes = () => {
  const routes = [...publicRoutes, ...protectedRoutes];
  const element = useRoutes(routes);
  return element;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
