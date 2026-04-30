import { render, screen } from '@testing-library/react';
import { StatBar } from '@/components/ui/StatBar';

describe('StatBar', () => {
  it('renders the display name for known stat keys', () => {
    render(<StatBar name="hp" value={45} />);
    expect(screen.getByText('HP')).toBeInTheDocument();
  });

  it('renders the raw name for unknown stat keys', () => {
    render(<StatBar name="some-stat" value={50} />);
    expect(screen.getByText('some-stat')).toBeInTheDocument();
  });

  it('displays the numeric value', () => {
    render(<StatBar name="attack" value={80} />);
    expect(screen.getByText('80')).toBeInTheDocument();
  });

  it('clamps the bar width to 100% when value exceeds max', () => {
    const { container } = render(<StatBar name="hp" value={300} max={255} />);
    const bar = container.querySelector('[style*="width"]') as HTMLElement;
    expect(bar.style.width).toBe('100%');
  });

  it('uses correct percentage for bar width', () => {
    const { container } = render(<StatBar name="hp" value={51} max={255} />);
    const bar = container.querySelector('[style*="width"]') as HTMLElement;
    expect(bar.style.width).toBe('20%');
  });

  it('uses custom max when provided', () => {
    const { container } = render(<StatBar name="hp" value={50} max={100} />);
    const bar = container.querySelector('[style*="width"]') as HTMLElement;
    expect(bar.style.width).toBe('50%');
  });
});