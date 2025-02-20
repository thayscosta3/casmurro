console.log('chamou dashboard');
document.getElementById('main-header').style.display = 'block';

async function recoverProjectInfos() {
  const projectActual = await db.settings.toArray();
  const idProject = await projectActual[0].currentproject;
  const projectData = await db.projects.get(idProject);
  addInfosHtml(projectData);
};
recoverProjectInfos();

function getStatusColor(status) {
  switch (status) {
    case "em andamento":
      return "#437895";
    case "pausado":
      return "chocolate";
    case "concluído":
      return "green";
    default:
      return "gray";
  }
}

function changeLabelColor(color) {
  const colorResult = getStatusColor(color);
  const sheet = document.styleSheets[0];
  sheet.insertRule(`#labelRibbon { background-color: ${colorResult}; }`, sheet.cssRules.length);
  sheet.insertRule(`#labelRibbon:before { background-color: ${colorResult}; }`, sheet.cssRules.length);
  sheet.insertRule(`#labelRibbon:after { background-color: ${colorResult}; }`, sheet.cssRules.length);
}

// =====================================================
var totalCards = 0;

function changeBackgroundImages(images, id) {
  if (!images || images.length === 0) {
    return;
  }
  const container = document.getElementById(id);
  let backgroundImageUrls = '';
  for (let i = 0; i < images.length; i++) {
    backgroundImageUrls += `url(${images[i]})`;
    if (i !== images.length - 1) {
      backgroundImageUrls += ', ';
    }
  }
  return container.style.backgroundImage = backgroundImageUrls;
}

function extractImageCards(array) {
  const imageCards = [];
  for (let i = 0; i < array.length; i++) {
    const { image_card_mini } = array[i];
    if (image_card_mini) {
      imageCards.push(image_card_mini);
    }
  }
  return imageCards;
}

function getDashCardInfos(data, idQtd, idImg) {
  const qtdWorld = data.length;
  totalCards += qtdWorld
  document.getElementById(idQtd).innerText = qtdWorld;
  const imgsMini = extractImageCards(data)
  return changeBackgroundImages(imgsMini, idImg)
}

// =====================================================

function addBackgroundProject(time, placeID) {
  if (time) {
    const mainDiv = document.getElementById(placeID);
    const resultImg = `url('${time}')`
    mainDiv.style.backgroundImage = resultImg;
    mainDiv.style.backgroundRepeat = "no-repeat";
    mainDiv.style.backgroundSize = "cover";
    mainDiv.style.width = "100%";
    mainDiv.style.backgroundColor  = "#202024";
  } else {
    const mainDiv = document.getElementById(placeID);
    mainDiv.style.backgroundImage = '';
    mainDiv.classList.remove('sombras');
  };
};

function diasDecorridos(data) {
  const hoje = new Date();
  const dataInicio = new Date(data);
  const diffTime = dataInicio - hoje;
  if (diffTime > 0) {
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { remain: `faltam ${diffDays} dias para o início` };
  } else {
    const diffDays = Math.ceil(Math.abs(diffTime) / (1000 * 60 * 60 * 24));
    return { remain: `${diffDays} dias decorridos` };
  }
}

function calcularProgresso(startDate, finishDate) {
  if (!startDate && !finishDate) {
    return { remain: `sem dadas` }
  }
  if (!finishDate) {
    return diasDecorridos(startDate);
  }
  const ONE_DAY_IN_MS = 86400000; // quantidade de milissegundos em um dia
  const startDateMs = new Date(startDate).getTime();
  const finishDateMs = new Date(finishDate).getTime();
  const totalDurationMs = finishDateMs - startDateMs;
  const elapsedMs = Date.now() - startDateMs;
  const percentageElapsed = (elapsedMs / totalDurationMs) * 100;
  const percentageElapsedRounded = Math.round(percentageElapsed * 100) / 100;
  const daysRemaining = Math.ceil((finishDateMs - Date.now()) / ONE_DAY_IN_MS);
  let finalRemain = '';
  if (daysRemaining <= 0) {
    finalRemain = 'Prazo encerrado'
  } else if (daysRemaining === 1) {
    finalRemain = 'Último dia'
  } else {
    finalRemain = daysRemaining + ' dias restantes'
  }
  return {
    porcent: percentageElapsedRounded + '%',
    remain: finalRemain
  };
};

function addInfosHtml(data) {
  document.getElementById("project-title-dashboard").innerText = data.title
  document.getElementById("project-subtitle").innerHTML = `<h2>${ data.subtitle }</h2>` 
  data.showSubtitle? document.getElementById("project-subtitle").style.display = 'block': '';
  document.getElementById("project-type-dashboard").innerText = data.literary_genre
  const label = document.getElementById("project-status-dashboard");
  label.innerText = data.status;
  label.style.fontSize = '1rem';
  changeLabelColor(data.status);
  document.getElementById("project-resume").innerText = data.description;

  // Progressbar section
  data.deadline? document.getElementById("sectionDeadline").style.display = 'block': '';
  const resultTime = calcularProgresso(data.startDate, data.finishDate);
  const startDateBR = convertDatePT_BR(data.startDate);
  document.getElementById('startDate').innerText = data.startDate ? startDateBR : 'sem dada';
  const finishDateBR = convertDatePT_BR(data.finishDate)
  document.getElementById('finishDate').innerText = data.finishDate ? finishDateBR : 'sem prazo';
  document.getElementById('daysRemaining').innerText = resultTime.remain;
  document.getElementById('progressBarColor').style.width = resultTime.porcent;

  getDashCardInfos(data.data.world, 'cardsDashboard_mundo_qtd', 'cardsDashboard_mundo');
  getDashCardInfos(data.data.characters, 'cardsDashboard_characters_qtd', 'cardsDashboard_characters');
  getDashCardInfos(data.data.scenes, 'cardsDashboard_scenes_qtd', 'cardsDashboard_scenes');
  getDashCardInfos(data.data.chapters, 'cardsDashboard_structure_qtd', 'cardsDashboard_structure');
  getDashCardInfos(data.data.timeline, 'cardsDashboard_timeline_qtd', 'cardsDashboard_timeline');
  getDashCardInfos(data.data.notes, 'cardsDashboard_notes_qtd', 'cardsDashboard_notes');

  document.getElementById('totalcards').innerText = totalCards;

  addBackgroundProject(data.image_cover, "Dashboard-content")
};

function returnDomainName(table) {
  switch (table) {
    case 'characters':
      return {name: 'Personagem', img: "../../assets/icons/characters.png"}
    case 'world':
      return {name: 'Mundo', img: "../../assets/icons/world.png"}
    case 'scenes':
      return {name: 'Cena', img: "../../assets/icons/scenes.png"}
    case 'chapters':
      return {name: 'Capítulo', img: "../../assets/icons/structure.png"}
    case 'parts':
      return {name: 'Parte', img: "../../assets/icons/structure.png"}
    case 'timeline':
      return {name: 'Timeline', img: "../../assets/icons/timeline.png"}
    case 'notes':
      return {name: 'Notas', img: "../../assets/icons/notes.png"}
    default:
      break;
  }
};

function returnPageName(table) {
  switch (table) {
    case 'characters':
      return {pagename: 'personagens', detailPage: 'detailCharacter'}
    case 'world':
      return {pagename: 'mundo', detailPage: 'world'};
    case 'scenes':
      return {pagename: 'cenas', detailPage: 'detailScene'};
    case 'chapters':
      return {pagename: 'estrutura', detailPage: 'detailChapter'}
    case 'parts':
      return {pagename: 'estrutura', detailPage: 'detailPart'}
    case 'timeline':
      return {pagename: 'timeline', detailPage: 'detailTimeline'}
    case 'notes':
      return {pagename: 'notas', detailPage: 'detailNote'}
    default:
      break;
  }
};

async function restorelastEditCards() {
  const project = await getCurrentProject();
  if (project.recent_edits.length === 0) {
    return $('#lastCards').append("<div><p>No momento não existem cartões</p></div>")
  }
  project.recent_edits.reverse().forEach( (ele, i) => {
    const icon = returnDomainName(ele.table)
    const page = returnPageName(ele.table)
    const cardItem = project.data[ele.table].filter( (item) => item.id === ele.id)
    return $('#lastCards').append(
      `
      <div style="margin-top: 5px">
        <div class="imgLastEditItem">
          <img src=${icon.img} style='width: 25px;'>
        </div>
        <div>
          ${cardItem[0].category? cardItem[0].category : icon.name}
          <a class="lastEditTitle" onclick="loadpageDetail('${page.pagename}', '${ele.table === 'parts' ? 'project-list' : ele.id}', '${cardItem[0].category === 'Listas' ? 'detailList' : page.detailPage}')">
            <div onclick="setCurrentCard('${ ele.table }', ${ ele.id })">
            ${cardItem[0].title}
            </div>
          </a>
        </div>
      </div>
      <div class="dashboard-divisor2"></div>
      `
    );
  })
};
restorelastEditCards();
calcularTempoPassado();
