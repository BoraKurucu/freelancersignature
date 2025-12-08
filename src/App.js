import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import SignatureBuilder from './components/SignatureBuilder';
import MySignatures from './components/MySignatures';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/builder" element={<SignatureBuilder />} />
          <Route path="/my-signatures" element={<MySignatures />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
