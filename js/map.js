
let map;
let markers = [];
let openInfoWindow = null;
let activeCard = null;
let searchOrigin = null;

const DEFAULT_CENTER = { lat: 39.9612, lng: -82.9988 };
const SEARCH_RADIUS = 16093; // 10 miles

async function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: DEFAULT_CENTER,
    zoom: 12,
    mapTypeControl: false,
  });

  const [{ Place, SearchNearbyRankPreference }] = await Promise.all([
    google.maps.importLibrary("places"),
  ]);

  window.PlaceLib = Place;
  window.RankPref = SearchNearbyRankPreference;
  searchOrigin = DEFAULT_CENTER;
  searchProviders(DEFAULT_CENTER);
}

async function searchProviders(center) {
  searchOrigin = center;
  const container = document.getElementById("provider-info");
  container.innerHTML = "";
  markers.forEach(m => m.setMap(null));
  markers = [];

  const bounds = new google.maps.LatLngBounds();

  const request = {
    locationRestriction: { center, radius: SEARCH_RADIUS },
    includedPrimaryTypes: ["hospital","doctor"],
    maxResultCount: 20,
    rankPreference: RankPref.DISTANCE,
    fields: [
      "displayName", "formattedAddress", "location", "nationalPhoneNumber", "types", "websiteURI", "id"
    ],
  };

  const { places } = await PlaceLib.searchNearby(request);
  if (!places || places.length === 0) {
    container.innerHTML = '<p>No providers found nearby.</p>';
    return;
  }

  places.forEach((place, index) => {
    const { location, displayName, formattedAddress, nationalPhoneNumber, websiteUri, id, types } = place;

    const marker = new google.maps.Marker({
      position: location,
      map,
      label: {
        text: `${index + 1}`,
        color: "white",
        fontSize: "12px",
        fontWeight: "bold"
      },
      
    });
    markers.push(marker);
    bounds.extend(location);

    const distance = searchOrigin ? google.maps.geometry.spherical.computeDistanceBetween(
      new google.maps.LatLng(searchOrigin.lat, searchOrigin.lng),
      location
    ) * 0.000621371 : null;

    const specialty = types
      ? types.filter(t => !t.includes("establishment"))
          .map(t => t.replace(/_/g, ' ').replace(/\w/g, c => c.toUpperCase()))
      : [];

    const primarySpecialty = specialty[0] || "General Practice";
    const extraSpecialties = specialty.slice(1);
    const extraList = extraSpecialties.map(s => `<li>${s}</li>`).join("");

    const card = document.createElement("div");
    card.className = "provider-list-item";
    card.dataset.index = index;

    card.innerHTML = `
      <div class="provider-card-header">
        <strong>${index + 1}. ${displayName}</strong><br/>
        <span>${distance ? distance.toFixed(1) + " miles away" : "Distance not available"}</span>
        <span class="primary-specialty">${primarySpecialty}</span>
      </div>
      <div class="provider-card-details" style="display:none;">
        <p><strong>Address:</strong> ${formattedAddress || "N/A"}</p>
        <p><strong>Phone:</strong> ${nationalPhoneNumber || "N/A"}</p>
        ${extraSpecialties.length ? `<p><strong>Additional Specialties:</strong><ul class="taxonomy-list">${extraList}</ul></p>` : ""}
        <p><a href="${websiteUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayName)}&query_place_id=${id}`}" target="_blank">Visit Website</a></p>
      </div>
    `;

    const toggleCard = () => {
      if (activeCard) {
        activeCard.classList.remove("active-card");
        activeCard.querySelector(".provider-card-details").style.display = "none";
      }
    
      card.classList.add("active-card");
      card.querySelector(".provider-card-details").style.display = "block";
    
      // Scroll card into view on desktop
      if (window.innerWidth > 768) {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    
      // Open InfoWindow on the associated marker
      if (openInfoWindow) openInfoWindow.close();
      openInfoWindow = new google.maps.InfoWindow({
        content: `
          <div style='font-weight: bold; font-size: 14px;'>
            ${displayName}<br>
            <span style='font-weight: normal;'>${distance ? distance.toFixed(1) + " miles away" : ""}</span>
          </div>
        `,
        maxWidth: 200
      });
      openInfoWindow.open(map, marker);
    
      activeCard = card;
    };

    
    marker.addListener("click", () => {
      toggleCard();

    });


    card.addEventListener("click", toggleCard);
    container.appendChild(card);
  });

  if (!bounds.isEmpty()) map.fitBounds(bounds);
}

function useCurrentLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      map.setCenter(loc);
      map.setZoom(13);
      searchProviders(loc);
    },
    () => alert("Unable to get your location")
  );
}

function searchLocation(inputId) {
  const address = document.getElementById(inputId).value.trim();
  if (!address) return;

  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address }, (results, status) => {
    if (status === "OK" && results[0]) {
      const location = results[0].geometry.location;
      const coords = { lat: location.lat(), lng: location.lng() };
      map.setCenter(coords);
      map.setZoom(13);
      searchProviders(coords);
    } else {
      alert("Location Not Found: " + status);
    }
  });
}

window.initMap = initMap;
window.useCurrentLocation = useCurrentLocation;
window.searchLocation = searchLocation;
