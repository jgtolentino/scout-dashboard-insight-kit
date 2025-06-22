import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from '../mocks/server';

// Setup MSW for tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  disconnect() {}
  unobserve() {}
};

// Mock ResizeObserver  
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  disconnect() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock mapbox-gl
vi.mock('mapbox-gl', () => ({
  default: {
    Map: vi.fn(() => ({
      on: vi.fn(),
      off: vi.fn(),
      addSource: vi.fn(),
      addLayer: vi.fn(),
      getCanvas: vi.fn(() => ({ style: {} })),
      remove: vi.fn(),
      setLayoutProperty: vi.fn(),
      setPaintProperty: vi.fn(),
      getZoom: vi.fn(() => 6),
      getBounds: vi.fn(() => ({
        toArray: vi.fn(() => [[0, 0], [1, 1]])
      })),
      flyTo: vi.fn(),
      resize: vi.fn(),
    })),
    accessToken: 'test-token'
  }
}));

// Mock D3 for tests with comprehensive coverage
vi.mock('d3', () => {
  const mockScale = () => ({
    domain: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
  });
  
  return {
    select: vi.fn(() => ({
      selectAll: vi.fn(() => ({ 
        remove: vi.fn(),
        data: vi.fn().mockReturnThis(),
        enter: vi.fn().mockReturnThis(),
        append: vi.fn().mockReturnThis(),
      })),
      append: vi.fn(() => ({
        attr: vi.fn().mockReturnThis(),
        style: vi.fn().mockReturnThis(),
        text: vi.fn().mockReturnThis(),
        on: vi.fn().mockReturnThis(),
      })),
      attr: vi.fn().mockReturnThis(),
      style: vi.fn().mockReturnThis(),
      node: vi.fn(() => ({ getBoundingClientRect: vi.fn(() => ({ width: 800, height: 600 })) })),
    })),
    scaleOrdinal: mockScale,
    scaleLinear: mockScale,
    scaleTime: mockScale,
    scaleBand: mockScale,
    hierarchy: vi.fn(() => ({
      sum: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      descendants: vi.fn(() => []),
      children: [],
    })),
    treemap: vi.fn(() => vi.fn()),
    sankey: vi.fn(() => ({
      nodeAlign: vi.fn().mockReturnThis(),
      nodeWidth: vi.fn().mockReturnThis(),
      nodePadding: vi.fn().mockReturnThis(),
      extent: vi.fn().mockReturnThis(),
      nodes: vi.fn().mockReturnThis(),
      links: vi.fn().mockReturnThis(),
    })),
    max: vi.fn(() => 100),
    min: vi.fn(() => 0),
    extent: vi.fn(() => [0, 100]),
  };
});

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/' }),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
  Routes: ({ children }: { children: React.ReactNode }) => children,
  Route: ({ children }: { children: React.ReactNode }) => children,
}));