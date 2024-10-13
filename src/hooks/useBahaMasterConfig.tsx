import { LS_KEY_BGT_V3_CONFIG } from '../constant';
import { useLocalStorage } from 'react-use';
import { BGT_V3_DEFAULT_VALUES } from '../types';

export default function useBGTV3Config() {
	return useLocalStorage(LS_KEY_BGT_V3_CONFIG, BGT_V3_DEFAULT_VALUES);
}
