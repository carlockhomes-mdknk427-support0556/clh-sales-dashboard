import { useAnimatedNumber } from '../hooks';

export default function AnimatedNumber({ value, prefix = '', suffix = '' }) {
  const animated = useAnimatedNumber(value);
  return <>{prefix}{animated.toLocaleString('ja-JP')}{suffix}</>;
}
