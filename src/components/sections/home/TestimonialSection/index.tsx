import { FC, useRef } from 'react';
import Slider from '@ant-design/react-slick';

import SliderButton from '@components/atoms/SliderButton';
import TestimonialCard from '@components/molecules/TestimonialCard';
import ScrollAnimation from '@components/atoms/ScrollAnimation';

import { testimonials } from '@constants/testimonialSectionDetails';

export interface TestimonialSectionProps {}

const TestimonialSection: FC<TestimonialSectionProps> = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const arrowRef = useRef<any>(null);

  const settings = {
    infinite: true,
    autoplay: true,
    autoplaySpeed: 6000,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    ref: arrowRef,
  };

  return (
    <ScrollAnimation direction="up" delay={50}>
      <div className="p-12 tablet:p-10 desktop:pt-12 desktop:px-28 tablet:pb-24">
        <div className="relative">
          <Slider {...settings}>
            {testimonials.map((testimonial, index) => (
              <ScrollAnimation key={index} direction="up" delay={100 + (index * 50)}>
                <TestimonialCard text={testimonial.text} />
              </ScrollAnimation>
            ))}
          </Slider>
          <ScrollAnimation direction="left" delay={150}>
            <SliderButton
              onClick={() => {
                if (arrowRef?.current != null) arrowRef.current.slickPrev();
              }}
              isPrev
            />
          </ScrollAnimation>
          <ScrollAnimation direction="right" delay={150}>
            <SliderButton
              onClick={() => {
                arrowRef?.current?.slickNext();
              }}
              isPrev={false}
            />
          </ScrollAnimation>
        </div>
      </div>
    </ScrollAnimation>
  );
};

export default TestimonialSection;
