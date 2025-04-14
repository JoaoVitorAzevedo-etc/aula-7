let saldo = 1000;
        let tentativasErradas = 0;
        let numeroCorreto = 6

        function atualizarSaldo() {
            document.getElementById("saldo").innerText = `Saldo: R$${saldo.toFixed(2)}`;
        }

        function reiniciarJogo() {
            numeroCorreto = Math.floor(Math.random() * 10) + 1;
            document.getElementById("guess").value = '';
            document.getElementById("result").innerText = '';
            tentativasErradas = 0;
        }

        function adivinhar() {
            const palpite = parseInt(document.getElementById("guess").value);
            if (isNaN(palpite) || palpite < 1 || palpite > 10) {
                document.getElementById("result").innerText = "Escolha um número entre 1 e 10.";
                return;
            }

            if (palpite === numeroCorreto) {
                saldo *= 2;
                document.getElementById("result").innerText = `Acertou! Seu saldo dobrou para R$${saldo.toFixed(2)}.`;
                reiniciarJogo();
            } else {
                tentativasErradas++;
                if (tentativasErradas >= 3) {
                    saldo = 0;
                    document.getElementById("result").innerText = "Você errou 3 vezes. Perdeu tudo!";
                    reiniciarJogo();
                } else {
                    document.getElementById("result").innerText = `Errou! Você tem ${3 - tentativasErradas} tentativas restantes.`;
                }
            }

            atualizarSaldo();
        }

        atualizarSaldo();