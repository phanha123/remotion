import React, {useId} from 'react';
import {useCurrentFrame} from 'remotion';

export const Tree: React.FC<{
	x: number;
	y: number;
	scale: number;
	phase: number;
}> = ({x, y, scale, phase}) => {
	const f = useCurrentFrame();
	return (
		<g transform={`translate(${x} ${y}) scale(${scale})`}>
			<path
				d="M0 0Q5-92-9-219M-3-97l-44-63M-6-143l38-40"
				fill="none"
				stroke="#65776d"
				strokeWidth="14"
				strokeLinecap="round"
			/>
			<g transform={`rotate(${Math.sin(f / 35 + phase) * 2.8} 0 -85)`}>
				<ellipse cx="-41" cy="-176" rx="65" ry="75" fill="#8ca792" />
				<ellipse cx="29" cy="-195" rx="77" ry="88" fill="#83a18c" />
				<ellipse cx="-11" cy="-240" rx="66" ry="72" fill="#9db49a" />
				<path
					d="M-44-192q30-37 63-29M4-264q31-14 47 10"
					stroke="#b5c5a7"
					strokeWidth="6"
					fill="none"
					strokeLinecap="round"
				/>
			</g>
		</g>
	);
};

export const Sky: React.FC<{night: boolean; sunset: boolean}> = ({
	night,
	sunset,
}) => {
	const f = useCurrentFrame();
	const id = useId();
	return (
		<>
			<defs>
				<linearGradient id={id} x2="0" y2="1">
					<stop
						stopColor={night ? '#263a57' : sunset ? '#dba89a' : '#b6d5d6'}
					/>
					<stop
						offset="1"
						stopColor={night ? '#71818d' : sunset ? '#f9d9a3' : '#e9e6ce'}
					/>
				</linearGradient>
			</defs>
			<rect width="1920" height="1080" fill={`url(#${id})`} />
			<circle
				cx={sunset ? 1350 : 1510}
				cy={sunset ? 360 : 185}
				r={sunset ? 106 : 67}
				fill={night ? '#f2e7bf' : '#ffedbd'}
				opacity=".94"
			/>
			{night
				? Array.from({length: 32}, (_, i) => (
						<circle
							key={i}
							cx={(i * 137 + 60) % 1900}
							cy={(i * 71 + 40) % 420}
							r={i % 3 === 0 ? 2 : 1}
							fill="#fcf4db"
							opacity={0.4 + Math.sin(f / 25 + i) * 0.3}
						/>
					))
				: [0, 1, 2, 3].map((i) => (
						<g
							key={i}
							transform={`translate(${((i * 580 + f * 0.32) % 2500) - 340} ${110 + (i % 3) * 73})`}
							fill="#f8f3df"
							opacity=".55"
						>
							<ellipse rx="144" ry="22" />
							<ellipse cx="-40" cy="-13" rx="67" ry="30" />
							<ellipse cx="45" cy="-19" rx="50" ry="31" />
						</g>
					))}
			{[0, 1, 2, 3].map((i) => (
				<path
					key={i}
					d={`M-15 0Q-8 ${-7 - Math.sin(f / 5 + i) * 5} 0 0Q8 ${-7 - Math.sin(f / 5 + i) * 5} 15 0`}
					transform={`translate(${((f * (2 + i * 0.2) + i * 250) % 2500) - 200} ${220 + i * 45}) scale(${0.5 + i * 0.1})`}
					stroke={night ? '#bacac7' : '#657d7e'}
					strokeWidth="3"
					fill="none"
				/>
			))}
		</>
	);
};
