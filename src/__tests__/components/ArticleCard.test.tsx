import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ArticleCard from '@/components/news/ArticleCard';
import type { NewsArticle } from '@/app/api/news/route';

const mockArticle: NewsArticle = {
  id: '1',
  title: 'Test Article',
  summary: 'This is a test summary.',
  content: 'Full content of the test article.',
  readTime: '3 min read',
  category: 'Innovation',
  imageUrl: '/test-image.jpg',
  imageAlt: 'Test image alt',
};

describe('ArticleCard', () => {
  it('renders the article details correctly', () => {
    render(<ArticleCard article={mockArticle} />);
    
    expect(screen.getByText('Test Article')).toBeInTheDocument();
    expect(screen.getByText('This is a test summary.')).toBeInTheDocument();
    expect(screen.getByText('3 min read')).toBeInTheDocument();
    expect(screen.getByText('Innovation')).toBeInTheDocument();
  });

  it('opens the modal when "Read Full Article" is clicked', () => {
    render(<ArticleCard article={mockArticle} />);
    
    const readBtn = screen.getByText('Read Full Article');
    fireEvent.click(readBtn);
    
    // The modal should display the full content
    const elements = screen.getAllByText('Full content of the test article.');
    expect(elements.length).toBeGreaterThan(0);
  });
});
