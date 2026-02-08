import { Image } from "@heroui/react";
import { layoutAtom } from "@liberfi/ui-base";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import ReactSlider from "react-slick";

const desktopSlides = ["/images/banner.png"];
const mobileSlides = ["/images/banner_sm.png"];

export function Slider() {
  const layout = useAtomValue(layoutAtom);

  const slides = useMemo(() => (layout !== "desktop" ? mobileSlides : desktopSlides), [layout]);

  return (
    <div className="w-full h-full">
      <ReactSlider
        autoplay
        autoplaySpeed={5000000}
        dots
        arrows={false}
        adaptiveHeight
        slidesToShow={1}
        slidesToScroll={1}
      >
        {slides.map((slide) => (
          <Image
            key={slide}
            src={slide}
            removeWrapper
            classNames={{ img: "w-full h-full lg:h-[160px] object-cover lg:object-contain" }}
            alt="slide"
          />
        ))}
      </ReactSlider>
    </div>
  );
}
