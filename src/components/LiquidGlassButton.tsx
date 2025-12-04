'use client';

/**
 * LiquidGlassButton Component
 * 
 * Implements Apple's Liquid Glass design system from iOS 26 / macOS Tahoe 26
 * Based on official Apple design language: https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/
 * 
 * Key Features:
 * - Translucent with refraction (backdrop-filter)
 * - Reflects and refracts surroundings
 * - Content-aware coloring
 * - Real-time specular highlights
 * - Multiple layers of glass for depth
 * - Dynamically morphs with interactions
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button, ButtonProps, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export interface LiquidGlassButtonProps extends Omit<ButtonProps, 'variant'> {
  /**
   * Liquid Glass variant - determines base color
   * Uses content-aware coloring that adapts to surroundings
   */
  liquidVariant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'neutral';
  
  /**
   * Glass intensity - controls refraction strength
   */
  glassIntensity?: 'subtle' | 'medium' | 'strong';
  
  /**
   * Enable specular highlights (shiny reflections)
   */
  specularHighlights?: boolean;
  
  /**
   * Enable dynamic morphing animations
   */
  dynamicMorph?: boolean;
  
  /**
   * Layer style - single or multi-layer glass
   */
  layerStyle?: 'single' | 'multi';
}

// Glass blur intensity mapping
const BLUR_INTENSITY = {
  subtle: 'blur(10px)',
  medium: 'blur(20px)',
  strong: 'blur(30px)',
};

// Color variants with content-aware base colors
const COLOR_VARIANTS = {
  primary: {
    base: { r: 99, g: 102, b: 241 }, // Indigo
    glow: 'rgba(99, 102, 241, 0.4)',
    border: 'rgba(129, 140, 248, 0.3)',
  },
  secondary: {
    base: { r: 16, g: 185, b: 129 }, // Emerald
    glow: 'rgba(16, 185, 129, 0.4)',
    border: 'rgba(52, 211, 153, 0.3)',
  },
  success: {
    base: { r: 34, g: 197, b: 94 }, // Green
    glow: 'rgba(34, 197, 94, 0.4)',
    border: 'rgba(74, 222, 128, 0.3)',
  },
  danger: {
    base: { r: 239, g: 68, b: 68 }, // Red
    glow: 'rgba(239, 68, 68, 0.4)',
    border: 'rgba(248, 113, 113, 0.3)',
  },
  warning: {
    base: { r: 255, g: 167, b: 38 }, // Orange/Amber
    glow: 'rgba(255, 167, 38, 0.4)',
    border: 'rgba(251, 191, 36, 0.3)',
  },
  info: {
    base: { r: 59, g: 130, b: 246 }, // Blue
    glow: 'rgba(59, 130, 246, 0.4)',
    border: 'rgba(96, 165, 250, 0.3)',
  },
  neutral: {
    base: { r: 156, g: 163, b: 175 }, // Gray
    glow: 'rgba(156, 163, 175, 0.4)',
    border: 'rgba(209, 213, 219, 0.3)',
  },
};

const StyledButton = styled(Button, {
  shouldForwardProp: (prop) => 
    !['liquidVariant', 'glassIntensity', 'specularHighlights', 'dynamicMorph', 'layerStyle'].includes(prop as string),
})<{
  liquidVariant: string;
  glassIntensity: string;
  theme?: any;
}>(({ theme, liquidVariant, glassIntensity }) => {
  const variant = COLOR_VARIANTS[liquidVariant as keyof typeof COLOR_VARIANTS] || COLOR_VARIANTS.primary;
  const isDark = theme.palette.mode === 'dark';
  
  // Content-aware opacity (adapts to light/dark)
  const baseOpacity = isDark ? 0.15 : 0.35;
  const hoverOpacity = isDark ? 0.25 : 0.45;
  
  return {
    // Base glass layer
    position: 'relative',
    overflow: 'hidden',
    textTransform: 'none',
    fontWeight: 500,
    borderRadius: 12,
    padding: '10px 20px',
    border: `1px solid ${variant.border}`,
    
    // Refraction - blurs content behind (like real glass)
    backdropFilter: `${BLUR_INTENSITY[glassIntensity as keyof typeof BLUR_INTENSITY]} saturate(180%)`,
    WebkitBackdropFilter: `${BLUR_INTENSITY[glassIntensity as keyof typeof BLUR_INTENSITY]} saturate(180%)`,
    
    // Translucent base - color informed by variant
    background: `linear-gradient(135deg, 
      rgba(${variant.base.r}, ${variant.base.g}, ${variant.base.b}, ${baseOpacity}) 0%, 
      rgba(${variant.base.r}, ${variant.base.g}, ${variant.base.b}, ${baseOpacity * 0.7}) 100%
    )`,
    
    // Multiple layer shadows for depth (inspired by visionOS)
    boxShadow: isDark
      ? `0 8px 32px rgba(0, 0, 0, 0.4),
         0 2px 8px rgba(${variant.base.r}, ${variant.base.g}, ${variant.base.b}, 0.2),
         inset 0 1px 0 rgba(255, 255, 255, 0.1),
         inset 0 -1px 0 rgba(0, 0, 0, 0.1)`
      : `0 8px 32px rgba(${variant.base.r}, ${variant.base.g}, ${variant.base.b}, 0.15),
         0 2px 8px rgba(${variant.base.r}, ${variant.base.g}, ${variant.base.b}, 0.1),
         inset 0 1px 0 rgba(255, 255, 255, 0.5),
         inset 0 -1px 0 rgba(0, 0, 0, 0.05)`,
    
    // Smooth transitions for morphing
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    
    // GPU acceleration for smooth rendering
    transform: 'translateZ(0)',
    willChange: 'transform, box-shadow, background',
    
    // Layer 2: Reflection gradient (reflects surroundings)
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 'inherit',
      background: isDark
        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, transparent 50%, rgba(255, 255, 255, 0.04) 100%)'
        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, transparent 50%, rgba(255, 255, 255, 0.3) 100%)',
      opacity: 0,
      transition: 'opacity 0.3s ease',
      pointerEvents: 'none',
      zIndex: 1,
    },
    
    // Layer 3: Specular highlight layer (positioned dynamically)
    '&::after': {
      content: '""',
      position: 'absolute',
      top: '-50%',
      left: '-50%',
      width: '200%',
      height: '200%',
      background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.4) 0%, transparent 50%)',
      opacity: 0,
      transition: 'opacity 0.2s ease, transform 0.2s ease',
      pointerEvents: 'none',
      zIndex: 2,
    },
    
    // Content sits above glass layers
    '& > *': {
      position: 'relative',
      zIndex: 3,
    },
    
    // Hover state - enhanced glass effect
    '&:hover': {
      transform: 'translateY(-2px) scale(1.02)',
      background: `linear-gradient(135deg, 
        rgba(${variant.base.r}, ${variant.base.g}, ${variant.base.b}, ${hoverOpacity}) 0%, 
        rgba(${variant.base.r}, ${variant.base.g}, ${variant.base.b}, ${hoverOpacity * 0.7}) 100%
      )`,
      boxShadow: isDark
        ? `0 16px 48px rgba(0, 0, 0, 0.6),
           0 4px 16px ${variant.glow},
           0 0 0 1px ${variant.border},
           inset 0 1px 0 rgba(255, 255, 255, 0.15)`
        : `0 16px 48px rgba(${variant.base.r}, ${variant.base.g}, ${variant.base.b}, 0.25),
           0 4px 16px ${variant.glow},
           0 0 0 1px ${variant.border},
           inset 0 1px 0 rgba(255, 255, 255, 0.6)`,
      borderColor: alpha(variant.border, 0.5),
      
      // Show reflection layer
      '&::before': {
        opacity: 1,
      },
    },
    
    // Active state - compressed glass
    '&:active': {
      transform: 'scale(0.98)',
      transition: 'all 0.1s ease',
    },
    
    // Disabled state - frosted/inactive glass
    '&:disabled': {
      opacity: 0.4,
      cursor: 'not-allowed',
      transform: 'none',
      backdropFilter: 'blur(5px) saturate(100%)',
      WebkitBackdropFilter: 'blur(5px) saturate(100%)',
    },
    
    // Focus visible for accessibility
    '&:focus-visible': {
      outline: `2px solid ${variant.glow}`,
      outlineOffset: 2,
    },
  };
});

const LiquidGlassButton = React.forwardRef<HTMLButtonElement, LiquidGlassButtonProps>(
  (
    {
      liquidVariant = 'primary',
      glassIntensity = 'medium',
      specularHighlights = true,
      dynamicMorph = true,
      layerStyle = 'multi',
      children,
      onMouseMove,
      onMouseLeave,
      ...props
    },
    ref
  ) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    // Mouse position tracking for specular highlights
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Spring animation for smooth specular highlight movement
    const springConfig = { damping: 25, stiffness: 300 };
    const smoothMouseX = useSpring(mouseX, springConfig);
    const smoothMouseY = useSpring(mouseY, springConfig);

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!specularHighlights || !buttonRef.current) return;

      const rect = buttonRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      setMousePosition({ x, y });
      mouseX.set(x);
      mouseY.set(y);

      // Call original onMouseMove if provided
      onMouseMove?.(e);
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsHovered(false);
      setMousePosition({ x: 50, y: 50 }); // Reset to center

      // Call original onMouseLeave if provided
      onMouseLeave?.(e);
    };

    // Apply specular highlight position via CSS custom property
    useEffect(() => {
      if (buttonRef.current && specularHighlights) {
        buttonRef.current.style.setProperty('--mouse-x', `${mousePosition.x}%`);
        buttonRef.current.style.setProperty('--mouse-y', `${mousePosition.y}%`);
      }
    }, [mousePosition, specularHighlights]);

    return (
      <motion.div
        initial={dynamicMorph ? { opacity: 0, scale: 0.95 } : false}
        animate={dynamicMorph ? { opacity: 1, scale: 1 } : false}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 25,
        }}
        style={{ display: 'inline-block' }}
      >
        <StyledButton
          ref={(node) => {
            // @ts-ignore
            buttonRef.current = node;
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          liquidVariant={liquidVariant}
          glassIntensity={glassIntensity}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          sx={{
            // Show specular highlight on hover
            ...(specularHighlights && isHovered && {
              '&::after': {
                opacity: 0.6,
                transform: `translate(calc(var(--mouse-x, 50%) - 50%), calc(var(--mouse-y, 50%) - 50%))`,
              },
            }),
          }}
          {...props}
        >
          {children}
        </StyledButton>
      </motion.div>
    );
  }
);

LiquidGlassButton.displayName = 'LiquidGlassButton';

export default LiquidGlassButton;

