// ══ #7 SETLOGINPUT METRIC — time / carry seconds capture ════════════════════
// The prescription already honors metric_type (Plank → time, Farmer's Walk →
// carry; getMetricType is curated in the library), but SetLogInput rendered
// kg/reps tiles regardless. This proves the metric rendering: a time exercise
// shows a SECONDS input (no reps), a carry shows load + seconds, the performed
// duration is captured via onDurationChange, and a reps exercise is byte-
// identical (kg/reps tiles, no seconds field).

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SetLogInput } from '../../../components/Workout/SetLogInput';
import { getMetricType } from '../../../../engine/metricType.js';

describe('#7 library metric_type is real for the curated holds/carries', () => {
  it('Plank / Dead Hang are time; Farmer\'s Walk is carry; a lift is reps', () => {
    expect(getMetricType('Plank')).toBe('time');
    expect(getMetricType('Dead Hang')).toBe('time');
    expect(getMetricType("Farmer's Walk DB")).toBe('carry');
    expect(getMetricType('Flat DB Press')).toBe('reps');
  });
});

describe('SetLogInput — time metric (Plank, seconds)', () => {
  it('renders a seconds input and NO reps input in editable/metric mode', () => {
    render(
      <SetLogInput
        kg={0}
        reps={0}
        onKgChange={vi.fn()}
        onRepsChange={vi.fn()}
        metricType="time"
        durationSec={45}
        onDurationChange={vi.fn()}
        mode="editable"
      />,
    );
    expect(screen.getByTestId('setlog-seconds-input')).toBeInTheDocument();
    expect(screen.queryByTestId('reps-input')).not.toBeInTheDocument();
    // No load tile for a bodyweight hold.
    expect(screen.queryByTestId('setlog-carry-kg-input')).not.toBeInTheDocument();
  });

  it('seconds input value reflects durationSec', () => {
    render(
      <SetLogInput
        kg={0} reps={0} onKgChange={vi.fn()} onRepsChange={vi.fn()}
        metricType="time" durationSec={60} onDurationChange={vi.fn()} mode="editable"
      />,
    );
    expect((screen.getByTestId('setlog-seconds-input') as HTMLInputElement).value).toBe('60');
  });

  it('changing the seconds field fires onDurationChange with the numeric value', () => {
    const onDurationChange = vi.fn();
    render(
      <SetLogInput
        kg={0} reps={0} onKgChange={vi.fn()} onRepsChange={vi.fn()}
        metricType="time" durationSec={30} onDurationChange={onDurationChange} mode="editable"
      />,
    );
    fireEvent.change(screen.getByTestId('setlog-seconds-input'), { target: { value: '50' } });
    expect(onDurationChange).toHaveBeenCalledWith(50);
  });

  it('tinta mode shows the prescribed seconds target + the confirm CTA', () => {
    render(
      <SetLogInput
        kg={0} reps={0} onKgChange={vi.fn()} onRepsChange={vi.fn()}
        metricType="time" durationSec={45} targetSec={45} onDurationChange={vi.fn()}
        mode="tinta" onLog={vi.fn()}
      />,
    );
    expect(screen.getByTestId('setlog-metric-target-sec').textContent).toBe('45');
    expect(screen.getByTestId('setlog-tinta-log-btn')).toBeInTheDocument();
  });

  it('post-log mode shows the held seconds', () => {
    render(
      <SetLogInput
        kg={0} reps={0} onKgChange={vi.fn()} onRepsChange={vi.fn()}
        metricType="time" durationSec={42} onDurationChange={vi.fn()} mode="post-log" onEdit={vi.fn()}
      />,
    );
    expect(screen.getByTestId('setlog-postlog-text').textContent).toContain('42');
  });
});

describe('SetLogInput — carry metric (Farmer\'s Walk, load + seconds)', () => {
  it('renders BOTH a seconds input and a load (kg) input', () => {
    render(
      <SetLogInput
        kg={30} reps={0} onKgChange={vi.fn()} onRepsChange={vi.fn()}
        metricType="carry" durationSec={40} onDurationChange={vi.fn()} mode="editable"
      />,
    );
    expect(screen.getByTestId('setlog-seconds-input')).toBeInTheDocument();
    expect(screen.getByTestId('setlog-carry-kg-input')).toBeInTheDocument();
    expect(screen.queryByTestId('reps-input')).not.toBeInTheDocument();
  });

  it('the carry load input reflects + fires kg change', () => {
    const onKgChange = vi.fn();
    render(
      <SetLogInput
        kg={30} reps={0} onKgChange={onKgChange} onRepsChange={vi.fn()}
        metricType="carry" durationSec={40} onDurationChange={vi.fn()} mode="editable"
      />,
    );
    expect((screen.getByTestId('setlog-carry-kg-input') as HTMLInputElement).value).toBe('30');
    fireEvent.change(screen.getByTestId('setlog-carry-kg-input'), { target: { value: '35' } });
    expect(onKgChange).toHaveBeenCalledWith(35);
  });
});

describe('SetLogInput — reps metric is byte-identical (no seconds field)', () => {
  it('a reps exercise (default) renders kg + reps and NO seconds field', () => {
    render(
      <SetLogInput kg={22.5} reps={10} onKgChange={vi.fn()} onRepsChange={vi.fn()} mode="editable" />,
    );
    expect(screen.getByTestId('kg-input')).toBeInTheDocument();
    expect(screen.getByTestId('reps-input')).toBeInTheDocument();
    expect(screen.queryByTestId('setlog-seconds-input')).not.toBeInTheDocument();
  });

  it('metricType="reps" explicit also renders the unchanged kg/reps tiles', () => {
    render(
      <SetLogInput kg={22.5} reps={10} onKgChange={vi.fn()} onRepsChange={vi.fn()} metricType="reps" mode="editable" />,
    );
    expect(screen.getByTestId('kg-input')).toBeInTheDocument();
    expect(screen.getByTestId('reps-input')).toBeInTheDocument();
    expect(screen.queryByTestId('setlog-seconds-input')).not.toBeInTheDocument();
  });
});
