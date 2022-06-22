// End playlist !load
/*
1. Render songs +
2. Scroll +
3. Play / Pause / seek +
4. CD rotate(quay) +
5. Next / Previous +
6. Next / Repeat when ended + 
7. Random +
8. Active song +
9. Scroll active song into view + 
10. Play song when click +
*/
const heading = document.querySelector('header h2');
const cdThumb = document.querySelector('.cd-thumb');
const audio = document.querySelector('#audio');
const cd = document.querySelector('.cd');
const playBtn = document.querySelector('.btn-toggle-play');
const player = document.querySelector('.player');
const progress = document.querySelector('#progress');
const nextSongBtn = document.querySelector('.btn-next');
const previousSongBtn = document.querySelector('.btn-prev');
const randomSongBtn = document.querySelector('.btn-random');
const repeatSongBtn = document.querySelector('.btn-repeat');
const playlist = document.querySelector('.playlist');
const option = document.querySelector('.option');
const volume = document.querySelector('#set-volume');
const subProgress = document.querySelector('#sub-progress');
const iconVolume = document.querySelector('.icon-volume.show-icon');
const iconVolumeUp = document.querySelector('.icon-volume-up');
const iconVolumeDown = document.querySelector('.icon-volume-down');
const iconVolumeOff = document.querySelector('.icon-volume-off');

const app = {
    isRandom: false,
    isRepeat: false,
    isPlaying: false,
    currentIndex: 0,

    songs: [],

    async fetchSongs() {
        await fetch("data-song.json")
            .then(response =>
                response.json()
            )
            .then(data => {
                this.songs = data;
            })
    }, // fetchSongs

    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            }
        });
    }, //

    // Rander playlist song 
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
             <div class="song ${index == this.currentIndex ? 'active' : ''}" data-index="${index}">
              <div class="thumb" style="background-image: url('${song.image}')">
              </div>
             <div class="body">
              <h3 class="title">${song.name}</h3>
              <p class="author">${song.singer}</p>
            </div>
            <div class="option">
              <i class="fas fa-ellipsis-h"></i>
            </div>
          </div>
          `;
        });
        playlist.innerHTML = htmls.join('');
    }, // Rander playlist song


    // Handle event 
    handleEvents: function () {
        // CD rotate / stop 
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 30000,
            iterations: Infinity
        });
        // CD rotate / stop 
        cdThumbAnimate.pause();

        // Scroll hide / show CD 
        const cdWidth = cd.offsetWidth;
        document.onscroll = function () {
            const scroll = window.scrollY;
            const newCdWidth = cdWidth - scroll;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }, // Scroll hide / show CD 

            // Event click play / stop btn 
            playBtn.onclick = function () {
                if (app.isPlaying) {
                    audio.pause();

                } else {
                    audio.play();
                }
            }, // Event click play / stop btn

            // Playing music 
            audio.onplay = function () {
                app.isPlaying = true;
                player.classList.add('playing');
                cdThumbAnimate.play();
            }, // Playing music

            // Pause music 
            audio.onpause = function () {
                app.isPlaying = false;
                player.classList.remove('playing');
                cdThumbAnimate.pause();
            }, // Pause music

            // Run progress bar 
            audio.ontimeupdate = function () {
                // audio.duration: Thời gian của audio
                // audio.currentTime: Thời gian hiện tại của audio 
                if (audio.duration) {
                    const progressPercent = Math.round(audio.currentTime / audio.duration * 100);
                    progress.value = progressPercent;
                    subProgress.style.setProperty('width', `${progress.value}%`);

                }
            }, // Run progress bar

            // 
            progress.onmousemove = function () {
                subProgress.style.setProperty('width', `${progress.value}%`);
            },//

            // Set Volume
            volume.onmousemove = function (e) {
                const seekVolume = 1 / 100 * e.target.value;
                audio.volume = seekVolume;

                if (audio.volume >= 0.5) {
                    iconVolumeUp.classList.add('show-icon');
                    iconVolumeDown.classList.remove('show-icon');
                    iconVolumeOff.classList.remove('show-icon');

                } else if (audio.volume <= 0.4 && audio.volume > 0) {
                    iconVolumeDown.classList.add('show-icon');
                    iconVolumeUp.classList.remove('show-icon');
                    iconVolumeOff.classList.remove('show-icon');

                } else if (audio.volume === 0) {
                    iconVolumeOff.classList.add('show-icon');
                    iconVolumeDown.classList.remove('show-icon');
                    iconVolumeUp.classList.remove('show-icon');
                }



            }, // Set Volume

            // Rewind forward / backward
            progress.onchange = function (e) {
                const seekTime = audio.duration / 100 * e.target.value;
                audio.currentTime = seekTime;
            }, // Rewind forward / backward

            // When next the song 
            nextSongBtn.onclick = function () {
                if (app.isRandom) {
                    // If targeting btn-random
                    app.playRandomSong();
                } else {
                    app.nextSong();
                }

                audio.play();
                app.render();
                app.scrollToActiveSong();
            }, // When next the song

            // When previous the song 
            previousSongBtn.onclick = function () {
                if (app.isRandom) {
                    // If targeting btn-random
                    app.playRandomSong();
                } else {
                    app.previousSong();
                }
                audio.play();
                app.render();
                app.scrollToActiveSong();
            }, // When previous the song

            // Random song
            randomSongBtn.onclick = function () {
                app.isRandom = !app.isRandom;
                randomSongBtn.classList.toggle('active', app.isRandom);
            }, // Random song

            // Repeat song
            repeatSongBtn.onclick = function () {
                app.isRepeat = !app.isRepeat;
                repeatSongBtn.classList.toggle('active', app.isRepeat);
            }, // Repeat song

            // Next song at the end 
            audio.onended = function () {
                if (app.isRepeat) {
                    audio.play();
                } else {
                    nextSongBtn.click();
                }
            }, // Next song at the end

            // Go to the clicked song
            playlist.onclick = function (e) {
                const songItem = e.target.closest('.song:not(.active)');
                const optionItem = e.target.closest('.option');


                if (songItem) {
                    app.currentIndex = Number(songItem.dataset.index);
                    app.loadSong();
                    app.render();
                    audio.play();
                }

                if (optionItem) {
                    option.onclick = function (e) {
                        e.stopPropagation();

                    }
                }

            } // Go to the clicked song

    }, // Handle event 


    // Scroll to active song 
    scrollToActiveSong: function () {
        setTimeout(() => {
            const songActive = document.querySelector('.song.active');
            if (app.currentIndex == 0 || app.currentIndex == 1 || app.currentIndex == 2) {
                songActive.scrollIntoView({
                    behavior: 'smooth',
                    block: 'end'
                });
            } else {
                songActive.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                });
            }
        }, 200);
    }, // Scroll to active song 

    // Load song
    loadSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    }, // Load song

    // Next song
    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadSong();
    }, // Next song

    // Previous song
    previousSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadSong();
    }, // Previous song

    // Random song
    playRandomSong: function () {
        let newIndex;
        do {
            newIndex = Math.round(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);

        this.currentIndex = newIndex;
        this.loadSong();
    }, // Random song

    // When start then run the function inside
    async start() {
        await this.fetchSongs();
        this.defineProperties();
        this.handleEvents();
        this.render();
        this.loadSong();
    } // start
} // app

app.start();

