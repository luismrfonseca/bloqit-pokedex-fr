import { render, screen } from '@testing-library/react';
import { PageTemplate } from '@/components/templates/PageTemplate';

describe('PageTemplate', () => {
  it('renders title and children', () => {
    render(
      <PageTemplate title="Test Title">
        <div data-testid="child">Child Content</div>
      </PageTemplate>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toHaveTextContent('Child Content');
  });

  it('renders optional subtitle', () => {
    render(
      <PageTemplate title="Title" subtitle="Optional Subtitle">
        Content
      </PageTemplate>
    );

    expect(screen.getByText('Optional Subtitle')).toBeInTheDocument();
  });

  it('renders headerAction and topContent', () => {
    render(
      <PageTemplate 
        title="Title" 
        headerAction={<button>Action</button>}
        topContent={<div data-testid="top">Top</div>}
      >
        Content
      </PageTemplate>
    );

    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    expect(screen.getByTestId('top')).toBeInTheDocument();
  });
});
