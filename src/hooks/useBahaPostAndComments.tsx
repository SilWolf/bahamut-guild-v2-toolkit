import {
	keepPreviousData,
	QueryFunction,
	queryOptions,
	useMutation,
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
	BahaComment,
} from '../helpers/api.helper';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { generateRandomId } from '../utils/string.util';

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

const createCommentFn = (variables: {
	gsn: string;
	sn: string;
	text: string;
	id: string;
}) => {
	return apiPostComment(variables.gsn, variables.sn, variables.text);
};

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
	return results.filter((result) => !!result.data).map((result) => result.data);
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

	const [totalPagesCount, setTotalPagesCount] = useState<number>(0);

	const commentPages = useQueries({
		queries: Array.from({ length: totalPagesCount }, (_, page) =>
			commentPageQueryOptions(
				postMetadata,
				page,
				totalPagesCount,
				options?.refreshInterval ?? 0
			)
		),
		combine: combineResult,
	});

	const isLoading = useMemo(
		() => isLoadingPost || totalPagesCount === 0,
		[isLoadingPost, totalPagesCount]
	);

	useEffect(() => {
		if (postMetadata && totalPagesCount === 0) {
			apiGetAllComments(postMetadata.gsn, postMetadata.sn).then(
				(commentPages) => {
					commentPages.forEach((commentPage, page) => {
						queryClient.setQueryData(
							['post', postMetadata, 'comments', page + 1],
							() => commentPage
						);
					});

					setTotalPagesCount(commentPages?.[0]?.totalPage ?? 1);
				}
			);
		}
	}, [postMetadata, queryClient, totalPagesCount]);

	useEffect(() => {
		if (!isLoading && commentPages[0]) {
			setTotalPagesCount(commentPages[0].totalPage ?? 1);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoading, commentPages?.[0]?.totalPage]);

	const [pendingNewComments, setPendingNewComments] = useState<
		Partial<BahaComment>[]
	>([]);

	const createComment = useCallback((text: string) => {
		setPendingNewComments((prev) => [
			...prev,
			{ text, id: generateRandomId() },
		]);
	}, []);

	const {
		mutateAsync: createCommentInternal,
		status: createCommentStatus,
		error: createCommentError,
		reset: resetMutation,
	} = useMutation({
		mutationFn: createCommentFn,
		onSuccess: (newComment, variables) => {
			queryClient.setQueryData(
				['post', postMetadata, 'comments', totalPagesCount],
				(prev: Awaited<ReturnType<typeof apiGetCommentsInPaginations>>) => ({
					...prev,
					comments: [...prev.comments, newComment],
				})
			);
			setPendingNewComments((prev) => {
				const indexOfRemoval = prev.findIndex(({ id }) => variables.id === id);
				if (indexOfRemoval !== -1) {
					prev.splice(indexOfRemoval, 1);
				}

				return [...prev];
			});

			return queryClient.invalidateQueries({
				queryKey: ['post', postMetadata, 'comments'],
			});
		},
	});

	useEffect(() => {
		if (!postMetadata) {
			return;
		}

		if (
			pendingNewComments.length > 0 &&
			createCommentStatus !== 'pending' &&
			createCommentStatus !== 'error'
		) {
			const creatingComment = pendingNewComments[0];
			console.log(creatingComment);
			createCommentInternal({
				gsn: postMetadata.gsn,
				sn: postMetadata.sn,
				text: creatingComment.text as string,
				id: creatingComment.id as string,
			});
		}
	}, [
		createComment,
		createCommentInternal,
		createCommentStatus,
		postMetadata,
		pendingNewComments,
		resetMutation,
	]);

	return {
		post,
		postMetadata,
		commentPages,
		isLoading,
		pendingNewComments,
		createComment,
		createCommentStatus,
		createCommentError,
	};
}
