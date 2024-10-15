export type TGalleryConfig = {
	version: 1;
	folders: string[];
	items: TGalleryItem[];
};

export type TGalleryItem = {
	id: string;
	name: string;
	content: string;
	type: 'image' | 'text' | 'url';
	tags: string[];
	createdAt: string;
};
