import React, { useCallback, useContext, useEffect, useRef } from "react";
import { SpeechesContext } from "../../context/SpeechesContext";
import { SearchBar } from "../SearchBar/SearchBar";
import { Speech } from "../Speech/Speech";
import './Main.scss';

export const Main = () => {
    const topRef = useRef(null);
    const bottomRef = useRef(null);
    const pageRef = useRef(null);
    const { pages = [], fetchNextPage, isFetchingNextPage } = useContext(SpeechesContext);
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

    return (
        <div className="Main">
            <SearchBar />
            <div className="Main-scroll">
                <div ref={topRef}>{isFetchingNextPage ? ' Loading...' : ''}</div>
                {pages.map((page, p) => (
                    <div key={p}>
                        {page.objects.map((speech, i) => (
                            <Speech key={`${p}-${i}`} {...speech} />
                        ))}
                        {p === 0 && <div ref={pageRef}></div>}
                    </div>
                ))}
                <div ref={bottomRef}></div>
            </div>
        </div>
    );
};