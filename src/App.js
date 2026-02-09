
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Landing from './page/landing';
import ECare from './page/eCare';
import Login from './page/Login';

function App() {
  return (
    <>

      <div className="App">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/eCare" element={<ECare />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
