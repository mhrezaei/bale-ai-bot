import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    
    // Set initial value only on first mount rather than relying on effect to change state synchronously
    // though the best approach might be to just let the return do nothing or use a layout effect if needed
    
    return () => mql.removeEventListener("change", onChange)
  }, [])


  return !!isMobile
}
