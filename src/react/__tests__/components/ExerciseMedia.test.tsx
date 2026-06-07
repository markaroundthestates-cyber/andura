// ══ EXERCISE MEDIA — loading skeleton (founder UX 2026-06-06) ════════════
// The demo box used to expand to an empty dark panel for ~2s while the media
// downloaded. A shimmer skeleton now fills the frame until the media's load
// event fires, then clears. These tests mock the media lib so the live-media
// branches (single image, dual-frame card, video) render in jsdom.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const getExerciseMedia = vi.fn();
const getExerciseMediaAlt = vi.fn((_name: string) => 'Demo Bench Press');

vi.mock('../../lib/exerciseMedia', () => ({
  getExerciseMedia: (name: string) => getExerciseMedia(name),
  getExerciseMediaAlt: (name: string) => getExerciseMediaAlt(name),
}));

import { ExerciseMedia } from '../../components/ExerciseMedia';

beforeEach(() => {
  getExerciseMedia.mockReset();
  getExerciseMediaAlt.mockReturnValue('Demo Bench Press');
});

describe('ExerciseMedia — loading skeleton', () => {
  it('shows a shimmer skeleton over a single image until it loads', () => {
    getExerciseMedia.mockReturnValue({ url: '/x.webp', type: 'image' });
    render(<ExerciseMedia engineName="Bench Press" variant="card" testId="em" />);
    // Skeleton present before load.
    expect(screen.getByTestId('em-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('em-skeleton')).toHaveClass('animate-shimmer');
    // Fire the image load → skeleton clears.
    fireEvent.load(screen.getByTestId('em'));
    expect(screen.queryByTestId('em-skeleton')).not.toBeInTheDocument();
  });

  it('clears the skeleton on image error (no permanent shimmer)', () => {
    getExerciseMedia.mockReturnValue({ url: '/x.webp', type: 'image' });
    render(<ExerciseMedia engineName="Bench Press" variant="card" testId="em" />);
    expect(screen.getByTestId('em-skeleton')).toBeInTheDocument();
    fireEvent.error(screen.getByTestId('em'));
    expect(screen.queryByTestId('em-skeleton')).not.toBeInTheDocument();
  });

  it('dual-frame card clears the skeleton only after BOTH frames load', () => {
    getExerciseMedia.mockReturnValue({ url: '/a.webp', url2: '/b.webp', type: 'image' });
    render(<ExerciseMedia engineName="Bench Press" variant="card" testId="em" />);
    const frames = Array.from(screen.getByTestId('em').querySelectorAll('img'));
    expect(frames).toHaveLength(2);
    const [frame0, frame1] = frames;
    expect(screen.getByTestId('em-skeleton')).toBeInTheDocument();
    // First frame loaded — skeleton still up.
    fireEvent.load(frame0!);
    expect(screen.getByTestId('em-skeleton')).toBeInTheDocument();
    // Second frame loaded — skeleton clears.
    fireEvent.load(frame1!);
    expect(screen.queryByTestId('em-skeleton')).not.toBeInTheDocument();
  });

  it('video shows a skeleton until loadeddata fires', () => {
    getExerciseMedia.mockReturnValue({ url: '/x.mp4', type: 'video' });
    render(<ExerciseMedia engineName="Bench Press" variant="card" testId="em" />);
    expect(screen.getByTestId('em-skeleton')).toBeInTheDocument();
    fireEvent.loadedData(screen.getByTestId('em'));
    expect(screen.queryByTestId('em-skeleton')).not.toBeInTheDocument();
  });

  // Audit 2026-06-07 (LOW-3): a failed video load must clear the skeleton too
  // (mirror the <img> error path), else a broken URL leaves the shimmer forever.
  it('clears the skeleton on video error (no permanent shimmer)', () => {
    getExerciseMedia.mockReturnValue({ url: '/x.mp4', type: 'video' });
    render(<ExerciseMedia engineName="Bench Press" variant="card" testId="em" />);
    expect(screen.getByTestId('em-skeleton')).toBeInTheDocument();
    fireEvent.error(screen.getByTestId('em'));
    expect(screen.queryByTestId('em-skeleton')).not.toBeInTheDocument();
  });

  it('no skeleton on the placeholder (no media)', () => {
    getExerciseMedia.mockReturnValue(undefined);
    render(<ExerciseMedia engineName="Unknown" variant="card" testId="em" />);
    expect(screen.queryByTestId('em-skeleton')).not.toBeInTheDocument();
    expect(screen.getByTestId('em-placeholder')).toBeInTheDocument();
  });
});
