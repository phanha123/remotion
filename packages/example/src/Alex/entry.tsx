import React from 'react';
import {
	AbsoluteFill,
	Composition,
	Html5Audio,
	interpolate,
	registerRoot,
	Sequence,
	staticFile,
	useCurrentFrame,
} from 'remotion';
import timeline from './timeline.json';

const INK = '#243c42';
const CREAM = '#f6f0e4';
const GOLD = '#d9a34c';

const Person: React.FC<{
	x: number;
	y: number;
	mara: boolean;
	sad: boolean;
	scale: number;
	painting: boolean;
}> = ({x, y, mara, sad, scale, painting}) => {
	const frame = useCurrentFrame();
	const breath = Math.sin(frame / 28) * 2;
	return (
		<g transform={`translate(${x} ${y + breath}) scale(${scale})`}>
			<ellipse cx="0" cy="285" rx="86" ry="13" fill={INK} opacity=".12" />
			<path
				d="M-34 170L-40 270M29 170L40 270"
				stroke={INK}
				strokeWidth="28"
				strokeLinecap="round"
			/>
			<path
				d="M-58 280h33m48 0h34"
				stroke={INK}
				strokeWidth="19"
				strokeLinecap="round"
			/>
			<path
				d="M-65 50Q0 20 65 50L53 184Q0 200-53 184Z"
				fill={mara ? '#d6a15d' : '#688c86'}
			/>
			<path
				d={painting ? 'M-48 65L-78 126L-145 92' : 'M-48 65L-69 142L-48 171'}
				fill="none"
				stroke={mara ? '#d6a15d' : '#688c86'}
				strokeWidth="26"
				strokeLinecap="round"
			/>
			<path
				d={painting ? 'M50 65L80 100L130 45' : 'M48 65L69 142L48 171'}
				fill="none"
				stroke={mara ? '#d6a15d' : '#688c86'}
				strokeWidth="26"
				strokeLinecap="round"
			/>
			{painting && (
				<>
					<circle cx="131" cy="45" r="13" fill="#e8b496" />
					<path d="M125 55l33-70" stroke={INK} strokeWidth="6" />
					<path d="M158-15l5-15" stroke={GOLD} strokeWidth="9" />
				</>
			)}
			<path d="M-13 8v28q13 15 26 0V8" fill="#dca587" />
			{mara && <path d="M-49-60Q-67 8-44 37H47Q65-10 47-60Z" fill="#493e3b" />}
			<ellipse cy="-34" rx="43" ry="54" fill="#e8b496" />
			<path
				d={
					mara
						? 'M-45-33Q-60-101 2-98Q57-100 44-28L26-68Q-10-40-45-33'
						: 'M-44-38Q-57-98 9-94Q58-92 44-37L29-63Q-4-48-44-52'
				}
				fill="#393f3c"
			/>
			<path
				d="M-20-30h3m30 0h3"
				stroke={INK}
				strokeWidth="5"
				strokeLinecap="round"
			/>
			<path
				d={sad ? 'M-10 1Q0-7 10 1' : 'M-11-1Q0 9 11-1'}
				fill="none"
				stroke={INK}
				strokeWidth="3"
				strokeLinecap="round"
			/>
		</g>
	);
};

const Artwork: React.FC<{x: number; y: number; complete: boolean}> = ({
	x,
	y,
	complete,
}) => (
	<g transform={`translate(${x} ${y})`}>
		<rect width="260" height="320" fill="#d8b781" rx="3" />
		<rect x="12" y="12" width="236" height="296" fill="#fcf6e8" />
		{complete ? (
			<>
				<path d="M24 218Q84 132 150 202T236 183V294H24Z" fill="#789d8b" />
				<path d="M24 260Q122 180 236 244V294H24Z" fill="#2b6261" />
				<circle cx="169" cy="94" r="43" fill={GOLD} />
				<path
					d="M117 289Q94 206 118 150M118 210Q63 209 69 173Q106 173 118 210M113 241Q172 239 168 199Q128 202 113 241"
					fill="#f6f0e4"
					stroke="#f6f0e4"
					strokeWidth="5"
				/>
			</>
		) : (
			<>
				<path
					d="M35 235Q93 139 153 203T225 192M117 281Q94 206 118 150"
					fill="none"
					stroke="#c7c7b5"
					strokeWidth="3"
				/>
				<circle
					cx="169"
					cy="94"
					r="42"
					fill="none"
					stroke="#c7c7b5"
					strokeWidth="3"
				/>
			</>
		)}
	</g>
);

const Illustration: React.FC<{kind: string}> = ({kind}) => {
	const frame = useCurrentFrame();
	const dark = ['alone', 'realize', 'pressure'].includes(kind);
	const art = [
		'dream',
		'invite',
		'paint',
		'gallery',
		'mara',
		'kind',
		'end',
	].includes(kind);
	const complete = ['paint', 'gallery', 'mara', 'kind', 'end'].includes(kind);
	const showMara = ['mara', 'gallery'].includes(kind);
	return (
		<svg
			viewBox="0 0 1050 700"
			style={{width: 1090, height: 727, overflow: 'visible'}}
		>
			<defs>
				<linearGradient id={`wall-${kind}`} x2="0" y2="1">
					<stop stopColor={dark ? '#36505b' : '#ebe3d3'} />
					<stop offset="1" stopColor={dark ? '#263b47' : '#e1dbcc'} />
				</linearGradient>
			</defs>
			<path
				d="M67 570V160Q67 68 160 68H882Q975 68 975 160V570Z"
				fill={`url(#wall-${kind})`}
			/>
			<path d="M67 570H975L1030 650H14Z" fill={dark ? '#1f3540' : '#d4cebc'} />
			<path
				d="M67 570H975"
				stroke={dark ? '#6f8082' : '#bbbca9'}
				strokeWidth="2"
			/>
			<g transform="translate(132 122)">
				<rect
					width="235"
					height="270"
					rx="115"
					fill={dark ? '#192f43' : '#f8f2df'}
				/>
				<circle
					cx={dark ? 165 : 80}
					cy="77"
					r="31"
					fill={dark ? '#f2e2b8' : '#e8bd70'}
				/>
				<path
					d="M0 215Q50 164 114 204T235 191V270H0Z"
					fill={dark ? '#294758' : '#afc4ad'}
				/>
				<path
					d="M118 0V270M0 153H235"
					stroke={dark ? '#6c7b7b' : '#d1c7b0'}
					strokeWidth="9"
				/>
			</g>
			<g transform="translate(880 400)">
				<path
					d="M-13 110Q-90 6-49-44Q6-15-13 110M0 110Q-12-27 41-72Q80 2 0 110M9 110Q69 9 94 18Q114 78 9 110"
					fill={dark ? '#426467' : '#6e927c'}
				/>
				<path d="M-39 103H39L28 170H-27Z" fill="#bc8567" />
			</g>
			{kind === 'office' && (
				<g>
					<path
						d="M365 419H806M394 419V570M781 419V570"
						stroke={INK}
						strokeWidth="13"
					/>
					<rect x="541" y="250" width="204" height="135" rx="9" fill={INK} />
					<rect x="551" y="260" width="184" height="113" fill="#b4d1c0" />
					<path
						d="M618 306l14 14 32-35"
						fill="none"
						stroke="#427968"
						strokeWidth="9"
					/>
					<path d="M642 385V416M608 416H676" stroke={INK} strokeWidth="9" />
				</g>
			)}
			{art && (
				<g transform={`rotate(${kind === 'dream' ? -7 : 0} 600 380)`}>
					<path
						d="M564 280L485 589M632 280L710 589M496 538H698"
						stroke="#9a7758"
						strokeWidth="13"
					/>
					<Artwork x={469} y={153} complete={complete} />
				</g>
			)}
			{kind === 'invite' && (
				<g
					transform={`translate(650 ${105 + Math.sin(frame / 24) * 5}) rotate(6)`}
				>
					<rect
						width="270"
						height="174"
						rx="6"
						fill="#fcf7e9"
						stroke={GOLD}
						strokeWidth="3"
					/>
					<text
						x="135"
						y="50"
						textAnchor="middle"
						fontSize="17"
						fill={INK}
						letterSpacing="4"
					>
						TRIỂN LÃM
					</text>
					<text
						x="135"
						y="91"
						textAnchor="middle"
						fontSize="28"
						fontFamily="Times New Roman"
						fill={INK}
					>
						Gửi giấc mơ của bạn
					</text>
					<path d="M70 120H200" stroke={GOLD} strokeWidth="3" />
				</g>
			)}
			{['alone', 'realize'].includes(kind) && (
				<g>
					<path d="M455 489H779V569H455Z" fill="#567079" />
					<path
						d="M445 461Q445 433 476 433H758Q789 433 789 461V504H445Z"
						fill="#67808a"
					/>
					<rect x="679" y="465" width="37" height="62" rx="6" fill="#182d3b" />
					<rect x="684" y="472" width="27" height="41" fill="#9fbdc1" />
					<text
						x="705"
						y="194"
						textAnchor="middle"
						fontSize="21"
						fill="#d9e2dc"
					>
						“Hôm nay, cậu có rảnh không?”
					</text>
					<text
						x="705"
						y="234"
						textAnchor="middle"
						fontSize="16"
						fill="#a6b9bd"
					>
						Đã gửi · 21:47
					</text>
					<path d="M576 275H832" stroke="#90a7ae" opacity=".3" />
				</g>
			)}
			<Person
				x={showMara ? 360 : kind === 'office' ? 420 : art ? 329 : 519}
				y={288}
				mara={false}
				sad={dark || kind === 'dream'}
				scale={0.96}
				painting={['paint', 'office'].includes(kind)}
			/>
			{showMara && (
				<Person
					x={805}
					y={288}
					mara
					sad={false}
					scale={0.96}
					painting={false}
				/>
			)}
			{['friends', 'pressure'].includes(kind) &&
				[0, 1, 2].map((n) => (
					<g
						key={n}
						transform={`translate(${n === 1 ? 635 : 124 + n * 35} ${119 + n * 103 + Math.sin(frame / 19 + n) * 5})`}
						opacity={interpolate(frame, [10 + n * 16, 25 + n * 16], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						})}
					>
						<rect
							width="283"
							height="77"
							rx="16"
							fill={dark ? '#f4eee1' : '#fff9ed'}
						/>
						<circle
							cx="34"
							cy="38"
							r="16"
							fill={n === 1 ? '#d9a34c' : '#87a79a'}
						/>
						<text x="64" y="45" fill={INK} fontSize="20">
							{
								[
									'Sửa máy giúp mình nhé?',
									'Cậu làm giúp được không?',
									'Alex ơi, nhờ chút!',
								][n]
							}
						</text>
					</g>
				))}
			{kind === 'no' && (
				<g
					transform={`translate(586 145) scale(${interpolate(frame, [10, 30], [0.85, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})})`}
				>
					<path
						d="M0 0H280Q305 0 305 25V112Q305 137 280 137H48L0 172V137Q-25 137-25 112V25Q-25 0 0 0"
						fill={GOLD}
					/>
					<text
						x="140"
						y="89"
						textAnchor="middle"
						fontSize="65"
						fontWeight="700"
						fill={INK}
					>
						KHÔNG.
					</text>
				</g>
			)}
			{kind === 'intro' && (
				<g>
					<circle cx="688" cy="236" r="49" fill={GOLD} opacity=".25" />
					<path
						d="M688 254l-26-22q-15-25 10-29q13 0 16 12q5-12 18-12q24 5 9 29Z"
						fill={GOLD}
					/>
				</g>
			)}
			{kind === 'gallery' && (
				<g>
					<rect x="753" y="122" width="146" height="78" fill="#faf5e9" />
					<text
						x="826"
						y="153"
						textAnchor="middle"
						fontSize="14"
						letterSpacing="3"
						fill={INK}
					>
						ALEX
					</text>
					<text
						x="826"
						y="180"
						textAnchor="middle"
						fontSize="16"
						fontFamily="Times New Roman"
						fill={INK}
					>
						Một chỗ cho mình
					</text>
				</g>
			)}
			{kind === 'end' && (
				<g>
					<path
						d="M200 90q110-88 230-15"
						stroke={GOLD}
						fill="none"
						strokeWidth="2"
					/>
					<circle cx="450" cy="83" r="5" fill={GOLD} />
				</g>
			)}
		</svg>
	);
};

const Scene: React.FC<{scene: (typeof timeline)[number]; index: number}> = ({
	scene,
	index,
}) => {
	const f = useCurrentFrame();
	const dark = ['alone', 'realize', 'pressure'].includes(scene.kind);
	const final = scene.kind === 'end';
	const opacity = interpolate(
		f,
		[0, 15, scene.duration - 15, scene.duration - 1],
		[0, 1, 1, 0],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);
	const sentences = scene.text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [scene.text];
	const progress = Math.max(0, (f - 20) / (scene.duration - 40));
	let sum = 0;
	const caption =
		sentences.find((sentence) => {
			sum += sentence.length / scene.text.length;
			return progress < sum;
		}) ?? sentences[sentences.length - 1];
	return (
		<AbsoluteFill
			style={{
				backgroundColor: dark ? '#1c303b' : CREAM,
				color: dark ? CREAM : INK,
				fontFamily: '"Segoe UI", Arial, sans-serif',
			}}
		>
			<AbsoluteFill
				style={{
					opacity,
					transform: `translateY(${interpolate(f, [0, 35], [12, 0], {extrapolateRight: 'clamp'})}px)`,
				}}
			>
				<div
					style={{
						position: 'absolute',
						top: 112,
						left: 112,
						fontSize: 16,
						letterSpacing: 6,
						color: dark ? '#a7bbb9' : '#73877c',
					}}
				>
					MỘT CHỖ CHO MÌNH
				</div>
				<div style={{position: 'absolute', top: 246, left: 112, width: 570}}>
					<div
						style={{
							fontSize: 17,
							letterSpacing: 5,
							color: GOLD,
							marginBottom: 30,
						}}
					>
						{final
							? 'LỜI NHẮN DÀNH CHO BẠN'
							: `${String(index + 1).padStart(2, '0')} / CÂU CHUYỆN CỦA ALEX`}
					</div>
					<h1
						style={{
							fontFamily: '"Times New Roman", serif',
							fontWeight: 400,
							fontSize: final ? 76 : 68,
							lineHeight: 1.17,
							letterSpacing: -2,
							margin: 0,
						}}
					>
						{scene.title}
					</h1>
					<div
						style={{height: 3, width: 88, background: GOLD, marginTop: 38}}
					/>
					<div
						style={{
							fontSize: 22,
							lineHeight: 1.7,
							marginTop: 26,
							color: dark ? '#a8bdbd' : '#74867d',
							maxWidth: 480,
						}}
					>
						{scene.kind === 'intro'
							? 'Một câu chuyện về lòng tốt, ranh giới và giá trị của chính bạn.'
							: scene.kind === 'no'
								? 'Không phải từ chối yêu thương.\nMà là bắt đầu yêu thương mình.'
								: scene.kind === 'end'
									? 'Không vì bạn làm được điều gì.\nMà vì bạn là chính bạn.'
									: scene.kind === 'mara'
										? 'Không nhờ vả. Không điều kiện.\nChỉ đơn giản là ở bên.'
										: ' '}
					</div>
				</div>
				<div
					style={{
						position: 'absolute',
						left: 734,
						top: 136,
						transform: `scale(${interpolate(f, [0, scene.duration], [0.98, 1.025])})`,
					}}
				>
					<Illustration kind={scene.kind} />
				</div>
				<div
					style={{
						position: 'absolute',
						bottom: 113,
						left: 150,
						right: 150,
						textAlign: 'center',
						fontSize: 30,
						fontWeight: 400,
						lineHeight: 1.5,
						minHeight: 83,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					{caption.trim()}
				</div>
			</AbsoluteFill>
			<div
				style={{
					position: 'absolute',
					top: 0,
					height: 48,
					left: 0,
					right: 0,
					background: '#14272b',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					bottom: 0,
					height: 48,
					left: 0,
					right: 0,
					background: '#14272b',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					bottom: 47,
					left: 0,
					height: 3,
					width: `${((index + f / scene.duration) / timeline.length) * 100}%`,
					background: GOLD,
				}}
			/>
		</AbsoluteFill>
	);
};

const Film = () => (
	<AbsoluteFill>
		<Html5Audio src={staticFile('soundtrack.m4a')} />
		{timeline.map((scene, index) => (
			<Sequence
				key={scene.kind}
				name={scene.title}
				from={scene.fromFrame}
				durationInFrames={scene.duration}
			>
				<Scene scene={scene} index={index} />
			</Sequence>
		))}
	</AbsoluteFill>
);

registerRoot(() => (
	<Composition
		id="MotChoChoMinh"
		component={Film}
		width={1920}
		height={1080}
		fps={30}
		durationInFrames={timeline.reduce(
			(total, scene) => total + scene.duration,
			0,
		)}
	/>
));
