import React from "react";
import { useQuery } from "react-query";
import { API_URL, DEFAULT_HEADERS, DEFAULT_QUERY_OPTIONS } from "../config";

export const MembersContext = React.createContext();

const getMembers = async () => {
    const response = await fetch(`${API_URL}/politicians/`, { headers: DEFAULT_HEADERS });
    const json = await response.json();

    return json.objects.map(({ name, url, image, current_party, current_riding }) => ({
        name, url, image,
        id: url.split("/")[2],
        party: current_party?.short_name?.en,
        riding: current_riding?.name?.en,
        province: current_riding?.province,
    }));
};

export const MembersProvider = ({ children }) => {
    const { isLoading, data } = useQuery("members", getMembers, DEFAULT_QUERY_OPTIONS);

    return (
        <MembersContext.Provider value={{
            isLoading,
            members: data
        }}>
            {children}
        </MembersContext.Provider>
    );
};