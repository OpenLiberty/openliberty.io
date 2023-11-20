import React from 'react';
import { render } from '@testing-library/react';
import App from './Components/App';

test('renders artist web service title', () => {
  const { getByText } = render(<App />);
  const titleElement = getByText(/Artist Web Service/i);
  expect(titleElement).toBeInTheDocument();
});
