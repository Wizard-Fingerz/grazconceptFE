import { ThemeProvider } from '@mui/material';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { theme } from './theme';
import { publicRoutes, protectedRoutes } from './routes';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
          <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} newestOnTop={false} closeOnClick pauseOnFocusLoss draggable pauseOnHover />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
