import { useState } from 'react';
import { Box, Container } from '@mui/material';
import { HeroSection } from './components/sections/HeroSection';
import { AboutSection } from './components/sections/AboutSection';
import { ExperienceSection } from './components/sections/ExperienceSection';
import { ProjectsSection } from './components/sections/ProjectsSection';
import { ContactSection } from './components/sections/ContactSection';
import IntroAnimation from './components/IntroAnimation';
// Source unique des projets : modifier src/data/projects.ts pour en ajouter.
import { projects } from './data/projects';

function App() {
  const [showIntro, setShowIntro] = useState(true);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  if (showIntro) {
    return <IntroAnimation onComplete={handleIntroComplete} />;
  }

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      <HeroSection />
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <AboutSection />
            <ExperienceSection />
            <ProjectsSection projects={projects} />
            <ContactSection />
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default App;
