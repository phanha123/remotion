import type {CalculateMetadataFunction} from 'remotion';
import {Composition, registerRoot} from 'remotion';
import {asset, Film, filmSchema, type FilmProps, type Layers} from './Film';

const loadLayers: CalculateMetadataFunction<FilmProps> = async ({
	props,
	abortSignal,
}) => {
	const response = await fetch(asset('layers.json'), {signal: abortSignal});
	if (!response.ok) {
		throw new Error(
			'Không tìm thấy layers.json. Hãy chuẩn bị tư liệu và mở Studio với đúng --public-dir.',
		);
	}

	const layers = (await response.json()) as Layers;
	return {props: {...props, layers}, defaultOutName: 'Du-mot-dot-xuong.mp4'};
};

registerRoot(() => (
	<Composition
		id="DuMotDotXuong"
		component={Film}
		width={1024}
		height={576}
		fps={24}
		durationInFrames={19118}
		calculateMetadata={loadLayers}
		schema={filmSchema}
		defaultProps={{
			layers: null,
			showCaptions: true,
			openingLabel: 'Bốc mộ thì phải đếm xương',
			captionOverrides: [],
		}}
	/>
));
