import React, { useMemo } from "react";
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

    const speeches = useMemo(
        () => (data?.pages ?? []).flatMap((page) => page.objects ?? []),
        [data]
    );

    const hasMore = Boolean(
        data?.pages?.length &&
        data.pages[data.pages.length - 1]?.pagination?.next_url !== null
    );

    return (
        <SpeechesContext.Provider value={{
            speeches,
            pages: data?.pages ?? [],
            fetchNextPage,
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