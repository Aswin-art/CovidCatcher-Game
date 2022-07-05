/**@type {HTMLCanvasElement} */

const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

canvas.width = 800
canvas.height = 600

function virusCollideWithBasket(virus, basket){
    return virus.position.y + virus.height > basket.position.y &&
        virus.position.y < basket.position.y + basket.height &&
        virus.position.x + virus.width > basket.position.x &&
        virus.position.x < basket.position.x + basket.width
}

function randomBetween(min, max){
    return Math.floor(Math.random() * ((max + 1) - min) + min)
}

class Virus{
    constructor(position, addSpeed){
        this.image = new Image()
        this.image.src = './assets/images/Enemy2.1.png'
        this.width = 100
        this.height = 100
        this.position = position

        this.addSpeed = addSpeed
        this.speed = 4
    }

    draw(ctx){
        ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
    }

    update(){
        // console.log(this.addSpeed)
        this.position.y += (this.speed + this.addSpeed)
    }
}

class Basket{
    constructor(){
        this.image = new Image()
        this.image.src = './assets/images/kisspng-picnic-baskets-computer-icons-clip-art-picnic-basket-free-business-icons-5ba3615ac7dc19.2137862415374339468186.png'
        this.width = 120
        this.height = 60
        this.position = {
            x: canvas.width / 2 - this.width / 2,
            y: canvas.height - this.height - 10
        }

        this.speed = 0
        this.maxSpeed = 8
    }

    moveLeft(){
        this.speed = -this.maxSpeed
    }

    moveRight(){
        this.speed = this.maxSpeed
    }

    stop(){
        this.speed = 0
    }

    draw(ctx){
        ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
    }

    update(){
        if(this.position.x + this.width > canvas.width){
            this.position.x = canvas.width - this.width
        }

        if(this.position.x < 0){
            this.position.x = 0
        }

        this.position.x += this.speed
    }
}

class EventHandler{
    constructor(game){
        document.addEventListener('keydown', e => {
            switch(e.key){
                case 'ArrowLeft':
                    game.basket.moveLeft()
                    break;
                case 'ArrowRight':
                    game.basket.moveRight()
                    break;
                default:
                    break;
            }
        })

        document.addEventListener('keyup', e => {
            switch(e.key){
                case 'ArrowLeft':
                    if(game.basket.speed < 0){
                        game.basket.stop()
                    }
                    break;
                case 'ArrowRight':
                    if(game.basket.speed > 0){
                        game.basket.stop()
                    }
                    break;
                default:
                    break;
            }
        })
    }
}

class Game{
    constructor(){
        this.score = 0
        this.addSpeed = 0
        this.reset()
    }
    
    reset(){
        this.time = 0
        this.viruses = []
        this.basket = new Basket()
        new EventHandler(this)
    }

    spawnVirus(){
        const position = {
            x: randomBetween(100, canvas.width - 150),
            y: randomBetween(-200, -50)
        }

        if(this.time > 1 && this.time % 10 == 0){
            this.addSpeed++
        }
    
        return new Virus(position, this.addSpeed)
    }

    drawConfig(ctx){
        ctx.fillStyle = 'black'
        ctx.font = '15px Arial'
        ctx.fillText('Score: ' + this.score, 10, 20)
        ctx.fillText('Name: ' + localStorage.getItem('name'), 10, 35)
        ctx.fillText('Time: ' + this.time, 10, 50)
    }

    draw(ctx){
        [...this.viruses, this.basket].forEach(object => object.draw(ctx))
        // this.basket.draw(ctx)
        // this.viruses.draw(ctx)
        this.drawConfig(ctx)
    }
    
    update(deltatime, timer){
        [...this.viruses, this.basket].forEach(object => object.update())
        // this.basket.update()
        // this.viruses.update()

        this.time = timer
        
        virusInterval += deltatime
        if(virusInterval > nextVirus){
            this.viruses.push(this.spawnVirus())
            virusInterval = 0
        }

        this.viruses.forEach((virus, index) => {
            if(virus.position.y > canvas.height){
                this.viruses.splice(index, 1)
            }
        })

        this.viruses.forEach((virus, index) => {
            if(virusCollideWithBasket(virus, this.basket)){
                this.viruses.splice(index, 1)
                this.score++
                const sound = new Audio()
                sound.src = './assets/sounds/coinsplash.ogg'
                sound.play()
            }
        })
    }
}

const game = new Game()

let gameover = false
let timer = 0
let lasttime = 0
let virusInterval = 0
let nextVirus = 1000
localStorage.removeItem('name')

function animate(timestamp = 0){
    if(!gameover && timer < 60){
        let deltatime = timestamp - lasttime
        lasttime = timestamp
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        game.update(deltatime, timer)
        game.draw(ctx)
        requestAnimationFrame(animate)
    }else{
        drawGameOver()
    }
}

function play(){
    if(localStorage.getItem('name')){
        document.querySelector('.game').style.display = 'flex'
        document.querySelector('.menu').style.display = 'none'
        setInterval(() => {
            timer++
        }, 1000)
        animate()
    }
}

function drawGameOver(){
    document.querySelector('.gameover').style.display = 'flex'
    document.querySelector('.game').style.display = 'none'
}

const input_name = document.getElementById('input_name')
input_name.addEventListener('change', () => {
    localStorage.setItem('name', input_name.value)
})

document.getElementById('submit').addEventListener('click', play)