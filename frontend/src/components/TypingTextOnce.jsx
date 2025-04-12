import React, { useEffect, useRef } from "react";
import Typed from "typed.js";

const TypingTextOnce = ({ text ,loop ,speed}) => {
  const el = useRef(null);
  const typed = useRef(null);

  useEffect(() => {
    if (!text) return;

    typed.current = new Typed(el.current, {
      strings: [text],
      typeSpeed: speed || 50,
      showCursor: false,  
      loop: loop,        
    });

    return () => {
      typed.current.destroy();
    };
  }, [text]);

  return (
    <span ref={el} className="text-white font-semibold text-lg" />
  );
};

export default TypingTextOnce;
