import type {FC} from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';

const boneStarts = [
	24, 31, 37, 42, 46, 51, 55, 58, 62, 66, 69, 72, 76, 79, 83, 86, 89, 93, 96,
	100, 104, 107, 111, 115, 120, 125, 131, 138,
];

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const Bone: FC<{x: number; y: number}> = ({x, y}) => (
	<g transform={`translate(${x} ${y})`} stroke="#221e14" strokeWidth={1.55}>
		<rect x={-4.4} y={-19.5} width={8.8} height={39} fill="#bbae8e" />
		<ellipse cy={-19.5} rx={6.3} ry={4.05} fill="#ccc0a2" />
		<ellipse cy={19.5} rx={6.3} ry={4.05} fill="#ccc0a2" />
	</g>
);

const BoneLineup: FC = () => {
	const frame = useCurrentFrame();
	return (
		<>
			{boneStarts.map((from, i) =>
				frame < from ? null : (
					<Bone
						key={from}
						x={224 + 64 * (i % 10)}
						y={176 + Math.floor(i / 10) * (272 / 3)}
					/>
				),
			)}
			<g opacity={interpolate(frame, [200, 213], [0, 1], clamp)}>
				<Bone x={800} y={416} />
				<ellipse
					cx={800}
					cy={416}
					rx={24.8}
					ry={38}
					stroke="#c44e39"
					strokeWidth={3}
					fill="none"
				/>
			</g>
		</>
	);
};

const BoneCount: FC = () => {
	const frame = useCurrentFrame();
	const extra = frame >= 206;
	return (
		<text
			x={864}
			y={172}
			textAnchor="middle"
			fontFamily="Times New Roman, serif"
			fontSize={130}
			fontWeight={700}
			fill={extra ? '#e5503b' : '#f1d082'}
			paintOrder="stroke"
			stroke="#0f0c08"
			strokeWidth={6}
			strokeLinejoin="round"
			opacity={interpolate(frame, [76, 85], [0, 1], clamp)}
		>
			{extra ? 29 : 28}
		</text>
	);
};

const OpeningLabel: FC<{text: string}> = ({text}) => {
	const frame = useCurrentFrame();
	return (
		<g
			opacity={interpolate(frame, [6, 25], [0, 1], {
				...clamp,
				easing: Easing.inOut(Easing.quad),
			})}
		>
			<rect
				x={333}
				y={30}
				width={358}
				height={47}
				rx={6}
				fill="#ede5ce"
				stroke="#221d15"
				strokeWidth={1.35}
			/>
			<text
				x={512}
				y={62}
				textAnchor="middle"
				fontFamily="Segoe UI, Arial, sans-serif"
				fontSize={26}
				fontWeight={700}
				fill="#1b160f"
			>
				{text}
			</text>
		</g>
	);
};

export const Opening: FC<{label: string}> = ({label}) => (
	<AbsoluteFill>
		<svg viewBox="0 0 1024 576" width="1024" height="576">
			<OpeningLabel text={label} />
			<BoneLineup />
			<BoneCount />
		</svg>
	</AbsoluteFill>
);
