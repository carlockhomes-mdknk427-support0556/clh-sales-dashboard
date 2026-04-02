import { useState, useEffect, useRef } from 'react';

export function useAnimatedNumber(target, duration = 1000) {
  const [value, setValue] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const start = prev.current;
    const diff = target - start;
    if (diff === 0) return;
    const startTime = performance.now();

    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + diff * eased);
      setValue(current);
      if (progress < 1) requestAnimationFrame(animate);
      else prev.current = target;
    }

    requestAnimationFrame(animate);
  }, [target, duration]);

  return value;
}

export function useInView(threshold = 0.1) {
  const ref = useRef();
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, inView];
}
