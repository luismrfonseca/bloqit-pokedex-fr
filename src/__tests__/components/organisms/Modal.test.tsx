import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '@/components/organisms/Modal';

describe('Modal', () => {
  const onClose = jest.fn();

  it('does not render when open is false', () => {
    render(<Modal open={false} onClose={onClose}>Content</Modal>);
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('renders children when open is true', () => {
    render(<Modal open={true} onClose={onClose}>Content</Modal>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<Modal open={true} onClose={onClose}>Content</Modal>);
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when overlay is clicked', () => {
    render(<Modal open={true} onClose={onClose}>Content</Modal>);
    // The overlay is the first div inside the relative div or identified by backdrop class
    // We can use a testid or find by class
    const overlay = screen.getByRole('dialog').children[0];
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when Escape key is pressed', () => {
    render(<Modal open={true} onClose={onClose}>Content</Modal>);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('prevents body scroll when open', () => {
    const { unmount } = render(<Modal open={true} onClose={onClose}>Content</Modal>);
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
  });
});
