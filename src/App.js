import NavBar from './components/NavBar';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <NavBar />
      <div className="App">
        
        <header className="App-header">
          <h1>Meet your doctor with (Project Name)</h1>
        </header>
      </div>
    </Router>
    
  );
}

export default App;
