import React, { useCallback, useMemo, useState } from "react";
import { useInfiniteQuery } from "react-query";
import { API_URL, DEFAULT_HEADERS, DEFAULT_QUERY_OPTIONS } from "../config";
import { normalizeSpeech } from "../utils/transcript";

export const SpeechesContext = React.createContext();

const LIMIT = 50;

const fetchSpeeches = async ({ pageParam = 0 }) => {
    const response = await fetch(
        `${API_URL}/speeches/?limit=${LIMIT}&offset=${LIMIT * pageParam}`,
        { headers: DEFAULT_HEADERS }
    );

    if (!response.ok) {
        throw new Error(`Failed to load speeches: ${response.status}`);
    }

    const { pagination, objects = [] } = await response.json();

    return {
        pagination,
        objects: objects
            .map(normalizeSpeech)
            .sort((a, b) => {
                const aId = Number(a.source_id);
                const bId = Number(b.source_id);

                if (!Number.isNaN(aId) && !Number.isNaN(bId)) {
                    return aId - bId;
                }

                return new Date(a.time).getTime() - new Date(b.time).getTime();
            })
    };
};

export const SpeechesProvider = ({ children }) => {
    const {
        data,
        fetchNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error
    } = useInfiniteQuery('speeches', fetchSpeeches, {
        ...DEFAULT_QUERY_OPTIONS,
        getNextPageParam: ({ pagination: { limit, offset, next_url } }) => {
            if (next_url !== null) {
                return offset / limit + 1;
            }
            return null;
        }
    });
    const [manualOlderSpeeches, setManualOlderSpeeches] = useState([]);

    const fetchOlderSpeeches = useCallback(async (beforeDate, startDate = '') => {
        if (!beforeDate) {
            return [];
        }

        const paramMap = new URLSearchParams({
            limit: String(LIMIT),
            time__lte: beforeDate,
        });

        if (startDate) {
            paramMap.set('time__gte', startDate);
        }

        let nextUrl = `${API_URL}/speeches/?${paramMap.toString()}`;
        const accumulated = [];

        while (nextUrl) {
            const response = await fetch(nextUrl, { headers: DEFAULT_HEADERS });

            if (!response.ok) {
                throw new Error(`Failed to load older speeches: ${response.status}`);
            }

            const { objects = [], pagination = {} } = await response.json();
            const normalized = objects
                .map(normalizeSpeech)
                .filter((speech) => {
                    const speechDate = new Date(speech.time).getTime();
                    const before = new Date(beforeDate).getTime();
                    if (Number.isNaN(speechDate) || speechDate >= before) {
                        return false;
                    }

                    if (startDate) {
                        const start = new Date(startDate).getTime();
                        return speechDate >= start;
                    }

                    return true;
                })
                .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

            accumulated.push(...normalized);

            nextUrl = pagination?.next_url
                ? new URL(pagination.next_url, API_URL).toString()
                : null;
        }

        setManualOlderSpeeches((current) => {
            const map = new Map();

            [...current, ...accumulated].forEach((speech) => {
                const key = speech.source_id || `${speech.memberId || 'speech'}-${speech.time}`;
                map.set(key, speech);
            });

            return Array.from(map.values()).sort(
                (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
            );
        });

        return accumulated;
    }, []);

    const baseSpeeches = useMemo(
        () => (data?.pages ?? []).flatMap((page) => page.objects ?? []),
        [data]
    );

    const speeches = useMemo(() => {
        const merged = [...baseSpeeches, ...manualOlderSpeeches];
        const map = new Map();

        merged.forEach((speech) => {
            const key = speech.source_id || `${speech.memberId || 'speech'}-${speech.time}`;
            map.set(key, speech);
        });

        return Array.from(map.values()).sort(
            (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
        );
    }, [baseSpeeches, manualOlderSpeeches]);

    const hasMore = Boolean(
        data?.pages?.length &&
        data.pages[data.pages.length - 1]?.pagination?.next_url !== null
    );

    return (
        <SpeechesContext.Provider value={{
            speeches,
            pages: data?.pages ?? [],
            fetchNextPage,
            fetchOlderSpeeches,
            hasMore,
            isFetchingNextPage,
            isLoading,
            isError,
            error
        }}>
            {children}
        </SpeechesContext.Provider>
    );
};