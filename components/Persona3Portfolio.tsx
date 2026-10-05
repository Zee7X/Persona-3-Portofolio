"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  MENU_OPTIONS,
  PINNED_PROJECTS,
  SKILL_TABS,
  SKILL_GROUPS,
  PROFILE_INFO,
  CONTACT_CHANNELS,
  MenuOption,
  PinnedProject,
  SkillGroup
} from "@/lib/portfolio-data";
import {
  initAudioEngine,
  playSFX,
  playCloseMenuSFX,
  playMenuUtamaSFX,
  unlockAudioEngine,
  playBGM,
  toggleBGM,
  isBGMActive
} from "@/lib/audio-engine";
import {
  executeWavyReveal,
  executeWavyClose
} from "@/lib/wavy-transition";

const SELECTOR_PATH =
  "M 24.853754, 93.31573 135.14625, 49.684266 114.14751, 97.331142 Z";
const SELECTOR_BG_PATH =
  "M 12.7428765,95.50088 144.25712,47.499123 116.75625,95.465764 Z";
const COLORS = ["fill-button-1", "fill-button-2", "fill-button-3"];

export default function Persona3Portfolio() {
  // Screen States
  const [isLoaded, setIsLoaded] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isBgmPlaying, setIsBgmPlaying] = useState(true);

  const [selectedMenuIndex, setSelectedMenuIndex] = useState(0);
  const [activeScreen, setActiveScreen] = useState<
    "menu" | "project" | "skill" | "about" | "contact"
  >("menu");

  const [selectedProjectIndex, setSelectedProjectIndex] = useState(0);
  const [currentSkillTab, setCurrentSkillTab] = useState("backend");
  const [selectedContactIndex, setSelectedContactIndex] = useState(0);

  // Video Refs
  const introVideoRef = useRef<HTMLVideoElement | null>(null);
  const loopVideoRef = useRef<HTMLVideoElement | null>(null);
  const projectVideoRef = useRef<HTMLVideoElement | null>(null);
  const skillVideoRef = useRef<HTMLVideoElement | null>(null);
  const aboutVideoRef = useRef<HTMLVideoElement | null>(null);
  const contactVideoRef = useRef<HTMLVideoElement | null>(null);

  // Screen DOM Refs for WAAPI Transitions
  const projectScreenRef = useRef<HTMLElement | null>(null);
  const skillScreenRef = useRef<HTMLElement | null>(null);
  const aboutScreenRef = useRef<HTMLElement | null>(null);
  const contactScreenRef = useRef<HTMLElement | null>(null);

  // Track transition state
  const isTransitioningRef = useRef(false);

  // --------------------------------------------------------------------------
  // Loading Progress Sequence
  // --------------------------------------------------------------------------
  useEffect(() => {
    initAudioEngine();

    let current = 0;
    let animId: number;

    const tick = () => {
      if (current < 100) {
        current += Math.max(1, Math.ceil((100 - current) * 0.15));
        setLoadingProgress(Math.min(100, current));
        animId = requestAnimationFrame(tick);
      } else {
        setLoadingProgress(100);
        setIsLoaded(true);
      }
    };

    const timer = setTimeout(() => {
      animId = requestAnimationFrame(tick);
    }, 150);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleEnterExperience = useCallback(() => {
    if (isStarted) return;
    unlockAudioEngine();
    setIsStarted(true);
    playMenuUtamaSFX(true);
    playBGM(0.20);
    setIsBgmPlaying(true);

    if (introVideoRef.current) {
      introVideoRef.current.currentTime = 0;
      introVideoRef.current.muted = true;
      introVideoRef.current.play().catch(() => {
        // Fallback directly to loop if autoplay with video fails
        if (loopVideoRef.current) {
          loopVideoRef.current.play().catch(() => {});
        }
      });
    }
  }, [isStarted]);

  // Fallback auto-entry if user does not click after loading reaches 100%
  useEffect(() => {
    if (isLoaded && !isStarted) {
      const fallbackTimer = setTimeout(() => {
        handleEnterExperience();
      }, 3500);
      return () => clearTimeout(fallbackTimer);
    }
  }, [isLoaded, isStarted, handleEnterExperience]);

  // --------------------------------------------------------------------------
  // Video Intro -> Loop Switcher
  // --------------------------------------------------------------------------
  const handleIntroVideoEnded = () => {
    if (introVideoRef.current) {
      introVideoRef.current.classList.add("fade-out");
      setTimeout(() => {
        if (introVideoRef.current) {
          introVideoRef.current.style.display = "none";
        }
      }, 300);
    }
    if (loopVideoRef.current) {
      loopVideoRef.current.currentTime = 0;
      loopVideoRef.current.play().catch(() => {});
    }
  };

  // --------------------------------------------------------------------------
  // Subpage Navigation & Transitions
  // --------------------------------------------------------------------------
  const getClickOrigin = (e?: React.MouseEvent): { x: number; y: number } => {
    if (e && (e.clientX > 0 || e.clientY > 0)) {
      return { x: e.clientX, y: e.clientY };
    }
    return {
      x: window.innerWidth * 0.58,
      y: window.innerHeight * 0.45
    };
  };

  const getExitOrigin = (corner: "right" | "left" = "right"): { x: number; y: number } => {
    if (corner === "left") {
      return { x: 80, y: window.innerHeight - 60 };
    }
    return { x: window.innerWidth - 120, y: window.innerHeight - 55 };
  };

  const openSubScreen = (
    screenName: "project" | "skill" | "about" | "contact",
    e?: React.MouseEvent
  ) => {
    if (isTransitioningRef.current || activeScreen !== "menu") return;
    isTransitioningRef.current = true;
    playSFX();

    let targetEl: HTMLElement | null = null;
    let targetVideo: HTMLVideoElement | null = null;
    let bodyClass = "";

    if (screenName === "project") {
      targetEl = projectScreenRef.current;
      targetVideo = projectVideoRef.current;
      bodyClass = "project-screen-active";
      setSelectedProjectIndex(0);
    } else if (screenName === "skill") {
      targetEl = skillScreenRef.current;
      targetVideo = skillVideoRef.current;
      bodyClass = "skill-screen-active";
    } else if (screenName === "about") {
      targetEl = aboutScreenRef.current;
      targetVideo = aboutVideoRef.current;
      bodyClass = "about-screen-active";
    } else if (screenName === "contact") {
      targetEl = contactScreenRef.current;
      targetVideo = contactVideoRef.current;
      bodyClass = "contact-screen-active";
      setSelectedContactIndex(0);
    }

    // Pause main background loop to save GPU
    if (loopVideoRef.current && !loopVideoRef.current.paused) {
      loopVideoRef.current.pause();
    }

    const origin = getClickOrigin(e);
    executeWavyReveal({
      pageEl: targetEl,
      origin,
      bodyClass,
      videoEl: targetVideo,
      onComplete: () => {
        setActiveScreen(screenName);
        isTransitioningRef.current = false;
      }
    });
  };

  const closeSubScreen = () => {
    if (isTransitioningRef.current || activeScreen === "menu") return;
    isTransitioningRef.current = true;
    playCloseMenuSFX();

    let targetEl: HTMLElement | null = null;
    let targetVideo: HTMLVideoElement | null = null;
    let bodyClass = "";
    let corner: "right" | "left" = "right";

    if (activeScreen === "project") {
      targetEl = projectScreenRef.current;
      targetVideo = projectVideoRef.current;
      bodyClass = "project-screen-active";
    } else if (activeScreen === "skill") {
      targetEl = skillScreenRef.current;
      targetVideo = skillVideoRef.current;
      bodyClass = "skill-screen-active";
    } else if (activeScreen === "about") {
      targetEl = aboutScreenRef.current;
      targetVideo = aboutVideoRef.current;
      bodyClass = "about-screen-active";
    } else if (activeScreen === "contact") {
      targetEl = contactScreenRef.current;
      targetVideo = contactVideoRef.current;
      bodyClass = "contact-screen-active";
      corner = "left";
    }

    const exitOrigin = getExitOrigin(corner);
    executeWavyClose({
      pageEl: targetEl,
      exitOrigin,
      bodyClass,
      videoEl: targetVideo,
      onComplete: () => {
        setActiveScreen("menu");
        isTransitioningRef.current = false;
        // Resume loop video
        if (loopVideoRef.current && loopVideoRef.current.paused) {
          loopVideoRef.current.play().catch(() => {});
        }
      }
    });
  };

  const handleOptionSelect = (index: number) => {
    if (selectedMenuIndex !== index) {
      setSelectedMenuIndex(index);
      playSFX();
    }
  };

  const handleOptionConfirm = (index: number, e?: React.MouseEvent) => {
    handleOptionSelect(index);
    if (index === 0) openSubScreen("project", e);
    else if (index === 1) openSubScreen("skill", e);
    else if (index === 2) openSubScreen("about", e);
    else if (index === 3) openSubScreen("contact", e);
  };

  const handleConfirmProject = useCallback(() => {
    const proj = PINNED_PROJECTS[selectedProjectIndex];
    if (proj) {
      playSFX();
      const targetUrl = proj.demoUrl || proj.repoUrl;
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  }, [selectedProjectIndex]);

  const handleContactRowClick = useCallback((channelHref: string) => {
    playSFX();
    window.open(channelHref, "_blank", "noopener,noreferrer");
  }, []);

  // --------------------------------------------------------------------------
  // Full Keyboard Router
  // --------------------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      unlockAudioEngine();

      if (!isStarted) {
        if (e.key === "Enter" || e.key === " ") {
          handleEnterExperience();
        }
        return;
      }

      // Global BGM Toggle Shortcut (M key)
      if (e.key.toLowerCase() === "m") {
        e.preventDefault();
        const nextState = toggleBGM();
        setIsBgmPlaying(nextState);
        return;
      }

      if (isTransitioningRef.current) return;

      // When Project Screen is active
      if (activeScreen === "project") {
        if (
          e.key === "Escape" ||
          e.key.toLowerCase() === "b" ||
          e.key.toLowerCase() === "backspace"
        ) {
          e.preventDefault();
          closeSubScreen();
        } else if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") {
          e.preventDefault();
          setSelectedProjectIndex(
            (prev) => (prev + 1) % PINNED_PROJECTS.length
          );
          playSFX();
        } else if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") {
          e.preventDefault();
          setSelectedProjectIndex(
            (prev) => (prev - 1 + PINNED_PROJECTS.length) % PINNED_PROJECTS.length
          );
          playSFX();
        } else if (
          e.key === "Enter" ||
          e.key === " " ||
          e.key.toLowerCase() === "a"
        ) {
          e.preventDefault();
          handleConfirmProject();
        }
        return;
      }

      // When Skills Screen is active
      if (activeScreen === "skill") {
        if (
          e.key === "Escape" ||
          e.key.toLowerCase() === "b" ||
          e.key.toLowerCase() === "backspace"
        ) {
          e.preventDefault();
          closeSubScreen();
        } else if (e.key.toLowerCase() === "q" || e.key === "ArrowLeft") {
          e.preventDefault();
          const currIdx = SKILL_TABS.findIndex((t) => t.id === currentSkillTab);
          const nextIdx = (currIdx - 1 + SKILL_TABS.length) % SKILL_TABS.length;
          setCurrentSkillTab(SKILL_TABS[nextIdx].id);
          playSFX();
        } else if (e.key.toLowerCase() === "e" || e.key === "ArrowRight") {
          e.preventDefault();
          const currIdx = SKILL_TABS.findIndex((t) => t.id === currentSkillTab);
          const nextIdx = (currIdx + 1) % SKILL_TABS.length;
          setCurrentSkillTab(SKILL_TABS[nextIdx].id);
          playSFX();
        }
        return;
      }

      // When About Screen is active
      if (activeScreen === "about") {
        if (
          e.key === "Escape" ||
          e.key.toLowerCase() === "b" ||
          e.key.toLowerCase() === "backspace"
        ) {
          e.preventDefault();
          closeSubScreen();
        }
        return;
      }

      // When Contact Screen is active
      if (activeScreen === "contact") {
        if (
          e.key === "Escape" ||
          e.key.toLowerCase() === "b" ||
          e.key.toLowerCase() === "backspace"
        ) {
          e.preventDefault();
          closeSubScreen();
        } else if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") {
          e.preventDefault();
          setSelectedContactIndex(
            (prev) => (prev + 1) % CONTACT_CHANNELS.length
          );
          playSFX();
        } else if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") {
          e.preventDefault();
          setSelectedContactIndex(
            (prev) => (prev - 1 + CONTACT_CHANNELS.length) % CONTACT_CHANNELS.length
          );
          playSFX();
        } else if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const ch = CONTACT_CHANNELS[selectedContactIndex];
          if (ch) handleContactRowClick(ch.href);
        }
        return;
      }

      // Main Menu Keyboard Controls
      if (activeScreen === "menu") {
        if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") {
          e.preventDefault();
          setSelectedMenuIndex((prev) => (prev + 1) % MENU_OPTIONS.length);
          playSFX();
        } else if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") {
          e.preventDefault();
          setSelectedMenuIndex(
            (prev) => (prev - 1 + MENU_OPTIONS.length) % MENU_OPTIONS.length
          );
          playSFX();
        } else if (
          e.key === "Enter" ||
          e.key === " " ||
          e.key.toLowerCase() === "b"
        ) {
          e.preventDefault();
          handleOptionConfirm(selectedMenuIndex);
        } else if (e.key === "Escape" || e.key.toLowerCase() === "a") {
          playSFX();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isStarted,
    activeScreen,
    selectedMenuIndex,
    currentSkillTab,
    selectedProjectIndex,
    selectedContactIndex,
    handleConfirmProject,
    handleContactRowClick,
    handleEnterExperience
  ]);

  const activeSkillGroup = SKILL_GROUPS.find(
    (g) => g.id === currentSkillTab
  ) || SKILL_GROUPS[0];

  return (
    <div className="relative w-full h-full select-none">
      {/* Mobile / Small Screen Notification */}
      <div className="mobile-warning">
        <p>Sorry, this website is not supported for your device.</p>
        <p>Try viewing this site on a computer!</p>
      </div>

      {/* Preloaded Native Audio Elements for Hardware Instant Playback */}
      <audio id="sfx-menu-utama-el" src="/sfx/menu-utama.mp3" preload="auto" />
      <audio id="sfx-navigation-el" src="/sfx/navigation.wav" preload="auto" />
      <audio id="sfx-close-menu-el" src="/sfx/close-menu.mp3" preload="auto" />

      {/* Loading Screen */}
      <div
        id="loading-screen"
        className={`p3r-loading-screen ${isStarted ? "dismissed" : ""}`}
        role="progressbar"
        aria-valuenow={loadingProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        onClick={handleEnterExperience}
      >
        <div className="loading-hud-bottom">
          <div className="loading-text-row">
            <h2 className="loading-title">
              NOW LOADING
              <span className="loading-dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </h2>
          </div>
          <div className="loading-bar-wrap">
            <div className="loading-track">
              <div
                id="loading-bar"
                className="loading-fill"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <div id="loading-percent" className="loading-percent">
              {loadingProgress}%
            </div>
          </div>
          {loadingProgress >= 90 && !isStarted && (
            <div className="loading-start-hint" onClick={handleEnterExperience}>
              <span className="prompt-bracket">[</span>
              <span>CLICK ANYWHERE OR PRESS ENTER TO START</span>
              <span className="prompt-bracket">]</span>
              <span>▶</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas Screen */}
      <main className="p3r-main">
        <div className="p3r-global-vignette" aria-hidden="true"></div>

        {/* Video Backdrops */}
        <video
          ref={introVideoRef}
          id="background-video-intro"
          className="background-video bg-video-intro"
          src="/assets/bg-intro.mp4"
          poster="/assets/posters/bg-loop.webp"
          muted
          playsInline
          preload="auto"
          onEnded={handleIntroVideoEnded}
          onError={handleIntroVideoEnded}
        ></video>
        <video
          ref={loopVideoRef}
          id="background-video-loop"
          className="background-video bg-video-loop"
          src="/assets/bg-loop.mp4"
          poster="/assets/posters/bg-loop.webp"
          loop
          muted
          playsInline
          preload="auto"
        ></video>

        {/* Side Watermark Number */}
        <div id="side-number" className="side-number">
          <span>{String(selectedMenuIndex + 1).padStart(2, "0")}</span>
        </div>

        {/* Top-Right Profile Header */}
        <div
          id="menu-profile-header"
          className={`menu-profile-header ${isStarted ? "menu-entered" : ""}`}
          aria-hidden="true"
        >
          <div className="profile-name-text">{PROFILE_INFO.badgeName}</div>
          <div className="profile-accent-line"></div>
        </div>

        {/* Options Stack */}
        <div
          id="menu-column"
          className={`menu-column ${isStarted ? "menu-entered" : ""}`}
        >
          <div id="options-list" className="options-list">
            {MENU_OPTIONS.map((opt, index) => {
              const isSelected = index === selectedMenuIndex;
              const colorClass = COLORS[(index + 2) % COLORS.length];
              const cleanName = opt.name.replace(/ /g, "");
              const bannerScaleFactorX = opt.bannerScaleX || 1.0;
              const bannerScaleY = opt.bannerScaleY || 3.2;
              const scaleX =
                (cleanName.length * 0.52 + 1.6) * bannerScaleFactorX;
              const selectorTransform = `translate(-60, -9) rotate(8, 0, 100) scale(${scaleX}, ${bannerScaleY})`;
              const maskId = `selector-mask-${index}`;

              return (
                <div
                  key={opt.name}
                  id={`option-item-${index}`}
                  className={`option-item ${isSelected ? "selected" : ""}`}
                  style={{ zIndex: isSelected ? 15 : opt.zIndex }}
                >
                  <button
                    className="option-hitbox"
                    data-index={index}
                    aria-label={opt.name}
                    style={{
                      transform: `translate(${opt.offsetX}px, ${opt.offsetY}px) rotate(${opt.rotation}deg)`,
                      transformOrigin: "25% center"
                    }}
                    onMouseEnter={() => handleOptionSelect(index)}
                    onClick={(e) => handleOptionConfirm(index, e)}
                  />

                  <svg
                    width="950"
                    height="200"
                    xmlns="http://www.w3.org/2000/svg"
                    className="option-svg"
                    style={{
                      transform: `translate(${opt.offsetX}px, ${opt.offsetY}px) rotate(${opt.rotation}deg)`
                    }}
                    onMouseEnter={() => handleOptionSelect(index)}
                    onClick={(e) => handleOptionConfirm(index, e)}
                  >
                    <defs>
                      <mask
                        id={maskId}
                        maskUnits="userSpaceOnUse"
                        maskContentUnits="userSpaceOnUse"
                        x="0"
                        y="0"
                        width="950"
                        height="200"
                      >
                        <rect width="100%" height="100%" fill="black" />
                        <g
                          transform={selectorTransform}
                          style={{ transformOrigin: "left center" }}
                        >
                          <path fill="white" d={SELECTOR_PATH} />
                          <path
                            className="pulse-anim"
                            style={{ transformOrigin: "52px 100px" }}
                            fill="white"
                            d={SELECTOR_BG_PATH}
                          />
                        </g>
                      </mask>
                    </defs>

                    {/* Selector Pink/White Banner when selected */}
                    <g
                      className="selector-group"
                      transform={selectorTransform}
                      style={{ transformOrigin: "left center" }}
                    >
                      <path
                        className="fill-pink pulse-anim"
                        style={{ transformOrigin: "52px 100px" }}
                        d={SELECTOR_BG_PATH}
                      />
                      <path className="fill-fg" d={SELECTOR_PATH} />
                    </g>

                    {/* Base Text */}
                    <text
                      x="150"
                      y="122"
                      className={`option-text base-text ${colorClass}`}
                      style={{ fontSize: opt.fontSize || "4.8rem" }}
                    >
                      {opt.name}
                    </text>

                    {/* Masked Red Text (Over the white selector) */}
                    <g
                      className="masked-red-group"
                      mask={`url(#${maskId})`}
                    >
                      <text
                        x="150"
                        y="122"
                        className="option-text fill-red"
                        style={{ fontSize: opt.fontSize || "4.8rem" }}
                      >
                        {opt.name}
                      </text>
                    </g>
                  </svg>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Right HUD Controls */}
        <div className="hud-controls">
          <div className="buttons-row">
            <div
              className="control-item cursor-pointer"
              onClick={() => handleOptionConfirm(selectedMenuIndex)}
            >
              <div className="control-key">ENTER</div>
              <span className="control-text">Confirm</span>
            </div>
            <div
              className="control-item cursor-pointer"
              onClick={() => {
                const nextState = toggleBGM();
                setIsBgmPlaying(nextState);
              }}
              title="Toggle Music (M)"
            >
              <div className="control-key">M</div>
              <span className="control-text">{isBgmPlaying ? "BGM ON" : "BGM OFF"}</span>
            </div>
          </div>
        </div>
      </main>

      {/* =====================================================================
          SUBPAGE 1: PROJECT (S.Link Style Screen with Pinned Repos)
          ===================================================================== */}
      <section
        ref={projectScreenRef}
        id="project-page"
        className="p3r-slink-screen"
        role="region"
        aria-label="Projects Social Link Screen"
        aria-hidden={activeScreen !== "project"}
      >
        <div className="slink-video-container" aria-hidden="true">
          <video
            ref={projectVideoRef}
            id="slink-bg-video"
            className="slink-bg-video"
            poster="/assets/posters/skills-bg.webp"
            loop
            muted
            playsInline
            preload="auto"
          >
            <source src="/assets/skills-bg.mp4" type="video/mp4" />
          </video>
          <div className="slink-video-overlay" aria-hidden="true"></div>
        </div>

        <div className="slink-viewport">
          <div className="slink-left-column">
            <div className="slink-profile-header" aria-hidden="true">
              <div className="slink-profile-name">{PROFILE_INFO.badgeName}</div>
            </div>

            {/* Persona 3 Reload Shattered Geometric Header Banner */}
            <div className="p3r-geometric-header animating" id="slink-project-div">
              <div className="p3r-shard-back-band" aria-hidden="true"></div>
              <div className="p3r-shard-cyan-peak" aria-hidden="true"></div>
              <div className="p3r-shard-right-cyan" aria-hidden="true"></div>
              <div className="p3r-header-slash-main" aria-hidden="true"></div>
              <div className="p3r-shard-float p3r-shard-float-1" aria-hidden="true"></div>
              <div className="p3r-shard-float p3r-shard-float-2" aria-hidden="true"></div>
              <h1 className="p3r-banner-title" id="slink-project-text">
                PROJECT
              </h1>
            </div>

            {/* S.Link Project Cards Stack */}
            <div
              id="slink-cards-container"
              className="slink-cards-container"
              role="tablist"
              aria-label="Project List"
            >
              {PINNED_PROJECTS.map((proj, idx) => {
                const isActive = idx === selectedProjectIndex;
                return (
                  <button
                    key={proj.title}
                    id={`slink-card-${idx}`}
                    className={`slink-card ${isActive ? "active" : ""}`}
                    role="tab"
                    aria-selected={isActive}
                    style={{ ["--card-idx" as string]: idx }}
                    onMouseEnter={() => {
                      if (selectedProjectIndex !== idx) {
                        setSelectedProjectIndex(idx);
                        playSFX();
                      }
                    }}
                    onClick={() => {
                      if (selectedProjectIndex === idx) {
                        handleConfirmProject();
                      } else {
                        setSelectedProjectIndex(idx);
                        playSFX();
                      }
                    }}
                  >
                    <div className="card-unified-row">
                      <div className="card-numeral-box">
                        <span className="card-numeral-text">{proj.numeral}</span>
                      </div>
                      <div className="card-main-body">
                        <div className="card-title-text">{proj.title}</div>
                        <div className="card-subtitle-text">{proj.subtitle}</div>
                        <div className="card-red-accent" aria-hidden="true"></div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Right HUD Controls */}
          <div className="slink-bottom-hud">
            <div className="buttons-row">
              <button
                id="slink-confirm-btn"
                className="control-item slink-hud-btn"
                aria-label="Confirm Selection"
                onClick={handleConfirmProject}
              >
                <div className="control-key">ENTER</div>
                <span className="control-text">Open Project ↗</span>
              </button>
              <button
                id="slink-back-btn"
                className="control-item slink-hud-btn"
                aria-label="Back to Main Menu"
                onClick={closeSubScreen}
              >
                <div className="control-key">ESC</div>
                <span className="control-text">Back</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SUBPAGE 2: SKILLS (Stats & Abilities Interface)
          ===================================================================== */}
      <section
        ref={skillScreenRef}
        id="skill-page"
        className="p3r-slink-screen p3r-skill-screen"
        role="region"
        aria-label="Skills Stats Screen"
        aria-hidden={activeScreen !== "skill"}
      >
        <div className="slink-video-container" aria-hidden="true">
          <video
            ref={skillVideoRef}
            id="skill-bg-video"
            className="slink-bg-video"
            poster="/assets/posters/makoto-wallpaper.webp"
            loop
            muted
            playsInline
            preload="auto"
          >
            <source src="/assets/makoto-wallpaper.mp4" type="video/mp4" />
          </video>
          <div className="slink-video-overlay" aria-hidden="true"></div>
        </div>

        <div className="slink-viewport p3r-skill-viewport">
          <div className="slink-left-column p3r-skill-left-column">
            <div className="slink-profile-header" aria-hidden="true">
              <div className="slink-profile-name">{PROFILE_INFO.badgeName}</div>
            </div>

            <div className="p3r-geometric-header animating" id="skill-header-div">
              <div className="p3r-shard-back-band" aria-hidden="true"></div>
              <div className="p3r-header-slash-main" aria-hidden="true"></div>
              <h1 className="p3r-banner-title" id="skill-header-text">
                SKILLS
              </h1>
            </div>

            {/* Category Filter Tabs */}
            <div
              className="p3r-skill-tabs"
              id="skill-tabs-nav"
              role="tablist"
              aria-label="Skill Categories"
            >
              {SKILL_TABS.map((tab) => {
                const isActive = tab.id === currentSkillTab;
                return (
                  <button
                    key={tab.id}
                    className={`p3r-skill-tab ${isActive ? "active" : ""}`}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => {
                      if (currentSkillTab !== tab.id) {
                        setCurrentSkillTab(tab.id);
                        playSFX();
                      }
                    }}
                  >
                    <span className="p3r-tab-tag">{tab.code}</span>
                    <span className="p3r-tab-label">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Skills Stats Grid */}
            <div
              id="p3r-skills-container"
              className="p3r-skills-container"
              role="region"
              aria-label="Skill Stats List"
            >
              <div className="p3r-skill-group" id={`skill-group-${activeSkillGroup.id}`}>
                <div className="p3r-skill-group-header">
                  <h3 className="p3r-group-title">{activeSkillGroup.title}</h3>
                  <div className="p3r-group-line"></div>
                </div>
                <div className="p3r-skill-rows-list">
                  {activeSkillGroup.skills.map((skill, idx) => (
                    <div
                      key={skill.name}
                      className="p3r-stat-row"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <div className="p3r-stat-name-col">
                        <span className="p3r-stat-name">{skill.name}</span>
                      </div>
                      <div className="p3r-stat-bar-track">
                        <div
                          className="p3r-stat-bar-fill"
                          data-v={skill.level}
                          style={{ width: `${skill.level}%` }}
                        >
                          <div className="p3r-stat-bar-tip" aria-hidden="true"></div>
                        </div>
                      </div>
                      <div className="p3r-stat-lv">
                        <span className="p3r-stat-lv-prefix">LV</span>
                        <span className="p3r-stat-lv-val">{skill.level}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Right HUD Controls */}
          <div className="slink-bottom-hud">
            <div className="buttons-row">
              <button
                id="skill-tab-prev-btn"
                className="control-item slink-hud-btn"
                aria-label="Previous Category"
                onClick={() => {
                  const currIdx = SKILL_TABS.findIndex((t) => t.id === currentSkillTab);
                  const nextIdx = (currIdx - 1 + SKILL_TABS.length) % SKILL_TABS.length;
                  setCurrentSkillTab(SKILL_TABS[nextIdx].id);
                  playSFX();
                }}
              >
                <div className="control-key">Q</div>
                <span className="control-text">Prev</span>
              </button>
              <button
                id="skill-tab-next-btn"
                className="control-item slink-hud-btn"
                aria-label="Next Category"
                onClick={() => {
                  const currIdx = SKILL_TABS.findIndex((t) => t.id === currentSkillTab);
                  const nextIdx = (currIdx + 1) % SKILL_TABS.length;
                  setCurrentSkillTab(SKILL_TABS[nextIdx].id);
                  playSFX();
                }}
              >
                <div className="control-key">E</div>
                <span className="control-text">Next</span>
              </button>
              <button
                id="skill-back-btn"
                className="control-item slink-hud-btn"
                aria-label="Close Skills Screen"
                onClick={closeSubScreen}
              >
                <div className="control-key">ESC</div>
                <span className="control-text">Close</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SUBPAGE 3: ABOUT (Profile & Systems Philosophy)
          ===================================================================== */}
      <section
        ref={aboutScreenRef}
        id="about-page"
        className="p3r-slink-screen p3r-about-screen"
        role="region"
        aria-label="About Screen"
        aria-hidden={activeScreen !== "about"}
      >
        <div className="slink-video-container" aria-hidden="true">
          <video
            ref={aboutVideoRef}
            id="about-bg-video"
            className="slink-bg-video"
            poster="/assets/posters/about-bg.webp"
            loop
            muted
            playsInline
            preload="auto"
          >
            <source src="/assets/about-bg.mp4" type="video/mp4" />
          </video>
          <div className="slink-video-overlay" aria-hidden="true"></div>
        </div>

        <div className="slink-viewport p3r-about-viewport">
          <div className="slink-left-column p3r-about-left-column">
            <div className="slink-profile-header" aria-hidden="true">
              <div className="slink-profile-name">{PROFILE_INFO.badgeName}</div>
            </div>

            <div className="p3r-geometric-header animating" id="about-header-div">
              <div className="p3r-shard-back-band" aria-hidden="true"></div>
              <div className="p3r-header-slash-main" aria-hidden="true"></div>
              <h1 className="p3r-banner-title" id="about-header-text">
                ABOUT
              </h1>
            </div>

            {/* Left-Docked About Card */}
            <div className="p3r-about-card" role="region" aria-label="About Profile Card">
              <div className="p3r-about-card-inner">
                {/* User Photo & Identity */}
                <div className="p3r-about-top-row">
                  <div className="p3r-photo-box" aria-label="Profile Photo">
                    <img
                      src={PROFILE_INFO.photo}
                      alt={PROFILE_INFO.name}
                      className="p3r-photo-img"
                      onError={(e) => {
                        // Fallback to profile.jpg if portrait.png fails
                        (e.target as HTMLImageElement).src = PROFILE_INFO.fallbackPhoto;
                      }}
                    />
                  </div>
                  <div className="p3r-about-identity">
                    <h2 className="p3r-about-name">{PROFILE_INFO.name}</h2>
                    <div className="p3r-about-title">{PROFILE_INFO.role}</div>
                  </div>
                </div>

                {/* Biography */}
                <div className="p3r-about-bio">
                  <p className="p3r-about-p">{PROFILE_INFO.bio[0]}</p>
                  <p className="p3r-about-p">{PROFILE_INFO.bio[1]}</p>
                </div>

                {/* Quote */}
                <div className="p3r-about-quote">
                  <div className="p3r-quote-mark" aria-hidden="true">
                    “
                  </div>
                  <div className="p3r-quote-content">
                    <blockquote className="p3r-quote-text">
                      {PROFILE_INFO.quote.text}
                    </blockquote>
                    <cite className="p3r-quote-author">
                      {PROFILE_INFO.quote.author}
                    </cite>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Right HUD Controls */}
          <div className="slink-bottom-hud">
            <div className="buttons-row">
              <button
                id="about-back-btn"
                className="control-item slink-hud-btn"
                aria-label="Close About Screen"
                onClick={closeSubScreen}
              >
                <div className="control-key">ESC</div>
                <span className="control-text">Close</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SUBPAGE 4: CONTACT (P3R Slanted Phone Chassis & Mail List)
          ===================================================================== */}
      <section
        ref={contactScreenRef}
        id="contact-page"
        className="p3r-slink-screen p3r-contact-screen"
        role="region"
        aria-label="Contact Mail Screen"
        aria-hidden={activeScreen !== "contact"}
      >
        <div className="slink-video-container" aria-hidden="true">
          <video
            ref={contactVideoRef}
            id="contact-bg-video"
            className="slink-bg-video"
            poster="/assets/posters/contact-bg.webp"
            loop
            muted
            playsInline
            preload="auto"
          >
            <source src="/assets/contact-bg.mp4" type="video/mp4" />
          </video>
          <div className="slink-video-overlay p3r-contact-overlay" aria-hidden="true"></div>
        </div>

        <div className="slink-viewport p3r-contact-viewport">
          <div className="p3r-mail-phone-wrap">
            {/* SVG Phone Chassis Background */}
            <svg
              className="p3r-mail-chassis-svg"
              viewBox="0 0 880 860"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polygon
                className="p3r-mail-black-body"
                points="10,28 875,56 875,836 10,858"
                fill="#070a12"
              />
              <polygon
                className="p3r-mail-white-frame"
                points="22,50 832,96 828,806 18,838"
                fill="none"
                stroke="#ffffff"
                strokeWidth="4.5"
                strokeLinejoin="round"
              />
            </svg>

            {/* Phone Inner Content Container */}
            <div className="p3r-mail-phone-card">
              <div className="p3r-mail-header-row">
                <div className="p3r-mail-watermark" aria-hidden="true">
                  MAIL
                </div>
              </div>

              {/* Messages / Contact Channels List */}
              <div
                className="p3r-mail-list-container"
                role="list"
                aria-label="Contact Channels"
              >
                {CONTACT_CHANNELS.map((ch, idx) => {
                  const isActive = idx === selectedContactIndex;
                  return (
                    <a
                      key={ch.label}
                      href={ch.href}
                      target={ch.iconType === "gmail" ? "_self" : "_blank"}
                      rel="noopener noreferrer"
                      className={`p3r-mail-row ${isActive ? "active" : ""}`}
                      data-idx={idx}
                      role="listitem"
                      aria-label={`${ch.label}: ${ch.value}`}
                      onMouseEnter={() => {
                        if (selectedContactIndex !== idx) {
                          setSelectedContactIndex(idx);
                          playSFX();
                        }
                      }}
                      onClick={() => handleContactRowClick(ch.href)}
                    >
                      <div
                        className="p3r-mail-icon-block p3r-mail-gmail"
                        aria-hidden="true"
                      >
                        {ch.iconType === "gmail" && (
                          <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                          </svg>
                        )}
                        {ch.iconType === "github" && (
                          <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                          </svg>
                        )}
                        {ch.iconType === "linkedin" && (
                          <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                          </svg>
                        )}
                        {ch.iconType === "web" && (
                          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="2" y1="12" x2="22" y2="12" />
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                          </svg>
                        )}
                        {ch.iconType === "location" && (
                          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                        )}
                      </div>
                      <div className="p3r-mail-content-block">
                        <div className="p3r-mail-sender-row">
                          <svg
                            className="p3r-mail-env-icon"
                            width="18"
                            height="14"
                            viewBox="0 0 24 18"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M22 0H2C0.9 0 0 0.9 0 2v14c0 1.1 0.9 2 2 2h20c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2zm0 4.2l-10 6.3L2 4.2V2.5l10 6.3 10-6.3v1.7z" />
                          </svg>
                          <span className="p3r-mail-sender-name">{ch.label}</span>
                        </div>
                        <div className="p3r-mail-row-line" aria-hidden="true"></div>
                        <div className="p3r-mail-msg-text">{ch.value}</div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Left HUD: ESC Back button */}
          <div className="p3r-contact-bottom-hud">
            <div className="buttons-row">
              <button
                id="contact-back-btn"
                className="control-item slink-hud-btn"
                aria-label="Close Contact Screen"
                onClick={closeSubScreen}
              >
                <div className="control-key">ESC</div>
                <span className="control-text">Close</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
