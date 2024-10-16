import React, { useMemo, useState } from 'react';
import { TGalleryItem } from './index.type';
import { useFieldArray, useForm } from 'react-hook-form';

export type GalleryAddItemsDialogFormProps = {
	targetFolderName: string;
	items: (Pick<TGalleryItem, 'name' | 'content'> & {
		type: 'text' | 'image-url' | 'image-upload';
		file?: FileList;
	})[];
};

export default function GalleryAddItemsDialog({
	targetFolderName,
	onSubmit,
	onCancel,
}: {
	targetFolderName: string;
	onSubmit: (
		targetFolderName: string,
		items: GalleryAddItemsDialogFormProps
	) => Promise<{ success: boolean; message?: string }[]>;
	onCancel: () => void;
}) {
	const {
		control,
		register,
		watch,
		formState: { errors },
		handleSubmit: handleRhfSubmit,
		reset,
		setError,
	} = useForm<GalleryAddItemsDialogFormProps>({
		defaultValues: {
			targetFolderName,
			items: [{ name: '', content: '', type: 'image-upload' }],
		},
	});
	const { fields, append, remove } = useFieldArray({ control, name: 'items' });

	/**
	 * Submission
	 */
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [showPartialError, setShowPartialError] = useState<boolean>(false);
	const handleSubmit = useMemo(
		() =>
			handleRhfSubmit((values) => {
				setIsSubmitting(true);
				setShowPartialError(false);

				onSubmit(targetFolderName, values)
					.then((results) => {
						if (!results.some(({ success }) => success === false)) {
							onCancel();
							return;
						}

						const combinedItemAndResult = values.items
							.map((item, index) => ({
								item,
								result: results[index],
							}))
							.filter(({ result }) => result.success === false);

						reset({
							...values,
							items: combinedItemAndResult.map(({ item }) => item),
						});

						for (let i = 0; i < combinedItemAndResult.length; i++) {
							if (combinedItemAndResult[i].item.type === 'image-upload') {
								setError(`items.${i}.file`, {
									type: 'custom',
									message: combinedItemAndResult[i].result.message,
								});
							}
						}

						setShowPartialError(true);
					})
					.finally(() => {
						setIsSubmitting(false);
					});
			}),
		[handleRhfSubmit, onCancel, onSubmit, reset, setError, targetFolderName]
	);

	return (
		<div className='tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-60 tw-z-[100] tw-flex tw-items-center tw-justify-center tw-p-32'>
			<div className='tw-bg-bg1 div tw-rounded-lg tw-p-8 tw-w-full tw-max-w-screen-md'>
				<h2>新增項目</h2>

				<div className='tw-max-h-[80vh] tw-overflow-y-auto'>
					{showPartialError && (
						<div className='tw-bg-red-500 tw-bg-opacity-20 tw-p-4 tw-rounded'>
							部分項目創建失敗，請檢查錯誤訊息後重新提交。
						</div>
					)}
					<form>
						<ul className='tw-py-4 tw-space-y-4'>
							{fields.map((field, index) => (
								<li
									key={field.id}
									className='tw-relative tw-space-y-4 tw-bg-white tw-bg-opacity-10 tw-shadow tw-p-4'
								>
									<div
										onClick={() => remove(index)}
										className='tw-absolute tw-top-4 tw-right-4 tw-text-sm tw-underline tw-opacity-60 hover:tw-opacity-100 tw-cursor-pointer'
									>
										刪除
									</div>
									<div className='tw-space-x-2'>
										<label>分類:</label>
										<select {...register(`items.${index}.type`)}>
											<option value='image-upload'>圖片(上傳)</option>
											<option value='image-url'>圖片(連結)</option>
											<option value='text'>文字</option>
										</select>
									</div>
									<div
										className={`tw-flex tw-gap-x-2 ${
											errors.items?.[index]?.content ||
											errors.items?.[index]?.file
												? 'tw-text-red-500 [&_input]:!tw-border-red-500 [&_textarea]:!tw-border-red-500'
												: ''
										}`}
									>
										<label className='tw-mt-2'>內容:</label>
										<div className='tw-flex-1'>
											{watch(`items.${index}.type`) === 'image-upload' && (
												<div>
													<input
														{...register(`items.${index}.file`, {
															required: '必須選擇檔案',
														})}
														type='file'
														className='tw-mt-1.5'
														accept='image/*'
													/>
													<p className='tw-text-sm'>圖片將上傳至 Imgur 圖床</p>
													<p className='tw-text-sm'>
														{errors.items?.[index]?.file?.message}
													</p>
												</div>
											)}
											{watch(`items.${index}.type`) === 'image-url' && (
												<div>
													<input
														{...register(`items.${index}.content`, {
															required: '必須填寫圖片連結',
														})}
														className='tw-text-[inherit] tw-bg-white tw-bg-opacity-10 tw-text-[1em] tw-w-full tw-border tw-border-neutral-400 tw-border-solid tw-p-2 tw-rounded'
														type='input'
													/>
													<p className='tw-text-sm'>
														{errors.items?.[index]?.content?.message}
													</p>
												</div>
											)}
											{watch(`items.${index}.type`) === 'text' && (
												<div>
													<textarea
														{...register(`items.${index}.content`, {
															required: '必須填寫內容',
														})}
														className='tw-text-[inherit] tw-bg-white tw-bg-opacity-10 tw-text-[1em] tw-w-full tw-leading-[1.5] tw-border tw-border-neutral-400 tw-border-solid tw-p-2 tw-rounded'
														rows={5}
													></textarea>
													<p className='tw-text-sm'>
														{errors.items?.[index]?.content?.message}
													</p>
												</div>
											)}
										</div>
									</div>
									<div>
										<div className='tw-flex tw-gap-x-2'>
											<label className='tw-mt-2'>名稱:</label>
											<div className='tw-flex-1'>
												<input
													{...register(`items.${index}.name`)}
													type='text'
													className='tw-text-[inherit] tw-bg-white tw-bg-opacity-10 tw-text-[1em] tw-border tw-border-neutral-400 tw-border-solid tw-p-2 tw-rounded'
												/>
												<p className='tw-text-sm'>選填，用於搜尋。</p>
											</div>
										</div>
									</div>
								</li>
							))}
						</ul>
					</form>
				</div>

				<div>
					<button
						onClick={() =>
							append({ name: '', content: '', type: 'image-upload' })
						}
					>
						+ 新增
					</button>
				</div>

				<div className='tw-text-right tw-space-x-1'>
					<button className='btn' onClick={onCancel}>
						取消
					</button>
					{isSubmitting && (
						<button className='btn btn-primary' disabled>
							提交
						</button>
					)}
					{!isSubmitting && (
						<button className='btn btn-primary' onClick={handleSubmit}>
							提交
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
