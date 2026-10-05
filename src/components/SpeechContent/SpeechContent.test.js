import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { SearchContext, SearchProvider } from '../../context/SearchContext';
import { MembersContext } from '../../context/MembersContext';
import { SpeechesContext } from '../../context/SpeechesContext';
import { SearchResultsPanel } from '../SearchResultsPanel/SearchResultsPanel';
import { Main } from '../Main/Main';
import { SearchBar } from '../SearchBar/SearchBar';
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
        <SearchResultsPanel results={[]} onSelect={() => {}} hasMore={false} />
      </SearchContext.Provider>
    );

    expect(screen.getByText(/No results found/i)).toBeInTheDocument();
  });

  test('preloads the date range from the currently loaded transcript dates', () => {
    const StatefulSearchBar = () => {
      const [searchOpen, setSearchOpen] = React.useState(true);
      const [searchString, setSearchString] = React.useState('');
      const [searchDraft, setSearchDraft] = React.useState('');
      const [selectedParty, setSelectedParty] = React.useState('all');
      const [dateRange, setDateRange] = React.useState({ startDate: '', endDate: '' });

      const value = {
        searchString,
        setSearchString,
        searchDraft,
        setSearchDraft,
        clearSearchString: () => {
          setSearchString('');
          setSearchDraft('');
        },
        applySearch: () => setSearchString(searchDraft.trim()),
        selectedParty,
        setSelectedParty,
        clearSelectedParty: () => setSelectedParty('all'),
        searchOpen,
        setSearchOpen,
        dateRange,
        setDateRange,
        clearDateRange: () => setDateRange({ startDate: '', endDate: '' }),
      };

      return (
        <SearchContext.Provider value={value}>
          <SpeechesContext.Provider value={{ speeches: [
            { time: '2026-09-25 12:15:00' },
            { time: '2026-09-20 09:00:00' },
          ] }}>
            <SearchBar />
          </SpeechesContext.Provider>
        </SearchContext.Provider>
      );
    };

    render(<StatefulSearchBar />);

    expect(screen.getByLabelText(/from/i)).toHaveValue('2026-09-20');
    expect(screen.getByLabelText(/to/i)).toHaveValue('2026-09-25');
  });

  test('requires an explicit search action instead of running on each keystroke', () => {
    const StatefulSearchBar = () => {
      const [searchOpen, setSearchOpen] = React.useState(true);
      const [searchString, setSearchString] = React.useState('');
      const [searchDraft, setSearchDraft] = React.useState('');
      const [selectedParty, setSelectedParty] = React.useState('all');
      const [dateRange, setDateRange] = React.useState({ startDate: '2026-09-20', endDate: '2026-09-25' });

      const value = {
        searchString,
        setSearchString,
        searchDraft,
        setSearchDraft,
        clearSearchString: () => {
          setSearchString('');
          setSearchDraft('');
        },
        applySearch: () => setSearchString(searchDraft.trim()),
        selectedParty,
        setSelectedParty,
        clearSelectedParty: () => setSelectedParty('all'),
        searchOpen,
        setSearchOpen,
        dateRange,
        setDateRange,
        clearDateRange: () => setDateRange({ startDate: '', endDate: '' }),
      };

      return (
        <SearchContext.Provider value={value}>
          <SearchBar />
          <div data-testid="applied-query">{searchString || 'none'}</div>
        </SearchContext.Provider>
      );
    };

    render(<StatefulSearchBar />);

    const input = screen.getByLabelText(/search speeches/i);
    fireEvent.change(input, { target: { value: 'budget' } });

    expect(screen.getByTestId('applied-query')).toHaveTextContent('none');

    fireEvent.click(screen.getByRole('button', { name: /^Search$/i }));

    expect(screen.getByTestId('applied-query')).toHaveTextContent('budget');
    expect(input).toHaveValue('budget');
  });

  test('offers a way to search older archive entries when there are still more pages', () => {
    render(
      <SearchContext.Provider value={{ searchString: 'zzz', setSearchOpen: jest.fn() }}>
        <SearchResultsPanel
          results={[]}
          onSelect={() => {}}
          onLoadMore={() => {}}
          hasMore={true}
        />
      </SearchContext.Provider>
    );

    expect(screen.getByRole('button', { name: /expand date range/i })).toBeInTheDocument();
  });

  test('does not show the old date metadata line in the results panel', () => {
    render(
      <SearchContext.Provider value={{ searchString: 'budget', setSearchOpen: jest.fn() }}>
        <SearchResultsPanel
          results={[]}
          onSelect={() => {}}
          onLoadMore={() => {}}
          hasMore={true}
          earliestAvailableDate='2024-03-12'
        />
      </SearchContext.Provider>
    );

    expect(screen.queryByText(/current search starts from/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/mar 12, 2024/i)).not.toBeInTheDocument();
  });

  test('shows an explicit loading state while expanding the date range', () => {
    render(
      <SearchContext.Provider value={{ searchString: 'budget', setSearchOpen: jest.fn() }}>
        <SearchResultsPanel
          results={[]}
          onSelect={() => {}}
          onLoadMore={() => {}}
          hasMore={true}
          isLoadingMore={true}
          earliestAvailableDate='2024-03-12'
        />
      </SearchContext.Provider>
    );

    expect(screen.getByRole('status')).toHaveTextContent(/searching earlier speeches/i);
    expect(screen.getByText(/expanding the date range/i)).toBeInTheDocument();
  });

  test('opens the search panel when the user wants to expand the date range', async () => {
    const fetchOlderSpeeches = jest.fn(() => Promise.resolve());
    const setSearchOpen = jest.fn();

    render(
      <SearchContext.Provider value={{
        searchString: 'budget',
        selectedParty: 'all',
        setSearchOpen,
      }}>
        <MembersContext.Provider value={{ members: [] }}>
          <SpeechesContext.Provider
            value={{
              speeches: [{ time: '2026-09-25 12:15:00', content: 'This speech mentions the budget.', attribution: 'Jane Doe', memberId: 'm1' }],
              pages: [{ pagination: { next_url: 'next' } }],
              fetchNextPage: jest.fn(),
              fetchOlderSpeeches,
              hasMore: true,
              isFetchingNextPage: false,
              isLoading: false,
              isError: false,
              error: null,
            }}
          >
            <Main />
          </SpeechesContext.Provider>
        </MembersContext.Provider>
      </SearchContext.Provider>
    );

    fireEvent.click(screen.getAllByRole('button', { name: /expand date range/i })[0]);

    await waitFor(() => {
      expect(setSearchOpen).toHaveBeenCalledWith(true);
    });
    expect(fetchOlderSpeeches).not.toHaveBeenCalled();
  });

  test('loads older speeches when the active date range extends beyond the loaded archive', async () => {
    const fetchOlderSpeeches = jest.fn(() => Promise.resolve());

    render(
      <SearchContext.Provider value={{
        searchString: 'Davenport',
        selectedParty: 'all',
        dateRange: { startDate: '2025-01-01', endDate: '2026-09-25' },
        hasAppliedSearch: true,
        setSearchOpen: jest.fn(),
      }}>
        <MembersContext.Provider value={{ members: [] }}>
          <SpeechesContext.Provider
            value={{
              speeches: [{ time: '2026-09-25 12:15:00', content: 'This speech mentions Davenport.', attribution: 'Jane Doe', memberId: 'm1' }],
              pages: [{ pagination: { next_url: 'next' } }],
              fetchNextPage: jest.fn(),
              fetchOlderSpeeches,
              hasMore: true,
              isFetchingNextPage: false,
              isLoading: false,
              isError: false,
              error: null,
            }}
          >
            <Main />
          </SpeechesContext.Provider>
        </MembersContext.Provider>
      </SearchContext.Provider>
    );

    await waitFor(() => {
      expect(fetchOlderSpeeches).toHaveBeenCalledWith('2026-09-25', '2025-01-01');
    });
  });

  test('offers a look for previous sittings action in the date bar when more archive pages remain', () => {
    render(
      <SearchContext.Provider value={{ searchString: '', selectedParty: 'all', setSearchOpen: jest.fn() }}>
        <MembersContext.Provider value={{ members: [] }}>
          <SpeechesContext.Provider
            value={{
              speeches: [{ time: '2026-09-25 12:15:00', content: 'Example', attribution: 'Jane Doe', memberId: 'm1' }],
              pages: [{ pagination: { next_url: 'next' } }],
              fetchNextPage: jest.fn(),
              hasMore: true,
              isFetchingNextPage: false,
              isLoading: false,
              isError: false,
              error: null,
            }}
          >
            <Main />
          </SpeechesContext.Provider>
        </MembersContext.Provider>
      </SearchContext.Provider>
    );

    expect(screen.getByRole('button', { name: /expand date range/i })).toBeInTheDocument();
  });

  test('shows the active search date range in the date bar', () => {
    render(
      <SearchContext.Provider value={{
        searchString: 'budget',
        selectedParty: 'all',
        dateRange: { startDate: '2026-09-20', endDate: '2026-09-25' },
        hasAppliedSearch: true,
        setSearchOpen: jest.fn(),
      }}>
        <MembersContext.Provider value={{ members: [] }}>
          <SpeechesContext.Provider
            value={{
              speeches: [
                { time: '2026-09-25 12:15:00', content: 'Budget speech', attribution: 'Jane Doe', memberId: 'm1' },
                { time: '2026-09-20 09:00:00', content: 'Budget speech', attribution: 'Jane Doe', memberId: 'm2' },
              ],
              pages: [{ pagination: { next_url: 'next' } }],
              fetchNextPage: jest.fn(),
              hasMore: false,
              isFetchingNextPage: false,
              isLoading: false,
              isError: false,
              error: null,
            }}
          >
            <Main />
          </SpeechesContext.Provider>
        </MembersContext.Provider>
      </SearchContext.Provider>
    );

    expect(screen.getByText(/search window/i)).toBeInTheDocument();
    expect(screen.getByText(/sep 20, 2026.*sep 25, 2026/i)).toBeInTheDocument();
  });

  test('does not open the results drawer when the date range changes without a search term', () => {
    render(
      <SearchContext.Provider value={{
        searchString: '',
        selectedParty: 'all',
        dateRange: { startDate: '2026-09-20', endDate: '2026-09-25' },
        hasAppliedSearch: true,
        setSearchOpen: jest.fn(),
      }}>
        <MembersContext.Provider value={{ members: [] }}>
          <SpeechesContext.Provider
            value={{
              speeches: [
                { time: '2026-09-25 12:15:00', content: 'Budget speech', attribution: 'Jane Doe', memberId: 'm1' },
                { time: '2026-09-20 09:00:00', content: 'Budget speech', attribution: 'Jane Doe', memberId: 'm2' },
              ],
              pages: [{ pagination: { next_url: 'next' } }],
              fetchNextPage: jest.fn(),
              hasMore: false,
              isFetchingNextPage: false,
              isLoading: false,
              isError: false,
              error: null,
            }}
          >
            <Main />
          </SpeechesContext.Provider>
        </MembersContext.Provider>
      </SearchContext.Provider>
    );

    expect(screen.queryByText(/search results/i)).not.toBeInTheDocument();
  });

  test('shows a full transcript loading overlay while a search is running', () => {
    render(
      <SearchContext.Provider value={{
        searchString: 'budget',
        selectedParty: 'all',
        dateRange: { startDate: '2026-09-20', endDate: '2026-09-25' },
        hasAppliedSearch: true,
        isSearchLoading: true,
        setSearchOpen: jest.fn(),
      }}>
        <MembersContext.Provider value={{ members: [] }}>
          <SpeechesContext.Provider
            value={{
              speeches: [
                { time: '2026-09-25 12:15:00', content: 'Budget speech', attribution: 'Jane Doe', memberId: 'm1' },
                { time: '2026-09-20 09:00:00', content: 'Budget speech', attribution: 'Jane Doe', memberId: 'm2' },
              ],
              pages: [{ pagination: { next_url: 'next' } }],
              fetchNextPage: jest.fn(),
              hasMore: false,
              isFetchingNextPage: false,
              isLoading: false,
              isError: false,
              error: null,
            }}
          >
            <Main />
          </SpeechesContext.Provider>
        </MembersContext.Provider>
      </SearchContext.Provider>
    );

    expect(screen.getByRole('status')).toHaveTextContent(/searching speeches/i);
  });

  test('disables the search button while speech data is still loading', () => {
    const StatefulSearchBar = () => {
      const [searchOpen, setSearchOpen] = React.useState(true);
      const [searchDraft, setSearchDraft] = React.useState('budget');
      const [dateRangeDraft, setDateRangeDraft] = React.useState({ startDate: '2026-09-20', endDate: '2026-09-25' });

      return (
        <SearchContext.Provider value={{
          searchDraft,
          setSearchDraft,
          searchString: '',
          setSearchString: jest.fn(),
          clearSearchString: jest.fn(),
          applySearch: jest.fn(),
          selectedParty: 'all',
          setSelectedParty: jest.fn(),
          clearSelectedParty: jest.fn(),
          dateRange: { startDate: '2026-09-20', endDate: '2026-09-25' },
          dateRangeDraft,
          setDateRangeDraft,
          clearDateRange: jest.fn(),
          searchOpen,
          setSearchOpen,
        }}>
          <SpeechesContext.Provider value={{ speeches: [], isLoading: true, isFetchingNextPage: false }}>
            <SearchBar />
          </SpeechesContext.Provider>
        </SearchContext.Provider>
      );
    };

    render(<StatefulSearchBar />);

    expect(screen.getByRole('button', { name: /^Search$/i })).toBeDisabled();
  });

  test('closes the search pop-up when interacting with the results drawer', () => {
    const setSearchOpen = jest.fn();

    render(
      <SearchContext.Provider value={{ searchString: 'tax', setSearchOpen }}>
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

    fireEvent.click(document.querySelector('.SearchResultsPanel'));

    expect(setSearchOpen).toHaveBeenCalledWith(false);
  });
});
