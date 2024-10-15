export type TGalleryConfig = {
	version: 1;
	folders: TGalleryItemTag[];
	items: TGalleryItem[];
};

export type TGalleryItem = {
	id: string;
	name: string;
	content: string;
	type: 'image' | 'text' | 'url';
	tags: TGalleryItemTag[];
	createdAt: string;
};

export type TGalleryItemTag = {
	id: string;
	name: string;
};
