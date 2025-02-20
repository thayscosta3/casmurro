document.getElementById("category").addEventListener('change', (e) => enableDateInput(e.target.value))

async function enableDateInput(target) {
  const divDate = document.getElementById("div_Date");
  target === 'Fato histórico' ? divDate.removeAttribute("style") : divDate.style.display = "none";
  target !== 'Fato histórico' ? clearDate('world') : '';
};

async function restoreCharactersCard() {
  const currentCardID = await getCurrentCardID();
  const projectData = await getCurrentProject();
  projectData.data.world.forEach( (ele) => {
    if (ele.id === currentCardID) {
      Object.keys(ele).forEach(key => {
        const result = document.getElementById(key);
        if (key === "date" &&  ele[key] !== '') {
          const divDate = document.getElementById("div_Date");
          divDate.removeAttribute("style");
          const resultDate = projectData.data.timeline.filter( (timelineElement) => {
            return timelineElement.id === ele[key]
          })
          return result.value = resultDate[0].date;
        } if (key === "image_card" && ele[key] !== '') {
          var cardbackgrond = document.getElementById("imageCardBackgournd");
          cardbackgrond.classList.add("imageCardBackgournd");
          cardbackgrond.children[0].style.backgroundImage =  `url(${ ele[key] })`;
          cardbackgrond.children[0].classList.add("cardImageDiv");
          result.setAttribute("src", ele[key]);
          result.classList.add("cardImage");
        } if (result) {
          return result.value = ele[key];
        }
      })
      resumeHeight("content")
    } else {
      return null
    }
  })
};

var elementsArray = document.querySelectorAll(".projectInputForm");

elementsArray.forEach(async function(elem) {
  const currentID = await getCurrentProjectID();
  const currentCardID = await getCurrentCardID();
  const projectData = await getCurrentProject();
  const positionInArray = await getCurrentCard();
  projectData.data.world.forEach( (ele) => {
    if (ele.id === currentCardID) {
      elem.addEventListener("input", async () => {
        await lastEditListModify('world', currentCardID);
        const field = elem.id
        if (elem.id === "date") {
          const checkIfisNew = await checkTimelineNewDate(ele.id, 'historical-event', 'historicID')
          if (checkIfisNew) {
            const projectDataActual = await getCurrentProject();
            const actualIDdateFact = projectDataActual.data.world[positionInArray].date;
            const positionInArrayTime = projectDataActual.data.timeline.map(function (e) { return e.id; }).indexOf(actualIDdateFact);
            return await db.projects.where('id').equals(currentID).modify( (e) => {
              e.data.timeline[positionInArrayTime].date = elem.value;
            });
          } else {
            const timelineID = await NewTimelineGenericWorld(elem.value, ele.id, 'historical-event');
            return await db.projects.where('id').equals(currentID).modify( (e) => {
              e.data.world[positionInArray][field] = timelineID;
            });
          }
        } else {
          await db.projects.where('id').equals(currentID).modify( (e) => {
            e.data.world[positionInArray][field] = elem.value;
          });
        }
      });
    }
  })
});

$( "#dialog-delete-world" ).dialog({
	autoOpen: false,
	width: 500,
	buttons: [
		{
			text: "Ok",
			click: async function() {
        await clearDate('world');
        await deleteCard('world');
        $( this ).dialog( "close" );
        loadpage('mundo');
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
// Link to open the dialog
$( "#deleteWorldCard" ).click(function( event ) {
	$( "#dialog-delete-world" ).dialog( "open" );
  $("#btnTwo").focus();
	event.preventDefault();
});

document.getElementById("btnSaveWall").disabled = true;
document.getElementById("my-image").addEventListener('input', () => { 
  document.getElementById("btnSaveWall").disabled = false;
});

restoreCharactersCard();
restoreCategories('world');
