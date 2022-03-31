import React from "react";
import { useInfiniteQuery } from "react-query";
import { API_URL, DEFAULT_HEADERS, DEFAULT_QUERY_OPTIONS } from "../config";

export const SpeechesContext = React.createContext();

const LIMIT = 50;

const fetchSpeeches = async ({ pageParam = 0 }) => {
    const response = await fetch(
        `${API_URL}/speeches/?limit=${LIMIT}&offset=${LIMIT * pageParam}`,
        { headers: DEFAULT_HEADERS }
    );
    const { pagination, objects } = await response.json();

    return {
        pagination,
        objects: objects.reverse().map(({attribution, h1, h2, content, politician_url, ...rest}) => ({
            ...rest,
            attribution: attribution.en,
            memberId: politician_url?.split('/')[2],
            content: content?.en.replace(/<.*?>/g, ""),
            title: h1?.en,
            subtitle: h2?.en
        }))
    };
};

export const SpeechesProvider = ({ children }) => {
    const { 
        data, 
        fetchNextPage,
        isFetchingNextPage
    } = useInfiniteQuery('speeches', fetchSpeeches, {
        ...DEFAULT_QUERY_OPTIONS,
        getNextPageParam: ({ pagination: { limit, offset, next_url } }) => {
            if (next_url !== null) {
                return offset/limit + 1;
            }
            return null;
        }
    });

    return (
        <SpeechesContext.Provider value={{
            pages: data?.pages.reduce((a, c) => ([c, ...a]), []),
            fetchNextPage,
            isFetchingNextPage
        }}>
            {children}
        </SpeechesContext.Provider>
    );
};