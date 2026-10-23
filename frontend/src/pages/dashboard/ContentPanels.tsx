import { Navigate, useParams } from "react-router-dom";
import { ResourcePanel } from "./ResourcePanel";
import { certificationsConfig, educationConfig, experiencesConfig, projectsConfig, skillsConfig } from "./resources";

/** Route /dashboard/:resource -> panneau CRUD correspondant. */
export default function ContentPanels() {
  const { resource } = useParams();
  switch (resource) {
    case "experiences":
      return <ResourcePanel key={resource} config={experiencesConfig} />;
    case "education":
      return <ResourcePanel key={resource} config={educationConfig} />;
    case "skills":
      return <ResourcePanel key={resource} config={skillsConfig} />;
    case "projects":
      return <ResourcePanel key={resource} config={projectsConfig} />;
    case "certifications":
      return <ResourcePanel key={resource} config={certificationsConfig} />;
    default:
      return <Navigate to="/dashboard" replace />;
  }
}
