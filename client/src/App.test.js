import { render, screen, within } from '@testing-library/react';
import App from './App';
import tools from './tools';

test('home page lists every registered tool', () => {
  render(<App />);
  const main = screen.getByRole('main');
  tools.forEach((tool) => {
    expect(within(main).getByText(tool.name)).toBeInTheDocument();
  });
});
