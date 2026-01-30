import NavBar from './Components/NavBar';
import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import Image from './heroImg.png';

function App() {
  return (
    <Router>
      <NavBar />
      <div className="App">

        <header className="App-header">
          <div className="App-header-text">
            <h2>Meet your doctor with</h2>
            <h1>(Project Name)</h1>
            <p>Book appointments with qualified doctors easily and quickly.</p>
            <div className="btn-container">
              <button className="btn">Book Appointment</button>
              <button className="btn">View Doctors</button>
            </div>
          </div>
          <img src={Image} alt="Doctor" className='heroImg' />
        </header>
      </div>
    </Router>

  );
}

export default App;
