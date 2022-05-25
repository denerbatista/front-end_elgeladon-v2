const baseURL = "https://api-elgeladon-v2.onrender.com/paletas";
// const baseURL = "http://localhost:3000/paletas";

let paletas = [];

function modalErrorA() {
  const modalError = document.querySelector(".modalError");
  modalError.style.display = "block";
}

function modalErrorF() {
  const modalError = document.querySelector(".modalError");
  modalError.style.display = "none";
}

function receberMensagem(array) {
  modalErrorF();
  document.querySelector(".contentError").innerHTML = "";
  document.querySelector(".contentError").insertAdjacentHTML(
    "beforeend",
    `<h2 id="title-header-modalError">Atenção</h2>
    <p id="mensagemError"></p>
    <button class="default-button" onclick="modalErrorF()">Fechar</button>`
  );
  document.querySelector("#mensagemError").innerText = `${array.mensagem}`;
  modalErrorA();
  
  setTimeout(() => {
    modalErrorF();
  }, 5000);

  document.querySelector(".contentError").innerHTML = "";
  document.querySelector(".contentError").insertAdjacentHTML(
    "beforeend",
    ` <h2 id="title-header-modalError">Atenção</h2>
          <div id="loader">
            <div class="c-loader"></div>`
  );
}

async function findAllPaletas() {
  const response = await fetch(`${baseURL}/find-paletas`);

  paletas = [await response.json()];
  if (paletas[0].mensagem) {
    receberMensagem(paletas[0]);
  } else {
    document.querySelector("#paletaList").innerHTML = "";
    paletas[0].forEach(function (paleta) {
      document.querySelector("#paletaList").insertAdjacentHTML(
        "beforeend",
        `
      <div class="PaletaListaItem" id="PaletaListaItem_${paleta._id}"><div>
            <div class="PaletaListaItem__sabor">${paleta.sabor}</div>
            <div class="PaletaListaItem__preco">R$ ${paleta.preco}</div>
            <div class="PaletaListaItem__descricao">${paleta.descricao}</div>

            <div class="PaletaListaItem__acoes Acoes" id="button-editar-apagar">
              <button class="Acoes__editar btn" onclick="abrirModal('${paleta._id}')">Editar</button> 
              <button class="Acoes__apagar btn" onclick="abrirModalDelete('${paleta._id}')">Apagar</button> 
            </div>
        </div>
        
        <img class="PaletaListaItem__foto" src="${paleta.foto}" alt="Paleta de ${paleta.sabor}" />
    </div>
    `
      );
    });
  }
}

async function findPaletaById() {
  const sabor = document.querySelector("#saborPaleta").value;
  const paletaSelect = await paletas[0].find((elem) => elem.sabor === sabor);
  if (paletaSelect === undefined) {
    receberMensagem({ mensagem: "Paleta não encontrada!" });
  } else {
    const id = paletaSelect._id;
    const response = await fetch(`${baseURL}/find-paleta/${id}`);
    const paleta = await response.json();
    if (paleta.mensagem) {
      receberMensagem(paleta);
    } else {
      const paletaEscolhidaDiv = document.querySelector("#paletaEscolhida");

      paletaEscolhidaDiv.innerHTML = `
  <div class="PaletaCardItem" id="PaletaListaItem_${paleta._id}">
  <div>
      <div class="PaletaCardItem__sabor">${paleta.sabor}</div>
      <div class="PaletaCardItem__preco">R$ ${paleta.preco}</div>
      <div class="PaletaCardItem__descricao">${paleta.descricao}</div>
      
      <div class="PaletaListaItem__acoes Acoes button-editar-apagar">
          <button class="Acoes__editar btn" onclick="abrirModal('${paleta._id}')">Editar</button> 
          <button class="Acoes__apagar btn" onclick="abrirModalDelete('${paleta._id}')">Apagar</button> 
      </div>
  </div>
  <img class="PaletaCardItem__foto" src="${paleta.foto}" alt="Paleta de ${paleta.sabor}" />
  <div><a class="close-modal" onclick="fecharPaleta()">x</a><div/>
  </div>`;
    }
  }
}

function fecharPaleta() {
  const paletaSelectDiv = document.querySelector("#paletaEscolhida");
  const saborPaleta = document.querySelector("#saborPaleta");
  saborPaleta.value = "";
  paletaSelectDiv.innerHTML = "";
}

async function abrirModal(id = null) {
  if (id != null) {
    document.querySelector("#title-header-modal").innerText =
      "Atualizar uma Paleta";
    document.querySelector("#button-form-modal").innerText = "Atualizar";

    modalErrorA();

    const response = await fetch(`${baseURL}/find-paleta/${id}`);
    const paleta = await response.json();

    modalErrorF();

    document.querySelector("#sabor").value = paleta.sabor;
    document.querySelector("#preco").value = paleta.preco;
    document.querySelector("#descricao").value = paleta.descricao;
    document.querySelector("#foto").value = paleta.foto;
    document.querySelector("#id").value = paleta._id;
  } else {
    document.querySelector("#title-header-modal").innerText =
      "Cadastrar uma Paleta";
    document.querySelector("#button-form-modal").innerText = "Cadastrar";
  }

  document.querySelector("#overlay").style.display = "flex";
}

function fecharModal() {
  document.querySelector(".modal-overlay").style.display = "none";
  document.querySelector("#id").value = "";
  document.querySelector("#sabor").value = "";
  document.querySelector("#preco").value = "";
  document.querySelector("#descricao").value = "";
  document.querySelector("#foto").value = "";
}

async function createPaleta() {
  const id = document.querySelector("#id").value;
  const sabor = document.querySelector("#sabor").value;
  const preco = document.querySelector("#preco").value;
  const descricao = document.querySelector("#descricao").value;
  const foto = document.querySelector("#foto").value;
  const token = localStorage.getItem("token");

  const paleta = {
    sabor,
    descricao,
    foto,
    preco,
  };
  const modoEdicaoAtivado = id != "";
  const endpoint =
    baseURL +
    (modoEdicaoAtivado ? `/update/${id},${token}` : `/create/${token}`);

  fecharModal();
  modalErrorA();

  const response = await fetch(endpoint, {
    method: modoEdicaoAtivado ? "put" : "post",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
    body: JSON.stringify(paleta),
  });

  const novaPaleta = await response.json();

  modalErrorF();

  if (novaPaleta.mensagem) {
    receberMensagem(novaPaleta);
  } else {
    if (modoEdicaoAtivado) {
      findAllPaletas();
      const mensagem = { mensagem: "Paleta editada com sucesso!" };
      receberMensagem(mensagem);
    } else {
      findAllPaletas();
      const mensagem = { mensagem: "Paleta adicionada com sucesso!" };
      receberMensagem(mensagem);
    }
  }
}

function abrirModalDelete(id) {
  document.querySelector(".btns_delete").insertAdjacentHTML(
    "beforeend",
    `
    <button class="btn_delete_no btn_delete" onclick="fecharModalDelete()">
    Não
    </button>
    <button onclick="deletePaleta('${id}')" class="btn_delete_yes btn_delete">Sim</button>`
  );
  document.querySelector("#overlay-delete").style.display = "flex";
}

function fecharModalDelete() {
  document.querySelector(".btns_delete").innerHTML = "";
  document.querySelector("#overlay-delete").style.display = "none";
}

async function deletePaleta(id) {
  fecharModalDelete();
  modalErrorA();

  const token = localStorage.getItem("token");
  const response = await fetch(`${baseURL}/delete/${id},${token}`, {
    method: "delete",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
  });
  const result = await response.json();

  receberMensagem(result);
  findAllPaletas();
}

function abrirModalSeguranca() {
  document.querySelector("#overlay-seguranca").style.display = "flex";
}

function fecharModalSeguranca() {
  document.querySelector("#overlay-seguranca").style.display = "none";
  document.querySelector("#senhaSeguranca").value = "";
}

async function verificaSeguranca(resposta) {
  const cadeado = resposta;
  const verificador = cadeado == "Acesso Liberado";
  verificador
    ? (document.querySelector("#seguranca").src =
        "https://cdn-icons-png.flaticon.com/512/193/193220.png")
    : (document.querySelector("#seguranca").src =
        "https://cdn-icons-png.flaticon.com/512/1417/1417897.png");

  return verificador;
}

async function enviarSenha() {
  const senha = await document.querySelector("#senhaSeguranca").value;
  const token = localStorage.getItem("token");

  if (senha != "") {
    const response = await fetch(
      `${baseURL}/security/${senha},${Number(token)}`
    );

    const senhaR = await response.json();

    localStorage.setItem("token", `${Number(senhaR.token)}`);
    fecharModalSeguranca();
    verificaSeguranca(senhaR.mensagem);
    receberMensagem(senhaR);
  }
}

async function verificarUsuario() {
  const digitado = localStorage.getItem("token");
  const response = await fetch(`${baseURL}/securitycheck/${Number(digitado)}`);
  const verificador = await response.json();
  localStorage.setItem("token", `${Number(verificador.token)}`);
  alert(verificador.mensagem);
}

findAllPaletas();
