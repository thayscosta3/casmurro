async function restoreProjectData() {
  const project = await db.settings.get(1);
  const projectID = project.currentproject;
  const projectData = await db.projects.get(projectID);
  const dateConverted = convertDateBR(projectData.created_at);
  const date = convertDateUS(dateConverted);
  Object.keys(projectData).forEach(key => {
    const result = document.getElementById(key);
    if (key === 'last_edit') {
      return null
    } if (key === 'deadline' && projectData[key] ) {
      const deadLineChk = document.getElementById('deadline');
      deadLineChk.checked = true;
    }  if (key === 'showSubtitle' && projectData[key] ) {
      const subtitleChk = document.getElementById('showSubtitle');
      const subtitleDiv = document.getElementById('subtitleDiv');
      subtitleDiv.style.display = 'block';
      subtitleChk.checked = true;
    } if (result) {
      return result.value = projectData[key];
    } 
  })
  resumeHeight("description")
}
restoreProjectData()

var elementsArray = document.querySelectorAll(".projectInputForm");

elementsArray.forEach(async function(elem) {
  const project = await db.settings.get(1);
  const projectID = project.currentproject;
    elem.addEventListener("input", async () => {
      const obj = { oldKey: elem.value };
      obj[elem.id] = obj['oldKey'];
      delete obj['oldKey'];
      if (Object.keys(obj)[0] === "created_at") {
        const dateObject = new Date(obj.created_at); // cria data
        const tomorrow = new Date(dateObject);
        const dateSum1 = tomorrow.setDate(dateObject.getDate()+1);
        const correctDate = new Date(dateSum1)
        obj['created_at'] = correctDate;
        db.projects.update(projectID, obj);
      } else {
        db.projects.update(projectID, obj);
      }
    });
});

async function deleteProject() {
  const project = await db.settings.get(1);
  const projectID = project.currentproject;
  await db.settings.where({id: 1}).modify({currentproject: 0}) 
  return await db.projects.delete(projectID);
}

$( "#dialog-delete-project" ).dialog({
	autoOpen: false,
	width: 500,
	buttons: [
		{
			text: "Ok",
			click: async function() {
        await deleteProject();
        $( this ).dialog( "close" );
        loadpage('welcome');
			}
		},
		{
			text: "Cancel",
      id: "btnTwo",
			click: function() {
				$( this ).dialog( "close" );
			}
		}
	]
});

function applyFiltersToImage(imageURL) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.filter = 'brightness(0.2)';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)   
      const resizedImageData = canvas.toDataURL();
      resolve(resizedImageData);
    }
    img.onerror = () => {
      reject(new Error('Erro ao carregar a imagem.'));
    };
    img.src = imageURL;
  });
}

async function saveProjectCover() {
  const projectActual = await db.settings.toArray();
  const idProject = await projectActual[0].currentproject;
  const projectData = await db.projects.get(idProject);
  const fileInput = document.querySelector('#my-image');
  const file = fileInput.files[0];
  const reader = new FileReader();
  reader.onloadend = async () => {
    const base64String = reader.result
    const  imgFinal = await applyFiltersToImage(base64String)
    await db.projects.update(projectData.id, {image_cover: imgFinal})
  };
  reader.readAsDataURL(file);
  pageChange('#dinamicPage', 'pages/dashboard/page.html', 'pages/dashboard/script.js');
};

async function restoreProjectCover() {
  const projectActual = await db.settings.toArray();
  const idProject = await projectActual[0].currentproject;
  const projectData = await db.projects.get(idProject);
  await db.projects.update(projectData.id, {image_cover: null})
  pageChange('#dinamicPage', 'pages/dashboard/page.html', 'pages/dashboard/script.js');
};

// Link to open the dialog
$( "#deleteProject" ).click(function( event ) {
	$( "#dialog-delete-project" ).dialog( "open" );
  $("#btnTwo").focus();
	event.preventDefault();
});

document.getElementById("btnSaveWall").disabled = true;
document.getElementById("my-image").addEventListener('input', () => { 
  document.getElementById("btnSaveWall").disabled = false;
});

var deadLineChk = document.getElementById('deadline');
deadLineChk.addEventListener('change', async function() {
  const currentID = await getCurrentProjectID();
  if (this.checked) {
    db.projects.where('id').equals(currentID).modify( (e) => {
      e.deadline = true;
    });
  } else {
    db.projects.where('id').equals(currentID).modify( (e) => {
      e.deadline = false;
    });
  }
});

var subtitleChk = document.getElementById('showSubtitle');
var subtitleDiv = document.getElementById('subtitleDiv');
subtitleChk.addEventListener('change', async function() {
  const currentID = await getCurrentProjectID();
  if (this.checked) {
    subtitleDiv.style.display = 'block';
    subtitleDiv.scrollIntoView({behavior: 'smooth'})
    db.projects.where('id').equals(currentID).modify( (e) => {
      e.showSubtitle = true;
    });
  } else {
    subtitleDiv.style.display = 'none';
    db.projects.where('id').equals(currentID).modify( (e) => {
      e.showSubtitle = false;
    });
  }
});