class Views {

    constructor(mapView, favorisView, navItems, organismPopup, firebaseDB, sqlLiteDB) {
        
        this.mapView = mapView;
        this.favorisView = favorisView;

        this.firebaseDB = firebaseDB;
        this.sqlLiteDB = sqlLiteDB;

        this.navItems = navItems;

        this.organismPopup = organismPopup;
        this.organismPopupContent = organismPopup.querySelector("#organism-popup-content")
        this.organismPopupCloseButton = organismPopup.querySelector("#organism-popup-close-btn");

        this.map = null;
        this.personneImageMarker = 'img/logos/charityfood-marker.png';
        this.establishmentImageMarker = 'img/logos/charityfood-marker-establishment.png';

        this.markers = [];
        // this.favoris = [];

    }

    init(){

        this.changeView();

        // Markers
        this.getUserLocation()
        .then( position => {
            this.initMap(position)
            this.markers.push(this.getMarker(position));
        })
        .catch( error => {
            alert(error);
            this.initMap(null);
        })
        .finally( () => {

            this.firebaseDB.getEstablishments()
            .then( establishments => {
                establishments.forEach( establishment =>  {
                    this.markers.push(this.getMarker(establishment))
                })
            })
            .catch( error => alert(error) )
            .finally( () => {

                let markerCluster = new MarkerClusterer(this.map, this.markers, {
                    imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
                });
            
            })
        
        })

        // Favoris
        this.sqlLiteDB.init()
        .then( () => this.addFavoris())
        .catch( error => alert(error))

        this.organismPopupCloseButton.addEventListener("click",() => { this.closeOrganismPopup() });

    }

    // Manage views
    changeView(){

        let navItems = this.navItems;
        let mapView = this.mapView;
        let favorisView = this.favorisView;

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

                    mapView.classList.remove("left");
                    mapView.classList.add("center");
                    favorisView.classList.remove("center");
                    favorisView.classList.add("right");
                
                } else if (view === "favoris") {

                    mapView.classList.remove("center");
                    mapView.classList.add("left");
                    favorisView.classList.remove("right");
                    favorisView.classList.add("center");
                
                }
    
            })
    
        }
    }

    //** Favoris View **//
    addFavoris() {
        
        
        let favorisView = this.favorisView;
        favorisView.innerHTML = "";

        this.sqlLiteDB.getFavoris()
        .then( favoris => {
            favoris.forEach( favori => {
                favorisView.append(this.getFavoris(favori))
            })
        })
        .catch( error => alert(error))
    
    }

    getFavoris(favori) {

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

        aDelete.addEventListener("click",e => {
            e.preventDefault();
            this.sqlLiteDB.deleteFavori(favori.id)
            .then( message => {
                this.addFavoris();
            })
            .catch( error => {
                alert(error);
            })
        })

        aName.append(name);
        aName.append(localisation);
        
        div.append(aName);
        div.append(aDelete);

        return div;

    }

    //** Map View **//

    // Manage popup
    openOrganismPopup(docRef){

        this.firebaseDB.getOrganism(docRef)
        .then( doc => {

            let organism = doc.data()
            let organismPopupContent = this.organismPopupContent;
    
            let img = document.createElement("img");
            img.setAttribute("src",organism.logo);
            img.setAttribute("alt",organism.name+" logo");
    
            let name = document.createElement("h2");
            name.innerHTML = organism.name;
    
            let hr = document.createElement("hr");
    
            let parag = document.createElement("p");
            parag.innerHTML = organism.description;
    
            let link = document.createElement("a");
            link.setAttribute("href",organism.url);
            link.innerHTML = "Lien vers le site officiel";
    
            organismPopupContent.innerHTML = "";
            organismPopupContent.appendChild(img);
            organismPopupContent.appendChild(name);
            organismPopupContent.appendChild(hr);
            organismPopupContent.appendChild(parag);
            organismPopupContent.appendChild(link);
    
            this.organismPopup.classList.add("moreInfosWindow_actif");

        })
        .catch( error => {
            alert(error)
            alert("Les informations consérnant cette organisme ne sont plus diponible")
        })


    }

    closeOrganismPopup(){

        this.organismPopup.classList.remove("moreInfosWindow_actif");
    
    }

    // Get user position
    getUserLocation(){

        let p = new Promise( function(resolve, reject ) {

            navigator.geolocation.getCurrentPosition( position => {
    
                let currentPosition = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
    
                resolve(currentPosition);
        
            }, error => {
    
                reject("Impossible d'obtenir la position actuelle de l'utilisateur");
            
            });
        })

        return p;

    }

    // Init map
    initMap(userPosition){

        let center = {
            lat : 46.8665231,
            lng : 2.5440779,
        }
        let zoom = 6;

        if (userPosition) {
            center = userPosition;
            zoom = 10;
        }

        this.map = new google.maps.Map(this.mapView, {
            center,
            zoom,
        })
    }

    // Get marker
    getMarker(doc){

        let marker = null;
        if( doc.title ) {
            marker = new google.maps.Marker({
                position: {
                    lat: doc.location.latitude,
                    lng: doc.location.longitude
                },
                title: doc.title,
                icon: this.establishmentImageMarker,
            });
            let infowindow = this.getInfoWindow(doc);
            marker.addListener('click', () => {
                infowindow.open(this.map, marker);
            });
        }else {
            marker = new google.maps.Marker({
                position: {
                    lat: doc.lat,
                    lng: doc.lng
                },
                icon: this.personneImageMarker,
            });
        }

        return marker;
    
    }

    getInfoWindow(doc){
        
        // image
        let img = document.createElement("img");
        img.setAttribute("src", doc.logo);
        img.setAttribute("alt", doc.logo);

        // add to favoris
        let btnAddFavoris = document.createElement("button");
        btnAddFavoris.classList.add("add_favoris_button");
        btnAddFavoris.innerHTML = '<i class="fas fa-heart"></i>';
        btnAddFavoris.addEventListener("click", () => {
            this.sqlLiteDB.addFavori({
                id: doc.id,
                title: doc.title,
                adress: doc.address,
                adressmp: doc.address_maps,
            })
            .then( message => {
                this.addFavoris();
                alert(message);
            })
            .catch( error => {
                alert(error);
            })
        })
        
        // title
        let mTitle = document.createElement("h2");
        mTitle.innerHTML = doc.title;

        //
        let cTitle = document.createElement("div");
        cTitle.classList.add("c_tile");
        cTitle.appendChild(mTitle);
        cTitle.appendChild(btnAddFavoris);



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
        aInfos.addEventListener("click", e => {
            e.preventDefault();
            this.openOrganismPopup(doc.reference)
        })

        // horaires title
        let listeTitle = document.createElement("h3");
        listeTitle.innerHTML = "Horaires :";

        let liste = document.createElement("ul");
        liste.appendChild(listeTitle);
        liste.appendChild(this.getHoraire("Lundi",doc.schedule[0]))
        liste.appendChild(this.getHoraire("Mardi",doc.schedule[1]))
        liste.appendChild(this.getHoraire("Mercredi",doc.schedule[2]))
        liste.appendChild(this.getHoraire("Jeudi",doc.schedule[3]))
        liste.appendChild(this.getHoraire("Vendredi",doc.schedule[4]))
        liste.appendChild(this.getHoraire("Samedi",doc.schedule[5]))
        liste.appendChild(this.getHoraire("Dimanche",doc.schedule[6]))


        // info windows
        let contentString = document.createElement("div");
        contentString.classList.add("infosWindow");
        contentString.appendChild(img);
        contentString.appendChild(cTitle);
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

    getHoraire(day,text){
        let horaire = document.createElement("li");
        horaire.innerHTML = day + " : " + text;
        return horaire;
    }


};