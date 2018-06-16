import React                     from 'react';
import Header                    from ./Header;
import AcademicProject           from ./AcademicProjects;
import Achievements              from ./Achievements;
import Responsibilities          from ./Responsibilities;
import Footer                    from ./Footer;

const App = () => {
  return (
    <Header />
    <Skills />
    <AcademicProjects />
    <Achievements />
    <Responsibilities />
    <Footer />
  );
}

export default App;
