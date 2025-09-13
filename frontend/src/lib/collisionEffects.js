const getRandomFloatInclusive = (start, end) => {
	return Math.random() * (end - start) + start;
};

// Make sure absolute children are positioned relative to `el`
const ensurePositioned = (el) => {
	const pos = getComputedStyle(el).position;
	if (pos === 'static' || !pos) el.style.position = 'relative';
};

/** Spawn N particles relative to `el` at local x,y */
const particleBurst = (el, opts) => {
	ensurePositioned(el);

	const {
		x,
		y,
		colors = ['#fff'],
		count = 12,
		speedMin = 150,
		speedMax = 420,
		sizeMin = 6,
		sizeMax = 12,
		lifeMin = 450,
		lifeMax = 900,
		gravity = 520, // px/s^2 downward
		shape = 'circle', // 'circle' | 'square'
	} = opts;

	for (let i = 0; i < count; i++) {
		const p = document.createElement('div');
		p.className = 'particle';
		const size = getRandomFloatInclusive(sizeMin, sizeMax);
		p.style.width = p.style.height = `${size}px`;
		p.style.borderRadius = shape === 'circle' ? '50%' : '4px';
		p.style.left = `${x - size / 2}px`;
		p.style.top = `${y - size / 2}px`;
		p.style.background = colors[i % colors.length];
		el.appendChild(p);

		const angle = Math.random() * Math.PI * 2;
		const speed = getRandomFloatInclusive(speedMin, speedMax);
		const vx = Math.cos(angle) * speed;
		const vy = Math.sin(angle) * speed - getRandomFloatInclusive(80, 160); // upward bias

		const start = performance.now();
		const life = getRandomFloatInclusive(lifeMin, lifeMax);
		const move = (t) => {
			const dt = (t - start) / 1000;
			const k = (t - start) / life;
			if (k >= 1) {
				p.remove();
				return;
			}
			const nx = x + vx * dt;
			const ny = y + vy * dt + 0.5 * gravity * dt * dt;
			p.style.transform = `translate(${nx - x}px, ${ny - y}px) rotate(${
				dt * 8
			}rad)`;
			p.style.opacity = String(1 - k);
			requestAnimationFrame(move);
		};
		requestAnimationFrame(move);
	}
};

/** Spawn a floating "+points" text that rises & fades (local to `el`) */
const floatText = (el, x, y, text, color = '#fff') => {
	ensurePositioned(el);

	const elText = document.createElement('div');
	elText.className = 'float-text';
	elText.textContent = text;
	elText.style.left = `${x + 80}px`;
	elText.style.top = `${y - 80}px`;
	elText.style.color = color;
	elText.style.fontSize = '30px';
	el.appendChild(elText);

	const start = performance.now();
	const life = 700; // ms
	const dx = Math.random() * 40 - 20;

	const tick = (t) => {
		const k = Math.min(1, (t - start) / life);
		const ease = 1 - Math.pow(1 - k, 3);
		elText.style.opacity = `${1 - ease}`;
		elText.style.transform = `translate(${dx * ease}px, ${
			-40 * ease
		}px) scale(${1 + 0.2 * (1 - ease)})`;
		if (k < 1) requestAnimationFrame(tick);
		else elText.remove();
	};
	requestAnimationFrame(tick);
};

/** Expanding glow ring (local to `el`) */
const ringPulse = (
	el,
	x,
	y,
	r = 16,
	color = 'rgba(255,255,255,0.85)',
	stroke = 3
) => {
	ensurePositioned(el);

	const ring = document.createElement('div');
	ring.className = 'ring';
	ring.style.left = `${x - r}px`;
	ring.style.top = `${y - r}px`;
	ring.style.width = `${r * 2}px`;
	ring.style.height = `${r * 2}px`;
	ring.style.border = `${stroke}px solid ${color}`;
	el.appendChild(ring);

	const start = performance.now(),
		life = 350;
	const anim = (t) => {
		const k = Math.min(1, (t - start) / life);
		const ease = 1 - Math.pow(1 - k, 3);
		const scale = 1 + 2.2 * ease;
		ring.style.transform = `scale(${scale})`;
		ring.style.opacity = String(1 - ease);
		if (k < 1) requestAnimationFrame(anim);
		else ring.remove();
	};
	requestAnimationFrame(anim);
};

export const fxPopShine = (el, points) => {
	// Optional element scale pop (matches your original)
	el.animate(
		[
			{ transform: 'scale(1)' },
			{ transform: 'scale(1.2)' },
			{ transform: 'scale(0.8)' },
			{ transform: 'scale(1)' },
		],
		{ duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)' }
	);

	// Local center of the element (no stage math needed)
	const w = el.clientWidth;
	const h = el.clientHeight;
	const cx = w / 2;
	const cy = h / 2;

	// Ring sized by the element (same look as before)
	ringPulse(el, cx, cy, w / 2, 'rgba(255,255,255,0.9)', 3);

	// Sparkle burst
	particleBurst(el, {
		x: cx,
		y: cy,
		colors: ['#fff', '#a3e7ff', '#bdb2ff', '#e8f7ff'],
		count: 14,
		speedMin: 180,
		speedMax: 360,
		sizeMin: 6,
		sizeMax: 10,
		lifeMin: 400,
		lifeMax: 800,
		gravity: 380,
	});

	// Floating points
	floatText(el, cx - 8, cy - 24, `+${points}`, '#ffffff');
};
