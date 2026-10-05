import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { MembersContext } from "../../context/MembersContext";
import { SearchContext } from "../../context/SearchContext";
import { SpeechesContext } from "../../context/SpeechesContext";
import { buildTranscriptIndex } from "../../utils/search";
import { formatDisplayDate, formatShortDate, getDateKey, getMeetingDates } from "../../utils/dateUtils";
import { SearchBar } from "../SearchBar/SearchBar";
import { SearchResultsPanel } from "../SearchResultsPanel/SearchResultsPanel";
import { Speech } from "../Speech/Speech";
import './Main.scss';

const getSpeechKey = (speech, index) => speech?.source_id || `${speech?.memberId || 'speech'}-${speech?.time || index}`;

export const Main = () => {
    const topRef = useRef(null);
    const bottomRef = useRef(null);
    const pageRef = useRef(null);
    const scrollRef = useRef(null);
    const speechRefs = useRef({});
    const { speeches = [], pages = [], fetchNextPage, fetchOlderSpeeches, hasMore, isFetchingNextPage, isLoading, isError, error } = useContext(SpeechesContext);
    const { members = [] } = useContext(MembersContext);
    const {
        searchString,
        selectedParty,
        dateRange = { startDate: '', endDate: '' },
        setSearchOpen,
        isSearchLoading,
        setIsSearchLoading,
    } = useContext(SearchContext);
    const firstScroll = useRef(true);
    const disableScroll = useRef(false);
    const speechesRef = useRef(speeches);
    const membersRef = useRef(members);
    const lastRequestedArchiveDate = useRef('');
    const isMountedRef = useRef(true);
    const [isLoadingOlderResults, setIsLoadingOlderResults] = useState(false);
    const [activeDate, setActiveDate] = useState('');

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        lastRequestedArchiveDate.current = '';
    }, [dateRange.startDate, searchString]);

    useEffect(() => {
        speechesRef.current = speeches;
    }, [speeches]);

    useEffect(() => {
        membersRef.current = members;
    }, [members]);

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

        if (bottomEl && typeof bottomEl.scrollIntoView === 'function' && firstScroll.current && pages.length) {
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

    const meetingDates = useMemo(() => getMeetingDates(speeches), [speeches]);
    const visibleMeetingDates = useMemo(() => [...meetingDates].reverse(), [meetingDates]);

    const activeRangeLabel = useMemo(() => {
        const startDate = dateRange?.startDate || meetingDates[meetingDates.length - 1] || '';
        const endDate = dateRange?.endDate || activeDate || meetingDates[0] || '';

        if (!startDate && !endDate) {
            return 'Latest session';
        }

        if (startDate && endDate && startDate !== endDate) {
            return `${formatDisplayDate(startDate)} – ${formatDisplayDate(endDate)}`;
        }

        return formatDisplayDate(startDate || endDate);
    }, [activeDate, dateRange, meetingDates]);

    const dateMap = useMemo(() => {
        const map = {};

        speeches.forEach((speech, index) => {
            const dateKey = getDateKey(speech?.time);
            if (!dateKey || map[dateKey]) return;

            map[dateKey] = { speech, index };
        });

        return map;
    }, [speeches]);

    const matchingSpeeches = useMemo(
        () => buildTranscriptIndex(speeches, members, searchString, selectedParty, dateRange),
        [members, speeches, searchString, selectedParty, dateRange]
    );

    const earliestLoadedDate = useMemo(() => meetingDates[meetingDates.length - 1] || '', [meetingDates]);
    const isTranscriptBusy = Boolean(isLoading || isFetchingNextPage || isLoadingOlderResults || isSearchLoading);

    const shouldShowResultsPanel = Boolean(searchString.trim());

    const updateActiveDate = useCallback(() => {
        if (!scrollRef.current || !meetingDates.length) {
            return;
        }

        const container = scrollRef.current;
        const containerTop = container.getBoundingClientRect().top;
        const targetOffset = container.clientHeight * 0.18;
        let closestDate = meetingDates[0];
        let closestDistance = Number.POSITIVE_INFINITY;

        meetingDates.forEach((dateKey) => {
            const speechRef = speechRefs.current[getSpeechKey(dateMap[dateKey]?.speech, dateMap[dateKey]?.index)];
            if (!speechRef) {
                return;
            }

            const rect = speechRef.getBoundingClientRect();
            const distance = Math.abs((rect.top - containerTop) - targetOffset);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestDate = dateKey;
            }
        });

        setActiveDate(closestDate);
    }, [dateMap, meetingDates]);

    const handleLoadOlderResults = useCallback(async () => {
        if (isFetchingNextPage || isLoadingOlderResults || isSearchLoading) {
            return;
        }

        const dates = getMeetingDates(speechesRef.current);
        const oldestLoadedDate = dates[dates.length - 1];

        if (!oldestLoadedDate || typeof fetchOlderSpeeches !== 'function') {
            return;
        }

        if (lastRequestedArchiveDate.current === oldestLoadedDate) {
            return;
        }

        lastRequestedArchiveDate.current = oldestLoadedDate;
        setIsLoadingOlderResults(true);
        if (typeof setIsSearchLoading === 'function') {
            setIsSearchLoading(true);
        }

        try {
            const startDate = dateRange?.startDate || '';
            if (startDate) {
                await fetchOlderSpeeches(oldestLoadedDate, startDate);
            } else {
                await fetchOlderSpeeches(oldestLoadedDate);
            }
        } finally {
            if (isMountedRef.current) {
                setIsLoadingOlderResults(false);
            }
            if (typeof setIsSearchLoading === 'function') {
                setIsSearchLoading(false);
            }
        }
    }, [dateRange, fetchOlderSpeeches, isFetchingNextPage, isLoadingOlderResults, isSearchLoading, setIsSearchLoading]);

    useEffect(() => {
        if (!dateRange?.startDate || !earliestLoadedDate || !hasMore || !fetchOlderSpeeches) {
            return;
        }

        const shouldExpandArchiveToCoverRange =
            Date.parse(earliestLoadedDate) > Date.parse(dateRange.startDate) &&
            !isFetchingNextPage &&
            !isLoadingOlderResults &&
            lastRequestedArchiveDate.current !== earliestLoadedDate;

        if (!shouldExpandArchiveToCoverRange) {
            return;
        }

        handleLoadOlderResults();
    }, [dateRange, earliestLoadedDate, fetchOlderSpeeches, handleLoadOlderResults, hasMore, isFetchingNextPage, isLoadingOlderResults]);

    useEffect(() => {
        if (!meetingDates.length) {
            setActiveDate('');
            return;
        }

        if (!activeDate || !meetingDates.includes(activeDate)) {
            setActiveDate(meetingDates[0]);
            return;
        }

        updateActiveDate();
    }, [activeDate, meetingDates, updateActiveDate]);

    const handleOpenSearch = useCallback(() => {
        if (typeof setSearchOpen === 'function') {
            setSearchOpen(true);
        }
    }, [setSearchOpen]);

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
        if (!target || typeof target.scrollIntoView !== 'function') {
            return;
        }

        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const jumpToDate = (dateKey) => {
        const targetSpeech = dateMap[dateKey]?.speech;
        if (!targetSpeech || !scrollRef.current) {
            return;
        }

        const targetId = getSpeechKey(targetSpeech, dateMap[dateKey]?.index);
        const targetNode = speechRefs.current[targetId];
        if (!targetNode) {
            return;
        }

        const container = scrollRef.current;
        const containerRect = container.getBoundingClientRect();
        const nodeRect = targetNode.getBoundingClientRect();
        const offset = nodeRect.top - containerRect.top - 80;

        container.scrollBy({
            top: offset,
            behavior: 'smooth',
        });

        setActiveDate(dateKey);
    };

    return (
        <div className="Main">
            <SearchBar />
            <div className="Main-shell">
                <div className="Main-scroll" ref={scrollRef} onScroll={updateActiveDate}>
                    {isTranscriptBusy && (
                        <div className='Main-transcriptLoading' role='status' aria-live='polite'>
                            <span className='Main-transcriptSpinner' aria-hidden='true' />
                            <strong>Searching speeches…</strong>
                        </div>
                    )}
                    <div className='Main-dateNavigator'>
                        {hasMore && (
                            <button
                                type='button'
                                className='Main-dateLoadMore'
                                onClick={handleOpenSearch}
                                disabled={isLoadingOlderResults || isFetchingNextPage}
                                aria-label='Expand date range'
                            >
                                {isLoadingOlderResults || isFetchingNextPage ? 'Loading previous sittings...' : 'Look for previous sittings'}
                            </button>
                        )}
                        <div className='Main-dateBubble' aria-label='Current search window'>
                            <span className='Main-dateBubbleLabel'>Search window</span>
                            <strong>{activeRangeLabel}</strong>
                        </div>
                        {visibleMeetingDates.length > 0 && (
                            <div className='Main-dateRail' role='tablist' aria-label='Parliament sitting dates'>
                                {visibleMeetingDates.map((dateKey) => (
                                    <button
                                        key={dateKey}
                                        type='button'
                                        className={`Main-dateChip ${activeDate === dateKey ? 'is-active' : ''}`}
                                        onClick={() => jumpToDate(dateKey)}
                                        aria-label={`Jump to ${formatDisplayDate(dateKey)}`}
                                    >
                                        {formatShortDate(dateKey)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div ref={topRef}>{isFetchingNextPage || isLoading ? ' Loading...' : ''}</div>
                    {speeches.length === 0 && isLoading ? (
                        <div className="Main-empty">Loading speeches...</div>
                    ) : null}
                    {speeches.map((speech, index) => (
                        <Speech
                            key={getSpeechKey(speech, index)}
                            ref={(node) => {
                                speechRefs.current[getSpeechKey(speech, index)] = node;
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
                        hasMore={hasMore && Boolean(searchString.trim())}
                        onLoadMore={handleLoadOlderResults}
                        isLoadingMore={isLoadingOlderResults || isFetchingNextPage}
                        earliestAvailableDate={meetingDates[meetingDates.length - 1] || ''}
                    />
                )}
            </div>
        </div>
    );
};