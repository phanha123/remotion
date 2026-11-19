import React from 'react';

export type Point = [number, number];

// Two-bone inverse kinematics, shared with the original Alex character rig.
export const Limb: React.FC<{
	root: Point;
	end: Point;
	length: number;
	bend: number;
	color: string;
	width: number;
}> = ({root, end, length, bend, color, width}) => {
	const dx = end[0] - root[0];
	const dy = end[1] - root[1];
	const distance = Math.min(Math.hypot(dx, dy), length * 1.98);
	const direction = Math.atan2(dy, dx);
	const angle = direction + bend * Math.acos(distance / (2 * length));
	const joint = [
		root[0] + Math.cos(angle) * length,
		root[1] + Math.sin(angle) * length,
	];
	return (
		<path
			d={`M${root}L${joint}L${end}`}
			fill="none"
			stroke={color}
			strokeWidth={width}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	);
};
