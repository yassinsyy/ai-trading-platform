import React from 'react';
import Hero from './components/Hero';
import Features from './components/Features';
import ThreeScene from './components/ThreeScene';
import Contact from './components/Contact';

const App: React.FC = () => {
  return (
    <div className="App">
      <Hero />
      <Features />
      <ThreeScene />
      <Contact />
    </div>
  );
};

export default App; 