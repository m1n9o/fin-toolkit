import { act, renderHook } from '@testing-library/react';
import { usePersistentState } from './storage';

beforeEach(() => window.localStorage.clear());

test('persists value and restores it on next mount', () => {
  const { result, unmount } = renderHook(() => usePersistentState('t', { a: '' }));
  act(() => result.current[1]({ a: '1' }));
  expect(JSON.parse(window.localStorage.getItem('toolkit:t'))).toEqual({ a: '1' });
  unmount();

  const { result: again } = renderHook(() => usePersistentState('t', { a: '' }));
  expect(again.current[0]).toEqual({ a: '1' });
});

test('clear resets to initial and removes stored data', () => {
  const initial = { a: '' };
  const { result } = renderHook(() => usePersistentState('t', initial));
  act(() => result.current[1]({ a: '1' }));
  act(() => result.current[2]());
  expect(result.current[0]).toBe(initial);
  expect(window.localStorage.getItem('toolkit:t')).toBeNull();
});
