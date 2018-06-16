import React                     from 'react';

// Components
import Header                    from './Header';
import Skills                    from './Skills';
import AcademicProjects          from './AcademicProjects';
import Achievements              from './Achievements';
import Responsibilities          from './Responsibilities';
import Footer                    from './Footer';

// Custom style
import                            '../styles/index.css';

const App = () => {
  return (
    <div>
      <Header />
      <Skills />
      <AcademicProjects />
      <Achievements />
      <Responsibilities />
      <Footer />
    </div>
  );
}

export default App;
