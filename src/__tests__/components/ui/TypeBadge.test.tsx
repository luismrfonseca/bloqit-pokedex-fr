import { render, screen } from '@testing-library/react';
import { TypeBadge } from '@/components/ui/TypeBadge';
import { TYPE_COLORS } from '@/types/pokemon';

describe('TypeBadge', () => {
  it('renders the type name', () => {
    render(<TypeBadge type="fire" />);
    expect(screen.getByText('fire')).toBeInTheDocument();
  });

  it('applies the correct background colour for known types', () => {
    render(<TypeBadge type="water" />);
    const badge = screen.getByText('water');
    expect(badge).toHaveStyle({ backgroundColor: TYPE_COLORS.water });
  });

  it('falls back to a grey colour for unknown types', () => {
    render(<TypeBadge type="unknown-type" />);
    const badge = screen.getByText('unknown-type');
    expect(badge).toHaveStyle({ backgroundColor: '#888' });
  });

  it('applies sm size classes', () => {
    render(<TypeBadge type="grass" size="sm" />);
    expect(screen.getByText('grass').className).toContain('text-xs');
  });

  it('applies md size classes by default', () => {
    render(<TypeBadge type="grass" />);
    expect(screen.getByText('grass').className).toContain('rounded-full');
  });
});