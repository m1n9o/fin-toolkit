import { useCallback, useEffect, useRef, useState } from 'react';

const PREFIX = 'toolkit:';

const read = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
};

// 与 useState 相同，但值会保存在 localStorage 中（仅本机浏览器）。
// 返回的 clear 会重置为初始值并删除已保存的数据。
export const usePersistentState = (key, initial) => {
  const initialRef = useRef(initial);
  const [state, setState] = useState(() => read(key, initial));

  useEffect(() => {
    try {
      if (state === initialRef.current) window.localStorage.removeItem(PREFIX + key);
      else window.localStorage.setItem(PREFIX + key, JSON.stringify(state));
    } catch {
      // 隐私模式或存储不可用时忽略，不影响使用
    }
  }, [key, state]);

  const clear = useCallback(() => setState(initialRef.current), []);

  return [state, setState, clear];
};
