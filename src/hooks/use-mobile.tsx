import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Default to false on server and initial client render to ensure consistency.
  const [isMobile, setIsMobile] = React.useState<boolean>(false); 

  React.useEffect(() => {
    // This function will run only on the client after mount.
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Call it once on mount to set the initial client-side value.
    checkIsMobile();

    // Add event listener for window resize.
    window.addEventListener("resize", checkIsMobile);
    
    // Cleanup listener on component unmount.
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []); // Empty dependency array ensures this effect runs only once on mount and unmount.

  return isMobile;
}
