// Shared key-less Esri World Imagery tile source used by every Leaflet map on
// the site (DestinationMap, IntroMap, ExploreMap) — real satellite/terrain
// imagery rather than a flat basemap. Centralised once three call sites
// needed the same three constants.
export const MAP_IMAGERY_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
export const MAP_LABELS_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";
export const MAP_IMAGERY_ATTR = 'Imagery &copy; <a href="https://www.esri.com">Esri</a>, Maxar, Earthstar Geographics';
