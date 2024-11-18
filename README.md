# ReadMe
This project provides a set of JavaScript functions that fetch GeoJSON data from OpenStreetMap (using the Nominatim API) and allow users to check if specific geographic coordinates (longitude and latitude) fall within a defined polygon or multipolygon area. The example focuses on checking whether a point is inside the boundaries of San Francisco.

## How It Works
The project is composed of three main parts that work together to fetch data from OpenStreetMaps, then checks whether specific X, Y coordinates are inside a polygon shape or a set of MultiPolygon shapes from a map:

## Fetching GeoJSON Data:
The function **fetchGeoJsonFromNominatim()** retrieves Sample boundary data for San Francisco from the Nominatim OpenStreetMap API. The data is in GeoJSON format, which includes information about polygons or multipolygons that define the region.

## Checking if a Point is Inside a Polygon:
The **CheckPointInPolygon** class contains methods to determine if a point (defined by longitude and latitude) is inside a polygon or multipolygon using a ray-casting algorithm.

The **isPointInsidePolygon()** method handles both Polygon and MultiPolygon types by checking whether the given point lies within the specified boundaries.  

The **checkPointInPolygon()** method uses the ray-casting technique to detect if a point is inside a polygon by counting how many times a ray crosses the polygon's edges.

## Front-End Integration:
The **checkUserPoint()** function is designed to be triggered by a button on a webpage. It retrieves user input for longitude and latitude, fetches the GeoJSON data, and checks if the provided point falls within the San Francisco boundaries.

## Future Updates
- Add input for specific search region for other city shapes from OpenStreet Maps
- A potential option to use a URL from another open source geojson data source.
