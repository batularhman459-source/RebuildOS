import { liquidMetalFragmentShader, ShaderMount } from "@paper-design/shaders";
import { Sparkles } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";

export type LiquidMetalVariant =
  | "obsidian"
  | "chrome"
  | "purple"
  | "cyan"
  | "gold"
  | "rose"
  | "danger"
  | "cobalt"
  | "default";

export type LiquidMetalSize = "xs" | "sm" | "md" | "lg" | "icon" | "compact";

export interface LiquidMetalButtonProps {
  label?: React.ReactNode;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  viewMode?: "text" | "icon";
  size?: LiquidMetalSize;
  variant?: LiquidMetalVariant;
  width?: number;
  height?: number;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  id?: string;
  speedMultiplier?: number;
}

export function LiquidMetalButton({
  label = "Get Started",
  children,
  icon,
  onClick,
  viewMode = "text",
  size = "md",
  variant = "default",
  width,
  height,
  disabled = false,
  type = "button",
  className = "",
  style,
  title,
  id,
  speedMultiplier = 1,
}: LiquidMetalButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<
    Array<{ x: number; y: number; id: number }>
  >([]);
  const shaderRef = useRef<HTMLDivElement>(null);
  // biome-ignore lint/suspicious/noExplicitAny: External library without types
  const shaderMount = useRef<any>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleId = useRef(0);

  // Derive content: children take precedence over label
  const content = children !== undefined ? children : label;
  const isIconOnly = viewMode === "icon" || size === "icon";

  // Calculate dimensions based on size, viewMode, and explicit width/height
  const dimensions = useMemo(() => {
    if (isIconOnly) {
      const defaultIconDim =
        size === "xs" || size === "sm" ? 34 : size === "lg" ? 52 : 44;
      const finalWidth = width || height || defaultIconDim;
      const finalHeight = height || width || defaultIconDim;
      return {
        width: finalWidth,
        height: finalHeight,
        innerWidth: Math.max(finalWidth - 4, 10),
        innerHeight: Math.max(finalHeight - 4, 10),
        shaderWidth: finalWidth,
        shaderHeight: finalHeight,
        fontSize:
          size === "xs" || size === "sm" ? "12px" : size === "lg" ? "16px" : "14px",
      };
    }

    const defaultHeight =
      size === "xs" ? 30 : size === "sm" || size === "compact" ? 36 : size === "lg" ? 52 : 44;
    const defaultWidth =
      size === "xs" ? 108 : size === "sm" || size === "compact" ? 126 : size === "lg" ? 172 : 144;
    const finalWidth = width || defaultWidth;
    const finalHeight = height || defaultHeight;
    const fontSize =
      size === "xs" ? "11px" : size === "sm" || size === "compact" ? "12px" : size === "lg" ? "15px" : "13px";

    return {
      width: finalWidth,
      height: finalHeight,
      innerWidth: Math.max(finalWidth - 4, 10),
      innerHeight: Math.max(finalHeight - 4, 10),
      shaderWidth: finalWidth,
      shaderHeight: finalHeight,
      fontSize,
    };
  }, [isIconOnly, size, width, height]);

  // Shader color shift parameterization based on variant
  // u_shape: 0 corresponds to LiquidMetalShapes.none (full canvas coverage rather than a cropped circle)
  // u_fit: 2 corresponds to cover
  const shaderParams = useMemo(() => {
    switch (variant) {
      case "purple":
        return {
          u_repetition: 4,
          u_softness: 0.5,
          u_shiftRed: 0.7,
          u_shiftBlue: 0.85,
          u_distortion: 0.1,
          u_contour: 0,
          u_angle: 45,
          u_scale: 1,
          u_shape: 0,
          u_fit: 2,
          u_offsetX: 0,
          u_offsetY: 0,
        };
      case "cobalt":
        return {
          u_repetition: 4,
          u_softness: 0.5,
          u_shiftRed: 0.1,
          u_shiftBlue: 0.85,
          u_distortion: 0.05,
          u_contour: 0,
          u_angle: 45,
          u_scale: 1,
          u_shape: 0,
          u_fit: 2,
          u_offsetX: 0,
          u_offsetY: 0,
        };
      case "cyan":
        return {
          u_repetition: 4,
          u_softness: 0.5,
          u_shiftRed: 0.1,
          u_shiftBlue: 0.9,
          u_distortion: 0.05,
          u_contour: 0,
          u_angle: 45,
          u_scale: 1,
          u_shape: 0,
          u_fit: 2,
          u_offsetX: 0,
          u_offsetY: 0,
        };
      case "gold":
        return {
          u_repetition: 4,
          u_softness: 0.5,
          u_shiftRed: 0.8,
          u_shiftBlue: 0.1,
          u_distortion: 0,
          u_contour: 0,
          u_angle: 45,
          u_scale: 1,
          u_shape: 0,
          u_fit: 2,
          u_offsetX: 0,
          u_offsetY: 0,
        };
      case "rose":
      case "danger":
        return {
          u_repetition: 4,
          u_softness: 0.5,
          u_shiftRed: 0.9,
          u_shiftBlue: 0.3,
          u_distortion: 0.1,
          u_contour: 0,
          u_angle: 45,
          u_scale: 1,
          u_shape: 0,
          u_fit: 2,
          u_offsetX: 0,
          u_offsetY: 0,
        };
      case "chrome":
        return {
          u_repetition: 4,
          u_softness: 0.5,
          u_shiftRed: 0.3,
          u_shiftBlue: 0.3,
          u_distortion: 0,
          u_contour: 0,
          u_angle: 45,
          u_scale: 1,
          u_shape: 0,
          u_fit: 2,
          u_offsetX: 0,
          u_offsetY: 0,
        };
      case "obsidian":
      case "default":
      default:
        return {
          u_repetition: 4,
          u_softness: 0.5,
          u_shiftRed: 0.3,
          u_shiftBlue: 0.3,
          u_distortion: 0,
          u_contour: 0,
          u_angle: 45,
          u_scale: 1,
          u_shape: 0,
          u_fit: 2,
          u_offsetX: 0,
          u_offsetY: 0,
        };
    }
  }, [variant]);

  // Variant-specific text/glow styling and perimeter rim gradient
  const variantStyles = useMemo(() => {
    switch (variant) {
      case "purple":
        return {
          textColor: "#f3e8ff",
          textGlow: "0px 1px 4px rgba(168, 85, 247, 0.6)",
          iconColor: "#e472ff",
          innerBg: "linear-gradient(180deg, #2b1238 0%, #0d0412 100%)",
          borderRim: "rgba(168, 85, 247, 0.4)",
          rimFallback:
            "linear-gradient(90deg, #5E1473 0%, #FF00FF 30%, #FCCF3A 55%, #00F0FF 80%, #FF00FF 100%)",
        };
      case "cobalt":
        return {
          textColor: "#ffffff",
          textGlow: "0px 1px 4px rgba(59, 130, 246, 0.6)",
          iconColor: "#93c5fd",
          innerBg: "linear-gradient(180deg, #1d4ed8 0%, #0f172a 100%)",
          borderRim: "rgba(59, 130, 246, 0.4)",
          rimFallback:
            "linear-gradient(90deg, #1d4ed8 0%, #3b82f6 35%, #60a5fa 65%, #2563eb 85%, #3b82f6 100%)",
        };
      case "cyan":
        return {
          textColor: "#e0f2fe",
          textGlow: "0px 1px 4px rgba(6, 182, 212, 0.6)",
          iconColor: "#38bdf8",
          innerBg: "linear-gradient(180deg, #0f2738 0%, #030d14 100%)",
          borderRim: "rgba(56, 189, 248, 0.4)",
          rimFallback:
            "linear-gradient(90deg, #0284c7 0%, #00F0FF 35%, #38bdf8 65%, #a855f7 85%, #00F0FF 100%)",
        };
      case "gold":
        return {
          textColor: "#fef3c7",
          textGlow: "0px 1px 4px rgba(251, 191, 36, 0.6)",
          iconColor: "#fcd34d",
          innerBg: "linear-gradient(180deg, #332712 0%, #120e04 100%)",
          borderRim: "rgba(251, 191, 36, 0.4)",
          rimFallback:
            "linear-gradient(90deg, #d97706 0%, #FCCF3A 35%, #f59e0b 65%, #fb7185 85%, #FCCF3A 100%)",
        };
      case "rose":
      case "danger":
        return {
          textColor: "#ffe4e6",
          textGlow: "0px 1px 4px rgba(244, 63, 94, 0.6)",
          iconColor: "#fb7185",
          innerBg: "linear-gradient(180deg, #36111a 0%, #120407 100%)",
          borderRim: "rgba(244, 63, 94, 0.4)",
          rimFallback:
            "linear-gradient(90deg, #e11d48 0%, #fb7185 35%, #f43f5e 65%, #f59e0b 85%, #fb7185 100%)",
        };
      case "chrome":
        return {
          textColor: "#ffffff",
          textGlow: "0px 1px 3px rgba(255, 255, 255, 0.4)",
          iconColor: "#ffffff",
          innerBg: "linear-gradient(180deg, #2a2c32 0%, #0a0b0d 100%)",
          borderRim: "rgba(255, 255, 255, 0.35)",
          rimFallback:
            "linear-gradient(90deg, #94a3b8 0%, #ffffff 35%, #cbd5e1 65%, #64748b 85%, #ffffff 100%)",
        };
      case "obsidian":
      case "default":
      default:
        return {
          textColor: "#f1f5f9",
          textGlow: "0px 1px 2px rgba(0, 0, 0, 0.8)",
          iconColor: "#cbd5e1",
          innerBg: "linear-gradient(180deg, #202022 0%, #090a0c 100%)",
          borderRim: "rgba(255, 255, 255, 0.2)",
          rimFallback:
            "linear-gradient(90deg, #475569 0%, #94a3b8 35%, #334155 65%, #64748b 85%, #94a3b8 100%)",
        };
    }
  }, [variant]);

  useEffect(() => {
    const styleId = "shader-canvas-style-exploded";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .shader-container-exploded canvas {
          width: 100% !important;
          height: 100% !important;
          display: block !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          border-radius: 100px !important;
        }
        @keyframes ripple-animation {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0.6;
          }
          100% {
            transform: translate(-50%, -50%) scale(4);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    const loadShader = async () => {
      try {
        if (shaderRef.current) {
          if (shaderMount.current?.destroy) {
            shaderMount.current.destroy();
          }

          shaderMount.current = new ShaderMount(
            shaderRef.current,
            liquidMetalFragmentShader,
            shaderParams,
            undefined,
            0.6 * speedMultiplier,
          );
        }
      } catch (error) {
        console.error("[LiquidMetalButton] Failed to load shader:", error);
      }
    };

    loadShader();

    return () => {
      if (shaderMount.current?.destroy) {
        try {
          shaderMount.current.destroy();
        } catch {
          // ignore cleanup errors
        }
        shaderMount.current = null;
      }
    };
  }, [shaderParams, speedMultiplier]);

  // Ensure shader mount accurately resizes to the full container bounds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (shaderMount.current?.handleResize) {
        shaderMount.current.handleResize();
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [dimensions.shaderWidth, dimensions.shaderHeight]);

  const handleMouseEnter = () => {
    if (disabled) return;
    setIsHovered(true);
    shaderMount.current?.setSpeed?.(1 * speedMultiplier);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
    shaderMount.current?.setSpeed?.(0.6 * speedMultiplier);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (shaderMount.current?.setSpeed) {
      shaderMount.current.setSpeed(2.4 * speedMultiplier);
      setTimeout(() => {
        if (isHovered) {
          shaderMount.current?.setSpeed?.(1 * speedMultiplier);
        } else {
          shaderMount.current?.setSpeed?.(0.6 * speedMultiplier);
        }
      }, 300);
    }

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const ripple = { x, y, id: rippleId.current++ };

      setRipples((prev) => [...prev, ripple]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
      }, 600);
    }

    onClick?.(e);
  };

  return (
    <div
      id={id}
      className={`relative inline-block select-none ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      style={style}
    >
      <div
        style={{
          perspective: "1000px",
          perspectiveOrigin: "50% 50%",
        }}
      >
        <div
          style={{
            position: "relative",
            width: `${dimensions.width}px`,
            height: `${dimensions.height}px`,
            transformStyle: "preserve-3d",
            transition:
              "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.3s ease, height 0.3s ease",
            transform: "none",
          }}
        >
          {/* Layer 3: Floating Icon & Typography Layer (translateZ: 20px) */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: isIconOnly ? "0px" : "6px",
              paddingLeft: isIconOnly ? "0px" : "12px",
              paddingRight: isIconOnly ? "0px" : "12px",
              transformStyle: "preserve-3d",
              transition:
                "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.3s ease, height 0.3s ease, gap 0.3s ease",
              transform: `translateZ(20px) ${isPressed ? "scale(0.96)" : isHovered ? "scale(1.02)" : "scale(1)"}`,
              zIndex: 30,
              pointerEvents: "none",
            }}
          >
            {isIconOnly ? (
              icon ? (
                <span
                  style={{
                    color: variantStyles.iconColor,
                    filter: `drop-shadow(${variantStyles.textGlow})`,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {icon}
                </span>
              ) : (
                <Sparkles
                  size={dimensions.height > 40 ? 18 : 14}
                  style={{
                    color: variantStyles.iconColor,
                    filter: `drop-shadow(${variantStyles.textGlow})`,
                    transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                />
              )
            ) : (
              <>
                {icon && (
                  <span
                    style={{
                      color: variantStyles.iconColor,
                      filter: `drop-shadow(${variantStyles.textGlow})`,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {icon}
                  </span>
                )}
                <span
                  style={{
                    fontSize: dimensions.fontSize,
                    color: variantStyles.textColor,
                    fontWeight: 600,
                    textShadow: variantStyles.textGlow,
                    transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    whiteSpace: "nowrap",
                    letterSpacing: "0.01em",
                    lineHeight: 1,
                  }}
                >
                  {content}
                </span>
              </>
            )}
          </div>

          {/* Layer 2: Dark Metallic Cavity/Plate (translateZ: 10px) */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              transformStyle: "preserve-3d",
              transition:
                "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.3s ease, height 0.3s ease",
              transform: `translateZ(10px) ${isPressed ? "translateY(1px) scale(0.98)" : "translateY(0) scale(1)"}`,
              zIndex: 20,
            }}
          >
            <div
              style={{
                width: `${dimensions.innerWidth}px`,
                height: `${dimensions.innerHeight}px`,
                margin: "2px",
                borderRadius: "100px",
                background: variantStyles.innerBg,
                boxShadow: isPressed
                  ? "inset 0px 2px 4px rgba(0, 0, 0, 0.6), inset 0px 1px 2px rgba(0, 0, 0, 0.4)"
                  : "inset 0px 1px 2px rgba(255, 255, 255, 0.15), inset 0px -1px 2px rgba(0, 0, 0, 0.5)",
                border: `1px solid ${variantStyles.borderRim}`,
                transition:
                  "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.3s ease, height 0.3s ease, box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </div>

          {/* Layer 1: Liquid Metal Shader Container (translateZ: 0px) */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              transformStyle: "preserve-3d",
              transition:
                "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.3s ease, height 0.3s ease",
              transform: `translateZ(0px) ${isPressed ? "translateY(1px) scale(0.98)" : "translateY(0) scale(1)"}`,
              zIndex: 10,
            }}
          >
            <div
              style={{
                height: `${dimensions.height}px`,
                width: `${dimensions.width}px`,
                borderRadius: "100px",
                boxShadow: isPressed
                  ? "0px 0px 0px 1px rgba(0, 0, 0, 0.5), 0px 1px 2px 0px rgba(0, 0, 0, 0.3)"
                  : isHovered
                    ? "0px 0px 0px 1px rgba(255, 255, 255, 0.3), 0px 12px 16px 0px rgba(0, 0, 0, 0.35), 0px 4px 8px 0px rgba(0, 0, 0, 0.2)"
                    : "0px 0px 0px 1px rgba(255, 255, 255, 0.15), 0px 8px 12px 0px rgba(0, 0, 0, 0.25), 0px 2px 4px 0px rgba(0, 0, 0, 0.15)",
                transition:
                  "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.3s ease, height 0.3s ease, box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                background: variantStyles.rimFallback || "rgb(0 0 0 / 0)",
              }}
            >
              <div
                ref={shaderRef}
                className="shader-container-exploded"
                style={{
                  borderRadius: "100px",
                  overflow: "hidden",
                  position: "relative",
                  width: `${dimensions.shaderWidth}px`,
                  maxWidth: `${dimensions.shaderWidth}px`,
                  height: `${dimensions.shaderHeight}px`,
                  transition: "width 0.3s ease, height 0.3s ease",
                }}
              />
            </div>
          </div>

          {/* Interactive Trigger Button with Expanding Radial Ripples (translateZ: 25px) */}
          <button
            ref={buttonRef}
            type={type}
            disabled={disabled}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={() => !disabled && setIsPressed(true)}
            onMouseUp={() => !disabled && setIsPressed(false)}
            title={title}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              background: "transparent",
              border: "none",
              cursor: disabled ? "not-allowed" : "pointer",
              outline: "none",
              zIndex: 40,
              transformStyle: "preserve-3d",
              transform: "translateZ(25px)",
              transition:
                "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.3s ease, height 0.3s ease",
              overflow: "hidden",
              borderRadius: "100px",
            }}
            aria-label={typeof content === "string" ? content : title || "action"}
          >
            {ripples.map((ripple) => (
              <span
                key={ripple.id}
                style={{
                  position: "absolute",
                  left: `${ripple.x}px`,
                  top: `${ripple.y}px`,
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 70%)",
                  pointerEvents: "none",
                  animation: "ripple-animation 0.6s ease-out",
                }}
              />
            ))}
          </button>
        </div>
      </div>
    </div>
  );
}
