// map.js
let map, infoWin, PlaceLib, RankPref;
const SEARCH_RADIUS = 16093; // 10 miles
const DEFAULT_CENTER = { lat: 39.9612, lng: -82.9988 };

async function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: DEFAULT_CENTER,
    zoom: 12,
    mapTypeControl: false,
  });

  infoWin = new google.maps.InfoWindow();
  const [{ Place, SearchNearbyRankPreference }] = await Promise.all([
    google.maps.importLibrary("places"),
  ]);

  PlaceLib = Place;
  RankPref = SearchNearbyRankPreference;
  searchProviders(DEFAULT_CENTER);
}

async function searchProviders(center) {
  clearProviderInfo();
  if (window.radiusCircle) window.radiusCircle.setMap(null);

  const request = {
    locationRestriction: { center, radius: SEARCH_RADIUS },
    includedPrimaryTypes: ["hospital", "pharmacy"],
    maxResultCount: 20,
    rankPreference: RankPref.DISTANCE,
    fields: ["displayName", "formattedAddress", "location", "nationalPhoneNumber", "types", "websiteURI", "id"],
  };

  const { places } = await PlaceLib.searchNearby(request);
  if (!places || places.length === 0) {
    document.getElementById("provider-info").innerHTML = '<p>No providers found nearby.</p>';
    return;
  }

  const bounds = new google.maps.LatLngBounds();
  const listContainer = document.getElementById("provider-info");
  listContainer.innerHTML = "";

  places.forEach((place, index) => {
    addMarker(place, index, bounds);

    const distanceText = "N/A";

    const listItem = document.createElement("div");
    listItem.className = "provider-list-item";
    listItem.innerHTML = `<strong>${index + 1}. ${place.displayName}</strong><br><span>${distanceText}</span>`;
    listItem.onclick = () => showProviderInfo(place, index);
    listContainer.appendChild(listItem);
  });

  map.fitBounds(bounds);
}

function addMarker(place, index, bounds) {
  const marker = new google.maps.Marker({
    map,
    position: place.location,
    title: place.displayName,
    label: `${index + 1}`,
  });

  marker.addListener("click", () => showProviderInfo(place, index));
  bounds.extend(place.location);
}

function showProviderInfo(place, index) {
    const specialty = place.types
      ? place.types.filter(t => !t.includes("establishment"))
          .map(t => t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
          .slice(0, 2).join(", ")
      : "Not specified";
  
    const fallbackLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.displayName)}&query_place_id=${place.id}`;
    const content = `
      <div style="font-family: 'Montserrat', sans-serif; font-size: 0.9rem; color: black; max-width: 260px; line-height: 1.4; text-align:left; padding:0 1rem 1rem 1.5rem;">
        <div style="font-weight: 700; font-size: 1rem; margin-bottom: 0.5rem; color: #1a4a8b;">
          ${index + 1}. ${place.displayName}
        </div>
        ${place.formattedAddress ? `<div><strong>Address:</strong><br>${place.formattedAddress}</div>` : ''}
        ${place.nationalPhoneNumber ? `<div style="margin-top: 0.4rem;"><strong>Phone:</strong><br>${place.nationalPhoneNumber}</div>` : ''}
        ${specialty ? `<div style="margin-top: 0.4rem;"><strong>Specialty:</strong><br>${specialty}</div>` : ''}
        <div style="margin-top: 0.6rem;">
          <a href="${place.websiteUri || fallbackLink}" target="_blank" style="color: #1a4a8b; text-decoration: underline; display: inline-block; margin-bottom: 0.3rem;">Visit Website</a><br>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.formattedAddress)}" target="_blank" style="color: #1a4a8b; text-decoration: underline;">Get Directions</a>
        </div>
      </div>`;
  
    infoWin.setContent(content);
    infoWin.setPosition(place.location);
    infoWin.open(map);
  }
  

function useCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLoc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        map.setCenter(userLoc);
        map.setZoom(13);
        searchProviders(userLoc);
      },
      () => alert("Unable to get your location")
    );
  } else {
    alert("Geolocation is not supported by your browser.");
  }
}

function searchLocation(inputId) {
  const address = document.getElementById(inputId).value.trim();
  if (!address) return;

  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address }, (results, status) => {
    if (status === "OK" && results[0]) {
      const location = results[0].geometry.location;
      map.setCenter(location);
      map.setZoom(13);
      searchProviders(location);
    } else {
      alert("Location Not Found: " + status);
    }
  });
}

function clearProviderInfo() {
  document.getElementById("provider-info").innerHTML = '';
}