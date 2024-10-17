import {
	keepPreviousData,
	Mutation,
	QueryFunction,
	queryOptions,
	useMutation,
	useMutationState,
	useQueries,
	useQuery,
	useQueryClient,
	UseQueryResult,
} from '@tanstack/react-query';
import useBahaPostMetadata from './useBahaPostMetadata';
import {
	apiGetAllComments,
	apiGetCommentsInPaginations,
	apiGetPostDetail,
	apiPostComment,
} from '../helpers/api.helper';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { generateRandomId } from '../utils/string.util';
import { TBahaComment } from '../types';

const COMMENT_PAGES_MAX = 2;

const fetchComments: QueryFunction<
	Awaited<ReturnType<typeof apiGetCommentsInPaginations>>,
	[unknown, ReturnType<typeof useBahaPostMetadata> | null, unknown, number]
> = async ({ queryKey }) =>
	apiGetCommentsInPaginations(
		queryKey[1]?.gsn as string,
		queryKey[1]?.sn as string,
		queryKey[3]
	);

function commentPageQueryOptions(
	postMetadata: ReturnType<typeof useBahaPostMetadata>,
	page: number,
	totalPagesCount: number,
	staleTime: number
) {
	return queryOptions({
		queryKey: ['post', postMetadata, 'comments', page + 1],
		queryFn: fetchComments,
		staleTime: staleTime,
		refetchInterval: staleTime,
		refetchIntervalInBackground: true,
		enabled: !!postMetadata && page >= totalPagesCount - COMMENT_PAGES_MAX,
		placeholderData: keepPreviousData,
	});
}

function combineResult(
	results: UseQueryResult<
		Awaited<ReturnType<typeof apiGetCommentsInPaginations>>,
		Error
	>[]
) {
	const allValidResuits = results.filter((result) => !!result.data);
	if (
		allValidResuits.length === 0 ||
		allValidResuits[0].data.commentCount === 0
	) {
		return {
			fetchedComments: [],
			latestCommentId: undefined,
			totalPage: 0,
			commentCount: 0,
		};
	}

	const fetchedComments = allValidResuits
		.map((result) =>
			result.data.comments.map((comment) => ({
				...comment,
			}))
		)
		.flat();
	const latestCommentPage = allValidResuits.slice(-1)[0].data;

	return {
		fetchedComments,
		latestComment: fetchedComments.slice(-1)[0],
		totalPage: latestCommentPage.totalPage,
		commentCount: latestCommentPage.commentCount,
	};
}

export default function useBahaPostAndComments(options?: {
	refreshInterval?: number;
}) {
	const postMetadata = useBahaPostMetadata();
	const queryClient = useQueryClient();

	const { data: post, isLoading: isLoadingPost } = useQuery({
		queryKey: ['post', postMetadata],
		queryFn: () =>
			apiGetPostDetail(postMetadata?.gsn as string, postMetadata?.sn as string),
		enabled: !!postMetadata,
	});

	const [cachedTotalPage, setCachedTotalPage] = useState<number>(0);
	const { fetchedComments, totalPage, latestComment, commentCount } =
		useQueries({
			queries: Array.from({ length: cachedTotalPage }, (_, page) =>
				commentPageQueryOptions(
					postMetadata,
					page,
					cachedTotalPage,
					options?.refreshInterval ?? 0
				)
			),
			combine: combineResult,
		});

	const isLoading = useMemo(
		() => isLoadingPost || cachedTotalPage === 0,
		[isLoadingPost, cachedTotalPage]
	);

	useEffect(() => {
		if (postMetadata && cachedTotalPage === 0) {
			apiGetAllComments(postMetadata.gsn, postMetadata.sn).then(
				(commentPages) => {
					commentPages.forEach((commentPage, page) => {
						queryClient.setQueryData(
							['post', postMetadata, 'comments', page + 1],
							() => commentPage
						);
					});

					setCachedTotalPage(commentPages[0]?.totalPage ?? 1);
				}
			);
		}
	}, [postMetadata, queryClient, cachedTotalPage]);

	useEffect(() => {
		setCachedTotalPage(totalPage);
	}, [totalPage]);

	const createCommentFn = useCallback(
		(variables: Pick<TBahaComment, 'id' | 'text'>) => {
			return apiPostComment(
				postMetadata!.gsn,
				postMetadata!.sn,
				variables.text
			);
		},
		[postMetadata]
	);

	/**
	 * Mutations
	 */
	const createCommentMutationKey = useMemo(
		() => ['post', postMetadata, 'createComment'] as const,
		[postMetadata]
	);
	const createCommentMutationFilter = useMemo(
		() => ({
			mutationKey: createCommentMutationKey,
		}),
		[createCommentMutationKey]
	);
	const createCommentSelect = useCallback(
		(mutation: Mutation) => ({
			variables: mutation.state.variables,
			status: mutation.state.status,
			error: mutation.state.error,
		}),
		[]
	);

	const allMutationComments = useMutationState({
		filters: createCommentMutationFilter,
		select: createCommentSelect,
	});
	const pendingMutations = useMemo(
		() => allMutationComments.filter(({ status }) => status !== 'success'),
		[allMutationComments]
	);

	const {
		mutateAsync: createCommentInternal,
		status: createCommentStatus,
		error: createCommentError,
	} = useMutation({
		mutationFn: createCommentFn,
		mutationKey: createCommentMutationKey,
		onSuccess: (newComment) => {
			queryClient.setQueryData(
				['post', postMetadata, 'comments', totalPage],
				(prev: Awaited<ReturnType<typeof apiGetCommentsInPaginations>>) => ({
					...prev,
					commentCount: prev.commentCount + 1,
					comments: [
						...prev.comments,
						{ ...newComment, position: prev.commentCount + 1 },
					],
				})
			);
		},
		scope: {
			id: 'createComment',
		},
	});

	const createComment = useCallback(
		(text: string) => {
			createCommentInternal({ id: generateRandomId(), text });
		},
		[createCommentInternal]
	);

	return {
		post,
		postMetadata,
		fetchedComments,
		latestComment,
		commentCount,
		pendingMutations,
		isLoading,
		createComment,
		createCommentStatus,
		createCommentError,
	};
}
