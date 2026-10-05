import { render, screen } from '@testing-library/react';
import { SpeechContent } from './SpeechContent';
import { SearchContext } from '../../context/SearchContext';

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
});
