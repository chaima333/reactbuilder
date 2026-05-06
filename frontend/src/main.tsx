// frontend/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import App from './App';
import './index.css';

const GOOGLE_CLIENT_ID = '386973697348-nli3u1vt7n20rj0svi90fc3b0kjkvpdc.apps.googleusercontent.com';
            

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </Provider>
  </React.StrictMode>
);