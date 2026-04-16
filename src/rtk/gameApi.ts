import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
    GameDetails,
    GamePlatform,
    GameSortBy,
    GameSummary,
    GamesByPlatformCategoryQuery,
    GamesByTagQuery
} from '../types/game';

export const gameApi = createApi({
    reducerPath: 'gameApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://www.freetogame.com/api/',
    }),
    endpoints: (builder) => ({
        getGames: builder.query<GameSummary[], void>({
            query: () => 'games',
        }),
        getGameById: builder.query<GameDetails, number>({
            query: (id) => `game?id=${id}`,
        }),
        getGamesByCategory: builder.query<GameSummary[], string>({
            query: (category) => ({
                url: 'games',
                params: { category },
            }),
        }),
        getGamesByPlatform: builder.query<GameSummary[], GamePlatform>({
            query: (platform) => ({
                url: 'games',
                params: { platform },
            }),
        }),
        getGamesSorted: builder.query<GameSummary[], GameSortBy>({
            query: (sortBy) => ({
                url: 'games',
                params: { 'sort-by': sortBy },
            }),
        }),
        getGamesByPlatformCategoryAndSort: builder.query<GameSummary[], GamesByPlatformCategoryQuery>({
            query: ({ platform, category, sortBy }) => ({
                url: 'games',
                params: {
                    ...(platform ? { platform } : {}),
                    ...(category ? { category } : {}),
                    ...(sortBy ? { 'sort-by': sortBy } : {}),
                },
            }),
        }),
        getGamesByTag: builder.query<GameSummary[], GamesByTagQuery>({
            query: ({ tag, platform, sortBy }) => ({
                url: 'filter',
                params: {
                    tag,
                    ...(platform ? { platform } : {}),
                    ...(sortBy ? { sort: sortBy } : {}),
                },
            }),
        }),
    }),
});

export const {
    useGetGamesQuery,
    useGetGameByIdQuery,
    useGetGamesByCategoryQuery,
    useGetGamesByPlatformQuery,
    useGetGamesSortedQuery,
    useGetGamesByPlatformCategoryAndSortQuery,
    useGetGamesByTagQuery,
} = gameApi;