import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Home from './pages/Home';
import Wedding from './pages/Wedding';
import Admin from './pages/Admin';
import CreateWedding from './pages/CreateWedding';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateWedding />} />
          <Route path="/wedding/:code" element={<Wedding />} />
          <Route path="/admin/:code" element={<Admin />} />
        </Routes>
      </Router>
      <Toaster position="top-center" />
    </div>
  );
}

export default App;