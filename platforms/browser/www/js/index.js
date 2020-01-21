let db = null;
let map = null; 
let dbSqlite =  null;

document.addEventListener('deviceready', function(){

    // firestore configuration
    firebase.initializeApp({

        apiKey: "AIzaSyDgBm4eWmKJk2zFaZ358VH4wDwCToJHjYE",
        authDomain: "charity-food.firebaseapp.com",
        databaseURL: "https://charity-food.firebaseio.com",
        projectId: "charity-food",
        storageBucket: "charity-food.appspot.com",
        messagingSenderId: "307113824448",
        appId: "1:307113824448:web:dba4b082e7f27968a55d25",
        measurementId: "G-RQ1RBDY5PQ"

    });

    let db = firebase.firestore();

    // set event listener for switch pages
    let navItems = document.getElementsByClassName("nav-item");
    let viewMap = document.getElementById("view-map");
    let viewFavoris = document.getElementById("view-favoris");

    // map
    let currentPosition = {};
    let personneImageMarker = 'img/logos/charityfood-marker.png';
    let establishmentImageMarker = 'img/logos/charityfood-marker-establishment.png';

    // popup
    let popUp = document.getElementById("moreInfosWindow");
    let popUpContent = document.getElementById("contente_moreInfosWindow");
    let closePopUpBtn = document.getElementById("close_moreInfosWindow");

    // views gestion
    for (let i = 0; i < navItems.length; i++) {

        navItems[i].addEventListener("click", function (e) {

            e.preventDefault();

            for (let j = 0; j < navItems.length; j++) {
                navItems[j].classList.remove("nav-item-actif")
            }

            let item = navItems[i];
            let view = item.getAttribute("href");

            item.classList.add("nav-item-actif")

            if (view === "map") {
                getView(viewMap, "left", "center");
                getView(viewFavoris, "center", "right")
            } else if (view === "favoris") {
                getView(viewMap, "center", "left");
                getView(viewFavoris, "right", "center");
            }

        })

    }

    function getView(view, removedClass, addedClass) {
        view.classList.remove(removedClass);
        view.classList.add(addedClass);
    }

    closePopUpBtn.addEventListener("click", () => {

        popUp.classList.remove("moreInfosWindow_actif");

    })


    // maps view //
    navigator.geolocation.getCurrentPosition(onSuccess, onError);

    function onSuccess(position) {

        currentPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };

        // map
        map = new google.maps.Map(document.getElementById('view-map'), {
            center: currentPosition,
            zoom: 10
        });

        // addMarker(currentPosition);
        getEstablishments();

    }

    function onError(error) {
        alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
    }

    function getEstablishments(){

        db.collection("establishments").get()
        .then(function(querySnapshot) {

            let markers = [];

            querySnapshot.forEach(function(doc) {

                marker = {
                    id: doc.id,
                    ... doc.data()
                }

                markers.push(addMarker(marker));

            });

            
            // Add a marker clusterer to manage the markers.
            var markerCluster = new MarkerClusterer(map, markers, {
                imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
            });

        })
        .catch(function(error) {
            
            console.log("Error getting documents: ", error);
        
        });

    }

    function addMarker(doc){
        let marker = null;
        if( doc.title ) {
            marker = new google.maps.Marker({
                position: {
                    lat: doc.location.latitude,
                    lng: doc.location.longitude
                },
                title: doc.title,
                icon: establishmentImageMarker,
            });
            let infowindow = getInfoWindow(doc);
            marker.addListener('click', function() {
                infowindow.open(map, marker);
            });
        }else {
            marker = new google.maps.Marker({
                position: {
                    lat: doc.lat,
                    lng: doc.lng
                },
                icon: personneImageMarker,
            });
        }
        return marker;
    }

    function getInfoWindow(doc){
        
        
        // infos window image
        let img = document.createElement("img");
        img.setAttribute("src", doc.logo);
        img.setAttribute("alt", doc.logo);

        // add to favoris button
        let btnAddFavoris = document.createElement("button");
        btnAddFavoris.innerHTML = "Ajouter aux favoris";
        btnAddFavoris.addEventListener("click",function(){
            
        })
        
        // title
        let mTitle = document.createElement("h2");
        mTitle.innerHTML = doc.title;

        // horizontal bar
        let hr = document.createElement("hr");

        // Adress
        let aAdresse = document.createElement("a");
        aAdresse.setAttribute("href", doc.address_maps);
        aAdresse.setAttribute("target", "_blank");
        aAdresse.innerHTML = '<div><i class="fas fa-map-marker-alt"></i></div>'+doc.address;

        // Téléphone
        let phone = document.createElement("p");
        phone.innerHTML = '<div><i class="fas fa-phone-alt"></i></div>'+doc.phone;
        
        // Organisme information
        let aInfos = document.createElement("a");
        aInfos.setAttribute("href", doc.reference);
        aInfos.innerHTML = "+ d'informations sur cette organisation";
        aInfos.addEventListener("click", function(e){

            e.preventDefault();
            let docRef = this.getAttribute("href");

            db.doc(docRef).get()
            .then( (doc) => {

                if (doc.exists) openPopUp(doc.data())
                else console.log("No such document!")

            })
            .catch( (error) => console.log("Error getting document:", error));

        })

        // horaires title
        let listeTitle = document.createElement("h3");
        listeTitle.innerHTML = "Horaires :";

        let liste = document.createElement("ul");
        liste.appendChild(listeTitle);
        liste.appendChild(getHoraire("Lundi",doc.schedule[0]))
        liste.appendChild(getHoraire("Mardi",doc.schedule[1]))
        liste.appendChild(getHoraire("Mercredi",doc.schedule[2]))
        liste.appendChild(getHoraire("Jeudi",doc.schedule[3]))
        liste.appendChild(getHoraire("Vendredi",doc.schedule[4]))
        liste.appendChild(getHoraire("Samedi",doc.schedule[5]))
        liste.appendChild(getHoraire("Dimanche",doc.schedule[6]))


        // info windows
        let contentString = document.createElement("div");
        contentString.classList.add("infosWindow");
        contentString.appendChild(img);
        contentString.appendChild(btnAddFavoris);
        contentString.appendChild(mTitle);
        contentString.appendChild(hr);
        contentString.appendChild(aAdresse);
        contentString.appendChild(phone);
        contentString.appendChild(aInfos);
        contentString.appendChild(liste);
        
        let infowindow = new google.maps.InfoWindow({
            content: contentString
        });

        return infowindow;

    }

    function getHoraire(day,text){
        let horaire = document.createElement("li");
        horaire.innerHTML = day + " : " + text;
        return horaire;
    }

    function openPopUp(doc){

        let img = document.createElement("img");
        img.setAttribute("src",doc.logo);
        img.setAttribute("alt",doc.name+" logo");

        let name = document.createElement("h2");
        name.innerHTML = doc.name;

        let hr = document.createElement("hr");

        let parag = document.createElement("p");
        parag.innerHTML = doc.description;

        let link = document.createElement("a");
        link.setAttribute("href",doc.url);
        link.innerHTML = "Lien vers le site officiel";

        popUpContent.innerHTML = "";
        popUpContent.appendChild(img);
        popUpContent.appendChild(name);
        popUpContent.appendChild(hr);
        popUpContent.appendChild(parag);
        popUpContent.appendChild(link);

        popUp.classList.add("moreInfosWindow_actif");

    }

    // local database SQLite
    const dbName = "favoris";
    const dbVersion = "1.0";
    const dbDescription = "Une base de données favoris";
    const dbSize = 20;

    let dbSqlite = window.openDatabase(dbName, dbVersion, dbDescription, dbSize);

    dbSqlite.transaction(function(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS favoris (id text primary key, title text, adress text, adressmp text)',[],function(tx, rs){}, function(tx, error) {
            alert('local databse created error' + error.message);
        });
    });

    getAllFavoris(dbSqlite,viewFavoris);
    
    

}, false);


function getAllFavoris(view){
    dbSqlite.transaction(function(tx) {
        tx.executeSql('SELECT * FROM favoris',[], function(tx, rs) {
            if(rs.rows.length == 0){
                alert("No rows");
            }else {

                let favoris = [];

                for(let i=0;i<rs.rows.length;i++){
                    favoris.push({
                        id: rs.rows.item(i).id,
                        title: rs.rows.item(i).title,
                        adress : rs.rows.item(i).adress,
                        adressmp : rs.rows.item(i).adressmp,
                    })
                }

                addFavorisToView(favoris,view);

            }
        }, function(tx, error) {
            alert('local databse getAllFavoris error' + error.message);
        });
    });
}

function addFavoris(obj){

    dbSqlite.transaction(function(tx) {
        tx.executeSql('INSERT INTO favoris (id,title,adress,adressmp) VALUES("myid1","mytitle1","myadress1","myadressmp1")',[], function(tx, rs) {
            alert("local data base add favoris")
        }, function(tx, error) {
            alert('local databse add favoris error' + error.message);
        });
    });
}

function deleteFavoris(){
    
    dbSqlite.transaction(function(tx) {
        tx.executeSql('DELETE FROM favoris WHERE id="myid1"',[], function(tx, rs) {
            alert("local data base delete favoris")
        }, function(tx, error) {
            alert('local databse delete favoris error' + error.message);
        });
    });
}

function searchFavoris(){
    
    // let response = "";
    dbSqlite.transaction(function(tx) {
        tx.executeSql('SELECT * FROM favoris WHERE id="myid1" ',[], function(tx, rs) {
            if( rs.rows.length == 0 ){
                alert("found")
            }else {
                alert("not found")
            }
        }, function(tx, error) {
            alert("error selecting : "+error.message);
        });
    });

    // return response;
}


function addFavorisToView(favoris,view){

    view.innerHTML = "";
    favoris.forEach(favori => {

        let div = document.createElement("div");
        div.classList.add("favoris");

        let aName = document.createElement("a");
        aName.setAttribute("href",favori.adressmp);
        aName.classList.add("favoris-name");
        
        let name = document.createElement("h3");
        name.innerHTML = favori.title;

        let localisation = document.createElement("p");
        localisation.innerHTML = favori.adress;

        let aDelete = document.createElement("a");
        aDelete.setAttribute("href",favori.id);
        aDelete.classList.add("favoris-delete");

        let icon = document.createElement("i");
        icon.classList.add("fas");
        icon.classList.add("fa-trash-alt");

        aDelete.append(icon);

        aDelete.addEventListener("click",function(e){
            e.preventDefault();
            // searchFavoris(dbSqlite);
            alert(favori.id)
        })

        aName.append(name);
        aName.append(localisation);
        
        div.append(aName);
        div.append(aDelete);

        view.append(div);

    })
}