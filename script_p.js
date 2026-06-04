const PI = 3.14;
let animacaoPenduloId = null;
let geometriaPenduloAtual = null;

function rolarParaFiguraDoProblema() {
  const figura = document.getElementById("figura-problema");

  if (!figura) {
    return;
  }

  figura.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}


function interpolar(valorInicial, valorFinal, progresso) {
  return valorInicial + (valorFinal - valorInicial) * progresso;
}

function atualizarPenduloAnimado(x, y) {
  const cordaAnimada = document.getElementById("pendulo-corda-animada");
  const bolaAnimada = document.getElementById("pendulo-bola-animada");

  cordaAnimada.setAttribute("x2", x.toFixed(2));
  cordaAnimada.setAttribute("y2", y.toFixed(2));
  bolaAnimada.setAttribute("cx", x.toFixed(2));
  bolaAnimada.setAttribute("cy", y.toFixed(2));
}

function resetarAnimacaoPendulo() {
  if (animacaoPenduloId) {
    cancelAnimationFrame(animacaoPenduloId);
    animacaoPenduloId = null;
  }

  const camadaAnimacao = document.getElementById("pendulo-animacao");
  const gabarito = document.getElementById("pendulo-gabarito");

  camadaAnimacao.classList.remove("is-visible");
  gabarito.classList.remove("is-visible");

  if (geometriaPenduloAtual) {
    atualizarPenduloAnimado(geometriaPenduloAtual.direita.x, geometriaPenduloAtual.direita.y);
  }
}

function mostrarGabaritoNaImagem(trajetoriaTotal) {
  const gabarito = document.getElementById("pendulo-gabarito");
  const fundoGabarito = document.getElementById("pendulo-gabarito-fundo");
  const textoGabarito = document.getElementById("pendulo-gabarito-texto");
  const yMaisBaixo = geometriaPenduloAtual
    ? Math.max(geometriaPenduloAtual.esquerda.y, geometriaPenduloAtual.direita.y)
    : 278;
  const yFundo = Math.min(yMaisBaixo + 44, 324);
  const yTexto = yFundo + 18;

  fundoGabarito.setAttribute("y", yFundo.toFixed(2));
  textoGabarito.setAttribute("y", yTexto.toFixed(2));
  textoGabarito.textContent = `1 periodo = ${trajetoriaTotal.toFixed(2).replace(".", ",")} cm`;
  gabarito.classList.add("is-visible");
}

function animarPeriodoPendulo(aoConcluir) {
  if (!geometriaPenduloAtual) {
    if (typeof aoConcluir === "function") {
      aoConcluir();
    }
    return;
  }

  resetarAnimacaoPendulo();

  const camadaAnimacao = document.getElementById("pendulo-animacao");
  const trajetoriaPeriodo = document.getElementById("pendulo-trajetoria-periodo");
  const duracao = 2600;
  const anguloInicial = 90 + geometriaPenduloAtual.semiAngulo;
  const anguloFinal = 90 - geometriaPenduloAtual.semiAngulo;
  const inicio = performance.now();

  trajetoriaPeriodo.setAttribute(
    "d",
    criarArcoSvg(
      geometriaPenduloAtual.pivoX,
      geometriaPenduloAtual.pivoY,
      geometriaPenduloAtual.raioVisual,
      anguloInicial,
      anguloFinal
    )
  );

  camadaAnimacao.classList.add("is-visible");

  function quadro(agora) {
    const progresso = Math.min((agora - inicio) / duracao, 1);
    const idaEVolta = progresso <= 0.5 ? progresso * 2 : (progresso - 0.5) * 2;
    const anguloAtual = progresso <= 0.5
      ? interpolar(anguloInicial, anguloFinal, idaEVolta)
      : interpolar(anguloFinal, anguloInicial, idaEVolta);
    const posicaoAtual = polarParaCartesiano(
      geometriaPenduloAtual.pivoX,
      geometriaPenduloAtual.pivoY,
      geometriaPenduloAtual.raioVisual,
      anguloAtual
    );

    atualizarPenduloAnimado(posicaoAtual.x, posicaoAtual.y);

    if (progresso < 1) {
      animacaoPenduloId = requestAnimationFrame(quadro);
      return;
    }

    animacaoPenduloId = null;

    if (typeof aoConcluir === "function") {
      aoConcluir();
    }
  }

  animacaoPenduloId = requestAnimationFrame(quadro);
}

function polarParaCartesiano(cx, cy, raio, anguloGraus) {
  const anguloRadianos = (anguloGraus * Math.PI) / 180;

  return {
    x: cx + raio * Math.cos(anguloRadianos),
    y: cy + raio * Math.sin(anguloRadianos),
  };
}

function criarArcoSvg(cx, cy, raio, anguloInicial, anguloFinal) {
  const inicio = polarParaCartesiano(cx, cy, raio, anguloInicial);
  const fim = polarParaCartesiano(cx, cy, raio, anguloFinal);
  const arcoMaior = Math.abs(anguloFinal - anguloInicial) > 180 ? 1 : 0;

  return `M ${inicio.x.toFixed(2)} ${inicio.y.toFixed(2)} A ${raio.toFixed(2)} ${raio.toFixed(2)} 0 ${arcoMaior} 1 ${fim.x.toFixed(2)} ${fim.y.toFixed(2)}`;
}

function atualizarIlustracaoPendulo(comprimento, angulo) {
  const pivoX = 130;
  const pivoY = 46;
  const raioVisual = Math.max(122, Math.min(158, comprimento * 8.6));
  const semiAngulo = Math.max(6, Math.min(angulo / 2, 84));

  const esquerda = polarParaCartesiano(pivoX, pivoY, raioVisual, 90 + semiAngulo);
  const direita = polarParaCartesiano(pivoX, pivoY, raioVisual, 90 - semiAngulo);

  const cordaEsquerda = document.getElementById("pendulo-corda-esquerda");
  const cordaDireita = document.getElementById("pendulo-corda-direita");
  const bolaEsquerda = document.getElementById("pendulo-bola-esquerda");
  const bolaDireita = document.getElementById("pendulo-bola-direita");
  const labelA = document.getElementById("pendulo-label-a");
  const labelB = document.getElementById("pendulo-label-b");
  const arcoBase = document.getElementById("pendulo-arco-base");
  const arcoAngulo = document.getElementById("pendulo-arco-angulo");
  const eixoCentral = document.getElementById("pendulo-eixo-central");
  const medidaGuia = document.getElementById("pendulo-medida-guia");
  const textoAngulo = document.getElementById("pendulo-angulo-texto");
  const textoComprimento = document.getElementById("pendulo-comprimento-path-texto");

  cordaEsquerda.setAttribute("x2", esquerda.x.toFixed(2));
  cordaEsquerda.setAttribute("y2", esquerda.y.toFixed(2));
  cordaDireita.setAttribute("x2", direita.x.toFixed(2));
  cordaDireita.setAttribute("y2", direita.y.toFixed(2));

  bolaEsquerda.setAttribute("cx", esquerda.x.toFixed(2));
  bolaEsquerda.setAttribute("cy", esquerda.y.toFixed(2));
  bolaDireita.setAttribute("cx", direita.x.toFixed(2));
  bolaDireita.setAttribute("cy", direita.y.toFixed(2));

  labelA.setAttribute("x", (esquerda.x - 16).toFixed(2));
  labelA.setAttribute("y", (esquerda.y + 26).toFixed(2));
  labelB.setAttribute("x", (direita.x + 10).toFixed(2));
  labelB.setAttribute("y", (direita.y + 26).toFixed(2));

  eixoCentral.setAttribute("x2", pivoX.toString());
  eixoCentral.setAttribute("y2", (pivoY + raioVisual).toFixed(2));

  arcoBase.setAttribute("d", criarArcoSvg(pivoX, pivoY, raioVisual - 22, 90 + semiAngulo, 90 - semiAngulo));
  arcoAngulo.setAttribute("d", criarArcoSvg(pivoX, pivoY, 40, 90 + semiAngulo, 90 - semiAngulo));

  const guiaInicioX = pivoX + 10;
  const guiaInicioY = pivoY + 14;
  const guiaFimX = direita.x + 18;
  const guiaFimY = direita.y - 16;
  const guiaControleX = (guiaInicioX + guiaFimX) / 2 + 8;
  const guiaControleY = (guiaInicioY + guiaFimY) / 2 - 4;

  medidaGuia.setAttribute(
    "d",
    `M ${guiaInicioX.toFixed(2)} ${guiaInicioY.toFixed(2)} Q ${guiaControleX.toFixed(2)} ${guiaControleY.toFixed(2)} ${guiaFimX.toFixed(2)} ${guiaFimY.toFixed(2)}`
  );

  textoAngulo.textContent = `${angulo}°`;
  textoAngulo.setAttribute("x", pivoX.toString());
  textoAngulo.setAttribute("y", (pivoY + 48).toString());

  textoComprimento.textContent = `${comprimento} cm`;

  geometriaPenduloAtual = {
    pivoX,
    pivoY,
    raioVisual,
    semiAngulo,
    esquerda,
    direita,
  };

  atualizarPenduloAnimado(direita.x, direita.y);
}

function calcularTrajetoriaTotal(comprimento, angulo) {
  const arcoIda = (angulo / 360) * 2 * PI * comprimento;
  const trajetoriaTotal = 2 * arcoIda;

  return trajetoriaTotal;
}

function atualizarProblema() {
  const comprimento = Number(document.getElementById("comprimento").value);
  const angulo = Number(document.getElementById("angulo").value);

  const enunciado = document.getElementById("enunciado");

  enunciado.innerHTML = `
    Um pêndulo de <strong>${comprimento} cm</strong> de comprimento oscila entre A e B,
    descrevendo um ângulo de <strong>${angulo}°</strong>.
    Sabendo que uma oscilação completa corresponde ao movimento de uma extremidade até a outra
    e ao retorno à posição inicial, determine o comprimento total da trajetória descrita
    pela extremidade do pêndulo.
    <br><br>
    Use <strong>π = 3,14</strong>.
  `;

  atualizarIlustracaoPendulo(comprimento, angulo);
  limparCampos();
}

function sortearProblema() {
  const comprimentosPossiveis = [10, 12, 15, 18, 20, 24, 30];
  const angulosPossiveis = [10, 12, 15, 20, 24, 30, 36, 45, 60];

  const comprimentoSorteado = comprimentosPossiveis[
    Math.floor(Math.random() * comprimentosPossiveis.length)
  ];

  const anguloSorteado = angulosPossiveis[
    Math.floor(Math.random() * angulosPossiveis.length)
  ];

  document.getElementById("comprimento").value = comprimentoSorteado;
  document.getElementById("angulo").value = anguloSorteado;

  atualizarProblema();
}

function verificarResposta() {
  const comprimento = Number(document.getElementById("comprimento").value);
  const angulo = Number(document.getElementById("angulo").value);
  const respostaUsuario = Number(document.getElementById("resposta").value);

  const feedback = document.getElementById("feedback");

  if (!respostaUsuario) {
    feedback.style.display = "block";
    feedback.innerHTML = "Digite uma resposta antes de verificar.";
    return;
  }

  const respostaCorreta = calcularTrajetoriaTotal(comprimento, angulo);
  animarPeriodoPendulo(() => mostrarGabaritoNaImagem(respostaCorreta));
  setTimeout(rolarParaFiguraDoProblema, 120);

  const diferenca = Math.abs(respostaUsuario - respostaCorreta);

  feedback.style.display = "block";

  if (diferenca <= 0.1) {
    feedback.innerHTML = `
      ✅ Muito bem! Sua resposta está correta.
      <br>
      O comprimento total da trajetória é aproximadamente
      <strong>${respostaCorreta.toFixed(2)} cm</strong>.
    `;
  } else {
    feedback.innerHTML = `
      ❌ Ainda não está correto.
      <br>
      Sua resposta foi <strong>${respostaUsuario.toFixed(2)} cm</strong>.
      <br>
      Tente novamente ou veja uma dica.
    `;
  }
}

function mostrarDica1() {
  const dicas = document.getElementById("dicas");

  dicas.style.display = "block";

  dicas.innerHTML = `
    <strong>Dica 1:</strong>
    A extremidade do pêndulo descreve um arco de circunferência.
    O raio dessa circunferência é o próprio comprimento do pêndulo.
  `;
}

function mostrarDica2() {
  const dicas = document.getElementById("dicas");

  dicas.style.display = "block";

  dicas.innerHTML = `
    <strong>Dica 2:</strong>
    Primeiro calcule o arco de ida usando:
    <br><br>
    <strong>arco = (ângulo / 360) × 2 × π × raio</strong>
    <br><br>
    Depois lembre que a oscilação completa considera ida e volta.
  `;
}

function mostrarResolucao() {
  const comprimento = Number(document.getElementById("comprimento").value);
  const angulo = Number(document.getElementById("angulo").value);

  const arcoIda = (angulo / 360) * 2 * PI * comprimento;
  const trajetoriaTotal = calcularTrajetoriaTotal(comprimento, angulo);

  const resolucao = document.getElementById("resolucao");

  resolucao.style.display = "block";

  resolucao.innerHTML = `
    <strong>Resolução:</strong>
    <br><br>

    O comprimento de um arco é calculado por:
    <br><br>

    <strong>C = (θ / 360) × 2πr</strong>
    <br><br>

    Substituindo os valores:
    <br><br>

    <strong>C = (${angulo} / 360) × 2 × 3,14 × ${comprimento}</strong>
    <br><br>

    <strong>C = ${arcoIda.toFixed(2)} cm</strong>
    <br><br>

    Esse é o percurso de uma extremidade até a outra.
    Como a oscilação completa considera ida e volta:
    <br><br>

    <strong>Trajetória total = 2 × ${arcoIda.toFixed(2)}</strong>
    <br><br>

    <strong>Trajetória total = ${trajetoriaTotal.toFixed(2)} cm</strong>
  `;

  animarPeriodoPendulo(() => mostrarGabaritoNaImagem(trajetoriaTotal));
  setTimeout(rolarParaFiguraDoProblema, 120);
}

function limparCampos() {
  resetarAnimacaoPendulo();
  document.getElementById("resposta").value = "";

  document.getElementById("feedback").style.display = "none";
  document.getElementById("dicas").style.display = "none";
  document.getElementById("resolucao").style.display = "none";

  document.getElementById("feedback").innerHTML = "";
  document.getElementById("dicas").innerHTML = "";
  document.getElementById("resolucao").innerHTML = "";
}

atualizarProblema();