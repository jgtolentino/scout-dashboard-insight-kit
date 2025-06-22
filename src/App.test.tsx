import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Basic smoke test - app should render
    expect(document.body).toBeTruthy();
  });

  it('contains main layout elements', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Check for main structural elements
    const mainElement = document.querySelector('main');
    expect(mainElement).toBeTruthy();
  });
});