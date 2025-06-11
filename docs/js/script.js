// const res = require("express/lib/response");

console.log("Welcome to console");

let songs;
let currFolder;

let currentSong = new Audio();
function formatTime(seconds) {
    // Ensure seconds is a valid number and non-negative
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    // Calculate minutes and remaining seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    // Format minutes and seconds to always be two digits
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`${folder}/`);
    let response = await a.text();

    let div = document.createElement('div');
    div.innerHTML = response;
    let as = div.getElementsByTagName('a')
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }


    // Getting the lsit of all songs
    let songsUl = document.querySelector('.songsList').getElementsByTagName("ul")[0];
    songsUl.innerHTML = '';
    for (const song of songs) {
        songsUl.innerHTML = songsUl.innerHTML + `
                    <li>
                        <div class="info">

                            <div class="music">
                                <img class="invert" src="./svgs/icons8-music.svg" alt="music">
                                <div class="songDetail">
                                    <div class="songName">${song.replaceAll("%20", " ")}</div>
                                    <div class="artist">Pkk</div>
                                </div>
                            </div>
                            <div id="playbutton">
                                <span>Play Now</span>
                                    <img  class= "invert" src="./svgs/play.svg" alt="play">
                            </div>
                        </div>
                    </li>`
    }

    // adding an event listener for playing music on a click
    Array.from(document.querySelector('.songsList').getElementsByTagName('li')).forEach(e => {
        e.addEventListener('click', element => {
            playMusic(e.querySelector(".songDetail").firstElementChild.innerHTML);
        })
    })

    return songs;

}


const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "./svgs/pause.svg";
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track)
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
}


async function displayAlbums() {
    let a = await fetch(`songs/`);
    let response = await a.text();

    let div = document.createElement('div');
    div.innerHTML = response;
    let anchors = div.getElementsByTagName('a')
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors)
    // let folder = [];
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs/")) {
            let folder = e.href.split("songs/")[1];
            // Getting metadata of the folder
            // let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            // response = await a.json();

            cardContainer.innerHTML = cardContainer.innerHTML + `
                <div data-folder="${folder}" class="cards">
                    <div class="play">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
                        <!-- Circular green background -->
                        <circle cx="50" cy="50" r="45" fill="green" />

                        <!-- Black play button centered inside -->
                        <polygon points="40,30 40,70 70,50" fill="black" />
                        </svg>
                    </div>

                    <img src="/songs/${folder}/cover.jpg" alt="${folder}">
                    <h2>${folder} Songs</h2>
                    <p>${folder} Songs For Yoou!!</p>
                </div>`

        }
    }

    // eventlistener for loading album on clicking to the cards
    Array.from(document.getElementsByClassName("cards")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        })
    })

}

async function main() {
    // getting the list of all songs
    await getSongs("songs/happy");
    // playMusic(songs[0],true);

    displayAlbums()
    // adding event listener for play and pause
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "./svgs/pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "./svgs/play.svg";
        }
    })

    // Event listener for playing the next song when the current song ends
    currentSong.addEventListener("ended", () => {
        let index = songs.indexOf(currentSong.src.split(`/${currFolder}/`)[1]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        } else {
            playMusic(songs[0]); // Loop back to the first song
        }
    });



    // event listener for previous song
    prev.addEventListener("click", () => {

        let index = songs.indexOf(currentSong.src.split(`/${currFolder}/`)[1]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
        else {
            playMusic(songs[0], true);
        }
    })

    // event listener for next song
    next.addEventListener("click", () => {

        let index = songs.indexOf(currentSong.src.split(`/${currFolder}/`)[1]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
        else {
            playMusic(songs[0])
        }
    })



    // Event listener for updating the duration
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })


    // Event listener for seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (percent * currentSong.duration) / 100;
    })

    // Event listener for opening hamburger
    document.querySelector(".menu").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
    })

    // Event listener for closing hamburger
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    })

    // Event listener for volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("mousemove", (e) => {
        currentSong.volume = e.target.value / 100;
    })

    // Event listener for volume muting
    document.querySelector(".volume>img").addEventListener("click", e => {
        console.log('muteButton clicked')
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replaceAll("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
            // currentSong.volume = e.target.value / 100;
            // currentSong.volume = 0;
        }
        else {
            e.target.src = e.target.src.replaceAll("mute.svg", "volume.svg");
            document.querySelector(".range").getElementsByTagName("input")[0].value = 50;
            currentSong.volume = 0.5;
            // currentSong.volume = 1;
        }
    })


    // Select the loop button
    // const loopButton = document.getElementById("loop");

    // Track whether looping is enabled
    let isLooping = false;

    // Event listener for toggling loop mode
    loop.addEventListener("click", () => {
        isLooping = !isLooping; // Toggle the loop state
        currentSong.loop = isLooping; // Set the audio loop property

        // Change the button icon based on loop state
        if (isLooping) {
            loop.src = "./svgs/loop-active.svg"; // Change icon to indicate looping is active
        } else {
            loop.src = "./svgs/loop.svg"; // Revert icon when looping is off
        }
    });

    // Automatically play the next song if looping is off and song ends
    currentSong.addEventListener("ended", () => {
        if (!isLooping) {
            let index = songs.indexOf(currentSong.src.split(`/${currFolder}/`)[1]);
            if ((index + 1) < songs.length) {
                playMusic(songs[index + 1]);
            } else {
                playMusic(songs[0]); // Loop back to the first song
            }
        }
    });



}
main()




