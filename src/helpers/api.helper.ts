import axiosInstance from '../services/api.service';
import { BahaPostDetail, TBahaComment, TBahaCommentsPage } from '../types';

export const apiGetPostDetail = async (gsn: string, sn: string) => {
	return axiosInstance
		.get<{ data: BahaPostDetail }>('/guild/v1/post_detail.php', {
			params: { gsn, messageId: sn },
		})
		.then((res) => res.data.data);
};

export const apiGetAllComments = async (gsn: string, sn: string) => {
	return axiosInstance
		.get<{ data: TBahaCommentsPage }>('/guild/v1/comment_list.php', {
			params: { gsn, messageId: sn, all: 1 },
		})
		.then((res) => {
			const result = res.data.data;
			const comments = [...result.comments];
			const finals: TBahaCommentsPage[] = [];
			const splitLength = 15;

			let nextPage = 0;
			while (comments.length > 0) {
				finals.push({
					...result,
					comments: comments.splice(0, splitLength).map(mapComment),
					nextPage,
					totalPage: result.totalPage,
					commentCount: result.commentCount,
				});
				nextPage += 1;
			}

			return finals;
		});
};

export const apiGetCommentsInPaginations = async (
	gsn: string,
	sn: string,
	page?: number | null | 'all'
) => {
	const _page = page !== 'all' ? page : null;
	const _all = page === 'all' ? 1 : null;

	return axiosInstance
		.get<{ data: TBahaCommentsPage }>('/guild/v1/comment_list.php', {
			params: { gsn, messageId: sn, page: _page, all: _all },
		})
		.then((res) => {
			const data = res.data.data;

			return {
				...data,
				comments: data.comments.map(mapComment),
			};
		});
};

export const apiPostComment = async (
	gsn: string,
	sn: string,
	content: string
) => {
	const formData = new FormData();
	formData.append('gsn', gsn);
	formData.append('messageId', sn);
	formData.append('content', content);
	formData.append('legacy', '1');

	return axiosInstance
		.post<{ data: { commentData: TBahaComment } }>(
			'/guild/v1/comment_new.php',
			formData
		)
		.then((res) => res.data.data.commentData);
};

const mapComment = (comment: TBahaComment) => {
	if (!comment.mentions || comment.mentions?.length === 0) {
		return comment;
	}

	let newText = comment.text;
	const mentions = comment.mentions.sort(
		(a, b) => parseInt(b.offset) - parseInt(a.offset)
	);

	for (const mention of mentions) {
		const offset = parseInt(mention.offset);
		const length = parseInt(mention.length);
		newText =
			newText.substring(0, offset) +
			`@[${newText.substring(offset, offset + length)}](${mention.id})` +
			newText.substring(offset + length);
	}

	return {
		...comment,
		text: newText,
	};
};

export const apiGetHomeImagesByPage = (p = 1) =>
	axiosInstance
		.get<{ index: number; thumb_url: string; url: string }[]>(
			'https://api.gamer.com.tw/ajax/common/truth_image_list.php',
			{ params: { p } }
		)
		.then((res) => res.data);
