// ══ RN UI-KIT SMOKE TESTS (Wave 2b) ═══════════════════════════════════════
// Foundation for all later screen waves: jest-expo + @testing-library/react-
// native. Each shared component must mount without throwing and expose its
// testID (the contract screen waves + e2e rely on). Not pixel/animation tests —
// motion is driven by Reanimated's official jest mock (jest.setup.js).

import { render, screen, fireEvent } from '@testing-library/react-native';
import { ReadinessOrb } from '../pulse/ReadinessOrb';
import { Ring } from '../pulse/Ring';
import { Sparkline } from '../pulse/Sparkline';
import { PulseMark } from '../pulse/PulseMark';
import { Kicker } from '../pulse/Kicker';
import { Pill } from '../pulse/Pill';
import { Toggle } from '../Toggle';
import { LoadingSkeleton } from '../LoadingSkeleton';
import { ExerciseMedia } from '../ExerciseMedia';
import { Text } from 'react-native';

describe('ReadinessOrb', () => {
  it('mounts and shows the count-up score', () => {
    render(<ReadinessOrb score={80} label="readiness" />);
    expect(screen.getByTestId('readiness-orb')).toBeTruthy();
    expect(screen.getByTestId('readiness-orb-score')).toBeTruthy();
    expect(screen.getByTestId('readiness-orb-label')).toBeTruthy();
  });

  it('honest empty state renders an em-dash when score is null', () => {
    render(<ReadinessOrb score={null} />);
    expect(screen.getByTestId('readiness-orb-score').props.children).toBe('—');
  });
});

describe('Ring', () => {
  it('mounts with track + arc', () => {
    render(
      <Ring pct={50} gradId="pulse">
        <Text>x</Text>
      </Ring>,
    );
    expect(screen.getByTestId('pulse-ring')).toBeTruthy();
    expect(screen.getByTestId('pulse-ring-track')).toBeTruthy();
    expect(screen.getByTestId('pulse-ring-arc')).toBeTruthy();
  });
});

describe('Sparkline', () => {
  it('renders line + dot with >=2 points', () => {
    render(
      <Sparkline
        data={[
          { day: 'a', kg: 80 },
          { day: 'b', kg: 79 },
          { day: 'c', kg: 78 },
        ]}
      />,
    );
    expect(screen.getByTestId('pulse-sparkline')).toBeTruthy();
    expect(screen.getByTestId('pulse-sparkline-line')).toBeTruthy();
    expect(screen.getByTestId('pulse-sparkline-dot')).toBeTruthy();
  });

  it('renders nothing with <2 points', () => {
    render(<Sparkline data={[{ day: 'a', kg: 80 }]} />);
    expect(screen.queryByTestId('pulse-sparkline')).toBeNull();
  });
});

describe('PulseMark', () => {
  it('mounts animated + static', () => {
    const { rerender } = render(<PulseMark />);
    expect(screen.getByTestId('pulse-mark')).toBeTruthy();
    expect(screen.getByTestId('pulse-mark-wave')).toBeTruthy();
    rerender(<PulseMark animated={false} />);
    expect(screen.getByTestId('pulse-mark')).toBeTruthy();
  });
});

describe('Kicker + Pill', () => {
  it('mount and render children', () => {
    render(<Kicker>TODAY</Kicker>);
    expect(screen.getByTestId('pulse-kicker')).toBeTruthy();
    render(<Pill solid>PR</Pill>);
    expect(screen.getByTestId('pulse-pill')).toBeTruthy();
  });
});

describe('Toggle', () => {
  it('mounts, exposes switch role, fires onToggle', () => {
    const onToggle = jest.fn();
    render(<Toggle checked={false} onToggle={onToggle} ariaLabel="Dark mode" testId="t1" />);
    const node = screen.getByTestId('t1');
    expect(node).toBeTruthy();
    expect(node.props.accessibilityState.checked).toBe(false);
    fireEvent.press(node);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});

describe('LoadingSkeleton', () => {
  it('mounts with the requested line count', () => {
    render(<LoadingSkeleton lines={2} />);
    expect(screen.getByTestId('loading-skeleton')).toBeTruthy();
    expect(screen.getByTestId('skeleton-line-0')).toBeTruthy();
    expect(screen.getByTestId('skeleton-line-1')).toBeTruthy();
  });
});

describe('ExerciseMedia', () => {
  it('renders the placeholder when no media is sourced (V1 state)', () => {
    render(<ExerciseMedia engineName="Barbell Bench Press" variant="card" />);
    expect(screen.getByTestId('exercise-media-placeholder')).toBeTruthy();
  });
});
