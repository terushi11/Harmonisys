'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@heroui/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CarouselCard from './CarouselCard';
import CardContent from './CardContent';
import { carouselElements } from '@/constants';

type CarouselProps = {
  isAuthenticated?: boolean;
};

const Carousel = ({ isAuthenticated = false }: CarouselProps) => {

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1); // 1 = next, -1 = prev
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)'); // < sm
    const onChange = () => setIsMobile(mq.matches);

    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const scrollPrev = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? carouselElements.length - 1 : prevIndex - 1
    );
  };

  const scrollNext = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) =>
      prevIndex === carouselElements.length - 1 ? 0 : prevIndex + 1
    );
  };

  const getVisibleItems = useCallback(() => {
    if (isMobile) {
      const item = carouselElements[currentIndex];
      return [{ ...item, relativePosition: 0 }];
    }

    const visibleItems: any[] = [];
    for (let i = -1; i <= 1; i++) {
      const index =
        (currentIndex + i + carouselElements.length) % carouselElements.length;

      visibleItems.push({
        ...carouselElements[index],
        relativePosition: i,
      });
    }
    return visibleItems;
  }, [currentIndex, isMobile]);

  return (
    <section id="tools" className="relative overflow-hidden bg-white text-slate-900">
      <div className="relative container mx-auto px-6 w-full max-w-7xl pt-14 pb-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <div className="max-w-none">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 bg-gradient-to-r from-[#7A0F1E] via-[#8B1538] to-[#A11A2F] bg-clip-text text-transparent">
              Harmonized DRRM-H
            </h2>

            <p className="mt-3 text-base sm:text-lg text-black font-medium sm:whitespace-nowrap">
              Disaster Risk Reduction and Management in Health tools designed for preparedness, response, and recovery.
            </p>
          </div>

          {/* Controls (desktop) */}
          <div className="hidden sm:flex items-center gap-3 pt-2">
            <Button
              isIconOnly
              variant="bordered"
              size="lg"
              onPress={scrollPrev}
              className="
                rounded-xl bg-white border-red-300 text-red-700
                hover:bg-red-50 hover:border-red-400
                shadow-sm hover:shadow-md transition-all
              "
              aria-label="Previous item"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <Button
              isIconOnly
              variant="solid"
              size="lg"
              onPress={scrollNext}
              className="
                rounded-xl bg-[#8B1538] text-white
                shadow-md hover:bg-[#7A0F1E] hover:shadow-lg transition-all
              "
              aria-label="Next item"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative mt-10">
          {/* ✅ allow vertical overflow (prevents top cut), keep horizontal clipping */}
          <div className="relative overflow-x-hidden overflow-y-visible [perspective:1300px]">
            {/* a bit more vertical room for hover lift */}
            <div className="flex py-6 [transform-style:preserve-3d]">
              {getVisibleItems().map((item) => {
                const rp = item.relativePosition as -1 | 0 | 1;

                const center = rp === 0;
                const side = rp !== 0;

                /**
                 * ✅ OUTWARD curve:
                 * - left card rotates LEFT (negative Y)
                 * - right card rotates RIGHT (positive Y)
                 * (this is the opposite of the inward tilt)
                 */
                const rotateY = center ? 0 : rp === -1 ? -18 : 18;

                // Bring center forward, keep sides slightly forward (not sunken)
                const translateZ = center ? 65 : 18;

                const translateX = center ? 0 : rp === -1 ? -12 : 12;
                const translateY = center ? 0 : 10;
                const scale = center ? 1 : 0.935;

                const entryX = direction === 1 ? 18 : -18;

                return (
                  <div
                    key={`${item.title}-${item.relativePosition}`}
                    className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] px-3 lg:px-4"
                    style={{
                      willChange: 'transform, opacity',
                      transformStyle: 'preserve-3d',
                      transition:
                        'transform 700ms cubic-bezier(0.16, 1, 0.3, 1), opacity 700ms ease',
                      opacity: center ? 1 : 0.62,
                      transform: `
                        translateX(${translateX}px)
                        translateY(${translateY}px)
                        translateZ(${translateZ}px)
                        rotateY(${rotateY}deg)
                        scale(${scale})
                      `,
                      filter: side ? 'blur(0.12px)' : 'none',
                      animation: center
                        ? `${direction === 1 ? 'cardEnterRight3D' : 'cardEnterLeft3D'} 700ms cubic-bezier(0.16, 1, 0.3, 1)`
                        : 'none',
                      ['--entryX' as any]: `${entryX}px`,
                    }}
                  >
                    <CarouselCard
                      onClick={() => {
                        if (rp === -1) scrollPrev();
                        else if (rp === 1) scrollNext();
                      }}
                      className={`
                        h-[22rem] sm:h-[24rem] select-none transition-all duration-300 ease-out
                        bg-white rounded-3xl shadow-sm border border-slate-200
                        hover:shadow-xl hover:-translate-y-2
                        ${center ? 'ring-2 ring-slate-900/10 shadow-lg' : 'cursor-pointer hover:scale-[1.01]'}
                      `}
                    >
                      <CardContent carouselItem={item} isAuthenticated={isAuthenticated} />

                    </CarouselCard>
                  </div>
                );
              })}
            </div>
          </div>

          {/* White fades */}
          <div className="hidden sm:block absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white via-white/85 to-transparent pointer-events-none" />
          <div className="hidden sm:block absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white via-white/85 to-transparent pointer-events-none" />
        </div>

        {/* Indicators */}
        <div className="mt-7 flex justify-center gap-2">
          {carouselElements.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-10 bg-gradient-to-r from-[#7A0F1E] to-[#A11A2F] shadow-md'
                  : 'w-6 bg-red-200 hover:bg-red-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Mobile controls */}
        <div className="mt-6 flex sm:hidden justify-center items-center gap-3">
          <Button
            isIconOnly
            variant="bordered"
            size="lg"
            onPress={scrollPrev}
            className="bg-white border-slate-200 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all"
            aria-label="Previous item"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <Button
            isIconOnly
            variant="solid"
            size="lg"
            onPress={scrollNext}
            className="bg-[#8B1538] text-white shadow-sm hover:shadow-md hover:bg-[#7A0F1E] transition-all"
            aria-label="Next item"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes cardEnterRight3D {
          0% {
            opacity: 0;
            transform: translateX(var(--entryX)) translateY(10px) translateZ(20px)
              rotateY(10deg) scale(0.985);
            filter: blur(0.7px);
          }
          100% {
            opacity: 1;
            transform: translateX(0) translateY(0) translateZ(65px) rotateY(0deg)
              scale(1);
            filter: blur(0);
          }
        }

        @keyframes cardEnterLeft3D {
          0% {
            opacity: 0;
            transform: translateX(var(--entryX)) translateY(10px) translateZ(20px)
              rotateY(-10deg) scale(0.985);
            filter: blur(0.7px);
          }
          100% {
            opacity: 1;
            transform: translateX(0) translateY(0) translateZ(65px) rotateY(0deg)
              scale(1);
            filter: blur(0);
          }
        }
      `}</style>
    </section>
  );
};

export default Carousel;
