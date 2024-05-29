export const getItemFromLocalStorage = (key: string | undefined | null) => {
	if (!key) {
		return null;
	}

	const data = localStorage.getItem(key) as string;
	try {
		return JSON.parse(data);
	} catch {
		return data;
	}
};

export const setItemToLocalStorage = (
	key: string | undefined | null,
	data: unknown
) => {
	if (!key) {
		return;
	}

	try {
		localStorage.setItem(key, JSON.stringify(data));
	} catch {
		localStorage.setItem(key, data as string);
	}
};
