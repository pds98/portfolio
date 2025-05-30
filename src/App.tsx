import React, { useState, useEffect } from 'react';
import { Box, Container } from '@mui/material';
import { HeroSection } from './components/sections/HeroSection';
import { AboutSection } from './components/sections/AboutSection';
import { ExperienceSection } from './components/sections/ExperienceSection';
import { ProjectsSection } from './components/sections/ProjectsSection';
import { ContactSection } from './components/sections/ContactSection';
import IntroAnimation from './components/IntroAnimation';
import type { IProject } from './core/interfaces/IProject';

function App() {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    // Initialize demo projects
    const demoProjects: IProject[] = [
      {
        id: 1,
        title: "Portfolio Website",
        shortDescription: "A personal portfolio website built with React and Material-UI",
        longDescription: "A responsive portfolio website showcasing my projects and skills",
        technologies: ["React", "TypeScript", "Material-UI"],
        githubUrl: "https://github.com/username/portfolio",
        demoUrl: "https://portfolio.username.com",
        image: "/portfolio-preview.jpg"
      },
      {
        id: 2,
        title: "Task Manager",
        shortDescription: "A task management application",
        longDescription: "A full-stack task management application with user authentication",
        technologies: ["Node.js", "Express", "MongoDB"],
        githubUrl: "https://github.com/username/task-manager",
        demoUrl: "https://tasks.username.com",
        image: "/task-manager-preview.jpg"
      },
      {
        id: 3,
        title: "Weather App",
        shortDescription: "A weather forecast application",
        longDescription: "A weather application that shows current weather and forecasts",
        technologies: ["React", "OpenWeather API"],
        githubUrl: "https://github.com/username/weather-app",
        demoUrl: "https://weather.username.com",
        image: "/weather-app-preview.jpg"
      }
    ];

    setProjects(demoProjects);
  }, []);

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
