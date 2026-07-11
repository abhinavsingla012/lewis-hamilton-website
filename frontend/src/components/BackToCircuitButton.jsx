import { Map } from "lucide-react";

export const BackToCircuitButton = ({ onClick }) => <button className="back-to-circuit" onClick={onClick} data-testid="back-to-circuit-button">
  <Map size={16} aria-hidden="true" />
  <span>BACK TO CIRCUIT</span>
</button>;