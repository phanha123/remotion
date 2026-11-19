import React from 'react';
import {
	AbsoluteFill,
	Composition,
	Easing,
	Html5Audio,
	interpolate,
	registerRoot,
	Sequence,
	staticFile,
	useCurrentFrame,
} from 'remotion';
import {Limb} from './Limb';
import {Sky, Tree} from './Nature';
import timeline from './timeline.json';

const ink = '#263d48';
const skin = '#e7ae8c';
const gold = '#eab66a';
type Point = [number, number];
type Action =
	| 'walk'
	| 'idle'
	| 'type'
	| 'phone'
	| 'offer'
	| 'paint'
	| 'stop'
	| 'sit'
	| 'listen'
	| 'reach';

const move = (f: number, frames: number[], values: number[]) =>
	interpolate(f, frames, values, {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.inOut(Easing.cubic),
	});

const Cup: React.FC<{x: number; y: number; steam: number}> = ({
	x,
	y,
	steam,
}) => (
	<g transform={`translate(${x} ${y})`}>
		<path
			d="M9-16Q30-20 27-5Q24 3 12-1"
			fill="none"
			stroke="#faf2dc"
			strokeWidth="5"
		/>
		<path d="M-15-21H15L11 8H-10Z" fill="#faf2dc" />
		<ellipse cy="-21" rx="15" ry="4" fill="#64493b" />
		{[0, 1].map((n) => (
			<path
				key={n}
				d={`M${-6 + n * 12} -32q-8-12 1-23t0-17`}
				transform={`translate(0 ${-((steam + n * 10) % 30)})`}
				stroke="#fff8e2"
				fill="none"
				strokeWidth="2"
				opacity={0.45 * (1 - ((steam + n * 10) % 30) / 30)}
			/>
		))}
	</g>
);

const Phone: React.FC<{x: number; y: number; angle: number; lit: boolean}> = ({
	x,
	y,
	angle,
	lit,
}) => (
	<g transform={`translate(${x} ${y}) rotate(${angle})`}>
		<rect x="-15" y="-28" width="30" height="54" rx="6" fill="#253d4c" />
		<rect
			x="-11"
			y="-23"
			width="22"
			height="42"
			rx="3"
			fill={lit ? '#c3dfd1' : '#314854'}
		/>
		{lit && (
			<>
				<rect x="-7" y="-13" width="14" height="7" rx="2" fill="#fff8e8" />
				<rect x="-7" y="-1" width="10" height="7" rx="2" fill="#80aaa4" />
			</>
		)}
	</g>
);

const Character: React.FC<{
	x: number;
	y: number;
	scale: number;
	action: Action;
	who: 'alex' | 'mara' | 'colleague';
	sad: boolean;
	facing: number;
	phase: number;
}> = ({x, y, scale, action, who, sad, facing, phase}) => {
	const frame = useCurrentFrame() + phase;
	const cycle = frame / 7.5;
	const walking = action === 'walk';
	const sitting = action === 'sit' || action === 'type';
	const bounce = walking ? Math.cos(cycle * 2) * 3 : Math.sin(frame / 22) * 1.5;
	const sway = walking ? Math.sin(cycle) * 3 : Math.sin(frame / 36) * 1.4;
	const shirt =
		who === 'mara' ? '#c58060' : who === 'colleague' ? '#858ba8' : '#5b9291';
	const hair =
		who === 'mara' ? '#563e37' : who === 'colleague' ? '#6c5141' : '#2d3c41';
	const stride = Math.sin(cycle);
	const leftFoot: Point = sitting
		? [29, -1]
		: [
				-17 + (walking ? stride * 39 : 0),
				walking ? -Math.max(0, Math.cos(cycle)) * 24 : 0,
			];
	const rightFoot: Point = sitting
		? [77, -1]
		: [
				20 - (walking ? stride * 39 : 0),
				walking ? -Math.max(0, -Math.cos(cycle)) * 24 : 0,
			];
	let leftHand: Point = [
		-47 + (walking ? stride * 34 : 0),
		-91 + (walking ? Math.cos(cycle) * 8 : Math.sin(frame / 24) * 2),
	];
	let rightHand: Point = [
		46 - (walking ? stride * 34 : 0),
		-91 - (walking ? Math.cos(cycle) * 8 : 0),
	];
	let leftElbow: Point = [-46 + (walking ? stride * 17 : 0), -145];
	let rightElbow: Point = [46 - (walking ? stride * 17 : 0), -145];
	if (action === 'type') {
		leftElbow = [14, -141];
		rightElbow = [67, -142];
		leftHand = [66 + Math.sin(frame / 2.8) * 5, -136 + Math.sin(frame / 2) * 4];
		rightHand = [
			99 + Math.sin(frame / 2.2) * 5,
			-135 + Math.cos(frame / 2.5) * 4,
		];
	}
	if (action === 'phone' || action === 'sit') {
		rightElbow = [61, -110];
		rightHand = [
			65 + Math.sin(frame / 22) * 2,
			-150 + Math.sin(frame / 21) * 2,
		];
		leftHand = [-35, -102];
	}
	if (action === 'paint') {
		leftElbow = [-56, -155];
		rightElbow = [80, -143 + Math.sin(frame / 15) * 10];
		rightHand = [
			124 + Math.sin(frame / 15) * 19,
			-165 + Math.sin(frame / 11) * 34,
		];
		leftHand = [-63, -126];
	}
	if (action === 'stop') {
		rightElbow = [75, -153];
		rightHand = [90 + Math.sin(frame / 35) * 2, -207];
		leftHand = [-40, -120];
	}
	if (action === 'offer') {
		leftElbow = [-30, -125];
		rightElbow = [73, -134];
		rightHand = [115, -148 + Math.sin(frame / 24) * 2];
		leftHand = [8, -146];
	}
	if (action === 'listen') {
		rightElbow = [63, -111];
		rightHand = [
			65 + Math.sin(frame / 18) * 12,
			-153 + Math.cos(frame / 18) * 8,
		];
		leftHand = [-42, -103];
	}
	if (action === 'reach') {
		rightElbow = [76, -122];
		rightHand = [
			114 + Math.sin(frame / 18) * 11,
			-125 + Math.sin(frame / 22) * 14,
		];
		leftHand = [-32, -110];
	}
	const blink = frame % 117 < 5 ? 0.12 : 1;
	const headTilt =
		action === 'stop'
			? Math.sin(frame / 8) * 6 * move(frame, [0, 80, 110], [1, 1, 0])
			: sad
				? 9 + Math.sin(frame / 30) * 2
				: action === 'listen'
					? Math.sin(frame / 15) * 5
					: walking
						? Math.sin(cycle) * 2
						: -3 + Math.sin(frame / 35) * 2;
	return (
		<g transform={`translate(${x} ${y}) scale(${scale})`}>
			<ellipse
				cy="8"
				rx={walking ? 59 : 67}
				ry="10"
				fill="#233a40"
				opacity=".13"
			/>
			<g transform={`scale(${facing} 1)`}>
				<Limb
					root={[-18, -106]}
					end={leftFoot}
					length={walking || sitting ? 62 : 54}
					bend={-1}
					color="#354b58"
					width={25}
				/>
				<path
					d={`M${leftFoot[0] - 12} ${leftFoot[1] + 2}h28`}
					stroke="#263744"
					strokeWidth="14"
					strokeLinecap="round"
				/>
				<Limb
					root={[18, -106]}
					end={rightFoot}
					length={walking || sitting ? 62 : 54}
					bend={-1}
					color="#2b414e"
					width={25}
				/>
				<path
					d={`M${rightFoot[0] - 12} ${rightFoot[1] + 2}h28`}
					stroke="#20313e"
					strokeWidth="14"
					strokeLinecap="round"
				/>
				<g transform={`translate(${sway} ${bounce})`}>
					<path
						d={`M-34-191L${leftElbow}L${leftHand}`}
						fill="none"
						stroke={shirt}
						strokeWidth={24}
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<circle cx={leftHand[0]} cy={leftHand[1]} r="10" fill={skin} />
					<path d="M-36-199Q0-212 37-199L42-109Q0-92-40-109Z" fill={shirt} />
					<path
						d="M-8-207L-17-190L-2-181L4-194L17-183L27-196L11-207"
						fill={who === 'mara' ? '#db9d79' : '#78aba5'}
					/>
					<path d="M-10-220V-202Q0-190 12-203V-220" fill="#d49b7d" />
					<g transform={`rotate(${headTilt} 0 -218)`}>
						{who === 'mara' && (
							<path
								d="M-38-255Q-51-212-35-187L39-190Q49-230 34-265Z"
								fill={hair}
							/>
						)}
						<ellipse cy="-245" rx="35" ry="44" fill={skin} />
						<ellipse cx="-34" cy="-242" rx="7" ry="10" fill={skin} />
						<ellipse cx="34" cy="-242" rx="7" ry="10" fill={skin} />
						<path
							d={
								who === 'mara'
									? 'M-37-242Q-54-292-4-297Q45-304 38-249L16-275Q-11-254-37-251Z'
									: 'M-37-247Q-45-291-4-293Q41-304 40-254L25-273Q-8-257-37-261Z'
							}
							fill={hair}
						/>
						<g transform={`translate(5 -247) scale(1 ${blink})`}>
							<ellipse cx="-15" rx="3" ry="4" fill={ink} />
							<ellipse cx="12" rx="3" ry="4" fill={ink} />
						</g>
						<path
							d={sad ? 'M-21-258l11-4m14-1 11 5' : 'M-22-260l11-2m14 0 12 2'}
							fill="none"
							stroke={hair}
							strokeWidth="2.5"
							strokeLinecap="round"
						/>
						<path
							d="M4-242L8-232H3"
							fill="none"
							stroke="#c68b70"
							strokeWidth="2"
							strokeLinecap="round"
						/>
						<path
							d={sad ? 'M-6-219Q3-227 13-219' : 'M-7-223Q3-212 14-225'}
							fill="none"
							stroke="#8e584d"
							strokeWidth="2.5"
							strokeLinecap="round"
						/>
						<ellipse
							cx="-20"
							cy="-231"
							rx="8"
							ry="4"
							fill="#d48977"
							opacity=".3"
						/>
					</g>
					<path
						d={`M34-191L${rightElbow}L${rightHand}`}
						fill="none"
						stroke={shirt}
						strokeWidth={24}
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<circle cx={rightHand[0]} cy={rightHand[1]} r="10" fill={skin} />
					{(action === 'phone' || action === 'sit') && (
						<Phone x={rightHand[0] + 2} y={rightHand[1] - 14} angle={-10} lit />
					)}
					{action === 'paint' && (
						<>
							<ellipse
								cx={leftHand[0] - 8}
								cy={leftHand[1]}
								rx="26"
								ry="15"
								fill="#b4845e"
								transform={`rotate(-15 ${leftHand})`}
							/>
							<circle
								cx={leftHand[0] - 18}
								cy={leftHand[1] - 3}
								r="5"
								fill="#ddb05b"
							/>
							<circle
								cx={leftHand[0] + 1}
								cy={leftHand[1] - 4}
								r="5"
								fill="#477d78"
							/>
							<g
								transform={`translate(${rightHand}) rotate(${35 + Math.sin(frame / 14) * 12})`}
							>
								<path d="M0 8V-59" stroke="#705339" strokeWidth="5" />
								<path d="M0-59V-73" stroke={gold} strokeWidth="7" />
							</g>
						</>
					)}
					{action === 'offer' &&
						(who === 'mara' ? (
							<Cup
								x={rightHand[0] + 4}
								y={rightHand[1] - 15}
								steam={frame / 2}
							/>
						) : (
							<g
								transform={`translate(${rightHand[0] - 18} ${rightHand[1] - 24}) rotate(-7)`}
							>
								<rect
									x="-36"
									y="-21"
									width="69"
									height="47"
									rx="2"
									fill="#f0dfb7"
								/>
								<path
									d="M-29-24H35V18"
									stroke="#e8bd80"
									strokeWidth="5"
									fill="none"
								/>
							</g>
						))}
					{action === 'stop' && (
						<g
							transform={`translate(${rightHand})`}
							stroke={skin}
							strokeWidth="5"
							strokeLinecap="round"
						>
							<path d="M-7-1V-23M0-4V-28M7-2V-23M13 1V-15" />
						</g>
					)}
				</g>
			</g>
		</g>
	);
};

const City: React.FC<{night: boolean}> = ({night}) => {
	const f = useCurrentFrame();
	return (
		<>
			<Sky night={night} sunset={false} />
			<g opacity=".55">
				{Array.from({length: 10}, (_, i) => (
					<rect
						key={i}
						x={i * 219 - 30}
						y={350 - (i % 4) * 47}
						width="180"
						height="430"
						rx="4"
						fill={night ? '#42556b' : '#9fb8b6'}
					/>
				))}
			</g>
			{[0, 1, 2, 3, 4].map((i) => (
				<g
					key={i}
					transform={`translate(${i * 425 - 80} ${350 + (i % 2) * 65})`}
				>
					<rect
						width="365"
						height="446"
						rx="7"
						fill={['#d4c2a6', '#b8c0b3', '#c7ada0', '#b5bab1', '#d3be9f'][i]}
					/>
					<path d="M-7 7H373" stroke="#e9dcc0" strokeWidth="16" />
					{Array.from({length: 12}, (_, j) => (
						<rect
							key={j}
							x={30 + (j % 4) * 82}
							y={40 + Math.floor(j / 4) * 100}
							width="51"
							height="67"
							rx="23"
							fill={night ? '#d8c98f' : '#7c9b9f'}
						/>
					))}
					<rect x="132" y="336" width="90" height="110" fill="#657f80" />
				</g>
			))}
			<rect y="796" width="1920" height="284" fill="#c7c8b7" />
			<path d="M0 909H1920M0 1020H1920" stroke="#b6baac" strokeWidth="3" />
			{[0, 1, 2, 3, 4, 5, 6].map((i) => (
				<path
					key={i}
					d={`M${i * 330 - 100} 796L${i * 390 - 200} 1080`}
					stroke="#b6baac"
					strokeWidth="3"
				/>
			))}
			<g transform={`translate(${((f * 4 + 200) % 2600) - 350} 765)`}>
				<path
					d="M0 0L31-43H132L166 0H196Q210 0 210 22V35H-17V19Q-17 0 0 0"
					fill={night ? '#65748b' : '#d19e7a'}
				/>
				<path d="M42-35H83V-4H20ZM94-35H125L151-4H94Z" fill="#c5d6cb" />
				<circle cx="29" cy="35" r="22" fill={ink} />
				<circle cx="168" cy="35" r="22" fill={ink} />
			</g>
			<Tree x={1615} y={850} scale={1.7} phase={0} />
			<Tree x={170} y={843} scale={1.6} phase={2} />
		</>
	);
};

const Room: React.FC<{night: boolean; studio: boolean}> = ({night, studio}) => {
	const f = useCurrentFrame();
	return (
		<>
			<defs>
				<linearGradient id="wall" x2="1" y2="1">
					<stop stopColor={night ? '#293e54' : '#e9dfca'} />
					<stop offset="1" stopColor={night ? '#4b6170' : '#d7cbb7'} />
				</linearGradient>
				<clipPath id="room-window">
					<rect x="190" y="155" width="490" height="550" />
				</clipPath>
			</defs>
			<rect width="1920" height="1080" fill="url(#wall)" />
			<rect
				x="180"
				y="145"
				width="510"
				height="570"
				rx="8"
				fill={night ? '#182f4c' : '#a9c7c2'}
				stroke={night ? '#677a81' : '#f7edda'}
				strokeWidth="19"
			/>
			<g clipPath="url(#room-window)">
				<circle cx="542" cy="260" r="52" fill={night ? '#e2d8b2' : '#fae8b5'} />
				<path
					d="M190 590Q320 402 500 550T680 530V705H190Z"
					fill={night ? '#345168' : '#88aa98'}
				/>
				<path
					d="M190 640Q440 499 680 620V705H190Z"
					fill={night ? '#2e465b' : '#73978c'}
				/>
				{[0, 1].map((i) => (
					<g
						key={i}
						transform={`translate(${((f * 0.4 + i * 270) % 650) + 190} ${325 + i * 60})`}
						fill={night ? '#6b7d86' : '#e2e6d6'}
						opacity=".65"
					>
						<ellipse rx="83" ry="15" />
						<ellipse cx="20" cy="-10" rx="37" ry="20" />
					</g>
				))}
				{night &&
					Array.from({length: 36}, (_, i) => (
						<path
							key={i}
							d="M0 0l-9 33"
							transform={`translate(${190 + ((i * 47) % 490)} ${160 + ((i * 79 + f * 12) % 540)})`}
							stroke="#b4c9cf"
							opacity=".28"
							strokeWidth="2"
						/>
					))}
			</g>
			<path
				d="M435 151V705M188 435H680"
				stroke={night ? '#667b82' : '#f4ead6'}
				strokeWidth="13"
			/>
			<g transform={`rotate(${Math.sin(f / 32) * 1.4} 151 130)`}>
				<path
					d="M124 130H247L220 731H96Z"
					fill={night ? '#596c7a' : '#d0b49c'}
				/>
				<path
					d="M155 140L135 710M205 140L185 710"
					stroke={night ? '#637582' : '#ddc3aa'}
					fill="none"
					strokeWidth="5"
				/>
			</g>
			<path d="M0 850H1920V1080H0Z" fill={night ? '#3c4b53' : '#bba98e'} />
			<path
				d="M0 850H1920"
				stroke={night ? '#728086' : '#f0e2c5'}
				strokeWidth="10"
			/>
			{[0, 1, 2, 3, 4].map((i) => (
				<path
					key={i}
					d={`M0 ${895 + i * 55}H1920`}
					stroke={night ? '#49565c' : '#caba9f'}
					strokeWidth="3"
				/>
			))}
			<ellipse
				cx="1130"
				cy="965"
				rx="600"
				ry="95"
				fill={night ? '#334c58' : '#97aaa0'}
				opacity=".55"
			/>
			<g transform="translate(1730 834)">
				<path
					d="M-22-33Q-141-184-94-243Q-2-217-22-33M0-33Q-23-228 53-294Q111-187 0-33M20-33Q115-196 150-155Q171-74 20-33"
					fill={night ? '#547d79' : '#668d76'}
				/>
				<path d="M-65-41H76L58 38H-46Z" fill="#be8e70" />
			</g>
			{!studio && (
				<>
					<path
						d="M760 728Q760 701 788 701H1431Q1460 701 1460 730V884H760Z"
						fill={night ? '#6e8190' : '#bb8c76'}
					/>
					<rect
						x="730"
						y="784"
						width="764"
						height="112"
						rx="27"
						fill={night ? '#617785' : '#c99c85'}
					/>
					<path
						d="M775 888V930M1448 888V930"
						stroke="#6f5d53"
						strokeWidth="15"
					/>
					<path
						d="M985 719V804M1220 719V804"
						stroke={night ? '#8395a0' : '#d6ab93'}
						strokeWidth="4"
					/>
				</>
			)}
			<path
				d="M1511 832V352M1460 834H1560"
				stroke={night ? '#ada18a' : '#827b6c'}
				strokeWidth="9"
			/>
			<path
				d="M1460 252H1565L1600 364H1424Z"
				fill={night ? '#e9c994' : '#ead3a3'}
			/>
			{night && (
				<path
					d="M1430 368L1240 845H1780L1592 368Z"
					fill="#e4c28b"
					opacity={0.05 + Math.sin(f / 50) * 0.004}
				/>
			)}
		</>
	);
};

const Painting: React.FC<{
	x: number;
	y: number;
	scale: number;
	progress: number;
	framed: boolean;
}> = ({x, y, scale, progress, framed}) => (
	<g transform={`translate(${x} ${y}) scale(${scale})`}>
		<rect
			x="-13"
			y="-13"
			width="326"
			height="426"
			rx="3"
			fill={framed ? '#bf9b63' : '#e4c99a'}
		/>
		<rect width="300" height="400" fill="#f8edda" />
		<path
			d="M12 300Q80 180 155 265T288 230M149 382Q126 262 156 172"
			stroke="#d8ccae"
			strokeWidth="2"
			fill="none"
		/>
		<circle
			cx="214"
			cy="112"
			r="48"
			fill="none"
			stroke="#d8ccae"
			strokeWidth="2"
		/>
		<defs>
			<clipPath id={`paint-${x}-${y}`}>
				<rect
					x="0"
					y={400 * (1 - progress)}
					width="300"
					height={400 * progress}
				/>
			</clipPath>
		</defs>
		<g clipPath={`url(#paint-${x}-${y})`}>
			<path d="M12 300Q80 180 155 265T288 230V388H12Z" fill="#88a493" />
			<path d="M12 347Q110 243 288 324V388H12Z" fill="#3f7773" />
			<circle cx="214" cy="112" r="48" fill={gold} />
			<path
				d="M149 383Q126 262 156 172M145 295Q74 295 86 249Q132 248 145 295M145 342Q212 333 202 285Q159 289 145 342"
				stroke="#f8edda"
				strokeWidth="6"
				fill="#f8edda"
			/>
		</g>
	</g>
);

const Easel: React.FC<{progress: number}> = ({progress}) => (
	<g>
		<path
			d="M1260 456L1118 974M1340 456L1511 974M1160 862H1465"
			stroke="#957250"
			strokeWidth="19"
			strokeLinecap="round"
		/>
		<Painting
			x={1120}
			y={293}
			scale={1.18}
			progress={progress}
			framed={false}
		/>
		<path d="M1099 791H1500" stroke="#ab845a" strokeWidth="17" />
	</g>
);

const Desk: React.FC<{office: boolean}> = ({office}) => {
	const f = useCurrentFrame();
	return (
		<g>
			<path d="M1004 733V974M1584 733V974" stroke="#846f5c" strokeWidth="24" />
			<rect x="964" y="707" width="668" height="30" rx="7" fill="#b18b66" />
			<path d="M987 707H1610" stroke="#d9b78b" strokeWidth="8" />
			<rect x="1250" y="443" width="285" height="204" rx="13" fill="#344956" />
			<rect
				x="1263"
				y="457"
				width="259"
				height="173"
				rx="6"
				fill={office ? '#a5c6bd' : '#b3c9bb'}
			/>
			{office && (
				<>
					<rect
						x="1294"
						y="485"
						width="196"
						height="117"
						rx="5"
						fill="#e6e9d3"
					/>
					<path
						d="M1315 510h67m-67 20h132m-132 20h91"
						stroke="#83a79e"
						strokeWidth="9"
						strokeLinecap="round"
					/>
					<path
						d="M1400 576l14 13 33-35"
						stroke="#4d8c79"
						fill="none"
						strokeWidth="7"
						opacity={move(f, [55, 95], [0, 1])}
					/>
				</>
			)}
			<path d="M1391 649V700M1352 700H1435" stroke="#3d5260" strokeWidth="12" />
			<path d="M1055 691H1242L1265 706H1041Z" fill="#dfddcb" />
			{Array.from({length: 15}, (_, i) => (
				<path
					key={i}
					d={`M${1063 + i * 11} 697h6`}
					stroke="#aaa997"
					strokeWidth="3"
				/>
			))}
			<Cup x={1563} y={692} steam={f / 2} />
		</g>
	);
};

const Park: React.FC<{sunset: boolean}> = ({sunset}) => {
	const f = useCurrentFrame();
	return (
		<>
			<Sky night={false} sunset={sunset} />
			<path
				d="M0 580Q350 374 680 523T1340 498T1920 469V1080H0Z"
				fill="#95b09b"
			/>
			<path
				d="M0 714Q290 526 636 692T1340 655T1920 626V1080H0Z"
				fill="#789a88"
			/>
			<path d="M1920 666Q1510 639 1335 805T956 1080H1920Z" fill="#9cbeb5" />
			{[0, 1, 2, 3, 4, 5, 6].map((i) => (
				<path
					key={i}
					d={`M${1290 + i * 92 + Math.sin(f / 25 + i) * 16} ${760 + i * 43}h${53 + i * 16}`}
					stroke="#d4ded0"
					opacity=".6"
					strokeWidth="3"
					strokeLinecap="round"
				/>
			))}
			<path
				d="M1250 681Q870 806 430 1080H1065Q1110 837 1370 710Z"
				fill="#d6c5a4"
			/>
			<Tree x={170} y={939} scale={2.9} phase={1} />
			<Tree x={1760} y={813} scale={2.25} phase={3} />
			<Tree x={1555} y={679} scale={1.2} phase={2} />
			{Array.from({length: 27}, (_, i) => (
				<g
					key={i}
					transform={`translate(${i * 79 - 70} ${1010 + (i % 3) * 26}) rotate(${Math.sin(f / 22 + i) * 7})`}
				>
					<path
						d="M0 40Q-9 2-27-9M0 40Q5 7 24-16M0 40V-28"
						stroke="#648774"
						fill="none"
						strokeWidth="4"
					/>
					<circle cy="-30" r="4" fill={i % 3 === 0 ? '#edc783' : '#a7bc96'} />
				</g>
			))}
			{Array.from({length: 9}, (_, i) => (
				<ellipse
					key={i}
					cx={((i * 227 + f * (0.4 + i * 0.07)) % 2100) - 80}
					cy={500 + Math.sin(f / 40 + i) * 170 + i * 37}
					rx="5"
					ry="2.6"
					transform={`rotate(${f * 2 + i * 34} ${((i * 227 + f * (0.4 + i * 0.07)) % 2100) - 80} ${500 + Math.sin(f / 40 + i) * 170 + i * 37})`}
					fill="#e8c77f"
					opacity=".7"
				/>
			))}
		</>
	);
};

const Shot: React.FC<{kind: string; duration: number}> = ({kind, duration}) => {
	const f = useCurrentFrame();
	const last = duration - 1;
	const cameraScale = move(
		f,
		[0, last],
		[kind === 'alone' ? 1.04 : 1, kind === 'end' ? 1 : 1.055],
	);
	const sceneFade = move(f, [0, 9, last - 9, last], [0, 1, 1, 0]);
	return (
		<AbsoluteFill style={{background: '#20333e'}}>
			<svg
				viewBox="0 0 1920 1080"
				style={{width: '100%', height: '100%', opacity: sceneFade}}
			>
				<g
					transform={`translate(960 540) scale(${cameraScale}) translate(-960 -540)`}
				>
					{kind === 'intro' && (
						<>
							<City night={false} />
							<Character
								x={move(f, [0, 180, 240, 289], [300, 935, 935, 1110])}
								y={946}
								scale={1.85}
								action={f < 180 || f > 240 ? 'walk' : 'reach'}
								who="alex"
								sad={false}
								facing={1}
								phase={0}
							/>
							<Character
								x={1270}
								y={933}
								scale={1.6}
								action={f < 165 ? 'reach' : 'listen'}
								who="colleague"
								sad={f < 175}
								facing={-1}
								phase={29}
							/>
							<g
								transform={`translate(${move(f, [0, 175, 211, 250], [1140, 1140, 1190, 1260])} ${move(f, [0, 175, 211, 250], [930, 930, 749, 705])}) rotate(${move(f, [170, 245], [-12, 0])})`}
							>
								<path d="M-27-18H36V0H-27Z" fill="#e4bc7e" />
								<path d="M-34-35H28V-19H-34Z" fill="#8b9da1" />
								<path d="M-25-51H37V-35H-25Z" fill="#bf866e" />
							</g>
						</>
					)}
					{kind === 'office' && (
						<>
							<Room night={false} studio />
							<path d="M862 710H1011V856H862Z" fill="#8a998d" />
							<path
								d="M873 854V955M1000 854V955"
								stroke="#637768"
								strokeWidth="13"
							/>
							<Character
								x={924}
								y={946}
								scale={1.8}
								action="type"
								who="alex"
								sad={false}
								facing={1}
								phase={0}
							/>
							<Character
								x={move(f, [0, 105, 210, 265], [1770, 1664, 1664, 1775])}
								y={931}
								scale={1.65}
								action={f < 105 || f > 210 ? 'walk' : 'listen'}
								who="colleague"
								sad={false}
								facing={-1}
								phase={18}
							/>
							<Desk office />
						</>
					)}
					{kind === 'friends' && (
						<>
							<City night={false} />
							<path
								d="M900 690H1350M953 690L918 970M1299 690L1331 970"
								stroke="#8f745d"
								strokeWidth="18"
							/>
							<Character
								x={720}
								y={953}
								scale={1.8}
								action={f < 170 ? 'phone' : 'offer'}
								who="alex"
								sad={false}
								facing={1}
								phase={0}
							/>
							<Character
								x={move(f, [0, 100, 210, 310], [1690, 1350, 1350, 1700])}
								y={950}
								scale={1.75}
								action={f < 100 || f > 210 ? 'walk' : 'offer'}
								who="colleague"
								sad={false}
								facing={-1}
								phase={17}
							/>
							<g
								transform={`translate(${move(f, [110, 185], [1135, 930])} ${690 + Math.sin(f / 20) * 2})`}
							>
								<rect x="-48" y="-18" width="99" height="17" fill="#f5e9cf" />
								<path d="M-48-24H53" stroke="#c59b73" strokeWidth="7" />
							</g>
							<Cup x={1215} y={673} steam={f / 2} />
						</>
					)}
					{kind === 'alone' && (
						<>
							<Room night studio={false} />
							<Character
								x={1030}
								y={966}
								scale={1.8}
								action="sit"
								who="alex"
								sad
								facing={1}
								phase={0}
							/>
							<g transform="translate(1260 918)">
								<ellipse rx="159" ry="35" fill="#a59581" />
								<path
									d="M-114 0L-138 95M106 0l19 95"
									stroke="#6f6d62"
									strokeWidth="12"
								/>
								<Cup x={65} y={-23} steam={f / 7} />
							</g>
							{Array.from({length: 12}, (_, i) => (
								<path
									key={i}
									d="M0 0L-1 36"
									transform={`translate(${191 + ((i * 41) % 470)} ${170 + ((i * 93 + f * 9) % 510)})`}
									stroke="#b7d3d6"
									strokeWidth="2"
									opacity=".35"
								/>
							))}
						</>
					)}
					{kind === 'realize' && (
						<>
							<City night />
							<Character
								x={980}
								y={952}
								scale={1.85}
								action="phone"
								who="alex"
								sad
								facing={1}
								phase={0}
							/>
							<g opacity={move(f, [0, 100, 250, 353], [0.8, 0.8, 0.22, 0])}>
								<Character
									x={move(f, [0, last], [780, -350])}
									y={950}
									scale={1.65}
									action="walk"
									who="colleague"
									sad={false}
									facing={-1}
									phase={22}
								/>
								<Character
									x={move(f, [0, last], [1310, 2350])}
									y={958}
									scale={1.74}
									action="walk"
									who="colleague"
									sad={false}
									facing={1}
									phase={61}
								/>
							</g>
							<path
								d="M0 1040H1920"
								stroke="#b4bdba"
								opacity=".3"
								strokeWidth="7"
							/>
						</>
					)}
					{kind === 'dream' && (
						<>
							<Room night={false} studio />
							<Easel progress={0} />
							<g transform="translate(805 796)">
								<path d="M-167-88H175V29H-167Z" fill="#b39573" />
								<path
									d="M-150 27V151M157 27V151"
									stroke="#8d7259"
									strokeWidth="16"
								/>
								<path d="M-167-88L-142-113H193L175-88Z" fill="#d0b28a" />
							</g>
							<Character
								x={561}
								y={961}
								scale={1.85}
								action={f < 90 ? 'reach' : 'phone'}
								who="alex"
								sad={f < 180}
								facing={1}
								phase={0}
							/>
							<g
								transform={`translate(${move(f, [40, 125], [803, 718])} ${move(f, [40, 125], [672, 665])}) rotate(${move(f, [40, 125], [-5, -18])})`}
							>
								<path
									d="M-61-47Q-24-64 0-46Q32-66 67-47V42Q30 29 0 45Q-32 28-61 42Z"
									fill="#f4e7c8"
								/>
								<path
									d="M0-46V45M-49 9q22-39 43-11M10 15q25-49 47-12"
									stroke="#acb4a0"
									fill="none"
									strokeWidth="3"
								/>
							</g>
							{Array.from({length: 8}, (_, i) => (
								<circle
									key={i}
									cx={850 + ((i * 137) % 850) + Math.sin(f / 40 + i) * 16}
									cy={190 + ((i * 79 + f * 0.5) % 530)}
									r="2"
									fill="#fff3d3"
									opacity=".7"
								/>
							))}
						</>
					)}
					{kind === 'invite' && (
						<>
							<City night={false} />
							<g transform="translate(1160 376)">
								<path
									d="M0 0V575M350 0V575"
									stroke="#4f6468"
									strokeWidth="14"
								/>
								<rect
									x="-29"
									y="-29"
									width="406"
									height="469"
									rx="9"
									fill="#759591"
								/>
								<rect
									x="-10"
									y="-10"
									width="368"
									height="431"
									rx="4"
									fill="#f1e0bd"
								/>
								<Painting x={72} y={38} scale={0.72} progress={1} framed />
								<path d="M52 364H293" stroke="#c09c69" strokeWidth="7" />
								<circle cx="173" cy="389" r="10" fill="#d9a765" />
							</g>
							<Character
								x={move(f, [0, 110, 240, last], [320, 940, 940, 1050])}
								y={963}
								scale={1.86}
								action={f < 110 || f > 240 ? 'walk' : 'listen'}
								who="alex"
								sad={false}
								facing={1}
								phase={0}
							/>
							{Array.from({length: 5}, (_, i) => (
								<ellipse
									key={i}
									cx={130 + ((f * 2 + i * 390) % 1900)}
									cy={530 + i * 73 + Math.sin(f / 26 + i) * 30}
									rx="8"
									ry="3"
									fill="#d6b379"
									transform={`rotate(${f + i * 23} ${130 + ((f * 2 + i * 390) % 1900)} ${530 + i * 73 + Math.sin(f / 26 + i) * 30})`}
								/>
							))}
						</>
					)}
					{kind === 'pressure' && (
						<>
							<Room night studio />
							<Easel progress={0.1} />
							<Character
								x={893}
								y={956}
								scale={1.85}
								action="phone"
								who="alex"
								sad
								facing={1}
								phase={0}
							/>
							<Character
								x={move(f, [0, 95, 220, 381], [-280, 475, 475, 350])}
								y={977}
								scale={1.9}
								action={f < 95 || f > 220 ? 'walk' : 'offer'}
								who="colleague"
								sad={false}
								facing={f > 220 ? -1 : 1}
								phase={17}
							/>
							<Character
								x={move(f, [50, 155, 280, 381], [2160, 1570, 1570, 1670])}
								y={950}
								scale={1.75}
								action={f < 155 || f > 280 ? 'walk' : 'offer'}
								who="colleague"
								sad={false}
								facing={f > 280 ? 1 : -1}
								phase={62}
							/>
							<g
								transform={`translate(${1000 + Math.sin(f / 2) * move(f, [25, 45, 80, 100], [0, 5, 5, 0])} 655)`}
							>
								<Phone x={0} y={0} angle={9} lit />
								<path
									d="M-30-18q-15 14 0 28M30-18q15 14 0 28"
									stroke="#edcb86"
									strokeWidth="3"
									fill="none"
									opacity={Math.max(0, Math.sin(f / 9))}
								/>
							</g>
						</>
					)}
					{kind === 'no' && (
						<>
							<Room night={false} studio />
							<Easel progress={0.1} />
							<Character
								x={835}
								y={956}
								scale={2}
								action={f < 60 ? 'phone' : f < 245 ? 'stop' : 'idle'}
								who="alex"
								sad={f < 60}
								facing={1}
								phase={0}
							/>
							<Character
								x={move(f, [0, 125, 220, last], [1540, 1540, 1800, 2180])}
								y={955}
								scale={1.78}
								action={f < 125 ? 'offer' : 'walk'}
								who="colleague"
								sad={false}
								facing={f < 125 ? -1 : 1}
								phase={40}
							/>
							<g
								opacity={move(f, [0, 60, 75, 250, 290], [0, 0, 1, 1, 0])}
								transform={`translate(${move(f, [65, 110], [977, 1030])} ${move(f, [65, 110], [654, 850])})`}
							>
								<Phone
									x={0}
									y={0}
									angle={move(f, [65, 110], [0, 90])}
									lit={false}
								/>
							</g>
						</>
					)}
					{kind === 'paint' && (
						<>
							<Room night={false} studio />
							<Easel progress={move(f, [15, 300], [0.1, 1])} />
							<Character
								x={848}
								y={956}
								scale={1.88}
								action="paint"
								who="alex"
								sad={false}
								facing={1}
								phase={0}
							/>
							<g transform="translate(605 831)">
								<path d="M-64-15H68V4H-64Z" fill="#b18b65" />
								<path
									d="M-47 4L-62 134M49 4L66 134"
									stroke="#967555"
									strokeWidth="14"
								/>
								<Cup x={0} y={-32} steam={f / 2} />
								<path
									d="M-28-31l-7-72m11 72 12-65"
									stroke="#8f6b4f"
									strokeWidth="5"
								/>
							</g>
							{Array.from({length: 10}, (_, i) => (
								<circle
									key={i}
									cx={750 + ((i * 139) % 900) + Math.sin(f / 39 + i) * 12}
									cy={176 + ((i * 61 + f * 0.4) % 580)}
									r="2"
									fill="#fff1c9"
									opacity=".7"
								/>
							))}
						</>
					)}
					{kind === 'mara' && (
						<>
							<Room night={false} studio />
							<Easel progress={1} />
							<Character
								x={766}
								y={958}
								scale={1.88}
								action={f < 160 ? 'paint' : 'listen'}
								who="alex"
								sad={false}
								facing={1}
								phase={0}
							/>
							<Character
								x={move(f, [0, 125, last], [2060, 1517, 1517])}
								y={963}
								scale={1.85}
								action={f < 125 ? 'walk' : f < 240 ? 'offer' : 'listen'}
								who="mara"
								sad={false}
								facing={-1}
								phase={26}
							/>
							<g transform="translate(1600 842)">
								<path
									d="M-52 0H60M-37 0L-46 118M41 0L52 118"
									stroke="#947559"
									strokeWidth="13"
								/>
								{f > 210 && <Cup x={0} y={-18} steam={f / 2} />}
							</g>
						</>
					)}
					{kind === 'gallery' && (
						<>
							<rect width="1920" height="1080" fill="#eee5d4" />
							<rect y="825" width="1920" height="255" fill="#c3b399" />
							{[0, 1, 2].map((i) => (
								<g key={i}>
									<path
										d={`M${395 + i * 540} 0V152`}
										stroke="#a8a18e"
										strokeWidth="4"
									/>
									<path
										d={`M${365 + i * 540} 150h60l24 32h-109Z`}
										fill="#7f8377"
									/>
									<path
										d={`M${368 + i * 540} 185L${245 + i * 540} 720H${545 + i * 540}L${424 + i * 540} 185`}
										fill="#fff7db"
										opacity=".35"
									/>
								</g>
							))}
							<Painting x={225} y={260} scale={0.9} progress={1} framed />
							<Painting x={810} y={240} scale={1.02} progress={1} framed />
							<Painting x={1400} y={260} scale={0.9} progress={0.8} framed />
							<Character
								x={move(f, [0, 150, 250, last], [220, 740, 740, 1040])}
								y={968}
								scale={1.68}
								action={f < 150 || f > 250 ? 'walk' : 'listen'}
								who="alex"
								sad={false}
								facing={1}
								phase={0}
							/>
							<Character
								x={move(f, [0, 150, 250, last], [440, 1005, 1005, 1280])}
								y={975}
								scale={1.64}
								action={f < 150 || f > 250 ? 'walk' : 'listen'}
								who="mara"
								sad={false}
								facing={f < 150 || f > 250 ? 1 : -1}
								phase={20}
							/>
							<g opacity=".65">
								<Character
									x={move(f, [0, last], [1810, 1550])}
									y={868}
									scale={1.25}
									action="walk"
									who="colleague"
									sad={false}
									facing={-1}
									phase={43}
								/>
							</g>
						</>
					)}
					{kind === 'kind' && (
						<>
							<Park sunset />
							<Character
								x={move(f, [0, last], [490, 1110])}
								y={990}
								scale={1.76}
								action="walk"
								who="alex"
								sad={false}
								facing={1}
								phase={0}
							/>
							<Character
								x={move(f, [0, last], [245, 875])}
								y={997}
								scale={1.7}
								action="walk"
								who="mara"
								sad={false}
								facing={1}
								phase={18}
							/>
							<g transform="translate(1435 866)">
								<path
									d="M-80 0H85M-75-20H80M-65 0V88M70 0V88"
									stroke="#a3835f"
									strokeWidth="13"
								/>
								<path d="M-87-30H90" stroke="#c6a67c" strokeWidth="16" />
							</g>
						</>
					)}
					{kind === 'end' && (
						<>
							<Park sunset />
							<g
								transform={`translate(1120 835) scale(${move(f, [0, last], [1, 0.78])}) translate(-1120 -835)`}
							>
								<Character
									x={move(f, [0, last], [780, 1070])}
									y={911}
									scale={1.16}
									action="walk"
									who="alex"
									sad={false}
									facing={1}
									phase={0}
								/>
								<Character
									x={move(f, [0, last], [620, 920])}
									y={927}
									scale={1.13}
									action="walk"
									who="mara"
									sad={false}
									facing={1}
									phase={17}
								/>
							</g>
							<path d="M0 989Q305 928 483 998T831 1080H0Z" fill="#527c6c" />
						</>
					)}
				</g>
			</svg>
		</AbsoluteFill>
	);
};

// Literal scene instances preserve separate editable timing boundaries.
const MovingFilm = () => (
	<AbsoluteFill>
		<Html5Audio src={staticFile('soundtrack.m4a')} />
		<Sequence
			name="Alex giúp người qua đường"
			from={timeline[0].fromFrame}
			durationInFrames={timeline[0].duration}
		>
			<Shot kind="intro" duration={timeline[0].duration} />
		</Sequence>
		<Sequence
			name="Sửa máy tính"
			from={timeline[1].fromFrame}
			durationInFrames={timeline[1].duration}
		>
			<Shot kind="office" duration={timeline[1].duration} />
		</Sequence>
		<Sequence
			name="Nhận việc giúp bạn"
			from={timeline[2].fromFrame}
			durationInFrames={timeline[2].duration}
		>
			<Shot kind="friends" duration={timeline[2].duration} />
		</Sequence>
		<Sequence
			name="Một mình trong đêm mưa"
			from={timeline[3].fromFrame}
			durationInFrames={timeline[3].duration}
		>
			<Shot kind="alone" duration={timeline[3].duration} />
		</Sequence>
		<Sequence
			name="Mọi người rời đi"
			from={timeline[4].fromFrame}
			durationInFrames={timeline[4].duration}
		>
			<Shot kind="realize" duration={timeline[4].duration} />
		</Sequence>
		<Sequence
			name="Mở lại giấc mơ"
			from={timeline[5].fromFrame}
			durationInFrames={timeline[5].duration}
		>
			<Shot kind="dream" duration={timeline[5].duration} />
		</Sequence>
		<Sequence
			name="Cơ hội triển lãm"
			from={timeline[6].fromFrame}
			durationInFrames={timeline[6].duration}
		>
			<Shot kind="invite" duration={timeline[6].duration} />
		</Sequence>
		<Sequence
			name="Những lời nhờ vả"
			from={timeline[7].fromFrame}
			durationInFrames={timeline[7].duration}
		>
			<Shot kind="pressure" duration={timeline[7].duration} />
		</Sequence>
		<Sequence
			name="Alex đặt ranh giới"
			from={timeline[8].fromFrame}
			durationInFrames={timeline[8].duration}
		>
			<Shot kind="no" duration={timeline[8].duration} />
		</Sequence>
		<Sequence
			name="Vẽ bức tranh"
			from={timeline[9].fromFrame}
			durationInFrames={timeline[9].duration}
		>
			<Shot kind="paint" duration={timeline[9].duration} />
		</Sequence>
		<Sequence
			name="Mara đến bên Alex"
			from={timeline[10].fromFrame}
			durationInFrames={timeline[10].duration}
		>
			<Shot kind="mara" duration={timeline[10].duration} />
		</Sequence>
		<Sequence
			name="Cùng xem triển lãm"
			from={timeline[11].fromFrame}
			durationInFrames={timeline[11].duration}
		>
			<Shot kind="gallery" duration={timeline[11].duration} />
		</Sequence>
		<Sequence
			name="Đi dạo bên dòng sông"
			from={timeline[12].fromFrame}
			durationInFrames={timeline[12].duration}
		>
			<Shot kind="kind" duration={timeline[12].duration} />
		</Sequence>
		<Sequence
			name="Một chỗ cho mình"
			from={timeline[13].fromFrame}
			durationInFrames={timeline[13].duration}
		>
			<Shot kind="end" duration={timeline[13].duration} />
		</Sequence>
	</AbsoluteFill>
);

registerRoot(() => (
	<Composition
		id="AlexHoatHinh"
		component={MovingFilm}
		width={1920}
		height={1080}
		fps={30}
		durationInFrames={timeline.reduce((sum, scene) => sum + scene.duration, 0)}
	/>
));
