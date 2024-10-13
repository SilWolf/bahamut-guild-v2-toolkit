import { average, prominent } from 'color.js';
import { lightness, saturation } from 'simpler-color';

const PROXY_IMAGE_SERVER = 'https://getproxyimage-wzh6dbfidq-de.a.run.app';

const LIGHT_BACKGROUND_COLOR = '#FFFFFF';
const DARK_BACKGROUND_COLOR = '#272728';

export const generateColorSchema = (primaryColor: string) => {
	const saturationPrimaryColor = saturation(primaryColor, 80);
	const saturationPrimaryColorBrightness =
		getBrightnessOfHex(saturationPrimaryColor) * 100;

	console.log(saturationPrimaryColor, saturationPrimaryColorBrightness);

	return {
		primaryColor,
		colors: {
			light: {
				textColor:
					getContrastRatio(saturationPrimaryColor, LIGHT_BACKGROUND_COLOR) >= 3
						? saturationPrimaryColor
						: lightness(saturationPrimaryColor, 40),
				bgColor: lightness(
					saturationPrimaryColor,
					(saturationPrimaryColorBrightness / 100.0) * 20 + 80
				),
			},
			dark: {
				textColor:
					getContrastRatio(saturationPrimaryColor, DARK_BACKGROUND_COLOR) >= 3
						? saturationPrimaryColor
						: lightness(saturationPrimaryColor, 80),
				bgColor: lightness(
					saturationPrimaryColor,
					(saturationPrimaryColorBrightness / 100.0) * 25 + 5
				),
			},
		},
	};
};

export const generateColorFromUrl = (url: string) =>
	average(`${PROXY_IMAGE_SERVER}?url=${url}`, {
		format: 'hex',
		amount: 1,
	}) as Promise<string>;

export const generateColorSchemaFromUrl = async (url: string) =>
	generateColorSchema(await generateColorFromUrl(url));

export const getContrastRatio = function (
	foreground: string,
	background: string
) {
	const rgb1 = convertHexToRGB(foreground);
	const rgb2 = convertHexToRGB(background);
	if (rgb1 && rgb2) {
		const lum1 = getBrightnessOfColor(rgb1);
		const lum2 = getBrightnessOfColor(rgb2);
		const ratio = (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);

		return Math.round(ratio * 100) / 100;
	} else {
		return 1;
	}
};

const convertHexToRGB = function (hex: string): {
	r: number;
	g: number;
	b: number;
} {
	// Expand shorthand form (e.g. '03F') to full form (e.g. '0033FF')
	const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;

	hex = hex.replace(shorthandRegex, function (m, r, g, b) {
		return r + r + g + g + b + b;
	});

	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16),
		  }
		: {
				r: parseInt('0', 16),
				g: parseInt('0', 16),
				b: parseInt('0', 16),
		  };
};

const getBrightnessOfColor = function (rgbColor: {
	r: number;
	g: number;
	b: number;
}): number {
	const a = [rgbColor.r, rgbColor.g, rgbColor.b].map(function (v) {
		v /= 255;
		return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
	});
	return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

const getBrightnessOfHex = (hex: string) =>
	getBrightnessOfColor(convertHexToRGB(hex));
