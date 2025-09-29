import { useState, useRef } from 'react';

const SWIPE_EDGE_WIDTH = 50; // The width of the area on the left edge of the screen that triggers the swipe (in pixels)
const SWIPE_THRESHOLD = 100; // The distance the user must swipe to trigger the back action (in pixels)

interface UseSwipeBackProps {
  onBack: () => void;
}

export const useSwipeBack = ({ onBack }: UseSwipeBackProps) => {
  const [translateX, setTranslateX] = useState(0);
  const isSwipingRef = useRef(false);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const [isAnimatingBack, setIsAnimatingBack] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    // Only start swipe if the touch begins near the left edge
    if (touch.clientX < SWIPE_EDGE_WIDTH) {
      isSwipingRef.current = true;
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      setIsAnimatingBack(false); // Stop any ongoing return animation
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwipingRef.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    // We only care about horizontal swipes to the right
    if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 0) {
      // Follow the finger
      setTranslateX(deltaX);
    } else {
      // If swipe becomes vertical or goes left, cancel it
      isSwipingRef.current = false;
      setTranslateX(0);
    }
  };

  const handleTouchEnd = () => {
    if (!isSwipingRef.current) return;

    // If swipe distance passes the threshold, trigger the back action
    if (translateX > SWIPE_THRESHOLD) {
      onBack();
    } else {
      // Otherwise, animate the view back to its original position
      setIsAnimatingBack(true);
      setTranslateX(0);
    }
    
    isSwipingRef.current = false;
    // Reset animation state after the transition ends
    setTimeout(() => {
        setIsAnimatingBack(false);
    }, 300); // Should match the CSS transition duration
  };

  // Apply styles for the swipe gesture and return animation
  const swipeStyle = {
    transform: `translateX(${translateX}px)`,
    transition: isAnimatingBack ? 'transform 0.3s ease-out' : 'none',
    touchAction: 'pan-y', // Allow vertical scrolling while listening for horizontal swipes
  };

  const swipeHandlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };

  return { swipeHandlers, swipeStyle };
};
