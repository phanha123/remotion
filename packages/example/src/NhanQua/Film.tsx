import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Html5Audio,
	interpolate,
	Sequence,
	staticFile,
	useCurrentFrame,
} from 'remotion';
import type {Point} from '../Alex/Limb';
import {Sky, Tree} from '../Alex/Nature';
import {Character} from './Character';
import story from './story.json';

const move = (frame: number, frames: number[], values: number[]) =>
	interpolate(frame, frames, values, {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.inOut(Easing.cubic),
	});

const Landscape: React.FC<{
	garden: boolean;
	rain: boolean;
	sunset: boolean;
}> = ({garden, rain, sunset}) => {
	const f = useCurrentFrame();
	return (
		<>
			<Sky night={false} sunset={sunset} />
			{rain && <rect width="1920" height="1080" fill="#526d83" opacity=".4" />}
			<path
				d="M0 620Q320 410 670 590T1340 530T1920 540V1080H0Z"
				fill="#9ab39a"
			/>
			<path
				d="M0 740Q310 570 710 705T1440 680T1920 640V1080H0Z"
				fill="#789b87"
			/>
			<Tree x={135} y={930} scale={2.8} phase={0} />
			<Tree x={1745} y={865} scale={2.1} phase={2} />
			<Tree x={1540} y={730} scale={1.2} phase={4} />
			<path
				d="M0 960Q650 840 1920 890V1080H0Z"
				fill={rain ? '#b4bab0' : '#deccb0'}
			/>
			<path
				d="M0 1035Q1000 935 1920 990"
				stroke={rain ? '#d1d6ce' : '#ecddc4'}
				strokeWidth="5"
				fill="none"
			/>
			{garden ? (
				<>
					<ellipse cx="1130" cy="947" rx="360" ry="76" fill="#b39370" />
					<ellipse cx="1130" cy="937" rx="330" ry="55" fill="#80644e" />
					<path
						d="M790 958Q1110 1060 1470 958"
						fill="none"
						stroke="#c6a179"
						strokeWidth="17"
					/>
				</>
			) : (
				<>
					<g transform="translate(270 568)">
						<path d="M0 0L220-117 440 0V276H0Z" fill="#e3cbb0" />
						<path
							d="M-30 5L220-136 470 5"
							stroke="#aa7864"
							strokeWidth="25"
							fill="none"
							strokeLinejoin="round"
						/>
						<rect
							x="174"
							y="107"
							width="102"
							height="169"
							rx="42"
							fill="#73928d"
						/>
						<rect x="45" y="80" width="77" height="85" rx="10" fill="#9ebbb1" />
					</g>
					<path
						d="M1450 795H1590M1460 760H1580M1470 795V875M1570 795V875"
						stroke="#9c7f60"
						strokeWidth="15"
						strokeLinecap="round"
					/>
				</>
			)}
			{Array.from({length: 15}, (_, i) => (
				<g
					key={i}
					transform={`translate(${i * 147} ${1010 + (i % 3) * 18}) rotate(${Math.sin(f / 29 + i) * 8})`}
				>
					<path
						d="M0 38Q-5 8-22-7M0 38Q3 10 23-13"
						stroke="#668974"
						strokeWidth="4"
						fill="none"
					/>
				</g>
			))}
			{rain && (
				<>
					{Array.from({length: 100}, (_, i) => (
						<path
							key={i}
							d="M0 0l-13 36"
							transform={`translate(${(i * 173 - f * 5 + 20000) % 2000} ${((i * 97 + f * 17) % 1120) - 40})`}
							stroke="#e0e9e4"
							strokeWidth="2"
							opacity=".45"
						/>
					))}
					{[0, 1, 2, 3, 4].map((i) => (
						<ellipse
							key={i}
							cx={250 + i * 335}
							cy={970 + (i % 2) * 60}
							rx={10 + ((f + i * 11) % 35)}
							ry={2 + ((f + i * 11) % 35) / 6}
							fill="none"
							stroke="#ecede0"
							strokeWidth="2"
							opacity={1 - ((f + i * 11) % 35) / 35}
						/>
					))}
				</>
			)}
		</>
	);
};

const Bag: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g transform={`translate(${x} ${y})`}>
		<path
			d="M-19 2V-25Q0-51 19-25V2"
			fill="none"
			stroke="#9e654c"
			strokeWidth="6"
		/>
		<path d="M-36-1H36L30 65H-29Z" fill="#ca9065" />
		<path d="M-25 5H24" stroke="#e0ad79" strokeWidth="4" />
		<path d="M-20-2l-10-30 10-4 13 34M10-2l5-40 12 2-3 38" fill="#6a976b" />
	</g>
);

const Bread: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g transform={`translate(${x} ${y}) rotate(-8)`}>
		<path
			d="M-34 0Q-36-25-12-27H22Q42-21 38 0Z"
			fill="#e8b46b"
			stroke="#a57848"
			strokeWidth="3"
		/>
		<path
			d="M-17-21l-6 11M1-23l-6 12M20-20l-6 11"
			stroke="#f8d79b"
			strokeWidth="5"
			strokeLinecap="round"
		/>
	</g>
);

const WateringCan: React.FC<{hand: Point; tilt: number}> = ({hand, tilt}) => (
	<g transform={`translate(${hand}) rotate(${tilt})`}>
		<path
			d="M-20 0Q-54-22-44-43Q-32-58-12-36"
			fill="none"
			stroke="#799e9c"
			strokeWidth="9"
		/>
		<path d="M-27-35H20L26 13H-28Z" fill="#66918c" />
		<path d="M18-14L61-41 67-32 27 6" fill="#799e9c" />
		<path d="M58-45l17 19" stroke="#b7c7b3" strokeWidth="9" />
	</g>
);

const Flower: React.FC<{x: number; growth: number; phase: number}> = ({
	x,
	growth,
	phase,
}) => {
	const f = useCurrentFrame();
	return (
		<g
			transform={`translate(${x} 931) scale(${growth}) rotate(${Math.sin(f / 30 + phase) * 3})`}
		>
			<path
				d="M0 0Q-12-85 0-182"
				stroke="#528369"
				strokeWidth="10"
				fill="none"
			/>
			<path
				d="M-4-65Q-87-67-72-113Q-21-119-4-65M-3-109Q58-163 72-121Q53-85-3-109"
				fill="#74a27b"
			/>
			<g transform="translate(0 -182)">
				{Array.from({length: 8}, (_, i) => (
					<ellipse
						key={i}
						cy="-29"
						rx="17"
						ry="34"
						fill={phase % 2 ? '#e7aa79' : '#f2d18b'}
						transform={`rotate(${i * 45})`}
					/>
				))}
				<circle r="24" fill="#a77b4d" />
				<circle r="14" fill="#ba9156" />
			</g>
		</g>
	);
};

const GardenScene: React.FC<{ending: boolean}> = ({ending}) => {
	const f = useCurrentFrame();
	const bend = ending ? 0 : move(f, [0, 45, 85, 125], [0, 85, 85, 0]);
	const hand: Point = ending
		? [28, -135 + Math.sin(f / 30) * 3]
		: [
				move(f, [0, 45, 90, 130], [55, 104, 104, 28]),
				move(f, [0, 45, 85, 130], [-100, -12, -12, -135]),
			];
	const watering = ending || f > 140;
	return (
		<svg viewBox="0 0 1920 1080" width="100%" height="100%">
			<Landscape garden rain={false} sunset={ending} />
			{ending ? (
				<>
					<Flower x={897} growth={0.93} phase={0} />
					<Flower x={1170} growth={1.15} phase={1} />
					<Flower x={1340} growth={0.8} phase={2} />
				</>
			) : (
				<g
					transform={`translate(897 935) scale(${move(f, [170, 299], [0, 0.6])})`}
				>
					<path
						d="M0 0V-77M0-30Q-53-78-45-40Q-35-12 0-30M0-60Q50-112 43-68Q34-41 0-60"
						stroke="#658e6e"
						strokeWidth="7"
						fill="#87ac7e"
					/>
				</g>
			)}
			<Character
				x={720}
				y={950}
				scale={1.7}
				who="minh"
				facing={1}
				walking={false}
				hand={hand}
				otherHand={[-42, -100 + bend]}
				bend={bend}
				sad={false}
			>
				{watering && (
					<WateringCan
						hand={hand}
						tilt={move(f, ending ? [0, 70] : [140, 175], [0, 25])}
					/>
				)}
			</Character>
			{!ending && f >= 60 && f < 115 && (
				<ellipse
					cx={897}
					cy={move(f, [60, 95], [924, 952])}
					rx="6"
					ry="4"
					fill="#d9b37b"
				/>
			)}
			{watering &&
				(ending || f > 175) &&
				Array.from({length: 12}, (_, i) => (
					<ellipse
						key={i}
						cx={892 + (i % 3) * 6}
						cy={712 + ((f * 4 + i * 18) % 220)}
						rx="3"
						ry="7"
						transform={`rotate(-15 ${892 + (i % 3) * 6} ${712 + ((f * 4 + i * 18) % 220)})`}
						fill="#b5d5ce"
						opacity=".85"
					/>
				))}
			{ending && (
				<>
					<Character
						x={1570}
						y={950}
						scale={1.65}
						who="lan"
						facing={-1}
						walking={false}
						hand={[105, -122 + Math.sin(f / 22) * 8]}
						otherHand={[-36, -100]}
						bend={0}
						sad={false}
					>
						{null}
					</Character>
					<Character
						x={move(f, [0, 110], [260, 480])}
						y={980}
						scale={1.45}
						who="nam"
						facing={1}
						walking={f < 110}
						hand={
							f < 110
								? [40 - Math.sin(f / 7.5) * 30, -105]
								: [70 + Math.sin(f / 12) * 15, -160 + Math.cos(f / 12) * 10]
						}
						otherHand={[-40, -105]}
						bend={0}
						sad={false}
					>
						{null}
					</Character>
					{Array.from({length: 5}, (_, i) => (
						<g
							key={i}
							transform={`translate(${930 + Math.sin(f / 35 + i * 2) * 220 + i * 45} ${430 + i * 48 + Math.cos(f / 22 + i) * 30})`}
						>
							<ellipse
								rx={4 + Math.abs(Math.sin(f / 3 + i)) * 11}
								ry="6"
								fill="#f5d59a"
								transform="rotate(-25)"
							/>
							<ellipse
								rx={4 + Math.abs(Math.sin(f / 3 + i)) * 11}
								ry="6"
								fill="#e4b789"
								transform="rotate(25)"
							/>
						</g>
					))}
				</>
			)}
		</svg>
	);
};

const ReturningBag = () => {
	const f = useCurrentFrame();
	const x = interpolate(f, [0, 130], [390, 925], {extrapolateRight: 'clamp'});
	const bend = move(f, [135, 170, 200, 245], [0, 65, 65, 0]);
	const hand: Point = [
		move(f, [130, 170, 280, 330], [45, 110, 110, 45]),
		move(f, [130, 170, 200, 245, 280, 330], [-100, -65, -65, -130, -130, -100]),
	];
	const receivingHand: Point = [
		move(f, [210, 245, 280, 330], [40, 110, 110, 45]),
		move(f, [210, 245, 280, 330], [-100, -130, -130, -100]),
	];
	const bagX =
		f < 170
			? 1112
			: f < 280
				? 925 + hand[0] * 1.7
				: 1300 - receivingHand[0] * 1.7;
	const bagY =
		f < 170
			? 839.5
			: f < 280
				? 950 + hand[1] * 1.7
				: 950 + receivingHand[1] * 1.7;
	return (
		<svg viewBox="0 0 1920 1080" width="100%" height="100%">
			<Landscape garden={false} rain={false} sunset={false} />
			<Character
				x={x}
				y={950}
				scale={1.7}
				who="minh"
				facing={1}
				walking={f < 130}
				hand={f < 130 ? [45 - Math.sin(f / 7.5) * 30, -100] : hand}
				otherHand={[-40, -100 + bend]}
				bend={bend}
				sad={false}
			>
				{null}
			</Character>
			<Character
				x={1300}
				y={950}
				scale={1.7}
				who="lan"
				facing={-1}
				walking={false}
				hand={receivingHand}
				otherHand={[-40, -100]}
				bend={0}
				sad={f < 200}
			>
				{null}
			</Character>
			<g transform={`translate(${bagX} ${bagY}) scale(1.7)`}>
				<Bag x={0} y={0} />
			</g>
		</svg>
	);
};

const SharingBread = () => {
	const f = useCurrentFrame();
	const x = interpolate(f, [0, 100], [400, 720], {extrapolateRight: 'clamp'});
	const hand: Point = [
		move(f, [100, 160], [45, 110]),
		move(f, [100, 160], [-100, -140]),
	];
	const recipient: Point = [
		move(f, [140, 180, 240, 290], [40, 110, 110, 60]),
		move(f, [140, 180, 240, 290], [-100, -140, -140, -200]),
	];
	return (
		<svg viewBox="0 0 1920 1080" width="100%" height="100%">
			<Landscape garden={false} rain={false} sunset={false} />
			<Character
				x={x}
				y={950}
				scale={1.7}
				who="lan"
				facing={1}
				walking={f < 100}
				hand={hand}
				otherHand={[-40, -100]}
				bend={0}
				sad={false}
			>
				{f < 190 && <Bread x={hand[0]} y={hand[1] - 4} />}
			</Character>
			<Character
				x={1094}
				y={950}
				scale={1.7}
				who="nam"
				facing={-1}
				walking={false}
				hand={recipient}
				otherHand={[-32, -108]}
				bend={0}
				sad={f < 185}
			>
				{f >= 190 && <Bread x={recipient[0]} y={recipient[1] - 4} />}
			</Character>
		</svg>
	);
};

const UmbrellaScene = () => {
	const f = useCurrentFrame();
	const x = interpolate(f, [80, 235], [1640, 1130], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const hand: Point = [move(f, [210, 285], [55, 105]), -150];
	return (
		<svg viewBox="0 0 1920 1080" width="100%" height="100%">
			<Landscape garden={false} rain sunset={false} />
			<Character
				x={850}
				y={950}
				scale={1.7}
				who="minh"
				facing={1}
				walking={false}
				hand={[
					move(f, [250, 310], [20, 65]),
					move(f, [250, 310], [-110, -155]),
				]}
				otherHand={[-26, -117]}
				bend={0}
				sad={f < 270}
			>
				{null}
			</Character>
			<Character
				x={x}
				y={950}
				scale={1.7}
				who="nam"
				facing={-1}
				walking={f > 80 && f < 235}
				hand={hand}
				otherHand={[-40, -105]}
				bend={0}
				sad={false}
			>
				<g
					transform={`translate(${hand}) rotate(${move(f, [230, 300], [0, -6])})`}
				>
					<path
						d="M0-220V12Q0 42-22 31"
						stroke="#745b45"
						strokeWidth="6"
						fill="none"
						strokeLinecap="round"
					/>
					<path
						d="M-153-210Q-102-301 0-301Q102-301 153-210Q114-237 77-210Q38-239 0-210Q-40-239-77-210Q-113-237-153-210Z"
						fill="#dca467"
						stroke="#c18c55"
						strokeWidth="3"
					/>
					<path
						d="M0-301Q-50-273-77-210M0-301Q50-273 77-210M0-301V-210"
						stroke="#f0c086"
						strokeWidth="3"
						fill="none"
					/>
				</g>
			</Character>
		</svg>
	);
};

export const Film = () => (
	<AbsoluteFill style={{background: '#d9d7be'}}>
		<Html5Audio src={staticFile('music.m4a')} volume={0.5} />
		<Sequence
			name="Gieo một hạt lành"
			from={story[0].from}
			durationInFrames={story[0].duration}
		>
			<GardenScene ending={false} />
			<Html5Audio src={staticFile('voice-0.mp3')} />
		</Sequence>
		<Sequence
			name="Giúp người không tính toán"
			from={story[1].from}
			durationInFrames={story[1].duration}
		>
			<ReturningBag />
			<Html5Audio src={staticFile('voice-1.mp3')} />
		</Sequence>
		<Sequence
			name="Lòng tốt được tiếp nối"
			from={story[2].from}
			durationInFrames={story[2].duration}
		>
			<SharingBread />
			<Html5Audio src={staticFile('voice-2.mp3')} />
		</Sequence>
		<Sequence
			name="Một chiếc ô trong mưa"
			from={story[3].from}
			durationInFrames={story[3].duration}
		>
			<UmbrellaScene />
			<Html5Audio src={staticFile('voice-3.mp3')} />
		</Sequence>
		<Sequence
			name="Gặt sự bình an"
			from={story[4].from}
			durationInFrames={story[4].duration}
		>
			<GardenScene ending />
			<Html5Audio src={staticFile('voice-4.mp3')} />
		</Sequence>
	</AbsoluteFill>
);
