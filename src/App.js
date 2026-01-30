import NavBar from './Components/NavBar';
import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import Image from './heroImg.png';
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

function App() {
  const containerRef = useRef();

  useGSAP(() => {
    gsap.from(".anim-text", {
      y: 30,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: "power3.out",
      delay: 0.2
    });
  }, { scope: containerRef });

  return (
    <Router>
      <NavBar />
      <div className="App">

        <header className="App-header">
          <div className="App-header-text" ref={containerRef}>
            <h2 className="anim-text">Meet your doctor with</h2>
            <h1 className="anim-text">(Project Name)</h1>
            <p className="anim-text">Book appointments with qualified doctors easily and quickly.</p>
            <div className="btn-container anim-text">
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
