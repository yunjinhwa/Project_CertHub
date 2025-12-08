// 자격 정보 현황 자동 캐러셀
export class TrendingCarousel {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) return;

        this.wrapper = null;
        this.slides = [];
        this.currentIndex = 0;
        this.intervalDuration = 5000; // 5초
        this.lastTimestamp = 0;
        this.accumulatedTime = 0;
        this.animationId = null;
        this.isTransitioning = false;
        
        this.init();
    }

    init() {
        // 기존 컨테이너를 래퍼로 감싸기
        this.wrapper = document.createElement('div');
        this.wrapper.className = 'trending-carousel-wrapper';
        
        const track = document.createElement('div');
        track.className = 'trending-carousel-track';
        
        // 기존 자식 요소들을 슬라이드로 변환
        const children = Array.from(this.container.children);
        children.forEach((child, index) => {
            const slide = document.createElement('div');
            slide.className = 'trending-carousel-slide';
            if (index === 0) slide.classList.add('active');
            slide.appendChild(child);
            track.appendChild(slide);
            this.slides.push(slide);
        });

        // 인디케이터 생성
        const indicators = document.createElement('div');
        indicators.className = 'trending-carousel-indicators';
        this.slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot';
            if (index === 0) dot.classList.add('active');
            dot.setAttribute('aria-label', `슬라이드 ${index + 1}로 이동`);
            dot.addEventListener('click', () => this.goToSlide(index));
            indicators.appendChild(dot);
        });

        this.wrapper.appendChild(track);
        this.container.innerHTML = '';
        this.container.appendChild(this.wrapper);
        this.container.appendChild(indicators);

        this.track = track;
        this.indicators = indicators;
        this.dots = Array.from(indicators.children);

        // deltaTime 기반 자동 재생 시작
        this.startAutoPlay();
    }

    startAutoPlay() {
        const animate = (timestamp) => {
            if (!this.lastTimestamp) {
                this.lastTimestamp = timestamp;
            }

            const deltaTime = timestamp - this.lastTimestamp;
            this.lastTimestamp = timestamp;

            if (!this.isTransitioning) {
                this.accumulatedTime += deltaTime;

                if (this.accumulatedTime >= this.intervalDuration) {
                    this.accumulatedTime = 0;
                    this.nextSlide();
                }
            }

            this.animationId = requestAnimationFrame(animate);
        };

        this.animationId = requestAnimationFrame(animate);
    }

    stopAutoPlay() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    nextSlide() {
        const nextIndex = (this.currentIndex + 1) % this.slides.length;
        this.goToSlide(nextIndex);
    }

    goToSlide(index) {
        if (this.isTransitioning || index === this.currentIndex) return;

        this.isTransitioning = true;

        // 현재 슬라이드 비활성화
        this.slides[this.currentIndex].classList.remove('active');
        this.dots[this.currentIndex].classList.remove('active');

        // 새 슬라이드 활성화
        this.currentIndex = index;
        this.slides[this.currentIndex].classList.add('active');
        this.dots[this.currentIndex].classList.add('active');

        // 트랙 이동
        const offset = -this.currentIndex * 100;
        this.track.style.transform = `translateX(${offset}%)`;

        // 전환 완료 후 플래그 해제
        setTimeout(() => {
            this.isTransitioning = false;
        }, 500); // CSS transition 시간과 맞춤
    }

    destroy() {
        this.stopAutoPlay();
    }
}
