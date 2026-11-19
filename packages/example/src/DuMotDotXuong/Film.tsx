import type {CSSProperties, FC} from 'react';
import {createContext, useContext, useMemo} from 'react';
import {
	AbsoluteFill,
	Html5Audio,
	Img,
	Interactive,
	OffthreadVideo,
	Sequence,
	staticFile,
	Track,
	CanvasImage,
} from 'remotion';
import {z} from 'zod';
import {Opening} from './Opening';

type Box = [left: number, top: number, width: number, height: number];
type Caption = {
	id: number;
	file: number;
	from: number;
	duration: number;
	box: Box;
};
export type Layers = Record<number, {motion: Box | null; captions: Caption[]}>;

export const filmSchema = z.object({
	showCaptions: z.boolean(),
	openingLabel: z.string(),
	captionOverrides: z.array(
		z.object({frame: z.number().int().nonnegative(), text: z.string()}),
	),
});
export type FilmProps = z.infer<typeof filmSchema> & {layers: Layers | null};

const FilmContext = createContext<{
	layers: Layers;
	openingLabel: string;
	showCaptions: boolean;
	captionOverrides: ReadonlyMap<number, string>;
} | null>(null);

export const asset = (name: string) => staticFile(`du-mot-dot-xuong/${name}`);

const place = ([left, top, width, height]: Box): CSSProperties => ({
	position: 'absolute',
	left,
	top,
	width,
	height,
});

const CaptionLayer: FC<{cue: Caption; replacement: string | null}> = ({
	cue,
	replacement,
}) => {
	if (replacement === null) {
		return (
			<Img src={asset(`caption-${cue.file}.png`)} style={place(cue.box)} />
		);
	}

	if (replacement === '') {
		return null;
	}

	return (
		<div
			style={{
				position: 'absolute',
				bottom: 22,
				left: '50%',
				transform: 'translateX(-50%)',
				width: 'max-content',
				maxWidth: 900,
				font: '600 24px/33px "Segoe UI", Arial, sans-serif',
				color: 'white',
				whiteSpace: 'pre-line',
			}}
		>
			<span
				style={{
					backgroundColor: 'rgba(0, 0, 0, .82)',
					boxDecorationBreak: 'clone',
					WebkitBoxDecorationBreak: 'clone',
					padding: '2px 8px',
				}}
			>
				{replacement}
			</span>
		</div>
	);
};

const ShotInner: FC<{sourceFrame: number}> = ({sourceFrame}) => {
	const film = useContext(FilmContext);
	const shot = film?.layers[sourceFrame];
	if (!film || !shot) {
		throw new Error(`Thiếu tài nguyên cho cảnh tại khung ${sourceFrame}.`);
	}

	return (
		<>
			<Img
				src={asset(`plate-${sourceFrame}.webp`)}
				style={place([0, 0, 1024, 576])}
			/>
			{shot.motion ? (
				<OffthreadVideo
					name="Chuyển động trên hình"
					src={asset(`motion-${sourceFrame}.mp4`)}
					style={place(shot.motion)}
					pauseWhenBuffering
					muted
				/>
			) : null}
			{sourceFrame === 0 ? <Opening label={film.openingLabel} /> : null}
			{film.showCaptions ? (
				<Track name="Phụ đề">
					{shot.captions.map((cue) => (
						<Sequence
							key={cue.file}
							name={`Phụ đề • khung ${cue.id}`}
							from={cue.from}
							durationInFrames={cue.duration}
							layout="none"
						>
							<CaptionLayer
								cue={cue}
								replacement={film.captionOverrides.get(cue.id) ?? null}
							/>
						</Sequence>
					))}
				</Track>
			) : null}
		</>
	);
};

const Shot = Interactive.create({
	Component: ShotInner,
	layout: 'absolute-fill',
	schema: {},
});

export const Film: FC<FilmProps> = ({
	layers,
	openingLabel,
	showCaptions,
	captionOverrides,
}) => {
	const film = useMemo(
		() =>
			layers === null
				? null
				: {
						layers,
						openingLabel,
						showCaptions,
						captionOverrides: new Map(
							captionOverrides.map(({frame, text}) => [frame, text]),
						),
					},
		[layers, openingLabel, showCaptions, captionOverrides],
	);
	if (!film) {
		throw new Error('Chưa nạp tài nguyên cho Dư một đốt xương.');
	}

	return (
		<>
			<FilmContext.Provider value={film}>
				<AbsoluteFill style={{backgroundColor: '#100e0c'}}>
					<Html5Audio name="Lời kể và nhạc gốc" src={asset('soundtrack.m4a')} />
					<Track name="Dựng cảnh">
						<Shot
							name="Đếm xương: 28 → 29"
							sourceFrame={0}
							from={0}
							durationInFrames={260}
						/>
						<Shot
							name="Lời dặn của chú Tư"
							sourceFrame={260}
							from={260}
							durationInFrames={177}
						/>
						<Shot
							name="Cái lỗ bên trái"
							sourceFrame={437}
							from={437}
							durationInFrames={219}
						/>
						<Shot
							name="Dư một đốt xương"
							sourceFrame={656}
							from={656}
							durationInFrames={212}
						/>
						<Shot
							name="Lộc và chú Tư Đức"
							sourceFrame={868}
							from={868}
							durationInFrames={508}
						/>
						<Shot
							name="Mộ bà Hai Thìn"
							sourceFrame={1376}
							from={1376}
							durationInFrames={431}
						/>
						<Shot
							name="Nghề này làm ban đêm"
							sourceFrame={1807}
							from={1807}
							durationInFrames={143}
						/>
						<Shot
							name="Điều 1"
							sourceFrame={1950}
							from={1950}
							durationInFrames={174}
						/>
						<Shot
							name="Điều 2"
							sourceFrame={2124}
							from={2124}
							durationInFrames={329}
						/>
						<Shot
							name="Điều 3"
							sourceFrame={2453}
							from={2453}
							durationInFrames={293}
						/>
						<Shot
							name="Điều 4"
							sourceFrame={2746}
							from={2746}
							durationInFrames={227}
						/>
						<Shot
							name="Vì sao lại dư?"
							sourceFrame={2973}
							from={2973}
							durationInFrames={98}
						/>
						<Shot
							name="Bàn tay đeo găng"
							sourceFrame={3071}
							from={3071}
							durationInFrames={89}
						/>
						<Shot
							name="Dư thì chờ chú"
							sourceFrame={3160}
							from={3160}
							durationInFrames={97}
						/>
						<Shot
							name="Nửa đêm trên gò"
							sourceFrame={3257}
							from={3257}
							durationInFrames={164}
						/>
						<Shot
							name="Nấm mộ thấp"
							sourceFrame={3421}
							from={3421}
							durationInFrames={111}
						/>
						<Shot
							name="Hai giờ sáng"
							sourceFrame={3532}
							from={3532}
							durationInFrames={271}
						/>
						<Shot
							name="Lộc xuống huyệt"
							sourceFrame={3803}
							from={3803}
							durationInFrames={412}
						/>
						<Shot
							name="Xếp xương lên lá chuối"
							sourceFrame={4215}
							from={4215}
							durationInFrames={609}
						/>
						<Shot
							name="Hai mươi chín"
							sourceFrame={4824}
							from={4824}
							durationInFrames={15}
						/>
						<Shot
							name="Một góc huyệt"
							sourceFrame={4839}
							from={4839}
							durationInFrames={494}
						/>
						<Shot
							name="Nhìn sang lỗ tối"
							sourceFrame={5333}
							from={5333}
							durationInFrames={425}
						/>
						<Shot
							name="Nhớ lời dặn"
							sourceFrame={5758}
							from={5758}
							durationInFrames={546}
						/>
						<Shot
							name="Đưa đốt xương vào lỗ"
							sourceFrame={6304}
							from={6304}
							durationInFrames={284}
						/>
						<Shot
							name="Quay lại gom xương"
							sourceFrame={6588}
							from={6588}
							durationInFrames={133}
						/>
						<Shot
							name="Trả lại lần thứ nhất"
							sourceFrame={6721}
							from={6721}
							durationInFrames={235}
						/>
						<Shot
							name="Trả lại lần thứ hai"
							sourceFrame={6956}
							from={6956}
							durationInFrames={430}
						/>
						<Shot
							name="Trả lại lần thứ ba"
							sourceFrame={7386}
							from={7386}
							durationInFrames={442}
						/>
						<Shot
							name="Tiếng hỏi trên miệng huyệt"
							sourceFrame={7828}
							from={7828}
							durationInFrames={706}
						/>
						<Shot
							name="Chú Tư trở về"
							sourceFrame={8534}
							from={8534}
							durationInFrames={641}
						/>
						<Shot
							name="Cái của ai?"
							sourceFrame={9175}
							from={9175}
							durationInFrames={130}
						/>
						<Shot
							name="Chú Tư xuống huyệt"
							sourceFrame={9305}
							from={9305}
							durationInFrames={190}
						/>
						<Shot
							name="Mày mới đếm đốt"
							sourceFrame={9495}
							from={9495}
							durationInFrames={153}
						/>
						<Shot
							name="Đủ hai bàn tay"
							sourceFrame={9648}
							from={9648}
							durationInFrames={88}
						/>
						<Shot
							name="Đốt không thuộc về bà Hai"
							sourceFrame={9736}
							from={9736}
							durationInFrames={356}
						/>
						<Shot
							name="Người nọ trả ba lần"
							sourceFrame={10092}
							from={10092}
							durationInFrames={285}
						/>
						<Shot
							name="Sao biết cái nào?"
							sourceFrame={10377}
							from={10377}
							durationInFrames={174}
						/>
						<Shot
							name="Tấm lá thứ hai"
							sourceFrame={10551}
							from={10551}
							durationInFrames={162}
						/>
						<Shot
							name="Xếp lại theo từng ngón"
							sourceFrame={10713}
							from={10713}
							durationInFrames={327}
						/>
						<Shot
							name="Bàn tay trái và phải"
							sourceFrame={11040}
							from={11040}
							durationInFrames={480}
						/>
						<Shot
							name="Đốt chót ngón út"
							sourceFrame={11520}
							from={11520}
							durationInFrames={311}
						/>
						<Shot
							name="Hai người dưới huyệt"
							sourceFrame={11831}
							from={11831}
							durationInFrames={167}
						/>
						<Shot
							name="Chú cởi bao tay trái"
							sourceFrame={11998}
							from={11998}
							durationInFrames={226}
						/>
						<Shot
							name="Hồi tưởng: trời mưa, đất trơn"
							sourceFrame={12224}
							from={12224}
							durationInFrames={488}
						/>
						<Shot
							name="Hai chục năm nay"
							sourceFrame={12712}
							from={12712}
							durationInFrames={449}
						/>
						<Shot
							name="Lộc hiểu ra điều ba"
							sourceFrame={13161}
							from={13161}
							durationInFrames={469}
						/>
						<Shot
							name="Hồi tưởng: vật ở bìa lỗ"
							sourceFrame={13630}
							from={13630}
							durationInFrames={491}
						/>
						<Shot
							name="Lấy lại đốt xương"
							sourceFrame={14121}
							from={14121}
							durationInFrames={111}
						/>
						<Shot
							name="Xếp vào tiểu"
							sourceFrame={14232}
							from={14232}
							durationInFrames={228}
						/>
						<Shot
							name="Đậy nắp"
							sourceFrame={14460}
							from={14460}
							durationInFrames={42}
						/>
						<Shot
							name="Tiếng hỏi ‘Đủ chưa?’"
							sourceFrame={14502}
							from={14502}
							durationInFrames={572}
						/>
						<Shot
							name="Lấp huyệt cho bà Hai"
							sourceFrame={15074}
							from={15074}
							durationInFrames={185}
						/>
						<Shot
							name="Một đốt vẫn nằm ngoài"
							sourceFrame={15259}
							from={15259}
							durationInFrames={634}
						/>
						<Shot
							name="Một câu chuyện khác"
							sourceFrame={15893}
							from={15893}
							durationInFrames={446}
						/>
						<Shot
							name="Không lửa, không kêu tên"
							sourceFrame={16339}
							from={16339}
							durationInFrames={337}
						/>
						<Shot
							name="Chú Tư đếm lại"
							sourceFrame={16676}
							from={16676}
							durationInFrames={410}
						/>
						<Shot
							name="Lộc trở lại lúc sáng"
							sourceFrame={17086}
							from={17086}
							durationInFrames={426}
						/>
						<Shot
							name="Cái túi vải nhỏ"
							sourceFrame={17512}
							from={17512}
							durationInFrames={275}
						/>
						<Shot
							name="Không bao giờ tự đếm nữa"
							sourceFrame={17787}
							from={17787}
							durationInFrames={273}
						/>
						<Shot
							name="Níu hay giữ giùm?"
							sourceFrame={18060}
							from={18060}
							durationInFrames={622}
						/>
						<Shot
							name="Chuyện Ma Đêm Khuya Radio"
							sourceFrame={18682}
							from={18682}
							durationInFrames={436}
						/>
					</Track>
				</AbsoluteFill>
			</FilmContext.Provider>
			<CanvasImage
				src={staticFile('caption-17086.png')}
				style={{
					position: 'absolute',
					translate: '377.6px 487.8px',
					width: 398,
					height: 34,
				}}
			/>
		</>
	);
};
