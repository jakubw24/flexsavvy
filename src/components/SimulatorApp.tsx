import type { FC } from 'react';

const SimulatorApp: FC = () => {
  return (
    <main data-testid="simulator-app" role="main">
      <h1>FlexSavvy Simulator</h1>
      <p>Upload your smart-meter data to explore electricity cost savings.</p>
    </main>
  );
};

export default SimulatorApp;
