import './App.css';

import Login from './components/Login/Login';
import Admin from './components/Admin/Admin';
import Interview from './components/Interview/Interview';
import { useState, useEffect  } from 'react';
import axios from 'axios';
import { config } from './config';

function App() {

  const [token, setToken] = useState();
  const [access, setAccess] = useState();

  useEffect(() => {
    const searchParams = new URLSearchParams(document.location.search)
    if (!token && searchParams.has('key')) {
      let key = searchParams.get('key');
      setToken(key);
      window.history.pushState(null, document.title, window.location.pathname)
    }
    if (token && !access) {
      axios.post(`${config.url.API_URL}/checkKey`, { "key" : token }).then(res => {
        setAccess(res.data);
      });
    }
  }, [access, token]);

  if (!access) {
    return <Login setToken={setToken} />
  }

  if (access === "admin") {
    return <Admin token={token} />
  }

  return <Interview token={token} />
  
}

export default App;
