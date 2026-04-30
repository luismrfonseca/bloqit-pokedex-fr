import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { FilterSort } from '@/components/pokedex/FilterSort';
import { FilterSortState } from '@/types/pokemon';

const defaultState: FilterSortState = {
  search: '',
  typeFilter: '',
  sortField: 'name',
  sortOrder: 'asc',
};

// Stateful wrapper so the input actually accumulates typed characters
function StatefulFilterSort({ onChange }: { onChange?: (s: FilterSortState) => void }) {
  const [state, setState] = useState(defaultState);
  return (
    <FilterSort
      state={state}
      onChange={(s) => {
        setState(s);
        onChange?.(s);
      }}
    />
  );
}

describe('FilterSort', () => {
  it('renders the search input', () => {
    render(<FilterSort state={defaultState} onChange={() => {}} />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('accumulates typed characters and calls onChange with full search string', async () => {
    const onChange = jest.fn();
    render(<StatefulFilterSort onChange={onChange} />);
    await userEvent.type(screen.getByPlaceholderText(/search/i), 'char');
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: 'char' })
    );
  });

  it('calls onChange when selecting a type filter', async () => {
    const onChange = jest.fn();
    render(<FilterSort state={defaultState} onChange={onChange} />);
    const selects = screen.getAllByRole('combobox');
    await userEvent.selectOptions(selects[0], 'fire');
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ typeFilter: 'fire' })
    );
  });

  it('calls onChange when changing the sort field', async () => {
    const onChange = jest.fn();
    render(<FilterSort state={defaultState} onChange={onChange} />);
    const selects = screen.getAllByRole('combobox');
    await userEvent.selectOptions(selects[1], 'height');
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ sortField: 'height' })
    );
  });

  it('toggles sort order from asc to desc when clicking the order button', async () => {
    const onChange = jest.fn();
    render(<FilterSort state={defaultState} onChange={onChange} />);
    await userEvent.click(screen.getByTitle('Ascending'));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ sortOrder: 'desc' })
    );
  });

  it('toggles sort order from desc to asc', async () => {
    const onChange = jest.fn();
    const descState: FilterSortState = { ...defaultState, sortOrder: 'desc' };
    render(<FilterSort state={descState} onChange={onChange} />);
    await userEvent.click(screen.getByTitle('Descending'));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ sortOrder: 'asc' })
    );
  });
});