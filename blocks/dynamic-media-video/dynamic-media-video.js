export default function decorate(block) {
    let url = block.textContent.trim();
    
    // Handle @ symbol prefix - remove it if present (common in Adobe Dynamic Media URLs)
    if (url.startsWith('@')) {
        url = url.substring(1);
    }
    
    block.innerHTML = '';

    // Wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'dynamic-media-video-wrapper';
    wrapper.style.position = 'relative';
    wrapper.style.maxWidth = '960px';
    wrapper.style.margin = '0 auto';
    wrapper.style.backgroundColor = '#000';
    wrapper.style.borderRadius = '8px';
    wrapper.style.overflow = 'hidden';

    // Video element
    const video = document.createElement('video');
    video.style.width = '100%';
    video.style.height = 'auto';
    video.playsInline = true;
    video.preload = 'metadata';
    video.setAttribute('controlsList', 'nodownload noremoteplaybook');

    // Video source
    const source = document.createElement('source');
    source.src = url;
    source.type = 'video/mp4';
    
    // Add error handling for video loading
    source.addEventListener('error', (e) => {
        console.error('Error loading video source:', e);
        // You could add a fallback message or retry logic here
    });
    
    video.appendChild(source);

    // Custom control bar
    const controlsBar = document.createElement('div');
    controlsBar.className = 'video-controls';
    controlsBar.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(transparent, rgba(0,0,0,0.7));
        padding: 20px 15px 15px;
        display: flex;
        align-items: center;
        gap: 10px;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 10;
    `;

    // Play/Pause button
    const playPauseBtn = document.createElement('button');
    playPauseBtn.className = 'play-pause-btn';
    playPauseBtn.innerHTML = '▶';
    playPauseBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 5px;
        border-radius: 4px;
        transition: background-color 0.2s;
    `;

    // Progress bar container
    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';
    progressContainer.style.cssText = `
        flex: 1;
        height: 6px;
        background: rgba(255,255,255,0.3);
        border-radius: 3px;
        cursor: pointer;
        position: relative;
        margin: 0 10px;
    `;

    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.style.cssText = `
        height: 100%;
        background: #FF0000;
        border-radius: 3px;
        width: 0%;
        transition: width 0.1s ease;
    `;

    const progressHandle = document.createElement('div');
    progressHandle.className = 'progress-handle';
    progressHandle.style.cssText = `
        position: absolute;
        top: 50%;
        left: 0%;
        transform: translate(-50%, -50%);
        width: 12px;
        height: 12px;
        background: #FF0000;
        border-radius: 50%;
        opacity: 0;
        transition: opacity 0.2s;
    `;

    progressContainer.appendChild(progressBar);
    progressContainer.appendChild(progressHandle);

    // Time display
    const timeDisplay = document.createElement('div');
    timeDisplay.className = 'time-display';
    timeDisplay.style.cssText = `
        color: white;
        font-size: 14px;
        font-family: monospace;
        min-width: 100px;
    `;
    timeDisplay.textContent = '0:00 / 0:00';

    // Volume control
    const volumeContainer = document.createElement('div');
    volumeContainer.className = 'volume-container';
    volumeContainer.style.cssText = `
        display: flex;
        align-items: center;
        gap: 5px;
    `;

    const volumeBtn = document.createElement('button');
    volumeBtn.className = 'volume-btn';
    volumeBtn.innerHTML = '🔊';
    volumeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 16px;
        cursor: pointer;
        padding: 5px;
    `;

    const volumeSlider = document.createElement('input');
    volumeSlider.type = 'range';
    volumeSlider.min = '0';
    volumeSlider.max = '1';
    volumeSlider.step = '0.1';
    volumeSlider.value = '1';
    volumeSlider.className = 'volume-slider';
    volumeSlider.style.cssText = `
        width: 60px;
        height: 4px;
        background: rgba(255,255,255,0.3);
        border-radius: 2px;
        outline: none;
        cursor: pointer;
    `;

    volumeContainer.appendChild(volumeBtn);
    volumeContainer.appendChild(volumeSlider);

    // Speed control dropdown
    const speedContainer = document.createElement('div');
    speedContainer.className = 'speed-container';
    speedContainer.style.cssText = `
        position: relative;
        display: inline-block;
    `;

    const speedBtn = document.createElement('button');
    speedBtn.className = 'speed-btn';
    speedBtn.textContent = '1x';
    speedBtn.style.cssText = `
        background: none;
        border: 1px solid rgba(255,255,255,0.3);
        color: white;
        font-size: 12px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background-color 0.2s;
        display: flex;
        align-items: center;
        gap: 4px;
    `;

    // Add dropdown arrow
    const dropdownArrow = document.createElement('span');
    dropdownArrow.innerHTML = '▼';
    dropdownArrow.style.cssText = `
        font-size: 8px;
        transition: transform 0.2s;
    `;
    speedBtn.appendChild(dropdownArrow);

    const speedDropdown = document.createElement('div');
    speedDropdown.className = 'speed-dropdown';
    speedDropdown.style.cssText = `
        position: absolute;
        bottom: 100%;
        right: 0;
        background: rgba(0, 0, 0, 0.9);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 4px;
        padding: 4px 0;
        min-width: 80px;
        opacity: 0;
        visibility: hidden;
        transform: translateY(10px);
        transition: all 0.2s ease;
        z-index: 20;
    `;

    speedContainer.appendChild(speedBtn);
    speedContainer.appendChild(speedDropdown);

    // Fullscreen button
    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.className = 'fullscreen-btn';
    fullscreenBtn.innerHTML = '⛶';
    fullscreenBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 16px;
        cursor: pointer;
        padding: 5px;
    `;

    // Custom play button overlay
    const playBtn = document.createElement('div');
    playBtn.className = 'video-play-btn';
    playBtn.innerHTML = '▶';
    playBtn.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        fontSize: 64px;
        color: white;
        background: rgba(0,0,0,0.5);
        borderRadius: 50%;
        width: 96px;
        height: 96px;
        display: flex;
        alignItems: center;
        justifyContent: center;
        cursor: pointer;
        zIndex: 2;
        transition: all 0.3s ease;
    `;

    // Assemble controls
    controlsBar.appendChild(playPauseBtn);
    controlsBar.appendChild(progressContainer);
    controlsBar.appendChild(timeDisplay);
    controlsBar.appendChild(volumeContainer);
    controlsBar.appendChild(speedContainer);
    controlsBar.appendChild(fullscreenBtn);

    // Event listeners
    let controlsTimeout;

    const showControls = () => {
        controlsBar.style.opacity = '1';
        progressHandle.style.opacity = '1';
        clearTimeout(controlsTimeout);
        controlsTimeout = setTimeout(() => {
            if (!video.paused) {
                controlsBar.style.opacity = '0';
                progressHandle.style.opacity = '0';
            }
        }, 3000);
    };

    const hideControls = () => {
        controlsBar.style.opacity = '0';
        progressHandle.style.opacity = '0';
    };

    // Mouse events for controls visibility
    wrapper.addEventListener('mouseenter', showControls);
    wrapper.addEventListener('mouseleave', () => {
        if (!video.paused) {
            hideControls();
        }
    });
    wrapper.addEventListener('mousemove', showControls);

    // Play/Pause functionality
    const togglePlayPause = () => {
        if (video.paused) {
            video.play();
            playPauseBtn.innerHTML = '⏸';
            playBtn.style.display = 'none';
        } else {
            video.pause();
            playPauseBtn.innerHTML = '▶';
        }
    };

    playPauseBtn.addEventListener('click', togglePlayPause);
    playBtn.addEventListener('click', togglePlayPause);
    video.addEventListener('click', togglePlayPause);

    // Progress bar functionality
    const updateProgress = () => {
        if (video.duration) {
            const progress = (video.currentTime / video.duration) * 100;
            progressBar.style.width = `${progress}%`;
            progressHandle.style.left = `${progress}%`;
        }
    };

    const seekTo = (e) => {
        const rect = progressContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        video.currentTime = percentage * video.duration;
    };

    progressContainer.addEventListener('click', seekTo);

    // Time display update
    const updateTimeDisplay = () => {
        const formatTime = (time) => {
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        };
        timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
    };

    // Volume control
    const updateVolumeIcon = () => {
        if (video.muted || video.volume === 0) {
            volumeBtn.innerHTML = '🔇';
        } else if (video.volume < 0.5) {
            volumeBtn.innerHTML = '🔉';
        } else {
            volumeBtn.innerHTML = '🔊';
        }
    };

    volumeBtn.addEventListener('click', () => {
        video.muted = !video.muted;
        updateVolumeIcon();
    });

    volumeSlider.addEventListener('input', (e) => {
        video.volume = e.target.value;
        video.muted = false;
        updateVolumeIcon();
    });

    // Speed control dropdown
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    let currentSpeed = 1; // Start at 1x

    // Create speed options
    speeds.forEach(speed => {
        const speedOption = document.createElement('div');
        speedOption.className = 'speed-option';
        speedOption.textContent = `${speed}x`;
        speedOption.style.cssText = `
            padding: 6px 12px;
            color: white;
            cursor: pointer;
            font-size: 12px;
            transition: background-color 0.2s;
        `;

        if (speed === currentSpeed) {
            speedOption.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
            speedOption.style.color = '#FF0000';
        }

        speedOption.addEventListener('click', () => {
            currentSpeed = speed;
            video.playbackRate = speed;
            speedBtn.innerHTML = `${speed}x<span style="font-size: 8px; transition: transform 0.2s;">▼</span>`;
            
            // Update visual state
            speedDropdown.querySelectorAll('.speed-option').forEach(option => {
                option.style.backgroundColor = '';
                option.style.color = 'white';
            });
            speedOption.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
            speedOption.style.color = '#FF0000';
            
            // Hide dropdown
            speedDropdown.style.opacity = '0';
            speedDropdown.style.visibility = 'hidden';
            speedDropdown.style.transform = 'translateY(10px)';
            dropdownArrow.style.transform = 'rotate(0deg)';
        });

        speedOption.addEventListener('mouseenter', () => {
            if (speed !== currentSpeed) {
                speedOption.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }
        });

        speedOption.addEventListener('mouseleave', () => {
            if (speed !== currentSpeed) {
                speedOption.style.backgroundColor = '';
            }
        });

        speedDropdown.appendChild(speedOption);
    });

    // Toggle dropdown
    speedBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = speedDropdown.style.opacity === '1';
        
        if (isOpen) {
            speedDropdown.style.opacity = '0';
            speedDropdown.style.visibility = 'hidden';
            speedDropdown.style.transform = 'translateY(10px)';
            dropdownArrow.style.transform = 'rotate(0deg)';
        } else {
            speedDropdown.style.opacity = '1';
            speedDropdown.style.visibility = 'visible';
            speedDropdown.style.transform = 'translateY(0)';
            dropdownArrow.style.transform = 'rotate(180deg)';
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!speedContainer.contains(e.target)) {
            speedDropdown.style.opacity = '0';
            speedDropdown.style.visibility = 'hidden';
            speedDropdown.style.transform = 'translateY(10px)';
            dropdownArrow.style.transform = 'rotate(0deg)';
        }
    });

    // Fullscreen functionality
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            wrapper.requestFullscreen().catch(err => {
                console.log('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    });

    // Video event listeners
    video.addEventListener('timeupdate', () => {
        updateProgress();
        updateTimeDisplay();
    });

    video.addEventListener('loadedmetadata', () => {
        updateTimeDisplay();
    });

    video.addEventListener('play', () => {
        playPauseBtn.innerHTML = '⏸';
        playBtn.style.display = 'none';
    });

    video.addEventListener('pause', () => {
        playPauseBtn.innerHTML = '▶';
        if (video.currentTime < video.duration) {
            playBtn.style.display = 'flex';
        }
    });

    video.addEventListener('ended', () => {
        playPauseBtn.innerHTML = '▶';
        playBtn.style.display = 'flex';
        progressBar.style.width = '0%';
        progressHandle.style.left = '0%';
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (wrapper.contains(document.activeElement) || video === document.activeElement) {
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    togglePlayPause();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    video.currentTime = Math.max(0, video.currentTime - 10);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    video.currentTime = Math.min(video.duration, video.currentTime + 10);
                    break;
                case 'KeyF':
                    e.preventDefault();
                    fullscreenBtn.click();
                    break;
                case 'KeyM':
                    e.preventDefault();
                    volumeBtn.click();
                    break;
            }
        }
    });

    // Assemble the player
    wrapper.appendChild(video);
    wrapper.appendChild(controlsBar);
    wrapper.appendChild(playBtn);
    block.appendChild(wrapper);
}
