import React, { useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { MembersContext } from "../../context/MembersContext";
import { SearchContext } from "../../context/SearchContext";
import { SpeechesContext } from "../../context/SpeechesContext";
import { buildTranscriptIndex } from "../../utils/search";
import { SearchBar } from "../SearchBar/SearchBar";
import { SearchResultsPanel } from "../SearchResultsPanel/SearchResultsPanel";
import { Speech } from "../Speech/Speech";
import './Main.scss';

export const Main = () => {
    const topRef = useRef(null);
    const bottomRef = useRef(null);
    const pageRef = useRef(null);
    const speechRefs = useRef({});
    const { speeches = [], pages = [], fetchNextPage, isFetchingNextPage, isLoading, isError, error } = useContext(SpeechesContext);
    const { members = [] } = useContext(MembersContext);
    const { searchString, selectedParty } = useContext(SearchContext);
    const firstScroll = useRef(true);
    const disableScroll = useRef(false);

    const handleScrollToTop = useCallback(() => {
        if (disableScroll.current === true) return;

        if(firstScroll.current === false) {
            const pageEl = pageRef.current;
            fetchNextPage().then(() => {
                disableScroll.current = true;
                pageEl?.scrollIntoView();
                setTimeout(() => {
                    disableScroll.current = false;
                }, 100);
            });
        }
    }, [fetchNextPage, firstScroll]);

    useEffect(() => {
        const bottomEl = bottomRef.current;

        if (bottomEl && firstScroll.current && pages.length) {
            bottomEl.scrollIntoView();
            setTimeout(() => {
                firstScroll.current = false;
            }, 100);
        }
    }, [pages, bottomRef]);

    useEffect(() => {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 1.0
        };

        const observer = new IntersectionObserver(handleScrollToTop, options);
        const topEl = topRef.current;
        if (topEl) observer.observe(topEl);

        return () => {
            if (topEl) observer.unobserve(topEl);
        };
    }, [handleScrollToTop]);

    const matchingSpeeches = useMemo(
        () => buildTranscriptIndex(speeches, members, searchString, selectedParty),
        [members, speeches, searchString, selectedParty]
    );

    const shouldShowResultsPanel = Boolean(searchString.trim()) || selectedParty !== 'all';

    if (isError) {
        return (
            <div className="Main">
                <SearchBar />
                <div className="Main-scroll Main-empty">
                    <p>We couldn’t load the latest speeches.</p>
                    <small>{error?.message || 'Please try again in a moment.'}</small>
                </div>
            </div>
        );
    }

    const handleSelectResult = (speechId) => {
        const target = speechRefs.current[speechId];
        if (!target) {
            return;
        }

        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    return (
        <div className="Main">
            <SearchBar />
            <div className="Main-shell">
                <div className="Main-scroll">
                    <div ref={topRef}>{isFetchingNextPage || isLoading ? ' Loading...' : ''}</div>
                    {speeches.length === 0 && isLoading ? (
                        <div className="Main-empty">Loading speeches...</div>
                    ) : null}
                    {speeches.map((speech, index) => (
                        <Speech
                            key={speech.source_id || `${speech.memberId || 'speech'}-${speech.time || index}`}
                            ref={(node) => {
                                const resultId = speech.source_id || `${speech.memberId || 'speech'}-${speech.time || index}`;
                                speechRefs.current[resultId] = node;
                            }}
                            {...speech}
                        />
                    ))}
                    {pages.length === 0 && <div ref={pageRef}></div>}
                    <div ref={bottomRef}></div>
                </div>
                {shouldShowResultsPanel && (
                    <SearchResultsPanel
                        results={matchingSpeeches}
                        onSelect={handleSelectResult}
                    />
                )}
            </div>
        </div>
    );
};