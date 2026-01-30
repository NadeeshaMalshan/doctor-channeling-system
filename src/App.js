import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './Components/NavBar';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <NavBar />
        <header className="App-header">
          <Routes>
            <Route path="/" element={
              <>
                <img src={logo} className="App-logo" alt="logo" />
                <p>Welcome to the Doctor Channeling System</p>
              </>
            } />
            <Route path="/doctors" element={<h2>Doctors Page</h2>} />
            <Route path="/login" element={<h2>Login Page</h2>} />
            <Route path="*" element={<h2>Page Not Found</h2>} />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;
