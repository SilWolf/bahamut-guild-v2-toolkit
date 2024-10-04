import React from 'react';
import styles from './index.module.css';

const UISwitch = React.forwardRef<
	HTMLInputElement,
	React.HTMLAttributes<HTMLInputElement> & {
		label?: React.ReactNode;
	}
>(({ label, ...inputProps }, ref) => {
	return (
		<label className='tw-inline-flex tw-items-center tw-gap-2 tw-cursor-pointer'>
			<div className={styles.switch}>
				<input
					type='checkbox'
					className={styles['switch-input']}
					ref={ref}
					{...inputProps}
				/>
				<span className={styles['switch-label']} data-on='On' data-off='Off' />
				<span className={styles['switch-handle']} />
			</div>
			<div>{label}</div>
		</label>
	);
});

export default UISwitch;
