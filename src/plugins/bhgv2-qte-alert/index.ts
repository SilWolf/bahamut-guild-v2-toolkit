/*******************************************************************************************
 *
 *  BHGV2_QTEAlert - 高亮我
 *  高亮你在留言中出現的名字
 *
 *******************************************************************************************/

import { TPlugin, TPluginConstructor } from '../../types';

const BHGV2_QTEAlert: TPluginConstructor = (core) => {
	const _plugin: TPlugin = {
		pluginName: 'BHGV2_QTEAlert',
		prefix: 'BHGV2_QTEAlert',
		label: '秒判警報(實驗功能)',
	};

	_plugin.configs = [
		{
			key: `${_plugin.prefix}-isEnabled`,
			suffixLabel: '高亮秒判',
			dataType: 'boolean',
			inputType: 'switch',
			defaultValue: true,
		},
		{
			key: `${_plugin.prefix}-notificationSound`,
			suffixLabel: '特殊提示音效',
			dataType: 'boolean',
			inputType: 'switch',
			defaultValue: false,
		},
	];

	_plugin.css = [
		`
			.${_plugin.prefix}-isEnabled .bhgv2-comment.${_plugin.prefix}-comment .${_plugin.prefix}-indicator {
				position: absolute;
				top: 0;
				bottom: 0;
				left: 0;
				right: 0;
				border: 4px solid #f00;
				pointer-events: none;
			}

			.${_plugin.prefix}-isEnabled .bhgv2-comment.${_plugin.prefix}-comment .${_plugin.prefix}-indicator:before {
				content: '秒判！';
				position: absolute;
				text-align: center;
				top: 0;
				left: calc(50% - 30px);
				height: 24px;
				width: 60px;
				line-height: 24px;
				background: #f00;
				color: #fff;
				border-bottom-left-radius: 8px;
				border-bottom-right-radius: 8px;
				pointer-events: none;
			}
		`,
	];

	const notifyAudio = new Audio(
		'https://github.com/SilWolf/bahamut-guild-v2-toolkit/blob/main/src/plugins/bhgv2-qte-alert/notify_for_qte.mp3?raw=true'
	);

	_plugin.onMutateState = ({ latestComments, isInit, isUserAction }) => {
		let found = false;
		const config = core.getConfig();

		if (latestComments) {
			latestComments.forEach((comment) => {
				const { element, payload } = comment;
				if (!element) {
					return;
				}

				const text = payload?.text ?? element.textContent;

				if (!text) {
					return;
				}

				if (text.match(/秒[^\(（)]*[\)）]/)) {
					element.classList.add(`${_plugin.prefix}-comment`);

					const indicator = document.createElement('div');
					indicator.classList.add(`${_plugin.prefix}-indicator`);
					element.appendChild(indicator);
				}

				found = true;
			});
		}

		if (isInit || isUserAction) {
			return;
		}

		// 播放通知音
		if (found && config[`${_plugin.prefix}:notificationSound`]) {
			notifyAudio.play();
		}
	};

	_plugin.onMutateConfig = (newValue) => {
		['isEnabled', 'notificationSound'].forEach((key) => {
			if (newValue[`${_plugin.prefix}-${key}`] !== undefined) {
				const dom = core.DOM.CommentListOuter;
				if (dom) {
					dom.classList.toggle(
						`${_plugin.prefix}-${key}`,
						newValue[`${_plugin.prefix}-${key}`] as boolean
					);
				}
			}
		});
	};

	return _plugin;
};

export default BHGV2_QTEAlert;
