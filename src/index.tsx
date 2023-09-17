import React, { memo, useLayoutEffect, useRef, ReactNode, CSSProperties, useState } from 'react';
import './FknLazyImage.css';

interface Props {
  children?: ReactNode[] | ReactNode | undefined;
  threshold?: number;
  fadeSpeed?: number;
  cb?: () => unknown;
  cssOverride?: CSSProperties;
  className?: string;
  arrLength?: number;
  srcSmall: string;
  src: string;
}

export const FknLazyImage = memo(
  ({
    arrLength,
    children,
    threshold,
    fadeSpeed = 1,
    cb,
    cssOverride,
    className,
  }: Partial<Props>) => {
    const imagesContainer = useRef<HTMLInputElement | null>(null);
    const [wasLoaded, setWasLoaded] = useState<boolean>(false);

    // const parent = (children && children.length && children.find(el => el._source)) || children;
    // const filename = parent._source?.fileName?.split('/').at(-1);

    //errors
    if (!children) throw new Error('FknLazyImage > Empty children');

    if (fadeSpeed < 0) {
      throw new Error('FknLazyImage > Fade In must be a positive value');
    }

    if ((threshold && threshold > 1) || (threshold && threshold < 0)) {
      throw new Error('FknLazyImage > Threshold value must be Between 0.0 and 1 ');
    }

    useLayoutEffect(() => {
      if (imagesContainer.current) {
        const allImages: NodeListOf<HTMLImageElement> =
          imagesContainer.current.querySelectorAll('img');
        allImages.forEach(img => {
          fadeSpeed > 0 && (img.style.transition = `${fadeSpeed}s opacity`);
          !wasLoaded && img.classList.add('hide');
          img.addEventListener('load', () => {
            setWasLoaded(true);
            const innerObserver = new IntersectionObserver(
              function (entries) {
                const [entry]: IntersectionObserverEntry[] = entries;
                if (entry.isIntersecting) {
                  img.classList.remove('hide');
                  !wasLoaded && cb && cb();
                  innerObserver.unobserve(entry.target);
                }
              },
              { threshold: (threshold && threshold) || 0.1 }
            );
            innerObserver.observe(img);
            return () => innerObserver.disconnect;
          });
        });
      }
    }, [cb, threshold, fadeSpeed, arrLength, wasLoaded]);

    return (
      children && (
        <div style={cssOverride} className={className} ref={imagesContainer}>
          {children}
        </div>
      )
    );
  }
);
