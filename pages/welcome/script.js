  console.log('chamou Welcome (dentro)');

var categoriesDefault = { 
  world: ["-- selecione --", "Local", "Objeto", "Fato histórico", "-- nenhum --"],
  characters: ["-- selecione --", "Principais", "Secundários", "-- nenhum --"],
  genders: ["-- selecione --", "Masculino", "Feminino", "N/A"],
  scenes: ["-- selecione --", "-- nenhum --"],
  timeline: ["-- selecione --", "-- nenhum --"],
  notes: ["-- selecione --", "-- nenhum --", "Ideias", "Pesquisas"]
};

$( "#dialog" ).dialog({
	autoOpen: false,
	width: 600,
	buttons: [
		{
			text: "Ok",
      id: "okBtn",
      disabled: false,
			click: async function() {
        await createNewProject();
        $( this ).dialog( "close" );
        pageChange('#dinamicPage', 'pages/dashboard/page.html', 'pages/dashboard/script.js')
			}
		},
		{
			text: "Cancel",
			click: function() {
        document.getElementById("projectName").value = "";
				$( this ).dialog( "close" );
			}
		}
	]
});
// Link to open the dialog
$( "#dialog-link" ).click(function( event ) {
	$( "#dialog" ).dialog( "open" );
  $( "#okBtn" ).addClass( "ui-button-disabled ui-state-disabled" );
  $( ".ui-icon-closethick" ).click(function( event ) {
    document.getElementById("projectName").value = "";
  })
});

$( "#dialog-import" ).dialog({
	autoOpen: false,
	width: 600,
	buttons: [
		{
			text: "Ok",
      id: "okBtnImport",
      disabled: false,
			click: async function() {
        await importNewProject();
        $( this ).dialog( "close" );
        pageChange('#dinamicPage', 'pages/welcome/page.html', 'pages/welcome/script.js')
			}
		},
		{
			text: "Cancel",
			click: function() {
				$( this ).dialog( "close" );
			}
		}
	]
});
// Link to open the dialog
$( "#dialog-link-import" ).click(function( event ) {
	$( "#dialog-import" ).dialog( "open" );
  $( "#okBtnImport" ).addClass( "ui-button-disabled ui-state-disabled" );
  $( ".ui-icon-closethick" ).click(function( event ) {
    document.getElementById("projectName").value = "";
  })
});

async function createNewProject() {
  const inputName = document.getElementById("projectName");
  const currentDate = new Date();
  const timeStamp = Date.now();
  const data = { world: [], characters: [], scenes: [], timeline: [], chapters: [], parts: [], notes: [] };
  const idNew = await db.projects.add(
    { title: inputName.value,
      subtitle: '',
      status: "novo",
      recent_edits: [],
      data: data,
      literary_genre: null,
      description: null,
      image_cover: null,
      created_at: currentDate,
      last_edit: currentDate,
      timestamp: timeStamp,
      id_world: 0,
      id_characters: 0,
      id_scenes: 0,
      id_timeline: 0,
      id_structure: 0,
      id_notes: 0,
      lastBackup: '',
      settings: categoriesDefault
    }).then();
  const updadeCurrent = await db.settings.update(1,{ currentproject: idNew });
  inputName.value = '';
  return updadeCurrent;
};

function handleInputFile() {
  const filename = document.getElementById('file-input-import');
  if (!filename.value.endsWith(".json")) {
    return alert("Selecione apenas arquivos terminados em '.json'!")
  };
  const file = filename.files[0]
  const reader = new FileReader();
  reader.readAsText(file);
  return new Promise((resolve, reject) => {
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result);
        resolve(json);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => {
      reject(reader.error);
    };
  });
};

function hasRequiredKeys(obj) {
  return ("title" in obj) && ("id" in obj) && ("data" in obj);
}

async function importNewProject() {
  const projectObj = await handleInputFile();
  const hasKeys = hasRequiredKeys(projectObj);
  if (!hasKeys) {
    return alert('Objeto não compatível')
  }
  const currentDate = new Date();
  delete projectObj.id
  projectObj.lastBackup = ''
  projectObj.last_edit = currentDate;
  projectObj.created_at = currentDate;
  await db.projects.add(projectObj)
}

function disableNavBar() {
  const navBarButtons = document.querySelectorAll(".navtrigger");
  navBarButtons.forEach( (buton) => {
    buton.style.display = 'none';
  })
}

async function setProjectAtual(id) {
  const result = await db.settings.update(1, {currentproject: id});
  pageChange('#dinamicPage', 'pages/dashboard/page.html', 'pages/dashboard/script.js');
  return result;
}

function getQtyCards(data) {
  const totalchar = data.characters.length;
  const totalworld = data.world.length;
  const totalscenes = data.scenes.length;
  const totalchapters = data.chapters.length;
  const totaltimeline = data.timeline.length;
  const totalnotes = data.notes.length;
  const result = totalchar + totalworld + totalscenes + totalchapters + totaltimeline + totalnotes;
  return result;
}

async function listProjects() {
  const result = await db.projects.orderBy('timestamp').desc();
  await result.each(function (project) {
      const qtyCards = getQtyCards(project.data)
      const dateEdit = convertDateBR(project.last_edit);
      const timeEdit = convertToTime(project.last_edit);
      $('#project-list').append(
        `
        <ul class="projectsList">
          <li class="projectsItens zoom">
          <a class="projectsName" onclick="setProjectAtual(${ project.id })">
          <img src="${ !project.image_cover ? 'assets/images/manuscript.jpeg' : project.image_cover }" class="coverImage"> 
              <div>
                <p class="projectTitle">${ project.title }</p>
                <p class="projectCreated"><span class="ui-icon ui-icon-calendar"></span>Modificado em: <strong>${ dateEdit }</strong> | <strong>${ timeEdit }</strong></p>
              </div>
              <span class="projectStatus"> ${ project.status } </span>
              <div>${ !project.literary_genre ? '' : project.literary_genre }</div>
              <div class="cards">
                <p class="projectTitle"><strong>${ qtyCards }</strong></p>
                <p class="projectCreated">Cartões</p>  
              </div>
          </a>
          </li>
        </ul>
        `
      );
    })
  changeStatusColor()
  return result
}
restoreBackground() 

$( document ).ready(function() {
  listProjects();
  validateNewCard("projectName", "#okBtn");
  validateNewCard("file-input-import", "#okBtnImport");
  disableNavBar();
});

document.getElementById('main-header').style.display = 'none';
