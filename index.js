particlesJS.load('particlesjs', 'particlesjs-config.json', function () {
  console.log('callback - particles.js config loaded');
});

let clarifaiApiKey = '739bbbcead5544288d8a90b4c1d049cb';
let workflowId = 'allmodelworkflow';
let uploadbtn = document.querySelector('.custom-file-upload');
let processing = document.querySelector('.processing');

let app = new Clarifai.App({
  apiKey: clarifaiApiKey
});

//setModel
const setModel = (modelName) => {
  workflowId = modelName;
  console.log(workflowId);
}


// Handles image upload
function uploadImage() {
  let preview = document.querySelector('img');
  let file = document.querySelector('input[type=file]').files[0];
  let reader = new FileReader();
  // if (document.getElementById('option2').checked) {
  //   workflowId = document.getElementById('option2').value;
  //   console.log(workflowId);
  // }
  // else {
  //   workflowId = 'allmodelworkflow';
  // }
  document.querySelector('#analysis').innerHTML = "";
  
  reader.addEventListener("load", function () {
    
    let imageData = reader.result;
    imageData = imageData.replace(/^data:image\/(.*);base64,/, '');
    predictFromWorkflow(imageData);
    preview.src = reader.result;
  }, false);
  
  if (file) {
    reader.readAsDataURL(file);
    preview.style.display = "inherit";
    processing.classList.toggle('d-none');
    let op = 0;
    const timer = setInterval(() => {
      processing.querySelector('.progress-bar').setAttribute('style', `width: ${op}%`);
      if (op == 100) {
        clearInterval(timer);
      }
      else {
        op += 1;
      }
      
    }, 100);
  }
}

// Analyzes image provided with Clarifai's Workflow API
function predictFromWorkflow(photoUrl) {
  app.workflow.predict(workflowId, { base64: photoUrl }).then(
    function (response) {
      let outputs = response.results[0].outputs;
      let analysis = document.querySelector('#analysis');
      console.log(analysis);
      
      // analysis.empty();
      console.log(analysis);
      console.log(outputs);
      
      outputs.forEach(function (output) {
        let modelName = getModelName(output);
        
        // Create heading for each section
        let newModelSection = document.createElement("div");
        newModelSection.className = modelName + " modal-container";
        
        let newModelHeader = document.createElement("h2");
        newModelHeader.innerHTML = modelName + "<hr>";
        newModelHeader.className = "model-header";
        console.log(newModelHeader)
        let formattedString = getFormattedString(output);
        let newModelText = document.createElement("p");
        newModelText.innerHTML = formattedString;
        newModelText.className = "model-text";
        
        newModelSection.appendChild(newModelHeader);
        newModelSection.appendChild(newModelText);
        analysis.appendChild(newModelSection);
      });
      processing.classList.toggle('d-none');
    },
    function (err) {
      console.log(err);
    }
    
    );
  }
  
  // Helper function to get model name
  function getModelName(output) {
    if (output.model.display_name !== undefined) {
      return output.model.display_name;
    } else if (output.model.name !== undefined) {
      return output.model.name;
    } else {
      return "";
    }
  }
  
  // Helper function to get output customized for each model
  function getFormattedString(output) {
    let formattedString = "";
    let data = output.data;
    let maxItems = 3;
    // let maxItems2 = 6;
    // General
    if (output.model.model_version.id === "26b62d8c6ea04ed9be12c3c63f4a59da") {
      let items = data.concepts;
      if (items.length < 6) {
       // maxItems2 = items.length;
        if (maxItems === 1) {
          formattedString = "The most probable concept for this image is:";
        }
      } else {
        formattedString = "The " + maxItems + " most probable concepts for this image are:";
      }
      
      for (let i = 0; i < maxItems; i++) {
        formattedString += "<br/>- " + items[i].name + " with " + '<span class="badge badge-pill badge-success">' + (Math.round(items[i].value * 10000) / 100) + "% probability" + '</span>';
      }
    }
    // Apparel 
    else if (output.model.model_version.id === "dc2cd6d9bff5425a80bfe0c4105583c1") {
      let items = data.concepts;
      console.log('apr');
      if (items.length < maxItems) {
        maxItems = items.length;
        if (maxItems === 1) {
          console.log('apppr1');
          formattedString = "The most probable detected concept for the piece of apparel is:";
        }
      } else {
        console.log('apprn');
        formattedString = "The " + maxItems + " most probable detected concepts for the pieces of apparel are:";
      }
      
      for (let i = 0; i < maxItems; i++) {
        formattedString += "<br/>- " + items[i].name + " with " + '<span class="badge badge-pill badge-success">' + (Math.round(items[i].value * 10000) / 100) + "% probability" + '</span>';
        // formattedString += "<br/>- " + items[i].name + " at a " + (Math.round(items[i].value * 10000) / 100) + "% probability";
      }
    }
    // Celebrity
    else if (output.model.model_version.id === "bdb0537982ae4e0da563ed836ccfa065") {
      if(data.regions){
      let items = data.regions;
      console.log('celebs');
      if (data.regions.length === 1) {console.log('celebs1');
        formattedString = "The most probable celebrity detected in this picture is:<br/>";
        
      } else {console.log('celebsn');
        formattedString = "The most probable celebrities detected in this picture are:<br/>";
        
      }
      for (let i = 0; i < items.length; i++) {
        let item = items[i].data.face.identity.concepts[0];
        console.log('celebsi');
        formattedString += "- " + item.name + " with " + '<span class="badge badge-pill badge-success">' + (Math.round(item.value * 10000) / 100) + "% probability" + '</span>' + "<br/>";
        // formattedString += "- " + item.name + " at a " + (Math.round(item.value * 10000) / 100) + "% probability<br/>";
        // formattedString += "<br/>- " + items[i].name + " with " + '<span class="badge badge-pill badge-success">'+ (Math.round(items[i].value * 10000) / 100) + "% probability" +'</span>';
      }
    }
    else{        formattedString = "None were detected for this picture. <br/>";
    return formattedString;
    // return;
  }
      
      
    }
    // Color
    else if (output.model.model_version.id === "dd9458324b4b45c2be1a7ba84d27cd04") {
      let items = data.colors;
      console.log('col');
      if (items.length < maxItems) {
        maxItems = items.length;
        if (maxItems === 1) {
          formattedString = "The most probable color detected is:";
        }
      } else {
        formattedString = "The " + maxItems + " most probable colors detected are:";
      }
      
      for (let i = 0; i < maxItems; i++) {
        formattedString += "<br/>- " + items[i].raw_hex + " (" + items[i].w3c.name + ") at a " + (Math.round(items[i].value * 10000) / 100) + "% probability";
      }
    }
    // Demographics
    else if (output.model.model_version.id === "f783f0807c52474c8c6ad20c8cf45fc0") {
      let items = data.regions;
      console.log('demo');
      formattedString = "The most probable racial origin concepts detected are:";
      
      for (let i = 0; i < items.length; i++) {
        let item = items[i].data.face;
        formattedString += "<br/>- " + item.multicultural_appearance.concepts[0].name + ", "
        + item.gender_appearance.concepts[0].name + ", "
        + item.age_appearance.concepts[0].name + " year old";
      }
    }
    // Face Detection
    else if (output.model.model_version.id === "c67b5872d8b44df4be55f2b3de3ebcbb") {
      let numFaces = data.regions.length;
      if (numFaces === 1) {
        formattedString = "1 face detected in the picture.";
      } else {
        formattedString = "" + numFaces + " faces are detected in the picture.";
      }
    }
    // Face Embedding
    else if (output.model.model_version.id === "ec1740642c83478392e7b8735c43c630") {
      let items = data.regions;
      if (items.length === 1) {
        formattedString = "Open up the console to see an array of numerical vectors representing 1 face in a 1024-dimensional space.";
      } else {
        formattedString = "Open up the console to see " + items.length + " arrays of numerical vectors representing " + items.length + " faces in a 1024-dimensional space.";
      }
      for (let i = 0; i < items.length; i++) {
        console.log("*** Face Embedding Output ***");
        console.log("Face " + i);
        console.log(items[i].data.embeddings[0]);
      }
    }
    // Focus
    else if (output.model.model_version.id === "fefeafd0c9224bce9274f06dad43553e") {
      formattedString = "Tis image has:<br/>- focus value of " + data.focus.value + "<br/>- density of " + data.focus.density;
    }
    // Food
    else if (output.model.model_version.id === "dfebc169854e429086aceb8368662641") {
      let items = data.concepts;
      if (items.length < maxItems) {
        maxItems = items.length;
        if (maxItems === 1) {
          formattedString = "The " + maxItems + " most probable concept of food item detected is:";
        }
      } else {
        formattedString = "The " + maxItems + " most probable concepts of food items detected are:";
      }
      
      for (let i = 0; i < maxItems; i++) {
        // formattedString += "<br/>- " + items[i].name + " at a " + (Math.round(items[i].value * 10000) / 100) + "% probability";
        formattedString += "<br/>- " + items[i].name + " with " + '<span class="badge badge-pill badge-success">' + (Math.round(items[i].value * 10000) / 100) + "% probability" + '</span>';
      }
    }
    // General Embedding
    else if (output.model.model_version.id === "bb7ac05c86be42d38b67bc473d333e07") {
      formattedString = "Open up the console to see an array of numerical vectors representing the input image in a 1024-dimensional space.";
      console.log("*** General Embedding Output ***");
      console.log(data.embeddings[0]);
    }
    // Landscape Quality
    else if (output.model.model_version.id === "a008c85bb6d44448ad35470bcd22666c") {
      let items = data.concepts;
      formattedString = "The probability that this photo's landscape is:";
      for (let i = 0; i < items.length; i++) {
        formattedString += "<br/>- " + items[i].name + " is " + (Math.round(items[i].value * 10000) / 100) + "%";
      }
    }
    // Logo
    else if (output.model.model_version.id === "ef1b7237d28b415f910ca343a9145e99") {
      let items = data.regions;
      if (items.length < maxItems) {
        maxItems = items.length;
        if (maxItems === 1) {
          formattedString = "The " + maxItems + " logos we are most confident in detecting are:";
        }
      } else {
        formattedString = "The " + maxItems + " logos we are most confident in detecting are:";
      }
      
      for (let i = 0; i < maxItems; i++) {
        formattedString += "<br/>- " + items[i].data.concepts[0].name + " at a " + (Math.round(items[i].data.concepts[0].value * 10000) / 100) + "% probability";
      }
    }
    // Moderation
    else if (output.model.model_version.id === "aa8be956dbaa4b7a858826a84253cab9") {
      let items = data.concepts;
      console.log(items[0].name);
      // if (items[0].name == 'Explicit' || 'suggestive') {
      //   console.log('EXP!!!');
      //   var photo = new stackBoxBlurIt('photo').blurit(40)
      //   photo.onmouseover = function(){
      //     this.blurit(0, 2000)
      //   }
      //   photo.onmouseout = function(){
      //     this.blurit(40, 2000)
      //   }
      // } 
      if (items[0].name == 'Explicit' || 'suggestive') {
        document.querySelector('.photo').classList.add('blur');
      }
      formattedString = "This photo is/contains:";
      for (let i = 0; i < items.length; i++) {
        formattedString += "<br/>- " + items[i].name + " at a " + (Math.round(items[i].value * 10000) / 100) + "% probability";
      }
    }
    // NSFW
    else if (output.model.model_version.id === "aa47919c9a8d4d94bfa283121281bcc4") {
      let items = data.concepts;
      formattedString = "This photo is:";
      for (let i = 0; i < items.length; i++) {
        formattedString += "<br/>- " + items[i].name + " at a " + (Math.round(items[i].value * 10000) / 100) + "% probability";
      }
    }
    // Portrait Quality
    else if (output.model.model_version.id === "c2e2952acb80429c8abb53e2fe3e11cd") {
      let items = data.concepts;
      formattedString = "The probability that this photo's portraits are:";
      for (let i = 0; i < items.length; i++) {
        formattedString += "<br/>- " + items[i].name + " is " + (Math.round(items[i].value * 10000) / 100) + "%";
      }
    }
    // Textures & Patterns
    else if (output.model.model_version.id === "b38274b04b1b4fb28c1b442dbfafd1ef") {
      let items = data.concepts;
      if (items.length < maxItems) {
        maxItems = items.length;
        if (maxItems === 1) {
          formattedString = "The texture or pattern we are most confident in detecting is:";
        }
      } else {
        formattedString = "The " + maxItems + " textures and/or patterns we are most confident in detecting are:";
      }
      
      for (let i = 0; i < maxItems; i++) {
        formattedString += "<br/>- " + items[i].name + " at a " + (Math.round(items[i].value * 10000) / 100) + "% probability";
      }
    }
    // Travel
    else if (output.model.model_version.id === "d2ffbf9730fd41fea79063270847be82") {
      let items = data.concepts;
      console.log('travel');
      if (items.length < maxItems) {
        maxItems = items.length;
        if (maxItems === 1) {
          formattedString = "The most probable travel concept detected is:";
        }
      } else {
        formattedString = "The " + maxItems + " most probable travel concepts detected are:";
      }
      
      for (let i = 0; i < maxItems; i++) {
        formattedString += "<br/>- " + items[i].name + " with " + '<span class="badge badge-pill badge-success">' + (Math.round(items[i].value * 10000) / 100) + "% probability" + '</span>';
        // formattedString += "<br/>- " + items[i].name + " at a " + (Math.round(items[i].value * 10000) / 100) + "% probability";
      }
    }
    // Wedding
    else if (output.model.model_version.id === "b91bcf877c464a38a25a742694da7535") {
      let items = data.concepts;
      if (items.length < maxItems) {
        maxItems = items.length;
        if (maxItems === 1) {
          formattedString = "The wedding topic we are most confident in detecting is:";
        }
      } else {
        formattedString = "The " + maxItems + " wedding topics we are most confident in detecting are:";
      }
      
      for (let i = 0; i < maxItems; i++) {
        formattedString += "<br/>- " + items[i].name + " at a " + (Math.round(items[i].value * 10000) / 100) + "% probability";
      }
    }
    
    return formattedString;
  }
  
  // uploadbtn.addEventListener('click', ()=>{
  //   processing.classList.toggle('d-none');
  // })
  
  