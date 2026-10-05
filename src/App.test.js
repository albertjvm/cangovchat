import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

test('renders the speech search UI', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /open search/i }));

  expect(screen.getByPlaceholderText(/Search speeches/i)).toBeInTheDocument();
});
