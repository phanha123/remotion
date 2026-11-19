import {execFileSync} from 'node:child_process';
import {createHash, randomUUID} from 'node:crypto';
import {
	existsSync,
	mkdirSync,
	readFileSync,
	renameSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import path from 'node:path';
import {parseArgs} from 'node:util';

type Scene = {id: string; text: string; duration: number};
type CachedAudio = {
	provider: string;
	fingerprint: string;
	audioSha256: string;
	durationSeconds: number;
	requestId: string | null;
	createdAt: string;
};

const root = path.resolve(import.meta.dir, '../../../..');
const cacheDir = path.join(root, 'out/voiceover/elevenlabs');
const hash = (value: string | ArrayLike<number>) =>
	createHash('sha256')
		.update(typeof value === 'string' ? value : new Uint8Array(value))
		.digest('hex');
const sampleText =
	'Mỗi ngày, chúng ta đều có thể gieo một điều lành. Một lời nói ấm áp, một bàn tay giúp đỡ, đôi khi đủ làm lòng người nhẹ lại. Hãy sống tử tế, không phải để chờ đền đáp, mà để nuôi dưỡng sự bình an.';

const probe = (file: string) => {
	try {
		const duration = Number(
			execFileSync(
				'ffprobe',
				[
					'-v',
					'error',
					'-show_entries',
					'format=duration',
					'-of',
					'csv=p=0',
					file,
				],
				{encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']},
			),
		);
		if (!Number.isFinite(duration) || duration <= 0) throw new Error();
		return duration;
	} catch {
		throw new Error(
			'Audio is invalid, or FFprobe is unavailable. Check FFmpeg/FFprobe installation.',
		);
	}
};

const writeJson = (file: string, data: unknown) => {
	const temporary = `${file}.${randomUUID()}.tmp`;
	writeFileSync(temporary, JSON.stringify(data, null, 2) + '\n');
	renameSync(temporary, file);
};

// A legacy MP3, partial download or mismatched sidecar is never a cache hit.
const cached = (fingerprint: string): CachedAudio | null => {
	const file = path.join(cacheDir, `${fingerprint}.mp3`);
	try {
		const info = JSON.parse(
			readFileSync(`${file}.json`, 'utf8'),
		) as CachedAudio;
		if (
			info.provider !== 'elevenlabs' ||
			info.fingerprint !== fingerprint ||
			info.audioSha256 !== hash(readFileSync(file)) ||
			!Number.isFinite(info.durationSeconds) ||
			info.durationSeconds <= 0
		)
			return null;
		return info;
	} catch {
		return null;
	}
};

const fittedSpeed = (scene: Scene, info: CachedAudio, fingerprint: string) => {
	const measured = probe(path.join(cacheDir, `${fingerprint}.mp3`));
	if (Math.abs(measured - info.durationSeconds) > 0.1)
		throw new Error(
			'Cached duration metadata does not match the audio. Inspect this cache entry before retrying.',
		);
	const speed = Math.max(1, measured / (scene.duration / 30 - 1.1));
	if (speed > 1.08)
		throw new Error(
			`Scene ${scene.id} exceeds its slot (${measured.toFixed(2)}s). Shorten that narration or deliberately revise timing; maximum time stretch is 1.08x. Raw audio is cached; nothing was truncated. No further scenes were synthesized.`,
		);
	return speed;
};

const request = async (
	endpoint: string,
	body: unknown | null,
): Promise<Response> => {
	const key = process.env.ELEVENLABS_API_KEY?.trim();
	if (!key)
		throw new Error(
			'Set ELEVENLABS_API_KEY in the repository-root .env. Never paste keys into chat.',
		);
	let response: Response;
	try {
		response = await fetch(`https://api.elevenlabs.io${endpoint}`, {
			method: body === null ? 'GET' : 'POST',
			headers: {'xi-api-key': key, 'Content-Type': 'application/json'},
			body: body === null ? null : JSON.stringify(body),
			signal: AbortSignal.timeout(90_000),
		});
	} catch {
		throw new Error(
			'ElevenLabs network error/timeout. No automatic retry: a submitted generation may already have been billed. Check your ElevenLabs history before retrying.',
		);
	}
	if (!response.ok) {
		const explanation: Record<number, string> = {
			401: 'Invalid API key.',
			403: 'Key permissions, voice access or plan does not allow this operation.',
			402: 'Insufficient balance or billing restriction.',
			422: 'Unsupported request settings.',
			429: 'Rate/concurrency limit or quota reached.',
		};
		// Do not print raw response bodies, request headers or transport errors.
		throw new Error(
			`ElevenLabs HTTP ${response.status}: ${explanation[response.status] ?? 'Request failed.'} No fallback provider and no automatic retry.`,
		);
	}
	return response;
};

const synthesize = async (
	fingerprint: string,
	body: Record<string, unknown>,
	voice: string,
) => {
	const hit = cached(fingerprint);
	if (hit) return hit;
	const file = path.join(cacheDir, `${fingerprint}.mp3`);
	const temporary = `${file}.${randomUUID()}.tmp.mp3`;
	const response = await request(
		`/v1/text-to-speech/${encodeURIComponent(voice)}?output_format=mp3_44100_128`,
		body,
	);
	try {
		if (!response.headers.get('content-type')?.includes('audio/'))
			throw new Error();
		writeFileSync(temporary, new Uint8Array(await response.arrayBuffer()));
		const info: CachedAudio = {
			provider: 'elevenlabs',
			fingerprint,
			audioSha256: hash(readFileSync(temporary)),
			durationSeconds: probe(temporary),
			requestId:
				response.headers.get('request-id') ??
				response.headers.get('x-request-id'),
			createdAt: new Date().toISOString(),
		};
		renameSync(temporary, file);
		writeJson(`${file}.json`, info);
		return info;
	} catch {
		throw new Error(
			'ElevenLabs returned incomplete/invalid audio, or the local file could not be saved. No retry was made; check generation history before retrying.',
		);
	} finally {
		rmSync(temporary, {force: true});
	}
};

const main = async () => {
	const {values} = parseArgs({
		options: {
			project: {type: 'string', default: 'nhan-qua'},
			'dry-run': {type: 'boolean'},
			sample: {type: 'boolean'},
			generate: {type: 'boolean'},
			'approve-voice': {type: 'boolean'},
			'confirm-spend': {type: 'boolean'},
			voices: {type: 'boolean'},
			models: {type: 'boolean'},
			scene: {type: 'string'},
			revision: {type: 'string', default: '1'},
			help: {type: 'boolean'},
		},
	});
	if (values.help) {
		console.log(
			'ElevenLabs voiceover: --project nhan-qua|alex [--dry-run | --voices | --models | --sample | --approve-voice | --generate --confirm-spend] [--scene ID] [--revision VERSION]',
		);
		return;
	}
	if (
		[
			values['dry-run'],
			values.sample,
			values.generate,
			values['approve-voice'],
			values.voices,
			values.models,
		].filter(Boolean).length > 1
	)
		throw new Error('Choose exactly one mode.');
	if (values.scene && !values.generate && !values['dry-run'])
		throw new Error('--scene requires --generate or --dry-run.');
	const project = values.project;
	if (project !== 'nhan-qua' && project !== 'alex')
		throw new Error('Project must be nhan-qua or alex.');
	if (!/^[\w-]{1,32}$/.test(values.revision))
		throw new Error(
			'Revision must contain 1–32 letters, digits, underscores or hyphens.',
		);
	if (values.voices) {
		const data = (await (
			await request('/v2/voices?page_size=100', null)
		).json()) as {
			voices: {
				voice_id: string;
				name: string;
				labels: Record<string, string>;
				preview_url: string | null;
			}[];
			has_more: boolean;
		};
		console.log(
			JSON.stringify(
				data.voices.map((v) => ({
					id: v.voice_id,
					name: v.name,
					labels: v.labels,
					preview: v.preview_url,
				})),
				null,
				2,
			),
		);
		if (data.has_more)
			console.log(
				'First 100 voices only. Use your ElevenLabs voice library to find additional voices; no voice was automatically selected.',
			);
		return;
	}
	const model = process.env.ELEVENLABS_MODEL_ID?.trim() || 'eleven_v3';
	if (values.models) {
		const data = (await (await request('/v1/models', null)).json()) as {
			model_id: string;
			can_do_text_to_speech: boolean;
			languages: {language_id: string}[];
		}[];
		console.log(
			JSON.stringify(
				data
					.filter(
						(m) =>
							m.can_do_text_to_speech &&
							m.languages.some((l) => l.language_id === 'vi'),
					)
					.map((m) => m.model_id),
				null,
				2,
			),
		);
		return;
	}
	if (!['eleven_v3', 'eleven_flash_v2_5'].includes(model))
		throw new Error(
			'Supported presets: eleven_v3 (expressive) or eleven_flash_v2_5 (economical). Both support Vietnamese; multilingual_v2 does not.',
		);
	const voice = process.env.ELEVENLABS_VOICE_ID?.trim() || '';
	const settings =
		model === 'eleven_v3'
			? {stability: 0.5}
			: {stability: 0.55, similarity_boost: 0.75, speed: 0.95};
	const config = {
		provider: 'elevenlabs',
		voice,
		model_id: model,
		language_code: 'vi',
		voice_settings: settings,
		output_format: 'mp3_44100_128',
	};
	const voiceFingerprint = hash(JSON.stringify(config));
	const sampleBody = {
		text: sampleText,
		model_id: model,
		language_code: 'vi',
		voice_settings: settings,
	};
	const sampleFingerprint = hash(JSON.stringify({config, body: sampleBody}));
	const approvalFile = path.join(cacheDir, `${voiceFingerprint}.approved.json`);
	if (values['approve-voice']) {
		if (!voice || !cached(sampleFingerprint))
			throw new Error(
				'Generate and listen to --sample first, then approve the selected voice.',
			);
		mkdirSync(cacheDir, {recursive: true});
		writeJson(approvalFile, {
			voiceFingerprint,
			sampleFingerprint,
			approvedAt: new Date().toISOString(),
		});
		console.log(
			'Voice approved locally. This records your listening decision; it does not certify the regional accent.',
		);
		return;
	}
	const source = path.join(
		root,
		project === 'nhan-qua'
			? 'packages/example/src/NhanQua/story.json'
			: 'packages/example/src/Alex/timeline.json',
	);
	const rows = JSON.parse(readFileSync(source, 'utf8')) as Record<
		string,
		unknown
	>[];
	if (!Array.isArray(rows) || rows.length === 0)
		throw new Error('Scene manifest must be a nonempty array.');
	let cursor = 0;
	const scenes: Scene[] = rows.map((row, index) => {
		const from = row.from ?? row.fromFrame;
		if (
			typeof row.text !== 'string' ||
			!row.text.trim() ||
			typeof row.duration !== 'number' ||
			!Number.isInteger(row.duration) ||
			row.duration <= 33 ||
			from !== cursor
		)
			throw new Error(
				`Invalid or nonconsecutive scene at index ${index}. Expected 30 fps timeline.`,
			);
		cursor += row.duration;
		return {
			id: typeof row.kind === 'string' ? row.kind : String(index),
			text: row.text,
			duration: row.duration,
		};
	});
	if (project === 'nhan-qua' && cursor !== 1800)
		throw new Error('Nhan Qua must remain 1800 frames / 60 seconds.');
	const bodies = scenes.map((scene, i) => ({
		text: scene.text,
		model_id: model,
		language_code: 'vi',
		voice_settings: settings,
		previous_text: scenes[i - 1]?.text ?? null,
		next_text: scenes[i + 1]?.text ?? null,
	}));
	const fingerprints = bodies.map((body) =>
		hash(JSON.stringify({config, body, revision: values.revision})),
	);
	const limit = model === 'eleven_v3' ? 5000 : 40000;
	if (scenes.some((scene) => [...scene.text].length > limit))
		throw new Error(
			`Scene text exceeds the ${limit}-character limit for ${model}. Split the scene before generation.`,
		);
	const selected = scenes
		.map((scene, i) => ({...scene, index: i}))
		.filter((scene) => !values.scene || scene.id === values.scene);
	if (selected.length === 0)
		throw new Error('Unknown scene ID. Run --dry-run to list IDs.');
	if (!values.sample && !values.generate) {
		console.log(
			`Dry run: ${project}; ${cursor / 30}s; model=${model}; voice=${voice || '(not configured)'}. No API requests.`,
		);
		let characters = 0;
		for (const scene of selected) {
			const hit = voice && cached(fingerprints[scene.index]);
			if (!hit) characters += [...scene.text].length;
			console.log(
				`${scene.id}: ${[...scene.text].length} text characters; ${scene.duration / 30}s slot; ${hit ? 'cached' : 'needs synthesis'}`,
			);
		}
		console.log(
			`Uncached text: ${characters} characters. This is not a credit/currency quote; model, context and account billing can affect charges.`,
		);
		return;
	}
	if (!voice)
		throw new Error(
			'Choose a Vietnamese male voice and set ELEVENLABS_VOICE_ID. Northern accent must be checked by listening, not guessed from an ID.',
		);
	const misses = values.sample
		? !cached(sampleFingerprint)
		: selected.some((scene) => !cached(fingerprints[scene.index]));
	if (values.generate && misses) {
		if (!values['confirm-spend'])
			throw new Error(
				'Uncached generation requires --confirm-spend. Use --dry-run first.',
			);
		let approved = false;
		try {
			const approval = JSON.parse(readFileSync(approvalFile, 'utf8'));
			approved =
				approval.voiceFingerprint === voiceFingerprint &&
				approval.sampleFingerprint === sampleFingerprint &&
				Boolean(cached(sampleFingerprint));
		} catch {
			/* No approval yet. */
		}
		if (!approved)
			throw new Error(
				'Generate --sample, listen to it, then run --approve-voice before full generation.',
			);
	}
	// Validate prerequisites before spending, but do not require credentials for cached work.
	try {
		execFileSync('ffprobe', ['-version'], {stdio: 'ignore'});
		execFileSync('ffmpeg', ['-version'], {stdio: 'ignore'});
	} catch {
		throw new Error('Install FFmpeg and FFprobe before generating paid audio.');
	}
	if (misses) {
		const models = (await (await request('/v1/models', null)).json()) as {
			model_id: string;
			can_do_text_to_speech: boolean;
			languages: {language_id: string}[];
		}[];
		if (
			!models.some(
				(m) =>
					m.model_id === model &&
					m.can_do_text_to_speech &&
					m.languages.some((l) => l.language_id === 'vi'),
			)
		)
			throw new Error(
				'The selected model is unavailable or does not support Vietnamese TTS.',
			);
		await request(`/v1/voices/${encodeURIComponent(voice)}`, null);
	}
	mkdirSync(cacheDir, {recursive: true});
	if (values.sample) {
		const info = await synthesize(sampleFingerprint, sampleBody, voice);
		console.log(
			`Sample: ${path.join(cacheDir, `${sampleFingerprint}.mp3`)} (${info.durationSeconds.toFixed(1)}s). Listen for warm/deep male delivery and Northern Vietnamese pronunciation. No full film was synthesized.`,
		);
		return;
	}
	for (const scene of selected) {
		const info = await synthesize(
			fingerprints[scene.index],
			bodies[scene.index],
			voice,
		);
		fittedSpeed(scene, info, fingerprints[scene.index]);
		console.log(
			`${scene.id}: raw audio ready (${info.durationSeconds.toFixed(2)}s).`,
		);
	}
	if (fingerprints.some((fingerprint) => !cached(fingerprint))) {
		console.log(
			'Selected scenes cached. Other scenes are missing; no complete soundtrack/release was published. Run --generate for the remaining scenes.',
		);
		return;
	}
	// All clips must fit before publishing any prepared files. Never truncate speech.
	const audio = fingerprints.map((fingerprint) => cached(fingerprint)!);
	const speeds = audio.map((info, i) =>
		fittedSpeed(scenes[i], info, fingerprints[i]),
	);
	const releaseFingerprint = hash(
		JSON.stringify({config, fingerprints, scenes, processingVersion: 2}),
	);
	const outputDir = path.join(
		root,
		'out',
		project,
		'elevenlabs',
		releaseFingerprint.slice(0, 16),
	);
	const manifestFile = path.join(outputDir, 'manifest.json');
	mkdirSync(outputDir, {recursive: true});
	const prepared = [];
	for (let i = 0; i < scenes.length; i++) {
		const destination = path.join(outputDir, `voice-${i}.mp3`);
		const temporary = `${destination}.${randomUUID()}.tmp.mp3`;
		try {
			execFileSync(
				'ffmpeg',
				[
					'-v',
					'error',
					'-y',
					'-i',
					path.join(cacheDir, `${fingerprints[i]}.mp3`),
					'-af',
					`atempo=${speeds[i]},adelay=450:all=1,aresample=44100,apad,atrim=end_sample=${Math.round((scenes[i].duration / 30) * 44100)},asetpts=N/SR/TB`,
					'-c:a',
					'libmp3lame',
					'-b:a',
					'128k',
					temporary,
				],
				{stdio: ['ignore', 'pipe', 'pipe']},
			);
			if (Math.abs(probe(temporary) - scenes[i].duration / 30) > 0.05)
				throw new Error(
					`Prepared audio duration mismatch for scene ${scenes[i].id}. Release not published.`,
				);
			renameSync(temporary, destination);
		} finally {
			rmSync(temporary, {force: true});
		}
		prepared.push({
			id: scenes[i].id,
			fingerprint: fingerprints[i],
			file: path.basename(destination),
			audioSha256: hash(readFileSync(destination)),
			durationFrames: scenes[i].duration,
			rawDurationSeconds: audio[i].durationSeconds,
			speed: speeds[i],
			requestId: audio[i].requestId,
		});
	}
	writeJson(manifestFile, {
		provider: 'elevenlabs',
		project,
		sourceSha256: hash(readFileSync(source)),
		config,
		releaseFingerprint,
		outputDir,
		fps: 30,
		durationFrames: cursor,
		complete: true,
		scenes: prepared,
	});
	console.log(`VOICEOVER_RESULT=${manifestFile}`);
};

main().catch((error: unknown) => {
	let message = error instanceof Error ? error.message : 'Voiceover failed.';
	const key = process.env.ELEVENLABS_API_KEY;
	if (key) message = message.split(key).join('[REDACTED]');
	console.error(
		message.replace(/sk_[a-zA-Z0-9_-]+/g, '[REDACTED]').slice(0, 800),
	);
	process.exitCode = 1;
});
