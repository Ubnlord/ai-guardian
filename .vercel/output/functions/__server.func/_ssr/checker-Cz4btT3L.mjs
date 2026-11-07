import { o as __toESM } from "../_runtime.mjs";
import { Z as require_react, b as Link, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as canUse } from "./watch-CyReOAKX.mjs";
import { a as Panel, i as PageIntro, n as Field, o as TextArea, r as Notice, s as TextInput, t as Button } from "./ui-CPX071CA.mjs";
import { M as useGuardian, c as analyzeInvestment, d as analyzeUrl, l as analyzeMessage, s as analyzeImage, u as analyzeNumber } from "./frame-Cqg4edXm.mjs";
import { a as scoreMessage, i as scoreInvestment, n as hintLines, o as scoreNumber, s as scoreUrl } from "./heuristics-Dj61ag1q.mjs";
import { r as VerdictCard } from "./verdict-D5NhtWvN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/checker-Cz4btT3L.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MESSAGE_SAMPLES = [
	{
		label: "Lost phone",
		channel: "WhatsApp",
		text: "Mom it's me. I lost my phone and this is a new number. I'm stranded and the police said I need to pay ₦200,000 today or they won't let me go. Don't call my old number, send the money to Opay 803 445 2211 now. I'll explain later. Please hurry."
	},
	{
		label: "Bank OTP",
		channel: "SMS",
		text: "GTBank ALERT: Your account will be suspended in 30 minutes. Confirm your BVN and the OTP we just sent by replying to this message or open http://gtb-secure-login.xyz/verify. Do not ignore this."
	},
	{
		label: "Ordinary plan",
		channel: "SMS",
		text: "Dinner is at 7 at the usual place. I'll grab the pepper soup if I get there first. No need to bring anything."
	}
];
var URL_SAMPLES = [
	{
		label: "Lookalike",
		url: "http://paypa1-secure-login.xyz/account/verify?user=you"
	},
	{
		label: "Short link",
		url: "https://bit.ly/3claim-now"
	},
	{
		label: "Known domain",
		url: "https://www.paypal.com"
	}
];
var INVESTMENT_SAMPLES = [{
	label: "Double your money",
	platform: "Aurex Prime",
	contact: "WhatsApp, number I don't know",
	url: "https://aurex-prime.top/deposit",
	promise: "Celebrity trader says deposit ₦50,000 and withdraw ₦100,000 in 24 hours. Guaranteed. My account manager says the withdrawal is locked until I pay a small tax."
}];
var NUMBER_SAMPLES = [{
	label: "New Opay",
	kind: "account",
	value: "8034452211",
	context: "Mom it's me. I lost my phone and this is a new number. Send ₦200,000 to this Opay account now. Don't call my old number. I'll explain later."
}, {
	label: "Bank caller",
	kind: "phone",
	value: "08061239874",
	context: "This is GTBank fraud desk. Your account will be blocked in 20 minutes. Read me the OTP that just arrived and confirm your BVN."
}];
var MODES = [
	{
		id: "photo",
		label: "Photo",
		hint: "Screenshot, profile, or payment proof.",
		frame: "frame-photo"
	},
	{
		id: "id",
		label: "ID",
		hint: "National ID, NIN slip, licence, or voter card. Hold it flat.",
		frame: "frame-id"
	},
	{
		id: "passport",
		label: "Passport",
		hint: "The photo page, open and flat. Avoid glare.",
		frame: "frame-passport"
	},
	{
		id: "document",
		label: "Document",
		hint: "Invoice, receipt, letter, or bank alert.",
		frame: "frame-document"
	},
	{
		id: "video",
		label: "Video",
		hint: "A person, a screen recording, or someone showing a page. Six seconds is enough.",
		frame: "frame-photo"
	}
];
var QUALITY_COPY = {
	wait: "Point the camera at the page.",
	dark: "Too dark. Turn toward a light.",
	blur: "Hold still. The page is soft.",
	ready: "Sharp enough. Fill the frame, then capture."
};
function Scanner({ mode, onMode, busy, onScan, children }) {
	const videoRef = (0, import_react.useRef)(null);
	const fileRef = (0, import_react.useRef)(null);
	const streamRef = (0, import_react.useRef)(null);
	const stopScan = (0, import_react.useRef)(false);
	const [live, setLive] = (0, import_react.useState)(false);
	const [scanning, setScanning] = (0, import_react.useState)(false);
	const [shot, setShot] = (0, import_react.useState)(null);
	const [frames, setFrames] = (0, import_react.useState)([]);
	const [note, setNote] = (0, import_react.useState)("");
	const [quality, setQuality] = (0, import_react.useState)("wait");
	const [localError, setLocalError] = (0, import_react.useState)(null);
	const guide = MODES.find((item) => item.id === mode) ?? MODES[0];
	(0, import_react.useEffect)(() => {
		setFrames([]);
		setShot(null);
		setLocalError(null);
	}, [mode]);
	(0, import_react.useEffect)(() => {
		return () => {
			stopScan.current = true;
			stopStream(streamRef.current);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (!live) return;
		const video = videoRef.current;
		if (!video) return;
		const timer = window.setInterval(() => {
			if (video.readyState < 2) return;
			setQuality(readQuality(video));
		}, 450);
		return () => window.clearInterval(timer);
	}, [live]);
	async function openCamera() {
		setLocalError(null);
		setShot(null);
		setFrames([]);
		if (!navigator.mediaDevices?.getUserMedia) {
			setLocalError("This browser has no camera. Upload a photo instead.");
			return;
		}
		try {
			stopStream(streamRef.current);
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: false,
				video: {
					facingMode: { ideal: "environment" },
					width: { ideal: 1280 },
					height: { ideal: 720 }
				}
			});
			streamRef.current = stream;
			const video = videoRef.current;
			if (video) {
				video.srcObject = stream;
				await video.play();
			}
			setLive(true);
			setQuality("wait");
		} catch {
			setLive(false);
			setLocalError("Camera permission was blocked. You can still upload a photo.");
		}
	}
	function closeCamera() {
		stopScan.current = true;
		stopStream(streamRef.current);
		streamRef.current = null;
		setLive(false);
		setScanning(false);
		setQuality("wait");
	}
	function capture() {
		const video = videoRef.current;
		if (!video || video.readyState < 2) {
			setLocalError("The camera is not ready yet.");
			return;
		}
		setShot(frameToDataUrl(video));
		setFrames([]);
		setLocalError(null);
		closeCamera();
	}
	async function scanLive() {
		const video = videoRef.current;
		if (!video) return;
		stopScan.current = false;
		setScanning(true);
		setShot(null);
		setFrames([]);
		setLocalError(null);
		const collected = [];
		for (let step = 0; step < 3; step += 1) {
			if (step > 0) await pause(1600);
			if (stopScan.current) break;
			if (video.readyState < 2) continue;
			setQuality(readQuality(video));
			collected.push(frameToDataUrl(video, 720, .7));
			setFrames([...collected]);
		}
		setScanning(false);
		const keep = collected.slice();
		closeCamera();
		setFrames(keep);
		if (keep.length < 2) {
			setFrames([]);
			setLocalError("Not enough of the clip was readable. Keep it in the light and scan again.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-3 flex flex-wrap gap-2",
			children: MODES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: `chip ${mode === item.id ? "chip-on" : ""}`,
				onClick: () => onMode(item.id),
				children: item.label
			}, item.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-3 text-sm text-muted",
			children: guide.hint
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: `relative overflow-hidden rounded-xl bg-black ${live ? "" : "hidden"}`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
					ref: videoRef,
					autoPlay: true,
					playsInline: true,
					muted: true,
					className: "aspect-video w-full object-cover"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pointer-events-none absolute inset-0 grid place-items-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `finder ${guide.frame}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "finder-corner left-0 top-0 border-l-2 border-t-2 border-solid" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "finder-corner right-0 top-0 border-r-2 border-t-2 border-solid" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "finder-corner bottom-0 left-0 border-b-2 border-l-2 border-solid" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "finder-corner bottom-0 right-0 border-b-2 border-r-2 border-solid" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "scan-beam" })
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "absolute inset-x-0 bottom-3 text-center text-sm text-white",
					children: scanning ? `Reading the clip · frame ${Math.min(frames.length + 1, 3)} of 3` : QUALITY_COPY[quality]
				})
			]
		}),
		frames.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "filmstrip",
				children: frames.map((src, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src,
					alt: `Frame ${index + 1} of ${frames.length}`
				}, `${index}-${src.length}`))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "quota-track mt-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "quota-fill",
					style: { width: `${frames.length / 3 * 100}%` }
				})
			})]
		}) : null,
		shot ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: shot,
			alt: "Captured page",
			className: "mt-3 max-h-80 w-full rounded-xl object-contain outline outline-1 -outline-offset-1 outline-white/10"
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3 flex flex-wrap gap-2",
			children: live ? scanning ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "quiet",
				onClick: () => {
					stopScan.current = true;
				},
				children: "Stop"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					onClick: () => void scanLive(),
					disabled: busy,
					children: "Scan live"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "quiet",
					onClick: capture,
					disabled: busy,
					children: "Capture still"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "quiet",
					onClick: closeCamera,
					children: "Close camera"
				})
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "quiet",
				onClick: () => void openCamera(),
				disabled: busy || scanning,
				children: shot || frames.length > 0 ? "Scan again" : "Open camera"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "quiet",
				onClick: () => fileRef.current?.click(),
				disabled: busy || scanning,
				children: mode === "video" ? "Upload video" : "Upload"
			})] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			ref: fileRef,
			type: "file",
			accept: mode === "video" ? "video/mp4,video/webm,video/quicktime,image/*" : "image/*",
			className: "sr-only",
			onChange: (event) => {
				const file = event.target.files?.[0];
				event.target.value = "";
				setLocalError(null);
				if (!file) return;
				closeCamera();
				if (file.type.startsWith("video/")) {
					setShot(null);
					framesFromVideo(file).then(setFrames).catch((err) => setLocalError(err instanceof Error ? err.message : "Could not read that video."));
					return;
				}
				setFrames([]);
				fileToDataUrl(file).then(setShot).catch((err) => setLocalError(err instanceof Error ? err.message : "Could not read that file."));
			}
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "What claim came with it?",
				hint: "Optional. Example: they said this proves the payment, or that they are your son.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
					value: note,
					onChange: (event) => setNote(event.target.value)
				})
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-3 text-xs text-faint",
			children: ["The picture is sent for this check only and is not stored. A live scan reads three frames from about six seconds, and that is still one check.", mode === "id" || mode === "passport" ? " This does not confirm the document with NIMC, immigration, or any government register." : mode === "video" ? " A few frames cannot prove a deepfake, or that the clip is real." : " A low score is not proof the picture is real."]
		}),
		localError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {
				tone: "danger",
				children: localError
			})
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				disabled: busy || scanning || frames.length === 0 && !shot,
				onClick: () => {
					const payload = frames.length > 0 ? frames : shot ? [shot] : [];
					if (payload.length > 0) onScan({
						frames: payload,
						note
					});
				},
				children: busy ? "Reading the page…" : frames.length > 1 ? "Check clip" : `Check ${guide.label.toLowerCase()}`
			})
		}),
		children
	] });
}
function stopStream(stream) {
	stream?.getTracks().forEach((track) => track.stop());
}
function frameToDataUrl(video, max = 1280, quality = .8) {
	return drawToJpeg(video.videoWidth, video.videoHeight, (ctx, width, height) => {
		ctx.drawImage(video, 0, 0, width, height);
	}, max, quality);
}
async function fileToDataUrl(file) {
	if (file.type === "application/pdf") throw new Error("Save the PDF as a photo or screenshot. PDF files are not read.");
	if (!file.type.startsWith("image/")) throw new Error("Choose an image file.");
	const bitmap = await createImageBitmap(file);
	try {
		return drawToJpeg(bitmap.width, bitmap.height, (ctx, width, height) => {
			ctx.drawImage(bitmap, 0, 0, width, height);
		});
	} finally {
		bitmap.close();
	}
}
function drawToJpeg(sourceWidth, sourceHeight, paint, max = 1280, quality = .8) {
	const scale = Math.min(1, max / Math.max(sourceWidth, sourceHeight, 1));
	const width = Math.max(1, Math.round(sourceWidth * scale));
	const height = Math.max(1, Math.round(sourceHeight * scale));
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Could not read that image.");
	paint(ctx, width, height);
	return canvas.toDataURL("image/jpeg", quality);
}
function pause(ms) {
	return new Promise((resolve) => {
		window.setTimeout(resolve, ms);
	});
}
function framesFromVideo(file) {
	if (file.size > 41943040) return Promise.reject(/* @__PURE__ */ new Error("That video is too large. Keep it under 40 MB."));
	const url = URL.createObjectURL(file);
	const video = document.createElement("video");
	video.preload = "auto";
	video.muted = true;
	video.playsInline = true;
	video.src = url;
	return new Promise((resolve, reject) => {
		const fail = (message) => {
			URL.revokeObjectURL(url);
			reject(new Error(message));
		};
		const openTimer = window.setTimeout(() => fail("That video took too long to open."), 12e3);
		video.onerror = () => {
			window.clearTimeout(openTimer);
			fail("Could not open that video.");
		};
		video.onloadedmetadata = () => {
			window.clearTimeout(openTimer);
			const duration = video.duration;
			if (!Number.isFinite(duration) || duration < .4) {
				fail("That video is too short to read.");
				return;
			}
			if (duration > 45) {
				fail("Keep the clip under 45 seconds.");
				return;
			}
			const times = [
				duration * .12,
				duration * .5,
				Math.max(0, Math.min(duration - .05, duration * .88))
			];
			const frames = [];
			let index = 0;
			const seek = () => {
				if (index >= times.length) {
					URL.revokeObjectURL(url);
					resolve(frames);
					return;
				}
				const wait = window.setTimeout(() => fail("Could not read a frame from that video."), 8e3);
				const onSeek = () => {
					window.clearTimeout(wait);
					video.removeEventListener("seeked", onSeek);
					try {
						frames.push(frameToDataUrl(video, 720, .7));
					} catch (err) {
						fail(err instanceof Error ? err.message : "Could not read a frame.");
						return;
					}
					index += 1;
					seek();
				};
				video.addEventListener("seeked", onSeek);
				video.currentTime = times[index];
			};
			seek();
		};
	});
}
function readQuality(video) {
	const width = 64;
	const height = 48;
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d", { willReadFrequently: true });
	if (!ctx) return "wait";
	ctx.drawImage(video, 0, 0, width, height);
	const pixels = ctx.getImageData(0, 0, width, height).data;
	const gray = /* @__PURE__ */ new Float32Array(3072);
	let sum = 0;
	for (let i = 0; i < gray.length; i += 1) {
		const value = pixels[i * 4] * .3 + pixels[i * 4 + 1] * .59 + pixels[i * 4 + 2] * .11;
		gray[i] = value;
		sum += value;
	}
	if (sum / gray.length < 42) return "dark";
	let energy = 0;
	let count = 0;
	for (let y = 1; y < 47; y += 1) for (let x = 1; x < 63; x += 1) {
		const i = y * width + x;
		const lap = gray[i - width] + gray[i + width] + gray[i - 1] + gray[i + 1] - 4 * gray[i];
		energy += lap * lap;
		count += 1;
	}
	if (energy / count < 40) return "blur";
	return "ready";
}
var COPY = {
	message: {
		kicker: "MESSAGE",
		title: "Is this message safe?",
		body: "Paste the SMS, WhatsApp, email, or DM before you reply, pay, or share a code."
	},
	url: {
		kicker: "LINK",
		title: "Is this link safe?",
		body: "Paste the address. Guardian reads the link itself. It does not open the page."
	},
	image: {
		kicker: "SCAN",
		title: "Scan a photo, ID, or video",
		body: "Open the camera for a still or a six-second live scan. Or upload a picture or a short clip."
	},
	investment: {
		kicker: "INVESTMENT",
		title: "Is this offer a trap?",
		body: "Crypto, forex, task groups, and “double your money” pitches. Describe what they promised and what they want."
	},
	number: {
		kicker: "NUMBER",
		title: "Is this number safe to pay?",
		body: "A phone or a 10-digit account, plus what they said. Guardian cannot see who owns it. It can see the ask."
	}
};
var CHANNELS = [
	"WhatsApp",
	"SMS",
	"Email",
	"DM",
	"Call"
];
function Checker({ kind }) {
	const me = useGuardian((s) => s.me);
	const copy = COPY[kind];
	const locked = me && (kind === "image" && !canUse(me.plan, "image") || kind === "investment" && !canUse(me.plan, "investment"));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
		kicker: copy.kicker,
		title: copy.title,
		body: copy.body
	}), locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: kind === "image" ? "Photo, ID, passport, document, and short video scans are on Guardian Plus. Free covers messages, links, and numbers — five times a month." : "This check is on Guardian Plus. Free covers messages, links, and numbers — five times a month."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/plans",
		className: "mt-4 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-ink",
		children: "See plans"
	})] }) : kind === "message" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageForm, {}) : kind === "url" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UrlForm, {}) : kind === "image" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageForm, {}) : kind === "number" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberForm, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvestmentForm, {})] });
}
function useCheck() {
	const [pending, setPending] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [upgrade, setUpgrade] = (0, import_react.useState)(false);
	const [analysis, setAnalysis] = (0, import_react.useState)(null);
	async function run(work) {
		setPending(true);
		setError(null);
		setUpgrade(false);
		try {
			const result = await work();
			if (!result.ok) {
				setError(result.error);
				setUpgrade(Boolean(result.upgrade));
				setAnalysis(null);
			} else setAnalysis(result.analysis);
		} catch (err) {
			setAnalysis(null);
			setError(err instanceof Error ? err.message : "The check did not finish.");
		} finally {
			setPending(false);
		}
	}
	return {
		pending,
		error,
		upgrade,
		analysis,
		run
	};
}
function Result({ pending, error, upgrade, analysis, subject }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-5 space-y-3",
		children: [
			pending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scan, { subject }) : null,
			!pending && error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Notice, {
				tone: "danger",
				children: [
					error,
					" ",
					upgrade ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/plans",
						className: "font-semibold text-primary",
						children: "See plans"
					}) : null
				]
			}) : null,
			!pending && analysis ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VerdictCard, {
				analysis,
				live: true
			}, analysis.id) : null
		]
	});
}
var SCAN_STEPS = [
	"Matching pressure and impersonation",
	"Scoring the ask",
	"Writing what to do next"
];
function Scan({ subject }) {
	const steps = [`Reading the ${subject}`, ...SCAN_STEPS];
	const [index, setIndex] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => setIndex((current) => (current + 1) % steps.length), 900);
		return () => window.clearInterval(id);
	}, [steps.length]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "scan panel",
		role: "status",
		"aria-live": "polite",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "scan-grid",
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "scan-beam",
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs tracking-widest text-primary",
						children: "CHECKING"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "scan-phrase mt-2 text-lg font-semibold",
						children: steps[index]
					}, steps[index]),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "This usually takes a few seconds."
					})
				]
			})
		]
	});
}
function Hints({ lines }) {
	if (lines.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3 rounded-md border border-line bg-bg px-3 py-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-xs tracking-widest text-faint",
				children: "PATTERN HINTS"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-1 space-y-1",
				children: lines.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "hint-pop text-sm text-muted",
					children: line
				}, line))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-faint",
				children: "Hints are not the Guardian score. Run the check."
			})
		]
	});
}
function MessageForm() {
	const me = useGuardian((s) => s.me);
	const [text, setText] = (0, import_react.useState)("");
	const [channel, setChannel] = (0, import_react.useState)("WhatsApp");
	const [invoice, setInvoice] = (0, import_react.useState)(false);
	const state = useCheck();
	(0, import_react.useEffect)(() => {
		const draft = sessionStorage.getItem("guardian-draft");
		if (draft) {
			setText(draft);
			sessionStorage.removeItem("guardian-draft");
		}
	}, []);
	const hints = (0, import_react.useMemo)(() => text.trim().length < 20 ? [] : hintLines(scoreMessage(text, invoice ? "invoice" : "message")), [text, invoice]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: (event) => {
			event.preventDefault();
			state.run(() => analyzeMessage({ data: {
				text,
				channel,
				mode: invoice ? "invoice" : "message"
			} }));
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-3 flex flex-wrap gap-2",
				children: MESSAGE_SAMPLES.map((sample) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "chip",
					onClick: () => {
						setText(sample.text);
						setChannel(sample.channel);
					},
					children: ["Try: ", sample.label]
				}, sample.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-3 flex flex-wrap gap-2",
				children: CHANNELS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setChannel(item),
					className: `chip ${channel === item ? "chip-on" : ""}`,
					children: item
				}, item))
			}),
			me?.plan === "business" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mb-3 flex min-h-11 items-center gap-2 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: invoice,
					onChange: (event) => setInvoice(event.target.checked)
				}), "Treat this as a supplier invoice"]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "The message",
				hint: "Nothing is sent until you press Check.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
					value: text,
					onChange: (event) => setText(event.target.value),
					placeholder: "Paste the message exactly as you received it."
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hints, { lines: hints }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: state.pending || text.trim().length < 8,
					children: state.pending ? "Reading the signals…" : "Check message"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Result, {
				...state,
				subject: "message"
			})
		]
	});
}
function NumberForm() {
	const [kind, setKind] = (0, import_react.useState)("phone");
	const [value, setValue] = (0, import_react.useState)("");
	const [context, setContext] = (0, import_react.useState)("");
	const state = useCheck();
	const hints = (0, import_react.useMemo)(() => {
		if (value.trim().length < 8 && context.trim().length < 12) return [];
		return hintLines(scoreNumber(kind, value, context));
	}, [
		kind,
		value,
		context
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: (event) => {
			event.preventDefault();
			state.run(() => analyzeNumber({ data: {
				kind,
				value,
				context
			} }));
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-3 flex flex-wrap gap-2",
				children: NUMBER_SAMPLES.map((sample) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "chip",
					onClick: () => {
						setKind(sample.kind);
						setValue(sample.value);
						setContext(sample.context);
					},
					children: ["Try: ", sample.label]
				}, sample.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-3 flex flex-wrap gap-2",
				children: [["phone", "Phone"], ["account", "Account"]].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setKind(id),
					className: `chip ${kind === id ? "chip-on" : ""}`,
					children: label
				}, id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: kind === "phone" ? "Phone number" : "Account number",
				hint: "Nigerian mobiles, or a 10-digit NUBAN. Not the person's name.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
					value,
					onChange: (event) => setValue(event.target.value),
					placeholder: kind === "phone" ? "0803 000 0000" : "0123456789",
					inputMode: "numeric",
					autoCapitalize: "none"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "What they said",
					hint: "Optional, but this is where the scam usually is.",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
						value: context,
						onChange: (event) => setContext(event.target.value),
						placeholder: "Send it now. Don't call the old number."
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hints, { lines: hints }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: state.pending || value.trim().length < 8,
					children: state.pending ? "Reading the number…" : "Check number"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Result, {
				...state,
				subject: "number"
			})
		]
	});
}
function UrlForm() {
	const [url, setUrl] = (0, import_react.useState)("");
	const [note, setNote] = (0, import_react.useState)("");
	const state = useCheck();
	const hints = (0, import_react.useMemo)(() => url.trim().length < 4 ? [] : hintLines(scoreUrl(url)), [url]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: (event) => {
			event.preventDefault();
			state.run(() => analyzeUrl({ data: {
				url,
				note
			} }));
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-3 flex flex-wrap gap-2",
				children: URL_SAMPLES.map((sample) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "chip",
					onClick: () => setUrl(sample.url),
					children: ["Try: ", sample.label]
				}, sample.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Web address",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
					value: url,
					onChange: (event) => setUrl(event.target.value),
					placeholder: "https://",
					inputMode: "url",
					autoCapitalize: "none"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "What did they ask you to do there?",
					hint: "Optional.",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
						value: note,
						onChange: (event) => setNote(event.target.value),
						placeholder: "Log in, pay a fee, enter an OTP…"
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hints, { lines: hints }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: state.pending || url.trim().length < 4,
					children: state.pending ? "Reading the address…" : "Check link"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Result, {
				...state,
				subject: "link"
			})
		]
	});
}
function InvestmentForm() {
	const [platform, setPlatform] = (0, import_react.useState)("");
	const [contact, setContact] = (0, import_react.useState)("");
	const [url, setUrl] = (0, import_react.useState)("");
	const [promise, setPromise] = (0, import_react.useState)("");
	const state = useCheck();
	const hints = (0, import_react.useMemo)(() => {
		const blob = `${platform}\n${contact}\n${url}\n${promise}`;
		return blob.trim().length < 12 ? [] : hintLines(scoreInvestment(blob));
	}, [
		platform,
		contact,
		url,
		promise
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: (event) => {
			event.preventDefault();
			state.run(() => analyzeInvestment({ data: {
				platform,
				contact,
				url,
				promise
			} }));
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-3",
				children: INVESTMENT_SAMPLES.map((sample) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "chip",
					onClick: () => {
						setPlatform(sample.platform);
						setContact(sample.contact);
						setUrl(sample.url);
						setPromise(sample.promise);
					},
					children: ["Try: ", sample.label]
				}, sample.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Platform or group name",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
						value: platform,
						onChange: (event) => setPlatform(event.target.value),
						placeholder: "Aurex Prime"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "How they reached you",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
						value: contact,
						onChange: (event) => setContact(event.target.value),
						placeholder: "WhatsApp, a stranger"
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Their link",
					hint: "Optional.",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
						value: url,
						onChange: (event) => setUrl(event.target.value),
						placeholder: "https://",
						autoCapitalize: "none"
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "What they promised",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
						value: promise,
						onChange: (event) => setPromise(event.target.value),
						placeholder: "Deposit this, withdraw that, a fee to unlock…"
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hints, { lines: hints }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: state.pending || promise.trim().length < 8 && platform.trim().length < 2,
					children: state.pending ? "Reading the offer…" : "Check offer"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Result, {
				...state,
				subject: "offer"
			})
		]
	});
}
function ImageForm() {
	const [mode, setMode] = (0, import_react.useState)("photo");
	const state = useCheck();
	const subject = mode === "id" ? "ID" : mode === "passport" ? "passport" : mode === "document" ? "document" : mode === "video" ? "video" : "photo";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scanner, {
		mode,
		onMode: setMode,
		busy: state.pending,
		onScan: ({ frames, note }) => {
			state.run(() => analyzeImage({ data: {
				frames,
				note,
				mode
			} }));
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Result, {
			...state,
			subject
		})
	});
}
//#endregion
export { Checker as t };
