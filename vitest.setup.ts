import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('server-only', () => ({}));

process.env.USE_MOCK_DATA = 'true';
