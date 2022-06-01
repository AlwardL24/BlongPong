// Convenience Methods

const range = (start, stop, step = 1) =>
    Array.from(
        { length: (stop - start) / step + 1 },
        (_, i) => start + i * step
    )

const anySimilarElements = (array1, array2) =>
    array1.filter(element => array2.includes(element)).length != 0

function millisToMinutesAndSeconds(millis) {
    if (millis <= 0) {
        return '0:00'
    }

    var minutes = Math.floor(millis / 60000)
    var seconds = ((millis % 60000) / 1000).toFixed(0)
    return (
        (seconds == '60' ? minutes + 1 : minutes) +
        ':' +
        (seconds < 10 ? '0' : '') +
        (seconds == '60' ? '00' : seconds)
    )
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

// Enums

var ENUM_Direction = {
    idle: 0,
    up: 1,
    down: 2,
    left: 3,
    right: 4,
}

// Constant Variables

var canvas = document.querySelector('canvas')
var ctx = canvas.getContext('2d')

var blongImage = document.querySelector('#blong-image')
var paddleImage = document.querySelector('#paddle-image')
var video = document.querySelector('#background-video')

var ballSpeed = 9
var playerPaddleSpeed = 10
var computerPaddleSpeed = 10

// Game Logic

var gameOver = false
var keyState = {
    KeyW: false,
    ArrowUp: false,
    KeyS: false,
    ArrowDown: false,
}

var timerStartDate = new Date()

var soundEffects = true

// Game Pieces

var ball = {
    width: 150,
    height: 150,
    x: canvas.width / 2 - 75,
    y: canvas.height / 2 - 75,
    moveX: ENUM_Direction.left,
    moveY: ENUM_Direction.idle,
}

var playerPaddle = {
    width: 20,
    height: 100,
    x: 100,
    y: canvas.height / 2 - 50,
    score: 0,
    move: ENUM_Direction.idle,
    moveTimeout: 0,
}

var computerPaddle = {
    width: 20,
    height: 100,
    x: canvas.width - 120,
    y: canvas.height / 2 - 50,
    score: 0,
    move: ENUM_Direction.idle,
    moveTimeout: 0,
}

function update() {
    if (!gameOver) {
        // Process currently pressed keys
        if (keyState['ArrowUp'] || keyState['KeyW']) {
            //playerPaddle.moveTimeout = 10
            playerPaddle.move = ENUM_Direction.up
        } else if (keyState['ArrowDown'] || keyState['KeyS']) {
            //playerPaddle.moveTimeout = 10
            playerPaddle.move = ENUM_Direction.down
        }

        // Ball collision with left/right walls
        if (ball.x <= 0) {
            computerPaddle.score += 1
            ball.x = canvas.width / 2 - 75
            ball.y = canvas.height / 2 - ball.height / 2 //randomInt(50, canvas.height - 50 - ball.height)
            ball.moveX = ENUM_Direction.left
            ball.moveY =
                ENUM_Direction.idle /*[ENUM_Direction.up, ENUM_Direction.down][
                Math.floor(Math.random() * 2)
            ]*/
        }
        if (ball.x >= canvas.width - ball.width) {
            playerPaddle.score += 1
            ball.x = canvas.width / 2 - 75
            ball.y = canvas.height / 2 - ball.height / 2 //randomInt(50, canvas.height - 50 - ball.height)
            ball.moveX = ENUM_Direction.right
            ball.moveY =
                ENUM_Direction.idle /*[ENUM_Direction.up, ENUM_Direction.down][
                Math.floor(Math.random() * 2)
            ]*/
        }

        // Ball collision with top/bottom walls
        if (ball.y <= 0) {
            ball.moveY = ENUM_Direction.down

            if (soundEffects) {
                var effect = new Audio('assets/sound/bounce.wav')
                effect.play()
            }
        }
        if (ball.y >= canvas.height - ball.height) {
            ball.moveY = ENUM_Direction.up

            if (soundEffects) {
                var effect = new Audio('assets/sound/bounce.wav')
                effect.play()
            }
        }

        // Computer Paddle AI
        if (computerPaddle.moveTimeout <= 0) {
            var diff = Math.abs(
                computerPaddle.y - (ball.y - computerPaddle.height / 2)
            )
            if (diff > 30) {
                if (computerPaddle.y > ball.y - computerPaddle.height / 2) {
                    if (Math.random() > 0.01) {
                        computerPaddle.move = ENUM_Direction.up
                    } else {
                        computerPaddle.move = ENUM_Direction.idle
                        computerPaddle.moveTimeout = 10
                    }
                }
                if (computerPaddle.y < ball.y - computerPaddle.height / 2) {
                    if (Math.random() > 0.01) {
                        computerPaddle.move = ENUM_Direction.down
                    } else {
                        computerPaddle.move = ENUM_Direction.idle
                        computerPaddle.moveTimeout = 10
                    }
                }
            } else {
                computerPaddle.move = ENUM_Direction.idle
            }
        } else {
            computerPaddle.moveTimeout--
        }

        // Move Player Paddle
        if (playerPaddle.move == ENUM_Direction.up) {
            playerPaddle.y -= playerPaddleSpeed
            //playerPaddle.moveTimeout--
            //if (playerPaddle.moveTimeout <= 0) {
            playerPaddle.move = ENUM_Direction.idle
            //}
        } else if (playerPaddle.move == ENUM_Direction.down) {
            playerPaddle.y += playerPaddleSpeed
            //playerPaddle.moveTimeout--
            //if (playerPaddle.moveTimeout <= 0) {
            playerPaddle.move = ENUM_Direction.idle
            //}
        }

        // Move Computer Paddle
        if (computerPaddle.move == ENUM_Direction.up) {
            computerPaddle.y -= computerPaddleSpeed
        } else if (computerPaddle.move == ENUM_Direction.down) {
            computerPaddle.y += computerPaddleSpeed
        }

        // Player Paddle collision with top/bottom walls
        if (playerPaddle.y <= 40) {
            playerPaddle.y = 40
        } else if (playerPaddle.y >= canvas.height - 40 - playerPaddle.height) {
            playerPaddle.y = canvas.height - 40 - playerPaddle.height
        }

        // Computer Paddle collision with top/bottom walls
        if (computerPaddle.y <= 0) {
            computerPaddle.y = 0
        } else if (computerPaddle.y >= canvas.height - computerPaddle.height) {
            computerPaddle.y = canvas.height - computerPaddle.height
        }

        // Ball collision with player paddle
        var diff = Math.abs(ball.x - playerPaddle.x + playerPaddle.width)
        if (ball.x <= playerPaddle.x + playerPaddle.width) {
            if (diff < 20) {
                if (
                    anySimilarElements(
                        range(ball.y, ball.y + ball.height),
                        range(
                            playerPaddle.y,
                            playerPaddle.y + playerPaddle.height
                        )
                    )
                ) {
                    ball.moveX = ENUM_Direction.right
                    if (ball.moveY == ENUM_Direction.idle) {
                        ball.moveY = [ENUM_Direction.up, ENUM_Direction.down][
                            Math.floor(Math.random() * 2)
                        ]
                    }

                    if (soundEffects) {
                        var effect = new Audio('assets/sound/bounce.wav')
                        effect.play()
                    }
                }
            } /* else if (
                anySimilarElements(
                    range(ball.y, ball.y + ball.height),
                    range(playerPaddle.y, playerPaddle.y + playerPaddle.height)
                )
            ) {
                if (
                    playerPaddle.y + playerPaddle.height / 2 <
                    ball.y + ball.height / 2
                ) {
                    // Move player paddle up
                    playerPaddle.y = ball.y - playerPaddle.height
                } else {
                    // Move player paddle down
                    playerPaddle.y = ball.y + ball.height
                }
            }*/
        }

        // Ball collision with computer paddle
        var diff = Math.abs(ball.x + ball.width - computerPaddle.x)
        if (ball.x + ball.width >= computerPaddle.x && diff < 20) {
            if (
                anySimilarElements(
                    range(ball.y, ball.y + ball.height),
                    range(
                        computerPaddle.y,
                        computerPaddle.y + computerPaddle.height
                    )
                )
            ) {
                ball.moveX = ENUM_Direction.left
                if (ball.moveY == ENUM_Direction.idle) {
                    ball.moveY = [ENUM_Direction.up, ENUM_Direction.down][
                        Math.floor(Math.random() * 2)
                    ]
                }

                if (soundEffects) {
                    var effect = new Audio('assets/sound/bounce.wav')
                    effect.play()
                }
            }
        }

        // Move Ball
        if (ball.moveX == ENUM_Direction.left) {
            ball.x -= ballSpeed
        } else if (ball.moveX == ENUM_Direction.right) {
            ball.x += ballSpeed
        }
        if (ball.moveY == ENUM_Direction.up) {
            ball.y -= ballSpeed
        } else if (ball.moveY == ENUM_Direction.down) {
            ball.y += ballSpeed
        }
    }
}

function drawTextFromSprites(text, x, y, size, textAlign) {
    var letterToSprite = {
        ':': 'letter-colon',
        0: 'letter-zero',
        1: 'letter-one',
        2: 'letter-two',
        3: 'letter-three',
        4: 'letter-four',
        5: 'letter-five',
        6: 'letter-six',
        7: 'letter-seven',
        8: 'letter-eight',
        9: 'letter-nine',
        a: 'assets/images/letters/BlongPong Font_a.png',
        b: 'assets/images/letters/BlongPong Font_b.png',
        c: 'assets/images/letters/BlongPong Font_c.png',
        d: 'assets/images/letters/BlongPong Font_d.png',
        e: 'assets/images/letters/BlongPong Font_e.png',
        f: 'assets/images/letters/BlongPong Font_f.png',
        g: 'assets/images/letters/BlongPong Font_g.png',
        h: 'assets/images/letters/BlongPong Font_h.png',
        i: 'assets/images/letters/BlongPong Font_i.png',
        j: 'assets/images/letters/BlongPong Font_j.png',
        k: 'assets/images/letters/BlongPong Font_k.png',
        l: 'assets/images/letters/BlongPong Font_l.png',
        m: 'assets/images/letters/BlongPong Font_m.png',
        n: 'assets/images/letters/BlongPong Font_n.png',
        o: 'assets/images/letters/BlongPong Font_o.png',
        p: 'assets/images/letters/BlongPong Font_p.png',
        q: 'assets/images/letters/BlongPong Font_q.png',
        r: 'assets/images/letters/BlongPong Font_r.png',
        s: 'assets/images/letters/BlongPong Font_s.png',
        t: 'assets/images/letters/BlongPong Font_t.png',
        u: 'assets/images/letters/BlongPong Font_u.png',
        v: 'assets/images/letters/BlongPong Font_v.png',
        w: 'assets/images/letters/BlongPong Font_w.png',
        x: 'assets/images/letters/BlongPong Font_x.png',
        y: 'assets/images/letters/BlongPong Font_y.png',
        z: 'assets/images/letters/BlongPong Font_z.png',
    }

    var combinedWidth = 0

    for (var letter of String(text)) {
        combinedWidth +=
            (document.getElementById(letterToSprite[letter]).naturalWidth /
                document.getElementById(letterToSprite[letter]).naturalHeight) *
                size +
            10
    }

    if (textAlign == 'center') {
        var drawX = x - combinedWidth / 2

        for (var letter of String(text)) {
            //console.log('drawing', letter)
            //console.log(letterToSprite[letter])
            //console.log(document.getElementById(letterToSprite[letter]))
            ctx.drawImage(
                document.getElementById(letterToSprite[letter]),
                drawX,
                y,
                (document.getElementById(letterToSprite[letter]).naturalWidth /
                    document.getElementById(letterToSprite[letter])
                        .naturalHeight) *
                    size,
                size
            )
            drawX +=
                (document.getElementById(letterToSprite[letter]).naturalWidth /
                    document.getElementById(letterToSprite[letter])
                        .naturalHeight) *
                    size +
                10
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = 'red'

    ctx.drawImage(
        paddleImage,
        playerPaddle.x,
        playerPaddle.y,
        playerPaddle.width,
        playerPaddle.height
    )

    ctx.drawImage(
        paddleImage,
        computerPaddle.x,
        computerPaddle.y,
        computerPaddle.width,
        computerPaddle.height
    )

    ctx.drawImage(blongImage, ball.x, ball.y, ball.width, ball.height)

    drawTextFromSprites(playerPaddle.score, canvas.width / 4, 70, 100, 'center')

    drawTextFromSprites(
        computerPaddle.score,
        (canvas.width / 4) * 3,
        70,
        100,
        'center'
    )

    var msSinceStart = new Date() - timerStartDate
    var msToGo = /*3000 - msSinceStart*/ 90000 - msSinceStart

    var videoSpeed = ((msSinceStart - 0) * (10 - 1)) / (90000 - 0) + 1

    video.playbackRate = videoSpeed

    if (msToGo <= 0) {
        gameOver = true
    }

    drawTextFromSprites(
        millisToMinutesAndSeconds(msToGo),
        canvas.width / 2,
        92,
        56,
        'center'
    )
}

function loop() {
    update()
    draw()

    if (!gameOver) {
        requestAnimationFrame(loop)
    }
}

function loadLocalStorageValues() {}

function load() {
    loadLocalStorageValues()

    document.getElementById('leaderboardFill').classList.add('show')
}

load()

document.addEventListener('keydown', e => {
    keyState[e.code] = true
})

document.addEventListener('keyup', e => {
    keyState[e.code] = false
})

document.getElementById('leaderboardOkButton').addEventListener('click', e => {
    document.getElementById('leaderboardFill').classList.remove('show')
    canvas.classList.add('show')
    requestAnimationFrame(loop)
    console.log('c')
    timerStartDate = new Date()
})
