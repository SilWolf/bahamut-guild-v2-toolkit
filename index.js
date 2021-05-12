// ==UserScript==
// @name         Bahamut Guild V2 Toolkits
// @namespace    https://silwolf.io/
// @version      0.1
// @description  巴哈公會2.0的插件
// @author       銀狼(silwolf167)
// @include      /guild.gamer.com.tw/guild.php
// @include      /guild.gamer.com.tw/post_detail.php
// @grant        none
// ==/UserScript==

(function () {
	'use strict';

	// Your code here...
	jQuery(document).ready(() => {
		const head = document.getElementsByTagName('head')[0];
		if (head) {
			const style = document.createElement('style');
			style.type = 'text/css';
			style.innerHTML = `
        .text_content-hide {
          display: block !important;
        }

        .more-text {
          display: none;
        }

        div[data-google-query-id] {
          display: none;
        }

        .webview_commendlist {
          display: flex; flex-direction: column-reverse;
        }
        .webview_commendlist > div {
          display: flex; flex-direction: column-reverse;
        }
      `;

			if (location && location.href.includes('post_detail.php')) {
				style.innerHTML += `
          .webview_commendlist .c-reply__editor {
            position: sticky;
            top: 80px;
            margin-left: -20px;
            margin-right: -20px;
            padding-left: 20px;
            padding-right: 20px;
            background-color: #bfbfbf;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
          }

          .reply-input textarea {
            min-height: 66px;
          }
        `;
			}
			head.appendChild(style);
		}

		// const editor = document.getElementsByClassName('c-reply__editor');
		// console.log(
		// 	document.getElementsByClassName('c-reply__editor'),
		// 	document.getElementsByClassName('c-reply__editor')[0]
		// );
		// if (editor) {
		// 	const newButton = document.createElement('button');
		// 	newButton.innerHTML('重新下載');

		// 	editor.appendChild(newButton);
		// }

		let hasTakenOver = false;

		const gsn = guild.gsn;
		const sn = parseInt($('.inboxfeed').first().data('post-sn'));

		let comments = [];
		const apiUrl = `https://api.gamer.com.tw/guild/v1/comment_list.php?gsn=${gsn}&messageId=${sn}`;

		const appendNewComments = (newComments) => {
			let commentListHtml = '';
			for (const nC of newComments) {
				nC.text = GuildTextUtil.mentionTagToMarkdown(
					gsn,
					nC.text,
					nC.tags,
					nC.mentions
				);
				commentListHtml += nunjucks.render('comment.njk.html', {
					post: {
						id: sn,
						commentCount: 0,
						to: { gsn: gsn },
					},
					comment: nC,
					marked: GuildTextUtil.markedInstance,
					youtubeParameterMatcher: GuildTextUtil.youtubeParameterMatcher,
					user: guildPost.loginUser,
				});
			}

			if (commentListHtml) {
				let $post = Guild.getPost(sn, false, '');
				let $commentContainer = $post.find(
					'.webview_commendlist > div:first-child'
				);
				$commentContainer.append(commentListHtml);

				comments = [...comments, ...newComments];
			}
		};

		fetch(`${apiUrl}&all`, {
			credentials: 'include',
		})
			.then((res) => res.json())
			.then((response) => {
				comments = response.data.comments;

				if (!hasTakenOver) {
					const oldGuildCommentReplyEnterKey = GuildComment.replyEnterKey;
					// GuildComment.replyEnterKey = (event, element) => {
					// 	let $element = $(element);
					// 	let gsn = parseInt($element.data('gsn'), 10);
					// 	let postSn = parseInt($element.data('post-sn'), 10);
					// 	event = window.event || event;
					// 	let code = event.which;
					// 	if (code == 13 && GuildTagUser.tagListTippyShown) {
					// 		return;
					// 	}
					// 	if (code == 13 && !event.shiftKey) {
					// 		commentNew(gsn, postSn);
					// 		if (event.preventDefault) {
					// 			event.preventDefault();
					// 		} else {
					// 			event.returnValue = false;
					// 		}
					// 		return;
					// 	}
					// };

					const editor = document.getElementsByClassName('reply-input')[0];
					console.log(editor);

					const textarea = editor.getElementsByTagName('textarea')[0];

					console.log(textarea);

					const onKeyDownFn = () => {
						console.log('123');
					};
					textarea.addEventListener('keydown', onKeyDownFn);

					// editor.innerHTML = '';

					hasTakenOver = true;
				}

				setInterval(() => {
					fetch(apiUrl, {
						credentials: 'include',
					})
						.then((res) => res.json())
						.then((newResponse) => {
							const newComments = newResponse.data.comments;
							appendNewComments(
								newComments.filter(
									(nC) => comments.findIndex((c) => c.id === nC.id) === -1
								)
							);
						});
				}, 5000000);
			});
	});
})();
