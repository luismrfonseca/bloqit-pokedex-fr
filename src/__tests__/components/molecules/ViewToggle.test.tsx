import { render, screen, fireEvent } from '@testing-library/react';
import { ViewToggle } from '@/components/molecules/ViewToggle';

describe('ViewToggle', () => {
  const onChange = jest.fn();

  it('renders both options', () => {
    render(<ViewToggle view="grid" onChange={onChange} />);
    expect(screen.getByTitle('Grid view')).toBeInTheDocument();
    expect(screen.getByTitle('Table view')).toBeInTheDocument();
  });

  it('calls onChange with grid when grid button clicked', () => {
    render(<ViewToggle view="table" onChange={onChange} />);
    fireEvent.click(screen.getByTitle('Grid view'));
    expect(onChange).toHaveBeenCalledWith('grid');
  });

  it('calls onChange with table when table button clicked', () => {
    render(<ViewToggle view="grid" onChange={onChange} />);
    fireEvent.click(screen.getByTitle('Table view'));
    expect(onChange).toHaveBeenCalledWith('table');
  });

  it('applies active styles correctly', () => {
    const { rerender } = render(<ViewToggle view="grid" onChange={onChange} />);
    expect(screen.getByTitle('Grid view')).toHaveClass('bg-red-500');
    
    rerender(<ViewToggle view="table" onChange={onChange} />);
    expect(screen.getByTitle('Table view')).toHaveClass('bg-red-500');
  });
});
