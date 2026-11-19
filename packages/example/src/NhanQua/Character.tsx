import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Limb, type Point} from '../Alex/Limb';

export const Character: React.FC<{
	x: number;
	y: number;
	scale: number;
	who: 'minh' | 'lan' | 'nam';
	facing: number;
	walking: boolean;
	hand: Point;
	otherHand: Point;
	bend: number;
	sad: boolean;
	children: React.ReactNode;
}> = ({
	x,
	y,
	scale,
	who,
	facing,
	walking,
	hand,
	otherHand,
	bend,
	sad,
	children,
}) => {
	const f = useCurrentFrame();
	const cycle = f / 7.5;
	const shirt =
		who === 'minh' ? '#438c86' : who === 'lan' ? '#cf8062' : '#d6ad5e';
	const skin = '#e8b08a';
	const bob = walking ? -Math.abs(Math.cos(cycle)) * 3 : Math.sin(f / 28) * 1.2;
	const feet: Point[] = walking
		? [
				[-18 + Math.sin(cycle) * 32, -Math.max(0, Math.cos(cycle)) * 20],
				[18 - Math.sin(cycle) * 32, -Math.max(0, -Math.cos(cycle)) * 20],
			]
		: [
				[-28, 0],
				[30, 0],
			];
	return (
		<g transform={`translate(${x} ${y}) scale(${scale})`}>
			<ellipse cy="9" rx="65" ry="12" fill="#294b48" opacity=".12" />
			<g transform={`scale(${facing} 1)`}>
				<Limb
					root={[-17, -105 + bend]}
					end={feet[0]}
					length={walking || bend > 0 ? 62 : 54}
					bend={-1}
					color="#425562"
					width={24}
				/>
				<Limb
					root={[17, -105 + bend]}
					end={feet[1]}
					length={walking || bend > 0 ? 62 : 54}
					bend={1}
					color="#344956"
					width={24}
				/>
				{feet.map((foot, i) => (
					<path
						key={i}
						d={`M${foot[0] - 10} ${foot[1] + 3}h27`}
						stroke="#283c47"
						strokeWidth="13"
						strokeLinecap="round"
					/>
				))}
				<g transform={`translate(0 ${bob})`}>
					<Limb
						root={[-29, -184 + bend]}
						end={otherHand}
						length={56}
						bend={1}
						color={shirt}
						width={22}
					/>
					<circle cx={otherHand[0]} cy={otherHand[1]} r="10" fill={skin} />
					<path
						d={`M-32 ${-198 + bend}Q0 ${-210 + bend} 34 ${-198 + bend}L40 ${-108 + bend}Q0 ${-93 + bend}-39 ${-108 + bend}Z`}
						fill={shirt}
					/>
					<path d={`M-10 ${-217 + bend}v21q10 13 21 0v-21`} fill={skin} />
					<g transform={`translate(0 ${bend}) rotate(${sad ? 8 : -4} 0 -218)`}>
						{who === 'lan' && (
							<path
								d="M-36-265Q-52-236-39-194H39Q50-242 31-270Z"
								fill="#58433d"
							/>
						)}
						<ellipse cy="-245" rx="35" ry="43" fill={skin} />
						<path
							d={
								who === 'lan'
									? 'M-36-241Q-47-293-1-294Q46-295 37-243L16-270Q-14-252-36-253'
									: 'M-36-246Q-45-293 0-295Q45-298 38-250L24-274Q0-253-36-258'
							}
							fill={who === 'nam' ? '#6f5544' : '#33454a'}
						/>
						<g
							transform={`translate(5 -246) scale(1 ${f % 121 < 5 ? 0.1 : 1})`}
							fill="#2c4146"
						>
							<ellipse cx="-14" rx="3" ry="4" />
							<ellipse cx="12" rx="3" ry="4" />
						</g>
						<path
							d="M4-241l5 12H3"
							fill="none"
							stroke="#cb9075"
							strokeWidth="2"
						/>
						<path
							d={sad ? 'M-8-219Q2-226 13-219' : 'M-8-224Q2-212 15-226'}
							fill="none"
							stroke="#995f51"
							strokeWidth="2.5"
							strokeLinecap="round"
						/>
						<ellipse
							cx="-19"
							cy="-230"
							rx="8"
							ry="4"
							fill="#d18c78"
							opacity=".45"
						/>
					</g>
					<Limb
						root={[30, -184 + bend]}
						end={hand}
						length={59}
						bend={-1}
						color={shirt}
						width={23}
					/>
					<circle cx={hand[0]} cy={hand[1]} r="10" fill={skin} />
					{children}
				</g>
			</g>
		</g>
	);
};
