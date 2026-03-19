document.addEventListener("DOMContentLoaded", () => {
    // SELETORES ATUALIZADOS
    const botaoJogar = document.querySelector('.jogar');
    const containerPaiInicial = document.querySelector('.pai');
    const telaOriginal = document.querySelector('.tela');
    const goku = document.querySelector('.goku');
    const container = document.querySelector('.container');
    const nuvens = document.querySelectorAll('.nuvem');
    const botaoReiniciar = document.querySelector('.jogarNov');
    const telaGameOver = document.querySelector('.desaparece');
    const cauda = document.querySelector('.cauda');
    const scoreElement = document.querySelector('.score');
    const creditos = document.querySelector('.creditos');
    const redes = document.querySelector('.redes');
    const icones = document.querySelectorAll('.icones');

    let gokuY = 200;
    const velocidadeGoku = 8;

    let descendo = false;
    let subindo = false;
    let jogoAtivo = false;
    let dificuldade = 0.3;
    let gameLoopId = null;
    let intervaloDificuldade = null;
    let pontos = 0;

    // SONS
    const click = new Audio('Sons/click.mp3');
    const gameOverMusic = new Audio('Sons/gameOver.mp3');
    const musica = new Audio('Sons/music.mp3');
    musica.loop = true;
    const somPonto = new Audio('Sons/ponto.mp3');
    const somIcone = new Audio('Sons/compartilhar.mp3');

    // Eventos nos ícones das redes sociais
    icones.forEach(icone => {
        icone.addEventListener('click', () => {
            somIcone.currentTime = 0;
            somIcone.play();
        });
    });

    // EVENTO DE INICIAR JOGO
    botaoJogar.addEventListener('click', () => {
        click.play();
        
        // Esconde os elementos da tela inicial
        telaOriginal.style.display = 'none';
        containerPaiInicial.style.display = 'none';
        creditos.style.display = 'none';
        redes.style.display = 'none';
        
        if (telaGameOver) telaGameOver.style.display = 'none';

        jogoAtivo = true;
        musica.play();
        iniciarJogo();
    });

    // EVENTO DE REINICIAR
    botaoReiniciar.addEventListener('click', () => {
        window.location.reload();
    });

    // CONTROLES
    document.addEventListener('keydown', (event) => {
        if (!jogoAtivo) return;
        if (event.code === 'KeyS' || event.code === 'ArrowDown') descendo = true;
        if (event.code === 'KeyW' || event.code === 'ArrowUp') subindo = true;
    });

    document.addEventListener('keyup', (event) => {
        if (event.code === 'KeyS' || event.code === 'ArrowDown') descendo = false;
        if (event.code === 'KeyW' || event.code === 'ArrowUp') subindo = false;
    });

    const GOKU_PADDING_X = 25;
    const GOKU_PADDING_Y = 15;

    function verificarColisao(gokuRect, objetoRect) {
        const hitboxGoku = {
            top: gokuRect.top + GOKU_PADDING_Y,
            bottom: gokuRect.bottom - GOKU_PADDING_Y,
            left: gokuRect.left + GOKU_PADDING_X,
            right: gokuRect.right - GOKU_PADDING_X
        };

        return (
            hitboxGoku.left < objetoRect.right &&
            hitboxGoku.right > objetoRect.left &&
            hitboxGoku.top < objetoRect.bottom &&
            hitboxGoku.bottom > objetoRect.top
        );
    }

    function gameLoop() {
        if (!jogoAtivo) return;

        const limiteBaixo = container.clientHeight - goku.clientHeight;

        if (descendo && gokuY < limiteBaixo) gokuY += velocidadeGoku;
        if (subindo && gokuY > 0) gokuY -= velocidadeGoku;

        goku.style.top = `${gokuY}px`;
        if (cauda) cauda.style.top = `${gokuY}px`;

        const gokuRect = goku.getBoundingClientRect();

        nuvens.forEach(nuvem => {
            const nuvemRect = nuvem.getBoundingClientRect();

            if (verificarColisao(gokuRect, nuvemRect)) {
                gameOver();
            }

            if (nuvemRect.right < gokuRect.left && nuvem.dataset.passou !== "true") {
                pontos++;
                scoreElement.textContent = `Score: ${pontos}`;
                nuvem.dataset.passou = "true";
                
                somPonto.currentTime = 0;
                somPonto.play();
            }
        });

        gameLoopId = requestAnimationFrame(gameLoop);
    }

    function iniciarJogo() {
        if (gameLoopId) cancelAnimationFrame(gameLoopId);
        if (intervaloDificuldade) clearInterval(intervaloDificuldade);

        pontos = 0;
        if (scoreElement) scoreElement.textContent = 'Score: 0';

        goku.style.left = '255px';
        if (cauda) cauda.style.left = '0px';

        gameLoop();

        intervaloDificuldade = setInterval(() => {
            if (jogoAtivo && dificuldade < 0.8) {
                dificuldade += 0.05;
            }
        }, 5000);

        nuvens.forEach(nuvem => {
            configurarNuvem(nuvem);
            nuvem.addEventListener('animationiteration', () => {
                if (jogoAtivo) {
                    configurarNuvem(nuvem);
                }
            });
        });
    }

    function gameOver() {
        if (!jogoAtivo) return;
        jogoAtivo = false;

        const background = document.querySelector('.background');
        if (background) background.style.animationPlayState = 'paused';

        nuvens.forEach(nuvem => {
            nuvem.style.animationPlayState = 'paused';
        });

        musica.pause();
        gameOverMusic.play();

        if (intervaloDificuldade) {
            clearInterval(intervaloDificuldade);
            intervaloDificuldade = null;
        }

        if (gameLoopId) {
            cancelAnimationFrame(gameLoopId);
            gameLoopId = null;
        }

        const scoreFinal = document.querySelector('.score-final');

        if (telaGameOver) {
            telaGameOver.style.display = 'flex';
            if (scoreFinal) {
                scoreFinal.textContent = `Você fez ${pontos} pontos!`;
            }
        }
    }

    function configurarNuvem(nuvem) {
        if (!jogoAtivo) return;

        nuvem.dataset.passou = "false";
        const containerRect = container.getBoundingClientRect();
        const gokuRect = goku.getBoundingClientRect();

        let altura;
        let tentativas = 0;
        let modoPerigoso = Math.random() < dificuldade;
        let duracaoBase = Math.random() * 4 + 6;
        let duracao = duracaoBase * (1 - dificuldade * 0.4);

        nuvem.style.animation = 'none';
        void nuvem.offsetHeight;
        nuvem.style.animation = `nuvens-animate ${duracao}s linear infinite`;
        nuvem.style.animationPlayState = 'running';

        if (modoPerigoso) {
            altura = Math.random() * (containerRect.height - 60);
        } else {
            do {
                altura = Math.random() * (containerRect.height - 60);
                tentativas++;
            } while (
                altura > (gokuRect.top - containerRect.top - 60) &&
                altura < (gokuRect.bottom - containerRect.top + 60) &&
                tentativas < 10
            );
        }

        altura = Math.max(0, Math.min(altura, containerRect.height - 60));
        nuvem.style.top = altura + 'px';
        nuvem.style.left = '100%';
    }
});

