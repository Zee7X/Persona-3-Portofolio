// Geometric Wavy Ripple Math for Persona 3 Reload Transitions

export function generateWavyPolygon(
  cx: number,
  cy: number,
  r: number,
  numPoints = 72,
  waves1 = 7,
  amp1 = 0.085,
  waves2 = 14,
  amp2 = 0.035,
  phase = 0.0,
  scaleX = 1.25,
  scaleY = 1.05
): string {
  if (r <= 0.5) {
    const pt = `${cx.toFixed(1)}px ${cy.toFixed(1)}px`;
    return `polygon(${new Array(numPoints).fill(pt).join(", ")})`;
  }
  const points: string[] = [];
  const step = (2 * Math.PI) / numPoints;
  for (let i = 0; i < numPoints; i++) {
    const theta = i * step;
    const wave =
      1.0 +
      amp1 * Math.sin(waves1 * theta + phase) +
      amp2 * Math.cos(waves2 * theta + phase * 1.6);
    const px = cx + r * wave * Math.cos(theta) * scaleX;
    const py = cy + r * wave * Math.sin(theta) * scaleY;
    points.push(`${px.toFixed(1)}px ${py.toFixed(1)}px`);
  }
  return `polygon(${points.join(", ")})`;
}

export function calculateTargetRadius(origin: { x: number; y: number }): number {
  if (typeof window === "undefined") return 1500;
  const maxDist = Math.hypot(
    Math.max(origin.x, window.innerWidth - origin.x),
    Math.max(origin.y, window.innerHeight - origin.y)
  );
  return Math.ceil(maxDist * 1.85);
}

export interface TransitionRevealOptions {
  pageEl: HTMLElement | null;
  origin: { x: number; y: number };
  bodyClass?: string;
  videoEl?: HTMLVideoElement | null;
  onStart?: () => void;
  onComplete?: () => void;
  duration?: number;
}

export function executeWavyReveal({
  pageEl,
  origin,
  bodyClass,
  videoEl,
  onStart,
  onComplete,
  duration = 520
}: TransitionRevealOptions): Animation | null {
  if (!pageEl) {
    if (bodyClass) document.body.classList.add(bodyClass);
    if (onComplete) onComplete();
    return null;
  }

  if (onStart) onStart();

  const targetRadius = calculateTargetRadius(origin);

  pageEl.classList.remove("active");
  pageEl.classList.add("circle-transitioning");
  pageEl.setAttribute("aria-hidden", "false");

  if (videoEl) {
    videoEl.currentTime = 0;
    videoEl.muted = true;
    videoEl.play().catch(() => {});
  }

  const anim = pageEl.animate(
    [
      {
        clipPath: generateWavyPolygon(
          origin.x,
          origin.y,
          0,
          72,
          7,
          0.085,
          14,
          0.035,
          0.0,
          1.25,
          1.05
        )
      },
      {
        clipPath: generateWavyPolygon(
          origin.x + 22,
          origin.y - 12,
          targetRadius * 0.45,
          72,
          7,
          0.09,
          14,
          0.035,
          1.2,
          1.25,
          1.05
        ),
        offset: 0.38
      },
      {
        clipPath: generateWavyPolygon(
          origin.x + 10,
          origin.y - 5,
          targetRadius * 0.85,
          72,
          7,
          0.075,
          14,
          0.025,
          2.2,
          1.2,
          1.05
        ),
        offset: 0.7
      },
      {
        clipPath: generateWavyPolygon(
          origin.x,
          origin.y,
          targetRadius,
          72,
          7,
          0.05,
          14,
          0.015,
          3.4,
          1.15,
          1.02
        )
      }
    ],
    {
      duration,
      easing: "cubic-bezier(0.2, 1, 0.35, 1)",
      fill: "forwards"
    }
  );

  anim.onfinish = () => {
    pageEl.classList.remove("circle-transitioning");
    pageEl.classList.add("active");
    pageEl.style.clipPath = "";
    if (bodyClass) document.body.classList.add(bodyClass);
    try {
      anim.cancel();
    } catch (_) {}
    if (onComplete) onComplete();
  };

  return anim;
}

export interface TransitionCloseOptions {
  pageEl: HTMLElement | null;
  exitOrigin: { x: number; y: number };
  bodyClass?: string;
  videoEl?: HTMLVideoElement | null;
  onComplete?: () => void;
  duration?: number;
}

export function executeWavyClose({
  pageEl,
  exitOrigin,
  bodyClass,
  videoEl,
  onComplete,
  duration = 480
}: TransitionCloseOptions): Animation | null {
  if (!pageEl) {
    if (bodyClass) document.body.classList.remove(bodyClass);
    if (onComplete) onComplete();
    return null;
  }

  const targetRadius = calculateTargetRadius(exitOrigin);

  if (bodyClass) document.body.classList.remove(bodyClass);

  pageEl.classList.remove("active");
  pageEl.classList.add("circle-transitioning");

  const anim = pageEl.animate(
    [
      {
        clipPath: generateWavyPolygon(
          exitOrigin.x,
          exitOrigin.y,
          targetRadius,
          72,
          9,
          0.07,
          18,
          0.025,
          0.0,
          1.15,
          1.25
        )
      },
      {
        clipPath: generateWavyPolygon(
          exitOrigin.x - 20,
          exitOrigin.y - 12,
          targetRadius * 0.8,
          72,
          9,
          0.08,
          18,
          0.03,
          1.0,
          1.15,
          1.25
        ),
        offset: 0.32
      },
      {
        clipPath: generateWavyPolygon(
          exitOrigin.x - 28,
          exitOrigin.y - 18,
          targetRadius * 0.42,
          72,
          9,
          0.085,
          18,
          0.03,
          2.0,
          1.15,
          1.25
        ),
        offset: 0.65
      },
      {
        clipPath: generateWavyPolygon(
          exitOrigin.x,
          exitOrigin.y,
          0,
          72,
          9,
          0.08,
          18,
          0.025,
          3.0,
          1.15,
          1.25
        )
      }
    ],
    {
      duration,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      fill: "forwards"
    }
  );

  anim.onfinish = () => {
    pageEl.classList.remove("circle-transitioning", "active");
    pageEl.style.clipPath = "";
    pageEl.setAttribute("aria-hidden", "true");
    if (videoEl) videoEl.pause();
    try {
      anim.cancel();
    } catch (_) {}
    if (onComplete) onComplete();
  };

  return anim;
}
