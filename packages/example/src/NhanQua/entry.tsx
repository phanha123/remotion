import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Film} from './Film';
import story from './story.json';

registerRoot(() => (
	<Composition
		id="LuatNhanQua"
		component={Film}
		width={1920}
		height={1080}
		fps={30}
		durationInFrames={story.reduce((sum, scene) => sum + scene.duration, 0)}
	/>
));
