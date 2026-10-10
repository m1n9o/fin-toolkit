import { render, screen } from '@testing-library/react';
import App from './App';
import tools from './tools';

test('home page lists every registered tool', () => {
  render(<App />);
  tools.forEach((tool) => {
    expect(screen.getByText(tool.name)).toBeInTheDocument();
  });
});
