import { render, screen } from '@testing-library/react';
import { SearchContext } from '../../context/SearchContext';
import { MembersContext } from '../../context/MembersContext';
import { SearchResultsPanel } from '../SearchResultsPanel/SearchResultsPanel';
import { Speech } from '../Speech/Speech';
import { SpeechContent } from './SpeechContent';

describe('SpeechContent', () => {
  test('highlights matching text when a search term is present', () => {
    render(
      <SearchContext.Provider value={{ searchString: 'member' }}>
        <SpeechContent>
          One member of the committee spoke on the matter.
        </SpeechContent>
      </SearchContext.Provider>
    );

    const text = screen.getByText(/One/i);
    expect(text).toBeInTheDocument();
    expect(document.querySelectorAll('.highlight').length).toBeGreaterThan(0);
  });

  test('does not filter the transcript view when a search is active', () => {
    render(
      <SearchContext.Provider value={{ searchString: 'budget' }}>
        <MembersContext.Provider value={{ members: [{ id: 'member-1', name: 'Jane Doe' }] }}>
          <Speech
            memberId='member-1'
            attribution='Jane Doe'
            time='2024-01-01'
            content='This speech is about a public health reform.'
          />
        </MembersContext.Provider>
      </SearchContext.Provider>
    );

    expect(screen.getByText(/This speech is about a public health reform/i)).toBeInTheDocument();
  });

  test('highlights the active search term in the results drawer snippet', () => {
    render(
      <SearchContext.Provider value={{ searchString: 'tax', setSearchOpen: jest.fn() }}>
        <SearchResultsPanel
          results={[
            {
              id: 'result-1',
              memberName: 'Jane Doe',
              time: '2024-01-01',
              snippet: 'This speech is about tax reform.'
            }
          ]}
          onSelect={() => {}}
        />
      </SearchContext.Provider>
    );

    const highlight = document.querySelector('.SearchResultsPanel-snippet .highlight');
    expect(highlight).toBeInTheDocument();
    expect(highlight).toHaveTextContent('tax');
  });

  test('shows an empty state when there are no search results', () => {
    render(
      <SearchContext.Provider value={{ searchString: 'zzz', setSearchOpen: jest.fn() }}>
        <SearchResultsPanel results={[]} onSelect={() => {}} />
      </SearchContext.Provider>
    );

    expect(screen.getByText(/No results found/i)).toBeInTheDocument();
  });
});
